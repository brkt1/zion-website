import { supabase } from './supabase';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return { granted: false, denied: false, default: false };
  }

  if (Notification.permission === 'granted') {
    return { granted: true, denied: false, default: false };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, denied: true, default: false };
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
};

/**
 * Check if notifications are enabled
 */
export const isNotificationEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Extended notification options that include image support
 */
interface ExtendedNotificationOptions extends NotificationOptions {
  image?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

/**
 * Show a notification
 */
export const showNotification = (
  title: string,
  options: ExtendedNotificationOptions = {}
): Notification | null => {
  if (!isNotificationEnabled()) {
    console.warn('Notifications are not enabled');
    return null;
  }

  const defaultOptions: ExtendedNotificationOptions = {
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'yenege-event',
    requireInteraction: false,
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      if (options.data?.url) {
        window.focus();
        window.open(options.data.url, '_blank');
      }
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Check for new events and notify users
 */
export const checkForNewEvents = async (lastCheckedDate: string | null): Promise<void> => {
  if (!isNotificationEnabled()) return;

  try {
    let query = supabase
      .from('events')
      .select('id, title, date, image')
      .order('created_at', { ascending: false })
      .limit(5);

    // If we have a last checked date, only get events created after that
    if (lastCheckedDate) {
      query = query.gt('created_at', lastCheckedDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching new events:', error);
      return;
    }

    if (events && events.length > 0) {
      // Get the most recent event
      const newestEvent = events[0];
      
      // Show notification for the newest event
      showNotification('🎉 New Event Launched!', {
        body: `${newestEvent.title} - Check it out now!`,
        ...(newestEvent.image && { image: newestEvent.image }),
        data: {
          url: `/events/${newestEvent.id}`,
        },
      });

      // Update last checked date
      localStorage.setItem('lastEventCheckDate', new Date().toISOString());
    }
  } catch (error) {
    console.error('Error checking for new events:', error);
  }
};

/**
 * Check for upcoming events and notify users
 */
export const checkForUpcomingEvents = async (): Promise<void> => {
  if (!isNotificationEnabled()) return;

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Get events happening tomorrow or the day after
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, date, time, location, image')
      .gte('date', tomorrow.toISOString().split('T')[0])
      .lt('date', dayAfterTomorrow.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming events:', error);
      return;
    }

    if (events && events.length > 0) {
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        const hoursUntilEvent = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60);
        
        // Notify if event is within 24 hours
        if (hoursUntilEvent <= 24 && hoursUntilEvent > 0) {
          const notificationId = `event-${event.id}-${eventDate.toISOString().split('T')[0]}`;
          const lastNotified = localStorage.getItem(notificationId);
          
          // Only notify once per day per event
          if (!lastNotified || lastNotified !== today.toISOString().split('T')[0]) {
            const timeStr = event.time ? ` at ${event.time}` : '';
            const locationStr = event.location ? ` - ${event.location}` : '';
            
            showNotification('📅 Event Tomorrow!', {
              body: `${event.title}${timeStr}${locationStr}`,
              ...(event.image && { image: event.image }),
              tag: notificationId,
              data: {
                url: `/events/${event.id}`,
              },
            });

            // Mark as notified today
            localStorage.setItem(notificationId, today.toISOString().split('T')[0]);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error checking for upcoming events:', error);
  }
};

/**
 * Initialize notification checking
 * This should be called periodically (e.g., every hour or when app becomes active)
 */
export const initializeNotificationChecking = async (): Promise<void> => {
  // Request permission first
  const permission = await requestNotificationPermission();
  
  if (!permission.granted) {
    console.log('Notification permission not granted');
    return;
  }

  // Check for new events
  const lastChecked = localStorage.getItem('lastEventCheckDate');
  await checkForNewEvents(lastChecked);

  // Check for upcoming events
  await checkForUpcomingEvents();
};

/**
 * Schedule periodic notification checks
 * 
 * NOTE: These notifications work when:
 * - App is open/active
 * - App is installed as PWA and running in background
 * - App tab is open (even if minimized)
 * 
 * They do NOT work when:
 * - App is completely closed
 * - Browser is closed
 * 
 * For notifications when app is closed, you need Web Push API with a backend service.
 * This would require:
 * 1. Backend server with push notification service (e.g., Firebase Cloud Messaging, or custom Web Push)
 * 2. Service worker to handle push events
 * 3. Subscription management to store user push subscriptions
 */
export const scheduleNotificationChecks = (): (() => void) => {
  // Check immediately
  initializeNotificationChecking();

  // Check every hour (only works if app is open/active)
  const intervalId = setInterval(() => {
    initializeNotificationChecking();
  }, 60 * 60 * 1000); // 1 hour

  // Also check when page becomes visible (user returns to app)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      initializeNotificationChecking();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

