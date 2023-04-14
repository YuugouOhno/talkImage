import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import GetImage from "./src/modules/GetImage"
import Header from "./src/modules/Header"
import Footer from "./src/modules/Footer"

export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <GetImage />
      <Footer />
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
