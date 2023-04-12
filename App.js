import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import GetImage from "./src/modules/GetImage"
import MainProcess from "./src/modules/main"
// import Ranking from "./src/modules/Ranking"

export default function App() {
  return (
    <View style={styles.container}>
      {/* <Ranking /> */}
      <Text>あなたのトークからイラストを出力します！！！！！！</Text>
      <GetImage />
      {/* <MainProcess /> */}
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
