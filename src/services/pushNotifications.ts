
/**
 * Web Push Notification Service
 * Handles push subscription and sending notifications even when app is closed
 */

import { safeAtob } from '../utils/polyfills';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Get VAPID public key from environment or use a placeholder
 * In production, this should come from your backend
 */
const getVAPIDPublicKey = (): string => {
  // This should be set in your environment variables
  // For now, we'll get it from the backend API
  return process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
};

/**
 * Convert base64 URL to Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): BufferSource => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = safeAtob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return null;
    }

    // Check if push manager is supported
    if (!('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from backend
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    let vapidPublicKey = '';
    
    try {
      const response = await fetch(`${apiUrl}/push/vapid-public-key`);
      if (response.ok) {
        const data = await response.json();
        vapidPublicKey = data.publicKey;
      }
    } catch (error) {
      console.warn('Could not fetch VAPID key from backend, using env variable');
      vapidPublicKey = getVAPIDPublicKey();
    }

    if (!vapidPublicKey) {
      console.error('VAPID public key is not configured');
      return null;
    }

    // Convert VAPID key
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

    // Save subscription to backend
    await savePushSubscription(subscription);

    console.log('Push subscription successful');
    return subscription;
  } catch (error: any) {
    console.error('Error subscribing to push notifications:', error);
    
    // Handle permission denied
    if (error.name === 'NotAllowedError') {
      console.warn('Push notification permission denied');
    }
    
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await deletePushSubscription(subscription);
      console.log('Push unsubscription successful');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Check if user is subscribed to push notifications
 */
export const isSubscribedToPush = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
};

/**
 * Get current push subscription
 */
export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
};

/**
 * Save push subscription to backend
 */
const savePushSubscription = async (subscription: PushSubscription): Promise<void> => {
  try {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(
          String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))
        ),
        auth: btoa(
          String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))
        ),
      },
    };

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      throw new Error('Failed to save push subscription');
    }

    console.log('Push subscription saved to backend');
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
};

/**
 * Delete push subscription from backend
 */
const deletePushSubscription = async (subscription: PushSubscription): Promise<void> => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to delete push subscription from backend');
    }
  } catch (error) {
    console.error('Error deleting push subscription:', error);
  }
};

/**
 * Request push notification permission and subscribe
 */
export const requestPushPermissionAndSubscribe = async (): Promise<boolean> => {
  try {
    // First request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Then subscribe to push
    const subscription = await subscribeToPushNotifications();
    return subscription !== null;
  } catch (error) {
    console.error('Error requesting push permission:', error);
    return false;
  }
};

