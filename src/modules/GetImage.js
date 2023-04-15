import React, { useState, useEffect } from "react";
import { Image, Button, View, Text, TextInput, StyleSheet } from 'react-native';
import 'react-native-url-polyfill/auto';
import { OPEN_AI_API_KEY } from 'dotenv';
import { TRANSLATE_KEY } from 'dotenv';
import axios from 'axios';
import Description from './Description';
import {NomalLoading} from './Loading';
import {Loading} from './Loading';

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
    const [prompt_en, setPrompt_en] = useState(null); // 上を英訳
    const [imageUrls, setImageUrls] = useState([]); // 出力された画像のURL
    const [newWord, setNewWord] = useState(""); // プロンプトを後から追加
    const MAX_IMAGES = 3 // 画像の保存上限を指定

    // 現在のフェーズを判定する　1:初期状態 2:ローディング中 3: 生成完了
    const [nowPhase, setNowPhase] = useState(1);

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
            // ランキングをセット
            setRanking(responseJson);
            //　上位3位をセット
            setPrompt_ja(responseJson[0]["word"] + "," + responseJson[1]["word"] + "," + responseJson[2]["word"])
        } catch (error) {
            console.error(error);
        }
    };

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
                    setImageUrls([...imageUrls.slice(1,MAX_IMAGES),urlData])
                } else {
                    console.log("まだやれる")
                    // 画像を配列に保存する
                    setImageUrls([...imageUrls, urlData]);
                }
                console.log("生成された画像",imageUrls);
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
        setNowPhase(2);
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
                <NomalLoading/>
            )
        case 3:
            return (
                <Loading file={file} talk={talk}/>
            )
        case 4:
            return (
                <View style={styles.container}>
                    {
                        ranking && imageUrls && (
                            <View>
                                {ranking.map((item, index) => (
                                    <View key={index}>
                                        <Text>{item.rank}位「{item.word}」（{item.num_of_use}回）</Text>
                                    </View>
                                ))}
                                {imageUrls.map((url, index) => (
                                    <View key={index}>
                                        <Image style={{ width: 100, height: 100 }} source={{ uri: url }} />
                                    </View>
                                ))}
                                <Text>プロンプト：{prompt_ja}</Text>
                                <TextInput placeholder='プロンプトの追加' value={newWord} onChangeText={(value) => setNewWord(value)} />
                                <Button title="画像の再生成" onPress={reGenerate} />
                                <Button title="最初からやり直す" onPress={reStart} />
                            </View>
                        )
                    }
                </View>
            )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 10,
    },
    buttonContainer: {
        width: 130,
    },
    selectedFileContainer: {
        marginTop: 25,
    },
});

export default GetImage;