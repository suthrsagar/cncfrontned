import React from 'react';
import { StatusBar } from 'react-native';
// @ts-ignore
import { AuthProvider } from './src/context/AuthContext';
// @ts-ignore
import AppNav from './src/navigation/AppNav';
// @ts-ignore
import { COLORS } from './src/theme/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <AppNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
