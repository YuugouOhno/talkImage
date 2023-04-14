import React from 'react';
import Home from "./src/modules/Home"
import Header from "./src/modules/Header"
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
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
          component={Home}
          // ここで、headerTitleにtitleコンポーネントを渡してあげます。
          options={{ headerTitle: Header }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;