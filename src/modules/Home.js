import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import GetImage from './GetImage';

const Home = () => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <GetImage />
          <StatusBar style="auto" />
        </View>
)};

export default Home;