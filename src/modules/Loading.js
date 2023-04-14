import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Loading = () => {

  // テキストファイルから取得したメッセージを格納
  const [messages, setMessages] = useState([
    { sender: 'me', text: 'おはよう' },
    { sender: 'you', text: 'おは' },
    { sender: 'me', text: '元気?' },
    { sender: 'you', text: '元気に決まってんだろ?' },
    { sender: 'me', text: 'Be quiet' },
    { sender: 'you', text: '怒るなよ' },
    { sender: 'me', text: 'Unmnmnmn' },
    { sender: 'you', text: 'お前ハーフだっけ？' },
    { sender: 'me', text: 'Be quiet' }
  ]);

  // 表示されるメッセージ数を格納
  const [currentMessages, setCurrentMessages] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading');
  
  useEffect(() => {
     
    // 1秒毎に表示するメッセージ数を1増やす
    const interval = setInterval(() => {
      setCurrentMessages((prevIndex) => {
        if (prevIndex === messages.length - 1) {
          clearInterval(interval);
        }
        return prevIndex + 1;
      });
      setLoadingText((prev) => {
        if (prev.length >= 13) {
          return 'Loading';
        }
        return ' ' + prev + '.';
      });
    }, 500);

    // クリーンアップ関数で再レンダリングの際にinterval()を停止
    return () => clearInterval(interval);
  }, []);

  
  const renderMessage = (message, index) => {
    const me = message.sender === 'me';
    const containerStyle = {
      backgroundColor: me ? '#DCF8C5' : '#FFF',
      alignSelf: me ? 'flex-end' : 'flex-start',
      borderRadius: 5,
      marginBottom: 10,
      padding: 10,
      maxWidth: '80%'
    };
    return (
      <View key={index} style={containerStyle}>
        <Text>{message.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        {messages.slice(0, currentMessages + 1).map(renderMessage)}
      </View>
      <View style={styles.overlay}/>
      <Text style={styles.loading}>{loadingText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
    paddingTop:100,
  },
  messagesContainer: {
    flex: 1,
    width: '100%'
  },
  loading:{
    position:'absolute',
    fontSize:30,
    fontWeight:'bold',
  },
  overlay:{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明の色
  }

});

export default Loading;
