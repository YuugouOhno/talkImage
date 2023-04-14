import React, { useState, useEffect } from "react";
import { Image, Button, View, Text, TextInput } from 'react-native';
import 'react-native-url-polyfill/auto';
import { OPEN_AI_API_KEY } from 'dotenv';
import { TRANSLATE_KEY } from 'dotenv';
import axios from 'axios';

import * as DocumentPicker from 'expo-document-picker';

// openAIのキーを設定
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const GetImage = () => {
    const [file, setFile] = useState(null); // トークのtxtファイル
    const [ranking, setRanking] = useState(null); // トークでのランキングトップ１０
    const [prompt_ja, setPrompt_ja] = useState(null); // ランキングトップ３をカンマ区切りで
    const [prompt_en, setPrompt_en] = useState(null); // 上を英訳
    const [imageUrl, setImageUrl] = useState(null); // 出力された画像のURL
    const [newWord, setNewWord] = useState(null); // プロンプトを後から追加

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
            const responseJson = JSON.parse(response.data.content);
            // ランキングをセット
            setRanking(responseJson)
            //　上位3位をセット
            setPrompt_ja(responseJson[0]["word"] + "," + responseJson[1]["word"] + "," + responseJson[2]["word"])
        } catch (error) {
            console.error(error);
        }
    };

    //pronptの英訳
    //prompt_jaを監視して、変更があった場合に実行される
    useEffect(() => {
        console.log(prompt_ja, "を英訳")
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
            translatePrompt()
        }
    }, [prompt_ja]);

    //画像の生成
    //prompt_enを監視して、変更があった場合に実行される
    useEffect(() => {
        console.log(prompt_en, "から画像を生成")
        async function generateImage() {
            // 画像生成の条件
            const imageParameters = {
                prompt: prompt_en,
                n: 1,
                size: "256x256",
            }
            try {
                const response = await openai.createImage(imageParameters);
                const urlData = response.data.data[0].url
                // 結果をurlDataに入れる
                setImageUrl(urlData);
                // 画像の生成完了
                setNowPhase(3);
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
        // 入力をクリアする
        setNewWord(null);
        const newPrompt = prompt_ja + "," + newWord
        setPrompt_ja(newPrompt)
    }

    // 最初に戻る
    const reStart = () => {
        // stateを全て初期化
        setFile(null);
        setRanking(null);
        setPrompt_ja(null);
        setPrompt_en(null);
        setImageUrl(null);
        setNewWord(null);

        //初期状態に戻る
        setNowPhase(1);
    }

    switch (nowPhase) {
        case 1:
            return (
                <View>
                    <Text>あなたのトーク履歴から、世界に一枚だけの画像を生成します</Text>
                    <Button title="ファイルを選択してください" onPress={selectFile} />
                    {
                        file && (
                            <Text>選択されたファイル：{file.name}</Text>
                        )
                    }
                    <Button title="画像の生成" onPress={generate} disabled={!file} />
                </View>
            )
        case 2:
            return (
                <View>
                    <Text>now loading ...</Text>
                </View>
            )
        case 3:
            return (
                <View>
                    {
                        ranking && imageUrl && (
                            <View>
                                {ranking.map((item, index) => (
                                <View key={index}>
                                    <Text>{item.rank}位「{item.word}」（{item.num_of_use}回）</Text>
                                </View>
                                ))}
                                <Image style={{ width: 100, height: 100 }} source={{ uri: imageUrl }} />
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

export default GetImage;