import React from 'react';
import { StatusBar, View, Text } from 'react-native';
// @ts-ignore
import { AuthProvider } from './src/context/AuthContext';
// @ts-ignore
import AppNav from './src/navigation/AppNav';
// @ts-ignore
import { COLORS, SHADOWS, FONTS } from './src/theme/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Custom Contexts
// @ts-ignore
import { AlertProvider } from './src/context/AlertContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// Initialize i18n
import './src/i18n/i18n';

/* Modern Toast Configuration */
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: COLORS.success, backgroundColor: COLORS.card, ...SHADOWS.dark, borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.secondary }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: COLORS.error, backgroundColor: COLORS.card, ...SHADOWS.dark, borderRadius: 12 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.secondary }}
    />
  ),
  customToast: ({ text1, text2, props }) => (
    <View style={{ height: 60, width: '90%', backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, ...SHADOWS.glow, justifyContent: 'center' }}>
      <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      {text2 && <Text style={{ color: '#333', fontSize: 13 }}>{text2}</Text>}
    </View>
  )
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AlertProvider>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <AppNav />
          </AlertProvider>
        </AuthProvider>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
