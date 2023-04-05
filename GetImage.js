import React from 'react';
import { useState } from "react";
import { Image } from 'react-native';
import { OPEN_AI_API_KEY } from 'dotenv';
import MyImage from './assets/MyImage.png';

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const GetImage = () => {
    const [userPrompt, setUserPrompt] = useState("")
    const [imageUrl, setImageUrl] = useState("")

    const generateImage = async () => {
        const imageParameters = {
            prompt: userPrompt,
            n: 1,
            size: "256x256",
        }
        const response = await openai.createImage(imageParameters);
        const urlData = response.data.data[0].url
        console.log(urlData);
        setImageUrl(urlData);
    }

    return (
        <div className="App">
            {
                imageUrl
                    ? <img src={imageUrl} className="image" alt="ai thing" />
                    : <img src={MyImage} className="image" alt="MyImage" />
            }
            <input
                placeholder='プロンプトの入力'
                onChange={(e) => setUserPrompt(e.target.value)}
            />
            <button onClick={() => generateImage()}>Generate</button>
        </div>
    )
}

export default GetImage;