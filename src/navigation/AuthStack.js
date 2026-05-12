import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LanguageSelectScreen from '../screens/Auth/LanguageSelectScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const { hasSelectedLanguage } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={hasSelectedLanguage ? "Register" : "LanguageSelect"}>
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
