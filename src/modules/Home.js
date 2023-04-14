import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import GetImage from './GetImage';

const Home = () => {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        }
    });
    return (
        <View style={styles.container}>
            <GetImage />
            <StatusBar style="auto" />
        </View>
    )
}

export default Home