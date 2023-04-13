import React, { useState, useEffect } from "react";
import { Image, Button, TextInput, View, Text } from 'react-native';
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
    const [file, setFile] = useState(null);
    const [ranking, setRanking] = useState(null);
    const [prompt_ja, setPrompt_ja] = useState(null);
    const [prompt_en, setPrompt_en] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 選択したファイルをセットする
    const selectFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'text/plain',
        });
        if (result.type === 'success') {
            setFile(result);
        }
    };

    // リクエストの作成
    const submitFile = async () => {
        setIsLoading(true);
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
            setRanking(responseJson)
            setPrompt_ja(responseJson[0]["word"] + " " + responseJson[1]["word"] + " " + responseJson[2]["word"]) 
        } catch (error) {
            console.error(error);
        }
    };

    //画像の生成
    //prompt_enを監視して、変更があった場合に実行される
    useEffect(() => {
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
                // ローディングの終了
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        generateImage();
    }, [prompt_en]);

    //pronptの英訳
    //prompt_jaを監視して、変更があった場合に実行される
    useEffect(() => {
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

    return (
        <View>
            <Button title="ファイルを選択してください" onPress={selectFile} />
            {file && (
                <Text>選択されたファイル：{file.name}</Text>
            )}

            <Button title="画像の生成" onPress={submitFile} disabled={!file} />
            {ranking && (
                ranking.map((item, index) => (
                    <View key={index}>
                        <Text>{item.rank}位「{item.word}」（{item.num_of_use}回）</Text>
                    </View>
                )))}
            {
                imageUrl
                    ? <Image style={{ width: 100, height: 100 }} source={{ uri: imageUrl }} />
                    : ""
            }
            {
                isLoading
                    ? <Text>now loading ...</Text>
                    : ""
            }
        </View>
    )
}

export default GetImage;