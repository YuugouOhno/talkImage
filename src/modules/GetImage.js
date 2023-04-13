import React from 'react';
import { useState, useEffect } from "react";
import { Image, Button, TextInput, View, Text } from 'react-native';
import 'react-native-url-polyfill/auto';
import { OPEN_AI_API_KEY } from 'dotenv';
import { TRANSLATE_KEY } from 'dotenv';
import axios from 'axios';

// openAIのキーを設定
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const GetImage = () => {
    const MyImage = require('../../assets/MyImage.png')
    const [prompt, setPrompt] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [ranking, setRankings] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    
    //promptを監視して、変更があった場合に実行される
    useEffect(() => {
        async function generateImage() {
            // 画像生成の条件
            const imageParameters = {
                prompt: prompt,
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
    }, [prompt]);

    // 処理の開始
    const generate = async () => {
        // 画像生成までのローディングを表示
        setIsLoading(true);
        // 渡されたプロンプトを英語に変換
        async function translatePrompt() {
            //　urlの{ranking}に渡った文字を英訳する
            const url = `https://api-free.deepl.com/v2/translate?auth_key=${TRANSLATE_KEY}&text=${ranking}&target_lang=EN`;
            axios.post(url)
                .then(response => {
                    // 結果をpromptに入れる
                    setPrompt(response.data.translations[0].text);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        translatePrompt()
    }

    return (
        <View>
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
            <TextInput placeholder='プロンプトの入力' value={ranking} onChangeText={(value) => setRankings(value)} />
            <Button title="Generate" onPress={generate} />
        </View>
    )
}

export default GetImage;