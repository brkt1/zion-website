import { useEffect, useState } from 'react';
import {
    isNotificationEnabled,
    requestNotificationPermission,
    scheduleNotificationChecks,
} from '../services/notifications';
import {
    isSubscribedToPush,
    requestPushPermissionAndSubscribe,
    unsubscribeFromPushNotifications,
} from '../services/pushNotifications';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  useEffect(() => {
    // Check current permission status
    const checkPermission = async () => {
      const enabled = isNotificationEnabled();
      setIsEnabled(enabled);
      
      if ('Notification' in window) {
        setPermission({
          granted: Notification.permission === 'granted',
          denied: Notification.permission === 'denied',
          default: Notification.permission === 'default',
        });
      }

      // Check push subscription status
      const pushSubscribed = await isSubscribedToPush();
      setIsPushSubscribed(pushSubscribed);
    };

    checkPermission();

    // Schedule notification checks if enabled
    let cleanup: (() => void) | null = null;
    if (isEnabled) {
      cleanup = scheduleNotificationChecks();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isEnabled]);

  const requestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsEnabled(result.granted);
    return result;
  };

  const requestPushSubscription = async () => {
    const subscribed = await requestPushPermissionAndSubscribe();
    setIsPushSubscribed(subscribed);
    if (subscribed) {
      setIsEnabled(true);
      setPermission({
        granted: true,
        denied: false,
        default: false,
      });
    }
    return subscribed;
  };

  const unsubscribePush = async () => {
    const unsubscribed = await unsubscribeFromPushNotifications();
    if (unsubscribed) {
      setIsPushSubscribed(false);
    }
    return unsubscribed;
  };

  return {
    permission,
    isEnabled,
    isPushSubscribed,
    requestPermission,
    requestPushSubscription,
    unsubscribePush,
  };
};

