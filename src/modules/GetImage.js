import React, { useState, useEffect } from "react";
import { ScrollView, Image, Button, View, Text, TextInput, StyleSheet, FlatList, Modal, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import 'react-native-url-polyfill/auto';
import { OPEN_AI_API_KEY } from '@env';
import { TRANSLATE_KEY } from '@env';
import axios from 'axios';
import Description from './Description';
import { NomalLoading } from './Loading';
import { Loading } from './Loading';
import KeywordsCloud from './KeywordsCloud';
import getRandomColorCode from './getRandomColorCode';

import * as DocumentPicker from 'expo-document-picker';

// openAIのキーを設定
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const GetImage = () => {
    const [file, setFile] = useState(null); // トークのtxtファイル
    const [talk, setTalk] = useState(null); // トークでの連続１０件
    const [ranking, setRanking] = useState(null); // トークでのランキングトップ１０
    const [prompt_ja, setPrompt_ja] = useState(null); // ランキングトップ３をカンマ区切りで
    const [prompToChatGPT, setPrompToChatGPT] = useState(null); //chatGPTに渡すプロンプト
    const [prompt_en, setPrompt_en] = useState(null); // 上を英訳
    const [imageUrls, setImageUrls] = useState([]); // 出力された画像のURL
    const [newWord, setNewWord] = useState(""); // プロンプトを後から追加
    const MAX_IMAGES = 4 // 画像の保存上限を指定
    const [selectTouch, setSelectTouch] = useState(false); // 画像のタッチを指定する画面の表示・非表示
    const [touchPrompt, setTouchPrompt] = useState(''); // 画像のタッチを指定する際のプロンプト
    const [cloudKeyWords, setCloudKeyWords] = useState([]) // ワードクラウド用のリスト
    const [cloudScale, setCloudScale] = useState(1000)// ワードクラウドのスケール

    // 現在のフェーズを判定する　1:初期状態 2:ローディング中 3: 生成完了
    const [nowPhase, setNowPhase] = useState(1);

    const [isAddNewPrompt, setIsAddNewPrompt] = useState(false); // プロンプトの追加を表示

    // 選択したファイルをセットする
    const selectFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'text/plain', // ファイルの形式
        });
        if (result.type === 'success') {
            setFile(result);
        }
    };

    // ファイルを一連の処理を開始する
    const generate = async () => {
        //ローディングを開始する
        setNowPhase(2);
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType,
            name: file.name,
        });

        // リクエストの送信＆レスポンスの受け取り
        try {
            const response = await axios.post('https://word-ranking-api.herokuapp.com/api', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            //　ここにトークメッセージを連続した１０件取得
            const responseJsonTalk = JSON.parse(response.data.serial_talk);
            setTalk(responseJsonTalk);
            // loading画面に変移
            setNowPhase(3);

            const responseJson = JSON.parse(response.data.top_10);
            const top_100 = JSON.parse(response.data.top_100);
            // Androidの場合、なぜかこの console.log がないと動かない
            // console.log("最初の会話",responseJsonTalk);
            // console.log("トップ10",responseJson);
            console.log("トップ100", top_100);
            let words = [];
            for (let i = 0; i < top_100.length; i++) {
                words.push({ keyword: top_100[i].word, frequency: top_100[i].num_of_use, color: getRandomColorCode() })
            }
            console.log("word cloud", words)
            setCloudKeyWords(words);

            // ランキングをセット
            setRanking(responseJson);
            //chatGPTに渡すプロンプトを作成
            const message = ("以下に単語を提示しますので、そこから画像生成AIに渡すいい感じのプロンプトを考えて下さい。プロンプトは30字以内とし、体言止めで出力して下さい。必ず全ての単語を一文にまとめて下さい。"
                + responseJson[0]["word"] + "," + responseJson[1]["word"] + "," + responseJson[2]["word"])
            setPrompToChatGPT(message)
        } catch (error) {
            console.error(error);
        }
    };

    // chatGPT
    useEffect(() => {
        if (prompToChatGPT) {
            console.log("動けGPT", prompToChatGPT);
            async function generateImage() {
                try {
                    const completion = await openai.createChatCompletion({
                        model: "gpt-3.5-turbo", // string;
                        messages: [
                            {
                                role: "user",
                                content: prompToChatGPT,
                            },
                        ],
                    });
                    console.log("GPTの返答", completion.data.choices[0].message.content)
                    setPrompt_ja(completion.data.choices[0].message.content)
                } catch (error) {
                    console.error(error);
                }
            }
            generateImage();
        }
    }, [prompToChatGPT]);

    //pronptの英訳
    //prompt_jaを監視して、変更があった場合に実行される
    useEffect(() => {
        if (prompt_ja) {
            console.log(prompt_ja, "を英訳");
            // 渡されたプロンプトを英語に変換
            async function translatePrompt() {
                //　urlの{ranking}に渡った文字を英訳する
                const url = `https://api-free.deepl.com/v2/translate?auth_key=${TRANSLATE_KEY}&text=${prompt_ja}&target_lang=EN`;
                axios.post(url)
                    .then(response => {
                        // 結果をpromptに入れる
                        setPrompt_en(response.data.translations[0].text.replace('"', '') + touchPrompt);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            translatePrompt();
        }
    }, [prompt_ja]);

    //画像の生成
    //prompt_enを監視して、変更があった場合に実行される
    useEffect(() => {
        if (prompt_en) {
            console.log(prompt_en, "から画像を生成");
            async function generateImage() {
                // 画像生成の条件
                const imageParameters = {
                    prompt: prompt_en,
                    n: 1,
                    size: "256x256",
                }
                try {
                    const response = await openai.createImage(imageParameters);
                    // 結果をurlDataに入れる
                    const urlData = response.data.data[0].url;
                    // 画像が保存できる上限に達していたら、一番古い画像を削除する
                    if (imageUrls.length >= MAX_IMAGES) {
                        console.log("限界突破")
                        // 配列の最初を除外して、画像を配列に保存する
                        setImageUrls([...imageUrls.slice(1, MAX_IMAGES), urlData])
                    } else {
                        console.log("まだやれる")
                        // 画像を配列に保存する
                        setImageUrls([...imageUrls, urlData]);
                    }
                    console.log("生成された画像", imageUrls);
                    // 画像の生成完了
                    setNowPhase(4);
                } catch (error) {
                    console.error(error);
                }
            }
            generateImage();
        }
    }, [prompt_en]);

    // 画像のタッチを指定する
    const onPressReGenerate = () => {
        setSelectTouch(true);
    };

    const selectAnimeStyle = () => {
        setTouchPrompt(' anime style')
        reGenerate();
        setSelectTouch(false);
    };

    const selectRealisticStyle = () => {
        setTouchPrompt(' true-to-life actual real style')
        reGenerate();
        setSelectTouch(false);
    };

    const selectNone = () => {
        setTouchPrompt('')
        reGenerate();
        setSelectTouch(false);
    }

    const cancelReGenerate = () => {
        setSelectTouch(false);
    };

    // 画像を再生成する
    const reGenerate = () => {
        //ローディングを開始する
        setNowPhase(3);
        const message = ("以下に単語を提示しますので、そこから画像生成AIに渡すいい感じのプロンプトを考えて下さい。プロンプトは30字以内とし、体言止めで出力して下さい。必ず全ての単語を一文にまとめて下さい。"
            + ranking[0].word + "," + ranking[1].word + "," + ranking[2].word + "," + newWord)
        setPrompToChatGPT(message)
        // 入力をクリアする
        setNewWord("");
    }

    // 最初に戻る
    const reStart = () => {
        // stateを全て初期化
        setFile(null);
        setRanking(null);
        setPrompt_ja(null);
        setPrompt_en(null);
        setImageUrls([]);
        setNewWord("");
        setIsAddNewPrompt(false);
        setPrompToChatGPT(null); //chatGPTに渡すプロンプト

        //初期状態に戻る
        setNowPhase(1);
    }

    switch (nowPhase) {
        case 1:
            return (
                <View style={styles.container}>
                    <Description />
                    <View style={[styles.buttonContainer, { marginTop: 25, marginBottom: 1 }]}>
                        <Button title="ファイルを選択" onPress={selectFile} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="画像生成" onPress={generate} disabled={!file} />
                    </View>
                    <View style={styles.selectedFileContainer}>
                        {file && (
                            <Text>file: {file.name}</Text>
                        )}
                    </View>
                </View>
            )
        case 2:
            return (
                <NomalLoading />
            )
        case 3:
            return (
                <Loading file={file} talk={talk} />
            )
        case 4:
            return (
                <View style={styles.container}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {
                            ranking && imageUrls && (
                                <View style={styles.finContainer}>
                                    <Text style={styles.finRankingTitle}>👑&nbsp;単語の使用回数&nbsp;👑</Text>
                                    <View style={styles.finRankingContainer}>
                                        {/* {ranking.map((item, index) => ( */}
                                        <View style={styles.finRanking}>
                                            <Text style={[styles.finRank4to10, { color: '#ffa500', textShadowColor: "#ffd700" }]}>&nbsp;1位</Text><Text style={styles.finRankWord}>{ranking[0].word}</Text><Text>（{ranking[0].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={[styles.finRank4to10, { color: '#DBDBDB', textShadowColor: "#c0c0c0" }]}>&nbsp;2位</Text><Text style={styles.finRankWord}>{ranking[1].word}</Text><Text>（{ranking[1].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={[styles.finRank4to10, { color: '#dcb890', textShadowColor: "#b87333" }]}>&nbsp;3位</Text><Text style={styles.finRankWord}>{ranking[2].word}</Text><Text>（{ranking[2].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>&nbsp;4位</Text><Text style={styles.finRankWord}>{ranking[3].word}</Text><Text>（{ranking[3].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>&nbsp;5位</Text><Text style={styles.finRankWord}>{ranking[4].word}</Text><Text>（{ranking[4].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>&nbsp;6位</Text><Text style={styles.finRankWord}>{ranking[5].word}</Text><Text>（{ranking[5].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>&nbsp;7位</Text><Text style={styles.finRankWord}>{ranking[6].word}</Text><Text>（{ranking[6].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>&nbsp;8位</Text><Text style={styles.finRankWord}>{ranking[7].word}</Text><Text>（{ranking[7].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>&nbsp;9位</Text><Text style={styles.finRankWord}>{ranking[8].word}</Text><Text>（{ranking[8].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>10位</Text><Text style={styles.finRankWord}>{ranking[9].word}</Text><Text>（{ranking[9].num_of_use}回）</Text>
                                        </View>
                                        {/* ))} */}
                                    </View>
                                    {
                                        cloudKeyWords && (
                                            <View>
                                                <KeywordsCloud keywords={cloudKeyWords} scale={cloudScale} largestAtCenter={true} drawContainerCircle={false} containerCircleColor={'gray'} />
                                                {/* <Slider
                                                    minimumValue={100}
                                                    maximumValue={2000}
                                                    value={cloudScale}
                                                    onValueChange={(newValue)=>{setCloudScale(newValue)}}
                                                />
                                                <Text>{cloudScale}</Text> */}
                                            </View>
                                        )
                                    }
                                    <Text style={styles.finImageTitle}>トークから生成された画像</Text>

                                    <View style={styles.finImagesContainer2}>
                                        {
                                            imageUrls.length > 1 && (
                                                <View style={styles.finImagesContainer}>
                                                    <Image style={{ width: '31%', height: 0, paddingBottom: '31%', margin: 4 }} source={{ uri: imageUrls[imageUrls.length - 2] }} resizeMode="contain" />
                                                    {imageUrls.length >= 3 ? <Image style={{ width: '31%', height: 0, paddingBottom: '31%', margin: 4 }} source={{ uri: imageUrls[imageUrls.length - 3] }} resizeMode="contain" /> : ""}
                                                    {imageUrls.length >= 4 ? <Image style={{ width: '31%', height: 0, paddingBottom: '31%', margin: 4 }} source={{ uri: imageUrls[imageUrls.length - 4] }} resizeMode="contain" /> : ""}
                                                </View>
                                            )}
                                        <View style={styles.centerContainer}>
                                            <Image style={{ width: '100%', height: 0, paddingBottom: '100%', margin: 8 }} source={{ uri: imageUrls[imageUrls.length - 1] }} />
                                        </View>
                                    </View>

                                    <Text style={styles.finNowPromptTitle}>画像生成に使用した文章</Text>
                                    <View style={styles.finPromptComponent}>
                                        <Text style={styles.finNowPrompt}>{prompt_ja}</Text>
                                        {isAddNewPrompt && (
                                            <TextInput style={styles.finAddPrompt} placeholder='単語を入力' value={newWord} onChangeText={(value) => setNewWord(value)} />
                                        )}
                                    </View>
                                    <View style={styles.finRegenerateContainer}>
                                        <View style={styles.buttonContainer2}>
                                            <Button style={styles.finRegenerateButton} title="画像の再生成" onPress={onPressReGenerate} />
                                        </View>
                                        <View style={styles.buttonContainer2}>
                                            <Button style={styles.finAddPromptButton} title={isAddNewPrompt ? "やめる" : "単語の追加"} onPress={() => setIsAddNewPrompt(!isAddNewPrompt)} />
                                        </View>
                                    </View>
                                    <View style={styles.buttonContainer3}>
                                        <Button style={styles.finReturnButton} title="最初からやり直す" onPress={reStart} />
                                    </View>
                                </View>
                            )
                        }
                    </ScrollView>

                    {/* 画像のタッチを指定 */}
                    <Modal visible={selectTouch} animationType="fade">
                        <View style={styles.modalContainer}>
                            <View style={styles.selectContainer}>
                                <Text style={styles.selectText}>画像のタッチを指定してください。</Text>
                                <View style={styles.selectButtonContainer}>
                                    {/* アニメ */}
                                    <TouchableOpacity
                                        onPress={selectAnimeStyle}
                                        style={styles.animeButton}
                                    >
                                        <Text style={styles.animeButtonText}>アニメ</Text>
                                    </TouchableOpacity>
                                    {/* リアル */}
                                    <TouchableOpacity
                                        onPress={selectRealisticStyle}
                                        style={styles.realisticButton}
                                    >
                                        <Text style={styles.realisticButtonText}>リアル</Text>
                                    </TouchableOpacity>
                                    {/* 指定しない */}
                                    <TouchableOpacity
                                        onPress={selectNone}
                                        style={styles.noneButton}
                                    >
                                        <Text style={styles.noneButtonText}>指定しない</Text>
                                    </TouchableOpacity>
                                    {/* 戻る */}
                                    <TouchableOpacity
                                        onPress={cancelReGenerate}
                                        style={styles.cancelButton}
                                    >
                                        <Text style={styles.cancelButtonText}>戻る</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    centerContainer: {
        alignItems: 'center',
    },
    buttonContainer: {
        width: 135,
    },
    buttonContainer2: {
        width: 120,
    },
    buttonContainer3: {
        width: 240,
    },
    selectedFileContainer: {
        marginTop: 25,
    },
    finRankingTitle: {
        fontSize: 24,
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center',
    },
    finContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    finRankingContainer: {
        backgroundColor: '#DDFFDD',
        borderRadius: 10,
        padding: 18,
        width: '90%',
    },
    finRanking: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
    },
    finRank1: {
        fontSize: 30,
        color: '#ffa500',
        textShadowColor: "#ffd700",
        width: "18%",
        justifyContent: 'center',
    },
    finRank2: {
        fontSize: 25,
        color: '#DBDBDB',
        textShadowColor: "#c0c0c0",
        width: "18%",
        justifyContent: 'center',
    },
    finRank3: {
        fontSize: 23,
        color: '#dcb890',
        textShadowColor: "#b87333",
        width: "18%",
        justifyContent: 'center',
    },
    finRank4to10: {
        fontSize: 20,
        color: 'black',
        width: "18%",
        justifyContent: 'center',
    },
    finRankWord: {
        fontSize: 18,
        width: "60%",
        textAlign: 'center',
    },
    finImagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finImagesContainer2: {
        backgroundColor: '#e8e8e8',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: '90%',
    },
    finImageTitle: {
        fontSize: 24,
        marginBottom: 10,
        marginTop: 30,
        textAlign: 'center',
    },
    finNowPromptTitle: {
        fontSize: 20,
        marginTop: 15,
        textAlign: 'center',
    },
    finPromptComponent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
    },
    finNowPrompt: {
        fontSize: 15,
        marginTop: 10,
        textAlign: 'center',
    },
    finAddPrompt: {
        fontSize: 15,
        marginTop: 10,
        textAlign: 'center',
    },
    finRegenerateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 1,
    },
    finRegenerateButton: {
        color: 'primary',
    },
    finAddPromptButton: {
    },
    finReturnButton: {
        color: 'yellow',
        marginBottom: 50
    },

    // 画像のタッチを指定
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    selectContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    selectText: {
        fontSize: 18,
        marginBottom: 20,
    },
    selectButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    animeButton: {
        padding: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 7.5,
    },
    animeButtonText: {
        fontSize: 16,
    },
    realisticButton: {
        padding: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 7.5,
    },
    realisticButtonText: {
        fontSize: 16,
    },
    noneButton: {
        padding: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 7.5,
    },
    noneButtonText: {
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#e60012',
        padding: 10,
        borderRadius: 5,
        marginLeft: 7.5,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GetImage;