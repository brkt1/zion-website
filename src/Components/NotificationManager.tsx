import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { isSubscribedToPush, requestPushPermissionAndSubscribe } from '../services/pushNotifications';

/**
 * Component to manage notifications in the background
 * This component doesn't render anything, it just handles notification logic
 */
const NotificationManager = () => {
  const { isEnabled, isPushSubscribed } = useNotifications();

  useEffect(() => {
    // If notifications are enabled but user is not subscribed to push, subscribe them
    const autoSubscribe = async () => {
      if (isEnabled && !isPushSubscribed) {
        // Check if already subscribed
        const subscribed = await isSubscribedToPush();
        if (!subscribed) {
          // Auto-subscribe to push notifications (only request permission if not already granted)
          if (Notification.permission === 'granted') {
            await requestPushPermissionAndSubscribe();
          }
        }
      }
    };

    autoSubscribe();
  }, [isEnabled, isPushSubscribed]);

  return null;
};

export default NotificationManager;

