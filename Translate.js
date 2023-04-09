import { useState } from 'react';
import axios from 'axios';
import { TRANSLATE_KEY } from 'dotenv';

const Translate = () => {
  // 単語ランキングを取得してranking変数に代入
  let ranking = "りんご";

  const [translation, setTranslation] = useState('a');

  const url = `https://api-free.deepl.com/v2/translate?auth_key=${TRANSLATE_KEY}&text=${ranking}&target_lang=EN`;
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
