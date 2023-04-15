import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Button, ScrollView, } from 'react-native';
import GetImage from "./src/modules/GetImage"

export default function App() {
  const [description, setDescription] = useState(false);
  const [page, setPage] = useState(1);

  const nextPage = () => {setPage(page + 1);};
  const prevPage = () => {setPage(page - 1);};
  const closePage = () => {
      setDescription(false)
      setPage(1)
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        visible={description}
        onRequestClose={closePage}
      >
        <View style={styles.container}>
          {page === 1 && (
              <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.nobr}>
                  <Text style={[styles.title, { marginLeft: 15 }]}>アプリの使い方</Text>
                  <TouchableOpacity onPress={closePage}>
                    <Text style={styles.cross}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>1. トーク履歴をダウンロードする</Text>
                <Image source={require('./assets/description_1.png')} style={styles.screenshot} />
                <Text>
                  LINEトーク画面の右上を押して、{'\n'}
                  <Text style={styles.emphasisText}>[その他&nbsp;{'>'}トーク履歴を送信]</Text>&nbsp;から{'\n'}
                  ダウンロードします。
                </Text>
                <View style={styles.popupButton}>
                  <Button title='次へ' onPress={nextPage} />
                </View>
              </ScrollView>
          )}

          {page === 2 && (
              <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.nobr}>
                  <Text style={[styles.title, { marginLeft: 15 }]}>アプリの使い方</Text>
                  <TouchableOpacity onPress={closePage}>
                    <Text style={styles.cross}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>2. ファイルをアップロードする</Text>
                <Image source={require('./assets/description_2.png')} style={styles.screenshot} />
                <Text>
                  ファイル選択後に&nbsp;<Text style={styles.emphasisText}>[画像の生成]</Text>&nbsp;を押すと{'\n'}
                  <Text style={styles.emphasisText}>
                    &nbsp;・単語の使用回数ランキング{'\n'}
                    &nbsp;・ランキングのTOP3で生成された画像{'\n'}
                  </Text>
                  が表示されます。
                </Text>
                <View style={[styles.popupButton, styles.nobr]}>
                  <Button title='戻る' onPress={prevPage}/>
                  <Button title='次へ' onPress={nextPage}/>
                </View>
              </ScrollView>
          )}

          {page === 3 && (
              <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.nobr}>
                  <Text style={[styles.title, { marginLeft: 15 }]}>アプリの使い方</Text>
                  <TouchableOpacity onPress={closePage}>
                    <Text style={styles.cross}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>3. フリーワードを入力する</Text>
                <Image source={require('./assets/description_2.png')} style={styles.screenshot} />
                <Text>
                  フリーワードを入力することで、{'\n'}
                  追加で画像を生成できます。{'\n'}
                  (<Text style={styles.emphasisText}>画像の生成は一度に3枚まで</Text>)
                </Text>
                <View style={[styles.popupButton, styles.nobr]}>
                  <Button title='戻る' onPress={prevPage}/>
                  <Button title='次へ' onPress={nextPage}/>
                </View>
              </ScrollView>
          )}

          {page === 4 && (
              <View style={styles.container}>
                <Text style={styles.title}>アプリの使い方</Text>
                <Text style={styles.subtitle}>注意事項</Text>
                <Text style={{ marginTop: 10 }}>
                  ・トーク量が少ない場合は画像が生成されません。{'\n'}
                  ・ファイルの名前や中身は編集しないで下さい。{'\n'}
                  ・グループチャットの画像生成には非対応です。{'\n'}
                  ・LINEの設定言語は日本語にして下さい。
                </Text>
                <View style={[styles.popupButton, styles.nobr]}>
                  <Button title='戻る' onPress={prevPage}/>
                  <Button title='終了' onPress={closePage}/>
                </View>
              </View>
          )}
        </View>
      </Modal>

      <Text style={styles.title}>LINEのトーク履歴で画像生成</Text>
      <View style={styles.nobr}>
        <Text>あなたと友人の会話から画像を生成します。</Text>
        <TouchableOpacity onPress={() => setDescription(true)}>
          <Image source={require('./assets/help.png')} style={styles.help} />
        </TouchableOpacity>
      </View>
      <GetImage />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    paddingTop: 10,
  },
  screenshot: {
    width: 240,
    height: 510,
    marginTop: 20,
    marginBottom: 20,
  },
  emphasisText: {
    fontWeight: 'bold',
  },
  popupButton: {
    marginTop: 20,
  },
  nobr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  help: {
    width: 15,
    height: 15,
  },
  cross: {
    fontSize: 25,
    color: '#717375',
    marginLeft: 10,
  }
});
