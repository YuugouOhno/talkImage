import { Text, Image, View, StyleSheet } from 'react-native';

const Header = () => {
    const IconImage = require('../../assets/talkimage-icon.png')
    return (
        <View style={styles.container}>
            <Image
                source={IconImage}
                style={{ width: 40, height: 40 }}
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
        fontSize: 25,
        marginLeft: 5
    }
});

export default Header;