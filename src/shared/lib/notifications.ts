import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storeData, getData } from './storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebase } from './firebase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Register for push notifications
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await storeData('@fcm_token', tokenData.data);

    console.log('Notification permission granted.');
    return true;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    if (tokenData.data) {
      await storeData('@fcm_token', tokenData.data);
    }
    return tokenData.data;
  } catch (error) {
    console.error('Failed to get Expo push token:', error);
    return null;
  }
}

export async function createNotificationChannel(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('plant-care', {
        name: 'Plant Care Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });
    }
  } catch (error) {
    console.error('Failed to create notification channel:', error);
  }
}

export async function showLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

export async function setupFirebaseMessaging(): Promise<void> {
  try {
    await createNotificationChannel();

    // Listen for incoming notifications while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification taps
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    console.log('Notification system setup complete');
  } catch (error) {
    console.error('Failed to setup notifications:', error);
  }
}
