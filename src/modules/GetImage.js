import React from 'react';
import { useState, useEffect } from "react";
import { Image, Button, TextInput, View, Text } from 'react-native';
import { OPEN_AI_API_KEY } from 'dotenv';
import 'react-native-url-polyfill/auto';
import Translate from './Translate';

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const GetImage = () => {
    const MyImage = require('../../assets/MyImage.png')
    const [userPrompt, setUserPrompt] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [test, setTest] = useState("")

    useEffect(() => {
        async function translatePrompt() {
            console.log("translatePrompt")
            // const translateResult = Translate()
            const translateResult = "apple"
            setUserPrompt(translateResult)
        }
        translatePrompt()
    }, [test]);

    useEffect(() => {
        async function generateImage() {
            console.log("generateImage")
            const imageParameters = {
                prompt: userPrompt,
                n: 1,
                size: "256x256",
            }
            try {
                const response = await openai.createImage(imageParameters);
                const urlData = response.data.data[0].url
                setImageUrl(urlData);
            } catch (error) {
                console.error(error);
            }
        }
        generateImage();
    }, [userPrompt]);

    // const result = Translate()
    // console.log(result);
    const handleButtonClick = async () => {
        console.log("handleButtonClick")
        setTest("クリックされました")
        // const imageParameters = {
        //     prompt: userPrompt,
        //     n: 1,
        //     size: "256x256",
        // }
        // try {
        //     const response = await openai.createImage(imageParameters);
        //     const urlData = response.data.data[0].url
        //     setImageUrl(urlData);
        // } catch (error) {
        //     console.error(error);
        // }
    }

    return (
        <View>
            {
                imageUrl
                    ? <Image style={{ width: 100, height: 100 }} source={{ uri: imageUrl }} />
                    : <Image style={{ width: 100, height: 100 }} source={MyImage} />
            }
            {/* <TextInput placeholder='プロンプトの入力' value={userPrompt} onChangeText={(value) => setUserPrompt(value)} /> */}
            <Button title="Generate" onPress={handleButtonClick} />
            <Text>{test}</Text>
        </View>
    )
}

export default GetImage;