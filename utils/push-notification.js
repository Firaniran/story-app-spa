//utils/push-notification.js
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';
const PUBLIC_VAPID_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const subscribeUserToPush = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      await sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  }
};

export const unsubscribeFromPush = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await sendUnsubscriptionToServer(subscription.endpoint);
        await subscription.unsubscribe();
        console.log('Successfully unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      throw error;
    }
  }
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const sendSubscriptionToServer = async (subscription) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }

  const subscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    }
  };

  const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(subscriptionData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to subscribe to push notifications');
  }

  return response.json();
};

const sendUnsubscriptionToServer = async (endpoint) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ endpoint })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to unsubscribe from push notifications');
  }

  return response.json();
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return window.btoa(binary);
};

// Utility function untuk mengecek status subscription
export const checkSubscriptionStatus = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
  return false;
};

// Function untuk setup push notification dengan user interaction
export const setupPushNotification = async () => {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      throw new Error('Notification permission denied');
    }
    const isSubscribed = await checkSubscriptionStatus();
    
    if (!isSubscribed) {
      await subscribeUserToPush();
      console.log('Successfully subscribed to push notifications');
      return { success: true, message: 'Berhasil berlangganan notifikasi push' };
    } else {
      console.log('Already subscribed to push notifications');
      return { success: true, message: 'Sudah berlangganan notifikasi push' };
    }
  } catch (error) {
    console.error('Failed to setup push notification:', error);
    return { success: false, message: error.message };
  }
};