import express, { Request, Response } from 'express';
import webpush from 'web-push';
import { supabase } from '../services/supabase';

const router = express.Router();

// Initialize web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@yenege.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key for client-side subscription
 */
router.get('/vapid-public-key', (req: Request, res: Response) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/**
 * POST /api/push/subscribe
 * Save a push subscription
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: endpoint,
        p256dh_key: keys.p256dh,
        auth_key: keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      });

    if (error) {
      console.error('Error saving push subscription:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    res.json({ success: true, message: 'Subscription saved' });
  } catch (error: any) {
    console.error('Error in /push/subscribe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/push/unsubscribe
 * Remove a push subscription
 */
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    // Delete subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error deleting push subscription:', error);
      return res.status(500).json({ error: 'Failed to delete subscription' });
    }

    res.json({ success: true, message: 'Subscription removed' });
  } catch (error: any) {
    console.error('Error in /push/unsubscribe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/push/send
 * Send a push notification to all subscribers (admin only)
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { title, body, icon, image, url, tag } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Get all active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh_key, auth_key');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: tag || 'yenege-notification',
      data: {
        url: url || '/',
      },
      ...(image && { image }),
    });

    // Send to all subscriptions
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        };

        await webpush.sendNotification(subscription, payload);
        return { success: true, endpoint: sub.endpoint };
      } catch (error: any) {
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
        return { success: false, endpoint: sub.endpoint, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;

    res.json({
      success: true,
      sent: successful,
      total: subscriptions.length,
      message: `Sent to ${successful} of ${subscriptions.length} subscribers`,
    });
  } catch (error: any) {
    console.error('Error in /push/send:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

