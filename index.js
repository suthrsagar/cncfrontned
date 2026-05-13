/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { NotificationService } from './src/services/NotificationService';

// Register background handler early for Firebase Messaging
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // Display the rich notification via Notifee
  await NotificationService.displayRichNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
