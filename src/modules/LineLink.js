import React, { useState, useEffect, useCallback} from "react";
import {Button, View, StyleSheet, Linking } from 'react-native';

const LineLinkButton = ({children}) => {

    // Lineのトーク画面に遷移するスキーム
    const lineTalkUrl = 'https://line.me/R/nv/chat';

    const handlePress = useCallback(async () => {

        await Linking.openURL(lineTalkUrl);

    });

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      });
    
    return (
        <View>
            <Button title={children} onPress={handlePress} />
        </View>
    );
};

export { LineLinkButton };