// utils/push-notification.js
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';
const PUBLIC_VAPID_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  }
  console.log('Notifications not supported');
  return false;
};

export const subscribeUserToPush = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      console.log('Subscribing to push notifications...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready for push subscription:', registration);
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed:', existingSubscription);
        await sendSubscriptionToServer(existingSubscription);
        return existingSubscription;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      
      console.log('Push subscription created:', subscription);
      await sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  } else {
    throw new Error('Push messaging is not supported');
  }
};

export const unsubscribeFromPush = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Unsubscribing from push notifications...');
        await sendUnsubscriptionToServer(subscription.endpoint);
        await subscription.unsubscribe();
        console.log('Successfully unsubscribed from push notifications');
        return true;
      }
      console.log('No subscription found to unsubscribe');
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      throw error;
    }
  }
  return false;
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

  console.log('Sending subscription to server:', subscriptionData);

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
    console.error('Failed to send subscription to server:', error);
    throw new Error(error.message || 'Failed to subscribe to push notifications');
  }

  const result = await response.json();
  console.log('Subscription sent to server successfully:', result);
  return result;
};

const sendUnsubscriptionToServer = async (endpoint) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  console.log('Sending unsubscription to server:', endpoint);

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
    console.error('Failed to send unsubscription to server:', error);
    throw new Error(error.message || 'Failed to unsubscribe from push notifications');
  }

  const result = await response.json();
  console.log('Unsubscription sent to server successfully:', result);
  return result;
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
      const isSubscribed = !!subscription;
      console.log('Subscription status:', isSubscribed);
      return isSubscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
  console.log('Push messaging not supported');
  return false;
};

// Function untuk setup push notification dengan user interaction
export const setupPushNotification = async () => {
  try {
    console.log('Setting up push notification...');
    // Cek apakah service worker sudah terdaftar
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker is ready:', registration);
    }
    
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

// Test function untuk mengirim test notification (hanya untuk development)
export const testPushNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Simulasi push event dengan test data
    const testData = {
      title: 'Test Notification',
      options: {
        body: 'Ini adalah test push notification dari Story App!',
        icon: '/story-app-spa/icon-192.png',
        badge: '/story-app-spa/icon-192.png',
        tag: 'test-notification',
        data: {
          url: '/story-app-spa/'
        }
      }
    };
    
    registration.showNotification(testData.title, testData.options);
    console.log('Test notification sent');
    
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};