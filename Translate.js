import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';

const Translate = () => {
    
    const apiKey = require('./.env').TRANSLATE_KEY;

    // 単語ランキングを取得してranking変数に代入
    let ranking = "ランキング";

    const [translation, setTranslation] = useState('a');

    const url = `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${ranking}&target_lang=EN`;
    axios.post(url)
      .then(response => {
        setTranslation(response.data.translations[0].text);
      })
      .catch(error => {
        console.log(error);
      });

    return translation;

};

export default Translate;
