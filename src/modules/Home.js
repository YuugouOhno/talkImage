import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import GetImage from './GetImage';

const Home = () => {
    return (
        <View style={styles.container}>
          <GetImage />
          <StatusBar style="auto" />
        </View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  }
});

export default Home;