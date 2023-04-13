// import React from 'react';

// import { Image, Button, TextInput, View, Text } from 'react-native';
// import { useState } from 'react';
// import axios from 'axios';
// import { TRANSLATE_KEY } from 'dotenv';
// import { OPEN_AI_API_KEY } from 'dotenv';
// import 'react-native-url-polyfill/auto';

// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//     apiKey: OPEN_AI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// const Translate = () => {
//     // 単語ランキングを取得してranking変数に代入
//     let ranking = "りんご";

//     const [translation, setTranslation] = useState('');

//     const url = `https://api-free.deepl.com/v2/translate?auth_key=${TRANSLATE_KEY}&text=${ranking}&target_lang=EN`;
//     axios.post(url)
//         .then(response => {
//             setTranslation(response.data.translations[0].text);
//         })
//         .catch(error => {
//             console.log(error);
//         });

//     return translation;

// };

// const MainProcess = () => {
//     const MyImage = require('../../assets/MyImage.png')
//     const [userPrompt, setUserPrompt] = useState("")
//     const [imageUrl, setImageUrl] = useState("")
//     const [test, setTest] = useState("")

//     const generateImage = async () => {
//         console.log(Translate())

//         setTest("クリックされました")
//         const imageParameters = {
//             prompt: userPrompt,
//             n: 1,
//             size: "256x256",
//         }
//         try {
//             const response = await openai.createImage(imageParameters);
//             const urlData = response.data.data[0].url
//             setImageUrl(urlData);
//         } catch (error) {
//             console.error(error);
//         }
//     }

//     return (
//         <View>
//             {
//                 imageUrl
//                     ? <Image style={{ width: 100, height: 100 }} source={{ uri: imageUrl }} />
//                     : <Image style={{ width: 100, height: 100 }} source={MyImage} />
//             }
//             <TextInput placeholder='プロンプトの入力' value={userPrompt} onChangeText={(value) => setUserPrompt(value)} />
//             <Button title="Generate" onPress={generateImage} />
//             <Text>{test}</Text>
//         </View>
//     )
// }

// export default MainProcess