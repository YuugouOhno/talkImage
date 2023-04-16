import React, { useState, useEffect } from "react";
import { ScrollView, Image, Button, View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import 'react-native-url-polyfill/auto';
import { OPEN_AI_API_KEY } from 'dotenv';
import { TRANSLATE_KEY } from 'dotenv';
import axios from 'axios';
import Description from './Description';
import { NomalLoading } from './Loading';
import { Loading } from './Loading';

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
            // Androidの場合、なぜかこの console.log がないと動かない
            console.log(responseJsonTalk);
            console.log(responseJson);
            // ランキングをセット
            setRanking(responseJson);
            //chatGPTに渡すプロンプトを作成
            const message = ("以下に単語を提示しますので、そこから画像生成AIに渡すいい感じのプロンプトを考えて下さい。プロンプトは30 字程度とし、体言止めで出力して下さい。"
                                + responseJson[0]["word"] + "," + responseJson[1]["word"] + "," + responseJson[2]["word"])
            setPrompToChatGPT(message)
        } catch (error) {
            console.error(error);
        }
    };

    // chatGPT
    useEffect(() => {
        console.log("動けGPT",prompToChatGPT);
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
    }, [prompToChatGPT]);

    //pronptの英訳
    //prompt_jaを監視して、変更があった場合に実行される
    useEffect(() => {
        console.log(prompt_ja, "を英訳");
        if (prompt_ja) {
            // 渡されたプロンプトを英語に変換
            async function translatePrompt() {
                //　urlの{ranking}に渡った文字を英訳する
                const url = `https://api-free.deepl.com/v2/translate?auth_key=${TRANSLATE_KEY}&text=${prompt_ja}&target_lang=EN`;
                axios.post(url)
                    .then(response => {
                        // 結果をpromptに入れる
                        setPrompt_en(response.data.translations[0].text);
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
    }, [prompt_en]);

    // 画像を再生成する
    const reGenerate = () => {
        //ローディングを開始する
        setNowPhase(3);
        const newPrompt = prompt_ja + "," + newWord;
        setPrompt_ja(newPrompt);
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
                    <ScrollView>
                        {
                            ranking && imageUrls && (
                                <View style={styles.finContainer}>
                                    <Text style={styles.finRankingTitle}>👑使った言葉ランキング👑</Text>
                                    <View style={styles.finRankingContainer}>
                                        {/* {ranking.map((item, index) => ( */}
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank1}>1位</Text><Text style={styles.finRankWord}>{ranking[0].word}</Text><Text>（{ranking[0].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank2}>2位</Text><Text style={styles.finRankWord}>{ranking[1].word}</Text><Text>（{ranking[1].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank3}>3位</Text><Text style={styles.finRankWord}>{ranking[2].word}</Text><Text>（{ranking[2].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}> 4位</Text><Text style={styles.finRankWord}>{ranking[3].word}</Text><Text>（{ranking[3].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}> 5位</Text><Text style={styles.finRankWord}>{ranking[4].word}</Text><Text>（{ranking[4].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}> 6位</Text><Text style={styles.finRankWord}>{ranking[5].word}</Text><Text>（{ranking[5].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}> 7位</Text><Text style={styles.finRankWord}>{ranking[6].word}</Text><Text>（{ranking[6].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}> 8位</Text><Text style={styles.finRankWord}>{ranking[7].word}</Text><Text>（{ranking[7].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}> 9位</Text><Text style={styles.finRankWord}>{ranking[8].word}</Text><Text>（{ranking[8].num_of_use}回）</Text>
                                        </View>
                                        <View style={styles.finRanking}>
                                            <Text style={styles.finRank4to10}>10位</Text><Text style={styles.finRankWord}>{ranking[9].word}</Text><Text>（{ranking[9].num_of_use}回）</Text>
                                        </View>
                                        {/* ))} */}
                                    </View>
                                    <Text style={styles.finImageTitle}>トークから生成された画像</Text>

                                    {
                                        imageUrls.length > 1 && (
                                            <View style={styles.finImagesContainer}>
                                                <Image style={{ width: 100, height: 100, margin: 4 }} source={{ uri: imageUrls[imageUrls.length - 2] }} resizeMode="contain" />
                                                {imageUrls.length >= 3 ? <Image style={{ width: 100, height: 100, margin: 4 }} source={{ uri: imageUrls[imageUrls.length - 3] }} resizeMode="contain" /> : ""}
                                                {imageUrls.length >= 4 ? <Image style={{ width: 100, height: 100, margin: 4 }} source={{ uri: imageUrls[imageUrls.length - 4] }} resizeMode="contain" /> : ""}
                                            </View>
                                        )}
                                    <Image style={{ width: 320, height: 320, margin: 8 }} source={{ uri: imageUrls[imageUrls.length - 1] }} />

                                    <Text style={styles.finNowPromptTitle}>使用したプロンプト</Text>
                                    <View style={styles.finPromptComponent}>
                                        <Text style={styles.finNowPrompt}>{prompt_ja}</Text>
                                        {isAddNewPrompt && (
                                            <TextInput style={styles.finAddPrompt} placeholder='追加するプロンプト' value={newWord} onChangeText={(value) => setNewWord(value)} />
                                        )}
                                    </View>
                                    <View style={styles.finRegenerateContainer}>
                                        <Button style={styles.finRegenerateButton} title="画像の再生成" onPress={reGenerate} />
                                        <Button style={styles.finAddPromptButton} title={isAddNewPrompt ? "やめる" : "プロンプトを追加する"} onPress={() => setIsAddNewPrompt(!isAddNewPrompt)} />
                                    </View>
                                    <Button style={styles.finReturnButton} title="最初からやり直す" onPress={reStart} />
                                </View>
                            )
                        }
                    </ScrollView>
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
    buttonContainer: {
        width: 130,
    },
    selectedFileContainer: {
        marginTop: 25,
    },
    finRankingTitle: {
        fontSize: 30,
        marginBottom: 10,
        marginTop: 30,
        textAlign: 'center',
    },
    finContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    finRankingContainer: {
        backgroundColor: 'white',
        width: '80%',
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
        fontSize: 20,
        width: "60%",
        textAlign: 'center',
    },
    finImagesContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finImageTitle: {
        fontSize: 30,
        marginBottom: 10,
        marginTop: 30,
        textAlign: 'center',
    },
    finNowPromptTitle: {
        fontSize: 20,
        marginTop: 10,
        textAlign: 'center',
    },
    finPromptComponent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finNowPrompt: {
        fontSize: 15,
        marginTop: 10,
        textAlign: 'center',
    },
    finAddPrompt: {
        fontSize: 20,
        marginTop: 10,
        textAlign: 'center',
    },
    finRegenerateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finRegenerateButton: {
        color: 'primary',
    },
    finAddPromptButton: {

    },
    finReturnButton: {
        color: 'yellow',
        marginBottom: 50
    }
});

export default GetImage;