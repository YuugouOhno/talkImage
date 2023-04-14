import { Text, Image, View, StyleSheet } from 'react-native';

const Header = () => {
    const IconImage = require('../../assets/talkimage-icon.png')
    return (
        <View style={styles.container}>
            <Image
                source={IconImage}
                style={{ width: 50, height: 50 }}
            />
            <Text style={styles.text}>Talk Image</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text:{
        color: "white",
        fontSize: 35,
        marginLeft: 5
    }
});

export default Header;