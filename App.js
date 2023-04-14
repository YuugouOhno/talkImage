import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GetImage from "./src/modules/GetImage"
import { StatusBar } from 'expo-status-bar';
import Header from "./src/modules/Header"

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

export default function SplashScreen() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }
  });
  function HomeScreen() {
    return (
      <View style={styles.container}>
        <GetImage />
        <StatusBar style="auto" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CC764',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          // ここで、headerTitleにtitleコンポーネントを渡してあげます。
          options={{ headerTitle: Header }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

