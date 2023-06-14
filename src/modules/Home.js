import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import GetImage from './GetImage';
import WordCloud from './WordCloud';

const Home = () => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <GetImage />
          <StatusBar style="auto" />
          {/* <WordCloud/> */}
        </View>
)};

export default Home;