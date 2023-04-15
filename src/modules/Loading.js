import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const NomalLoading = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400, // 1秒でフェードインする
      useNativeDriver: true, // ネイティブアニメーションを使用
    }).start();
  }, [fadeAnim]);


  return (
    <View style={normalLoadingStyles.container}>
      <Animated.View style={[normalLoadingStyles.overlay, { opacity: fadeAnim }]} />
      <Animated.Text style={[normalLoadingStyles.loading, { opacity: fadeAnim }]}>
        Loading
      </Animated.Text>
    </View>
  );
};

const Loading = (props) => {
  // ファイル名を親コンポーネントから取得
  const fileName = props.file.name;
  // ファイル名からトーク相手の名前を取得
  const you = fileName.replace('[LINE] ','').replace('とのトーク.txt','');
  const talkHistories = props.talk;
  
  // テキストファイルから取得したメッセージを格納
  const [messages, setMessages] = useState([
    { sender: talkHistories[0]["name"], text: talkHistories[0]["talk"] },
    { sender: talkHistories[1]["name"], text: talkHistories[1]["talk"] },
    { sender: talkHistories[2]["name"], text: talkHistories[2]["talk"] },
    { sender: talkHistories[3]["name"], text: talkHistories[3]["talk"] },
    { sender: talkHistories[4]["name"], text: talkHistories[4]["talk"] },
    { sender: talkHistories[5]["name"], text: talkHistories[5]["talk"] },
    { sender: talkHistories[6]["name"], text: talkHistories[6]["talk"] },
    { sender: talkHistories[7]["name"], text: talkHistories[7]["talk"] },
    { sender: talkHistories[8]["name"], text: talkHistories[8]["talk"] },
    { sender: talkHistories[9]["name"], text: talkHistories[9]["talk"] },
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
    const containerStyle = {
      backgroundColor: you == message.sender ? '#FFF' : '#DCF8C5',
      alignSelf: you == message.sender ? 'flex-start' : 'flex-end',
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

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400, // 1秒でフェードインする
      useNativeDriver: true, // ネイティブアニメーションを使用
    }).start();
  }, [fadeAnim]);


  return (
    <View style={loadingStyles.container}>
      <Animated.View style={[loadingStyles.messagesContainer, { opacity: fadeAnim}]}>
        {messages.slice(0, currentMessages + 1).map(renderMessage)}
      </Animated.View>
      <View style={loadingStyles.overlay}/>
      <Text style={loadingStyles.loading}>{loadingText}</Text>
    </View>
  );
};

const normalLoadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
    paddingTop:100,
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

const loadingStyles = StyleSheet.create({
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
    fontWeight:'bold'
  },
  overlay:{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明の色
  }

});

export {NomalLoading, Loading};