import React, { useEffect } from 'react';
import { StatusBar, View, Text, PermissionsAndroid, Platform, Alert } from 'react-native';
// @ts-ignore
import { AuthProvider } from './src/context/AuthContext';
// @ts-ignore
import AppNav from './src/navigation/AppNav';
// @ts-ignore
import { COLORS, SHADOWS, FONTS } from './src/theme/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Custom Contexts
// @ts-ignore
import { AlertProvider } from './src/context/AlertContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// Initialize i18n
import './src/i18n/i18n';

/* Modern Toast Configuration */
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: COLORS.success, backgroundColor: COLORS.card, ...SHADOWS.dark, borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.secondary }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: COLORS.error, backgroundColor: COLORS.card, ...SHADOWS.dark, borderRadius: 12 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.secondary }}
    />
  ),
  customToast: ({ text1, text2, props }: any) => (
    <View style={{ height: 60, width: '90%', backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, ...SHADOWS.glow, justifyContent: 'center' }}>
      <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      {text2 && <Text style={{ color: '#333', fontSize: 13 }}>{text2}</Text>}
    </View>
  )
};

const App = () => {

  useEffect(() => {
    async function setupNotifications() {
      try {
        // 1. Request permissions for iOS
        if (Platform.OS === 'ios') {
          await messaging().requestPermission();
        } else if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }

        // 2. Get FCM Token
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        // You should send this token to your backend to save against the user profile

        // 3. Create Android Channel for Notifee
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        // 4. Handle Foreground Messages
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          console.log('A new FCM message arrived in foreground!', remoteMessage);
          
          // Display a local notification via Notifee
          await notifee.displayNotification({
            title: remoteMessage.notification?.title || 'New Notification',
            body: remoteMessage.notification?.body || '',
            android: {
              channelId,
              smallIcon: 'ic_launcher', // Update with your actual small icon
              pressAction: {
                id: 'default',
              },
            },
          });
        });

        // 5. Handle Notification opening app from background
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification caused app to open from background state:', remoteMessage.notification);
          // Handle Navigation here
        });

        // 6. Handle Notification opening app from quit state
        messaging().getInitialNotification().then(remoteMessage => {
          if (remoteMessage) {
            console.log('Notification caused app to open from quit state:', remoteMessage.notification);
            // Handle Navigation here
          }
        });

        return unsubscribe;
      } catch (error) {
        console.log('Error setting up notifications', error);
      }
    }

    setupNotifications();
  }, []);

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
