import express, { Request, Response } from 'express';
import {
  announceEventToGroups,
  broadcastToSubscribers,
  deleteWebhook,
  getBotInfo,
  handleNewChatMembers,
  handleTelegramCallback,
  handleTelegramCommand,
  sendEventReminders,
  sendTelegramMessage,
  setWebhook,
} from '../services/telegram';

const router = express.Router();

/**
 * Middleware to verify admin authentication
 * Checks if request has valid admin token or is from authenticated admin
 */
const verifyAdminAuth = (req: Request, res: Response, next: express.NextFunction) => {
  const adminToken = process.env.TELEGRAM_ADMIN_API_TOKEN;
  const authHeader = req.headers.authorization;

  // If admin token is set, require it
  if (adminToken) {
    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    }
  } else {
    // If no admin token set, log warning but allow (for development)
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: TELEGRAM_ADMIN_API_TOKEN not set. Admin endpoints are unprotected!');
    }
  }

  next();
};

/**
 * Validate webhook request (basic verification)
 * Note: Telegram doesn't provide webhook secrets by default
 * This is a basic check - for production, consider implementing custom verification
 */
const validateWebhookRequest = (req: Request, res: Response, next: express.NextFunction) => {
  const update = req.body;

  // Basic validation - check if it looks like a Telegram update
  if (!update || typeof update.update_id !== 'number') {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  // Optional: Verify webhook secret if configured
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret = req.headers['x-telegram-webhook-secret'];
    if (providedSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
  }

  next();
};

/**
 * POST /api/telegram/webhook
 * Webhook endpoint for Telegram bot updates
 * Note: This endpoint should be publicly accessible for Telegram to send updates
 */
router.post('/webhook', validateWebhookRequest, async (req: Request, res: Response) => {
  try {
    const update = req.body;

    // Log incoming updates for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📨 Telegram webhook received:', {
        update_id: update.update_id,
        has_message: !!update.message,
        has_callback: !!update.callback_query,
        message_text: update.message?.text,
        chat_type: update.message?.chat?.type,
      });
    }

    // Handle new chat members (welcome messages)
    if (update.message && update.message.new_chat_members) {
      console.log('👋 New member(s) joined');
      await handleNewChatMembers(update);
    }

    // Handle message updates
    if (update.message) {
      const command = update.message.text?.split(' ')[0] || '';
      console.log(`💬 Processing command: ${command}`);
      await handleTelegramCommand(update);
    }

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      console.log('🔘 Callback query received');
      await handleTelegramCallback(update);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error processing Telegram webhook:', error);
    console.error('Error stack:', error.stack);
    // Still return 200 to prevent Telegram from retrying
    res.status(200).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/telegram/info
 * Get bot information
 */
router.get('/info', async (req: Request, res: Response) => {
  try {
    const info = await getBotInfo();
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/telegram/set-webhook
 * Set webhook URL for Telegram bot
 * Requires admin authentication
 */
router.post('/set-webhook', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Ensure URL uses HTTPS in production
    if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'Webhook URL must use HTTPS in production' });
    }

    const result = await setWebhook(url);
    res.json(result);
  } catch (error: any) {
    console.error('Error setting webhook:', error);
    res.status(500).json({ error: 'Failed to set webhook' });
  }
});

/**
 * POST /api/telegram/delete-webhook
 * Delete webhook for Telegram bot
 * Requires admin authentication
 */
router.post('/delete-webhook', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const result = await deleteWebhook();
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

/**
 * POST /api/telegram/send-message
 * Send a message to a specific chat (admin only)
 * Requires admin authentication
 */
router.post('/send-message', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { chat_id, text, parse_mode } = req.body;

    if (!chat_id || !text) {
      return res.status(400).json({ error: 'chat_id and text are required' });
    }

    // Validate input
    if (typeof text !== 'string' || text.length > 4096) {
      return res.status(400).json({ error: 'Invalid message text (max 4096 characters)' });
    }

    if (parse_mode && !['HTML', 'Markdown', 'MarkdownV2'].includes(parse_mode)) {
      return res.status(400).json({ error: 'Invalid parse_mode' });
    }

    const result = await sendTelegramMessage({
      chat_id,
      text,
      parse_mode: parse_mode || 'HTML',
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/telegram/broadcast
 * Broadcast a message to all subscribers (admin only)
 * Requires admin authentication
 */
router.post('/broadcast', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { message, parse_mode } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Validate input
    if (typeof message !== 'string' || message.length > 4096) {
      return res.status(400).json({ error: 'Invalid message (max 4096 characters)' });
    }

    if (parse_mode && !['HTML', 'Markdown', 'MarkdownV2'].includes(parse_mode)) {
      return res.status(400).json({ error: 'Invalid parse_mode' });
    }

    const result = await broadcastToSubscribers(message, parse_mode || 'HTML');

    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      total: result.sent + result.failed,
    });
  } catch (error: any) {
    console.error('Error broadcasting:', error);
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});

/**
 * POST /api/telegram/announce-event
 * Announce a new event to Telegram groups
 * Requires admin authentication
 */
router.post('/announce-event', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { event, group_chat_ids } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event data is required' });
    }

    // Validate required event fields
    if (!event.id || !event.title || !event.date) {
      return res.status(400).json({ 
        error: 'Event must have id, title, and date' 
      });
    }

    const result = await announceEventToGroups(event, group_chat_ids);

    res.json({
      success: result.sent > 0,
      sent: result.sent,
      failed: result.failed,
      total: result.sent + result.failed,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Error announcing event:', error);
    res.status(500).json({ error: 'Failed to announce event' });
  }
});

/**
 * POST /api/telegram/send-reminders
 * Manually trigger event reminders (for testing or manual use)
 * Requires admin authentication
 */
router.post('/send-reminders', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    console.log('📢 Manual reminder check triggered');
    const result = await sendEventReminders();

    res.json({
      success: result.sent > 0 || result.failed === 0,
      sent: result.sent,
      failed: result.failed,
      total: result.sent + result.failed,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

export default router;

