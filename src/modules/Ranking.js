import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const Ranking = () => {
  const [file, setFile] = useState(null);
  const [ranking, setRanking] = useState(null);

  // 選択したファイルをセットする
  const selectFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
    });
    if (result.type === 'success') {
      setFile(result.file);
    }
  };

  // リクエストの作成
  const submitFile = async () => {
    const formData = new FormData();
    formData.append('file', file);

    // リクエストの送信＆レスポンスの受け取り
    try {
      const response = await axios.post('https://word-ranking-api.herokuapp.com/api', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const responseJson = JSON.parse(response.data.content);
      setRanking(responseJson)
      console.log(responseJson);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>Word Ranking.</Text>
      <Button title="ファイルを選択してください" onPress={selectFile} />
      {file && (
        <Text>選択されたファイル：{file.name}</Text>
      )}

      <Button title="送信" onPress={submitFile} disabled={!file} />
      {ranking && (
        ranking.map((item, index) => (
        <View key={index}>
          <Text>{item.rank}位「{item.word}」（{item.num_of_use}回）</Text>
        </View>
      )))}
    </View>
  );
}

export default Ranking
