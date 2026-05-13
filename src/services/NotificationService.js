import notifee, { AndroidImportance, AndroidStyle, EventType, AndroidColor } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import * as RootNavigation from '../navigation/RootNavigation'; // Ensure this exists and works

export class NotificationService {
  
  static async setupChannels() {
    // 1. Order Channel (High Priority)
    await notifee.createChannel({
      id: 'orders',
      name: 'Order Updates',
      importance: AndroidImportance.HIGH,
      sound: 'default', // Can add custom sound file in res/raw
      vibration: true,
      vibrationPattern: [300, 500],
    });
    
    // 2. Explore Channel (Media/Designs)
    await notifee.createChannel({
      id: 'explore',
      name: 'New Designs & Models',
      importance: AndroidImportance.DEFAULT,
      vibration: true,
    });
    
    // 3. Chat Channel (High Priority)
    await notifee.createChannel({
      id: 'chat',
      name: 'Messages',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }

  static async displayRichNotification(remoteMessage) {
    const { title, body } = remoteMessage.notification || {};
    const data = remoteMessage.data || {};
    const { type, screen, id, image, action1, action2 } = data;

    // Determine channel based on type
    let channelId = 'explore';
    if (type === 'order') channelId = 'orders';
    if (['chat', 'message'].includes(type)) channelId = 'chat';

    // Build Action Buttons dynamically based on payload
    const actions = [];
    if (action1) actions.push({ title: action1, pressAction: { id: 'action1' } });
    if (action2) actions.push({ title: action2, pressAction: { id: 'action2' } });

    // Determine notification style (Big Picture if image is provided)
    let androidStyle = undefined;
    if (image) {
      androidStyle = {
        type: AndroidStyle.BIGPICTURE,
        picture: image,
      };
    }

    // Modern Premium UI configs
    await notifee.displayNotification({
      title: title || data.title || 'New Notification',
      body: body || data.body || '',
      data: data, // Attach data for click handlers
      android: {
        channelId,
        smallIcon: 'ic_launcher', // TODO: Make sure to have a proper transparent icon named ic_notification
        color: '#8A2BE2', // Premium Purple Color Theme or standard app color
        importance: AndroidImportance.HIGH,
        largeIcon: image || undefined, // Show image in small circle
        style: androidStyle,
        actions: actions.length > 0 ? actions : undefined,
        pressAction: {
          id: 'default',
        },
        circularLargeIcon: true, // Make large icon circular
        showTimestamp: true,
      },
    });
  }

  static handleNotificationAction(type, detail) {
    const { notification, pressAction } = detail;
    const { data } = notification;

    if (!data) return;

    console.log('Action triggered:', pressAction?.id, 'Data:', data);

    // Route to appropriate screen based on data payload
    const actionId = pressAction?.id;
    
    // If specific action buttons are clicked
    if (actionId === 'action1' || actionId === 'action2') {
      // Handle custom actions (e.g. Reply, Like, Cancel)
      // Usually you might trigger an API call here, or navigate to a specific modal
      console.log(`Custom Action ${actionId} clicked for ${data.type}`);
    }

    // Determine navigation target
    const targetScreen = data.screen;
    const typeId = data.type;

    if (targetScreen) {
      // If a specific screen is passed from backend
      RootNavigation.navigate(targetScreen, { id: data.id });
    } else {
      // Fallback logic based on type
      if (typeId === 'order') {
        RootNavigation.navigate('OrderDetail', { orderId: data.id });
      } else if (typeId === 'explore') {
        RootNavigation.navigate('ExploreDetails', { designId: data.id });
      } else if (typeId === 'chat') {
        RootNavigation.navigate('ChatRoom', { chatId: data.id });
      } else if (typeId === 'profile') {
        RootNavigation.navigate('Profile');
      }
    }
  }

  static async setupForegroundListener() {
    // Handle FCM foreground messages
    return messaging().onMessage(async remoteMessage => {
      console.log('Foreground Message received:', remoteMessage);
      await this.displayRichNotification(remoteMessage);
    });
  }
}

// Background handler for Notifee Actions (when notification is clicked in background)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    NotificationService.handleNotificationAction(type, detail);
  }
});
