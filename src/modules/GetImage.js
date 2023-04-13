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
    const [isLoading, setIsLoading] = useState(false); // ローディング中の判定
    const [newWord, setNewWord] = useState(null); // プロンプトを後から追加

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
        console.log(prompt_ja,"を英訳")
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
        console.log(prompt_en,"から画像を生成")
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

    const addPrompt = () => {
        const newPrompt = prompt_ja + "," + newWord
        setPrompt_ja(newPrompt)
        console.log("追加じゃわっふぉい",newPrompt,newWord,prompt_ja)
    }

    return (
        <View>
            <Button title="ファイルを選択してください" onPress={selectFile} />
            {file && (
                <Text>選択されたファイル：{file.name}</Text>
            )}
            {ranking && (
                ranking.map((item, index) => (
                    <View key={index}>
                        <Text>{item.rank}位「{item.word}」（{item.num_of_use}回）</Text>
                    </View>
                )))}
            {
                imageUrl
                    ?
                    <View>
                        <Image style={{ width: 100, height: 100 }} source={{ uri: imageUrl }} />
                        <Text>プロンプト：{prompt_ja}</Text>
                        <TextInput placeholder='プロンプトの追加' value={newWord} onChangeText={(value) => setNewWord(value)} />
                        <Button title="画像の生成" onPress={addPrompt}/>
                    </View>
                    : 
                    <Button title="画像の生成" onPress={generate} disabled={!file} />
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