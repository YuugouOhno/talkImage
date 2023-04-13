import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import GetImage from "./src/modules/GetImage"

export default function App() {
  return (
    <View style={styles.container}>
      <Text>あなたのトークからイラストを出力します！！！！！！</Text>
      <GetImage />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
