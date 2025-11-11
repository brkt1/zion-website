/**
 * Telegram Bot Service
 * Handles Telegram bot interactions, notifications, and commands
 * Fixed import statement typo
 */

import https from 'https';
import { isSupabaseConfigured, supabase } from './supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
  photo?: Array<{ file_id: string; width: number; height: number; file_size?: number }>;
  document?: { file_id: string; file_name?: string; mime_type?: string; file_size?: number };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage & {
    new_chat_members?: TelegramMessage['from'][];
    left_chat_member?: TelegramMessage['from'];
    reply_to_message?: TelegramMessage;
  };
  callback_query?: {
    id: string;
    from: TelegramMessage['from'];
    message?: TelegramMessage;
    data?: string;
  };
}

interface SendMessageParams {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
    keyboard?: Array<Array<{ text: string }>>;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
  };
  disable_web_page_preview?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

/**
 * Make a request to Telegram Bot API
 */
const telegramRequest = async (
  method: string,
  params: Record<string, any>
): Promise<TelegramResponse> => {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('Telegram bot token not configured');
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(params);
    const url = new URL(`${TELEGRAM_API_URL}/${method}`);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.ok) {
            resolve(jsonData);
          } else {
            reject(new Error(jsonData.description || 'Telegram API error'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

/**
 * Send a message via Telegram
 */
export const sendTelegramMessage = async (params: SendMessageParams): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('sendMessage', params);
  } catch (error: any) {
    // Don't log full error details that might contain sensitive info
    console.error('Error sending Telegram message:', error.message || 'Unknown error');
    throw error;
  }
};

/**
 * Send a photo via Telegram
 */
export const sendTelegramPhoto = async (
  chatId: number | string,
  photo: string,
  caption?: string,
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('sendPhoto', {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: parseMode,
    });
  } catch (error: any) {
    console.error('Error sending Telegram photo:', error);
    throw error;
  }
};

/**
 * Answer a callback query
 */
export const answerCallbackQuery = async (
  callbackQueryId: string,
  text?: string,
  showAlert?: boolean
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    });
  } catch (error: any) {
    console.error('Error answering callback query:', error);
    throw error;
  }
};

/**
 * Get bot information
 */
export const getBotInfo = async (): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('getMe', {});
  } catch (error: any) {
    console.error('Error getting bot info:', error);
    throw error;
  }
};

/**
 * Set webhook URL
 */
export const setWebhook = async (url: string): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('setWebhook', { url });
  } catch (error: any) {
    console.error('Error setting webhook:', error);
    throw error;
  }
};

/**
 * Delete webhook
 */
export const deleteWebhook = async (): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('deleteWebhook', {});
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
};

/**
 * Ban a user from a group
 */
export const banChatMember = async (
  chatId: number | string,
  userId: number,
  untilDate?: number
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('banChatMember', {
      chat_id: chatId,
      user_id: userId,
      until_date: untilDate || 0, // 0 = permanent ban
    });
  } catch (error: any) {
    console.error('Error banning user:', error);
    throw error;
  }
};

/**
 * Unban a user from a group
 */
export const unbanChatMember = async (
  chatId: number | string,
  userId: number,
  onlyIfBanned: boolean = true
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('unbanChatMember', {
      chat_id: chatId,
      user_id: userId,
      only_if_banned: onlyIfBanned,
    });
  } catch (error: any) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

/**
 * Kick a user from a group (ban and immediately unban)
 */
export const kickChatMember = async (
  chatId: number | string,
  userId: number
): Promise<TelegramResponse> => {
  try {
    // Ban the user
    await banChatMember(chatId, userId, Math.floor(Date.now() / 1000) + 60); // Ban for 1 minute
    // Immediately unban (this effectively kicks them)
    return await unbanChatMember(chatId, userId);
  } catch (error: any) {
    console.error('Error kicking user:', error);
    throw error;
  }
};

/**
 * Restrict a user (mute) in a group
 */
export const restrictChatMember = async (
  chatId: number | string,
  userId: number,
  permissions: {
    can_send_messages?: boolean;
    can_send_media_messages?: boolean;
    can_send_polls?: boolean;
    can_send_other_messages?: boolean;
    can_add_web_page_previews?: boolean;
    can_change_info?: boolean;
    can_invite_users?: boolean;
    can_pin_messages?: boolean;
  },
  untilDate?: number
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('restrictChatMember', {
      chat_id: chatId,
      user_id: userId,
      permissions,
      until_date: untilDate || 0,
    });
  } catch (error: any) {
    console.error('Error restricting user:', error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (
  chatId: number | string,
  messageId: number
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('deleteMessage', {
      chat_id: chatId,
      message_id: messageId,
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Pin a message
 */
export const pinChatMessage = async (
  chatId: number | string,
  messageId: number,
  disableNotification: boolean = false
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('pinChatMessage', {
      chat_id: chatId,
      message_id: messageId,
      disable_notification: disableNotification,
    });
  } catch (error: any) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

/**
 * Unpin a message
 */
export const unpinChatMessage = async (
  chatId: number | string,
  messageId?: number
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('unpinChatMessage', {
      chat_id: chatId,
      message_id: messageId,
    });
  } catch (error: any) {
    console.error('Error unpinning message:', error);
    throw error;
  }
};

/**
 * Get chat member information
 */
export const getChatMember = async (
  chatId: number | string,
  userId: number
): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('getChatMember', {
      chat_id: chatId,
      user_id: userId,
    });
  } catch (error: any) {
    console.error('Error getting chat member:', error);
    throw error;
  }
};

/**
 * Get chat information
 */
export const getChat = async (chatId: number | string): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('getChat', {
      chat_id: chatId,
    });
  } catch (error: any) {
    console.error('Error getting chat info:', error);
    throw error;
  }
};

/**
 * Get chat administrators
 */
export const getChatAdministrators = async (chatId: number | string): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('getChatAdministrators', {
      chat_id: chatId,
    });
  } catch (error: any) {
    console.error('Error getting chat administrators:', error);
    throw error;
  }
};

/**
 * Check if user is admin or creator of a group
 */
const isGroupAdmin = async (chatId: number | string, userId: number): Promise<boolean> => {
  try {
    const result = await getChatMember(chatId, userId);
    if (result.ok && result.result) {
      const status = result.result.status;
      return status === 'administrator' || status === 'creator';
    }
    return false;
  } catch (error) {
    console.error('Error checking group admin status:', error);
    return false;
  }
};

/**
 * Get upcoming events
 */
const getUpcomingEvents = async (limit: number = 5) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, date, time, location, price, currency, category, image, description')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

/**
 * Get event by ID
 */
const getEventById = async (eventId: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

/**
 * Verify ticket by transaction reference
 */
const verifyTicket = async (txRef: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, events(title, date, location)')
      .eq('tx_ref', txRef.toUpperCase())
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return null;
  }
};

/**
 * Format event information for Telegram
 */
const formatEventInfo = (event: any): string => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = event.time || 'TBA';
  const price = event.price === '0' || event.price === 'Free' ? 'Free' : `${event.price} ${event.currency}`;

  return `🎉 <b>${event.title}</b>

📅 <b>Date:</b> ${date}
⏰ <b>Time:</b> ${time}
📍 <b>Location:</b> ${event.location}
💰 <b>Price:</b> ${price}
🏷️ <b>Category:</b> ${event.category}

${event.description || ''}

<i>Use /event_${event.id} for more details</i>`;
};

/**
 * Format ticket information for Telegram
 */
const formatTicketInfo = (ticket: any): string => {
  const statusEmoji = {
    pending: '⏳',
    success: '✅',
    failed: '❌',
    cancelled: '🚫',
    used: '🎫',
  };

  const statusText = {
    pending: 'Pending',
    success: 'Confirmed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    used: 'Used',
  };

  const emoji = statusEmoji[ticket.status as keyof typeof statusEmoji] || '❓';
  const status = statusText[ticket.status as keyof typeof statusText] || ticket.status;

  let message = `${emoji} <b>Ticket Status: ${status}</b>\n\n`;
  message += `📋 <b>Transaction Ref:</b> <code>${ticket.tx_ref}</code>\n`;
  
  if (ticket.event_title) {
    message += `🎉 <b>Event:</b> ${ticket.event_title}\n`;
  }
  
  if (ticket.customer_name) {
    message += `👤 <b>Name:</b> ${ticket.customer_name}\n`;
  }
  
  message += `📧 <b>Email:</b> ${ticket.customer_email}\n`;
  message += `💰 <b>Amount:</b> ${ticket.amount} ${ticket.currency}\n`;
  message += `🎫 <b>Quantity:</b> ${ticket.quantity}\n`;

  if (ticket.payment_date) {
    const paymentDate = new Date(ticket.payment_date).toLocaleString();
    message += `📅 <b>Payment Date:</b> ${paymentDate}\n`;
  }

  if (ticket.verified_at) {
    const verifiedDate = new Date(ticket.verified_at).toLocaleString();
    message += `✅ <b>Verified:</b> ${verifiedDate}\n`;
  }

  if (ticket.events) {
    const event = ticket.events;
    message += `\n📍 <b>Event Location:</b> ${event.location}\n`;
    if (event.date) {
      const eventDate = new Date(event.date).toLocaleDateString();
      message += `📅 <b>Event Date:</b> ${eventDate}\n`;
    }
  }

  return message;
};

/**
 * Check if a Telegram user is an admin
 */
const isTelegramAdmin = async (telegramUserId: number): Promise<boolean> => {
  try {
    // If Supabase is not configured, only check env variable
    if (!isSupabaseConfigured()) {
      const adminIdsEnv = process.env.TELEGRAM_ADMIN_USER_IDS;
      if (!adminIdsEnv || adminIdsEnv.trim() === '') {
        return false; // No admin IDs configured
      }
      const adminIds = adminIdsEnv.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      const isAdmin = adminIds.includes(telegramUserId);
      if (isAdmin) {
        console.log(`✅ User ${telegramUserId} is admin (from env variable)`);
      }
      return isAdmin;
    }

    // Check if this Telegram user ID is linked to an admin account
    // First, try to find in telegram_admin_users table (if exists)
    const { data: adminLink, error: linkError } = await supabase
      .from('telegram_admin_users')
      .select('user_id')
      .eq('telegram_user_id', telegramUserId.toString())
      .eq('is_active', true)
      .single();

    if (adminLink && !linkError) {
      // Check if the linked user is an admin
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', adminLink.user_id)
        .eq('role', 'admin')
        .single();

      if (userRole && !roleError) {
        console.log(`✅ User ${telegramUserId} is admin (from database)`);
        return true;
      }
    }

    // Fallback: Check if admin Telegram user IDs are configured in env
    const adminIdsEnv = process.env.TELEGRAM_ADMIN_USER_IDS;
    if (!adminIdsEnv || adminIdsEnv.trim() === '') {
      return false; // No admin IDs configured
    }
    const adminIds = adminIdsEnv.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    const isAdmin = adminIds.includes(telegramUserId);
    if (isAdmin) {
      console.log(`✅ User ${telegramUserId} is admin (from env fallback)`);
    }
    return isAdmin;
  } catch (error) {
    console.error('Error checking Telegram admin status:', error);
    // Fallback to env check
    const adminIdsEnv = process.env.TELEGRAM_ADMIN_USER_IDS;
    if (!adminIdsEnv || adminIdsEnv.trim() === '') {
      return false; // No admin IDs configured
    }
    const adminIds = adminIdsEnv.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    return adminIds.includes(telegramUserId);
  }
};

/**
 * Get website statistics for admin
 */
const getWebsiteStats = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Get total events
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Get upcoming events
    const { count: upcomingEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0]);

    // Get total tickets
    const { count: totalTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    // Get successful tickets
    const { count: successfulTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success');

    // Get total revenue
    const { data: tickets } = await supabase
      .from('tickets')
      .select('amount, currency')
      .eq('status', 'success');

    const revenue = tickets?.reduce((sum, ticket) => {
      const amount = typeof ticket.amount === 'string' ? parseFloat(ticket.amount) : ticket.amount;
      return sum + (amount || 0);
    }, 0) || 0;

    // Get recent tickets (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { count: recentTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('created_at', yesterday.toISOString());

    // Get Telegram subscribers
    const { count: telegramSubscribers } = await supabase
      .from('telegram_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get push notification subscribers
    const { count: pushSubscribers } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    // Get top events by ticket sales
    const { data: eventSales } = await supabase
      .from('tickets')
      .select('event_title, quantity')
      .eq('status', 'success');

    const eventSalesMap = new Map<string, number>();
    eventSales?.forEach(ticket => {
      if (ticket.event_title) {
        const current = eventSalesMap.get(ticket.event_title) || 0;
        eventSalesMap.set(ticket.event_title, current + (ticket.quantity || 1));
      }
    });

    const topEvents = Array.from(eventSalesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalEvents: totalEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      totalTickets: totalTickets || 0,
      successfulTickets: successfulTickets || 0,
      revenue,
      recentTickets: recentTickets || 0,
      telegramSubscribers: telegramSubscribers || 0,
      pushSubscribers: pushSubscribers || 0,
      topEvents,
    };
  } catch (error) {
    console.error('Error getting website stats:', error);
    return null;
  }
};

/**
 * Format website statistics for Telegram
 */
const formatWebsiteStats = (stats: any): string => {
  if (!stats) {
    return '❌ Unable to fetch statistics. Please try again later.';
  }

  const topEventsText = stats.topEvents.length > 0
    ? stats.topEvents.map(([event, count]: [string, number], index: number) => 
        `${index + 1}. ${event}: ${count} tickets`
      ).join('\n')
    : 'No ticket sales yet';

  return `📊 <b>Website Statistics</b>

<b>Events:</b>
• Total Events: ${stats.totalEvents}
• Upcoming Events: ${stats.upcomingEvents}

<b>Tickets:</b>
• Total Tickets: ${stats.totalTickets}
• Successful Tickets: ${stats.successfulTickets}
• Recent (24h): ${stats.recentTickets}

<b>Revenue:</b>
• Total: ${stats.revenue.toFixed(2)} ETB

<b>Subscribers:</b>
• Telegram: ${stats.telegramSubscribers}
• Push Notifications: ${stats.pushSubscribers}

<b>Top Events (by ticket sales):</b>
${topEventsText}

<i>Last updated: ${new Date().toLocaleString()}</i>`;
};

/**
 * Get recent activity
 */
const getRecentActivity = async (limit: number = 10) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Get recent successful tickets
    const { data: recentTickets } = await supabase
      .from('tickets')
      .select('tx_ref, event_title, customer_name, amount, currency, quantity, created_at')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(limit);

    return recentTickets || [];
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

/**
 * Format recent activity for Telegram
 */
const formatRecentActivity = (activities: any[]): string => {
  if (activities.length === 0) {
    return '📋 <b>Recent Activity</b>\n\nNo recent activity.';
  }

  const activityText = activities.map((ticket, index) => {
    const date = new Date(ticket.created_at).toLocaleString();
    const amount = typeof ticket.amount === 'string' ? parseFloat(ticket.amount) : ticket.amount;
    return `${index + 1}. <b>${ticket.event_title || 'Event'}</b>\n   👤 ${ticket.customer_name || 'Customer'}\n   💰 ${amount} ${ticket.currency} (${ticket.quantity}x)\n   📅 ${date}\n   🔖 <code>${ticket.tx_ref}</code>`;
  }).join('\n\n');

  return `📋 <b>Recent Activity</b> (Last ${activities.length} tickets)\n\n${activityText}`;
};

/**
 * Handle new chat members (welcome messages)
 */
export const handleNewChatMembers = async (update: TelegramUpdate): Promise<void> => {
  if (!update.message || !update.message.new_chat_members) return;

  const message = update.message;
  const chatId = message.chat.id;
  const newMembers = update.message.new_chat_members;

  // Don't welcome the bot itself
  const botInfo = await getBotInfo();
  const botId = botInfo.result?.id;

  for (const member of newMembers) {
    // Skip if it's the bot itself
    if (member.id === botId) continue;

    // Send welcome message
    const welcomeMessage = `👋 Welcome to the group, <b>${member.first_name}</b>!

Please read the group rules and enjoy your stay! 🎉

<i>Use /help to see available commands.</i>`;

    try {
      await sendTelegramMessage({
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }
};

/**
 * Handle bot commands
 */
export const handleTelegramCommand = async (update: TelegramUpdate): Promise<void> => {
  if (!update.message) {
    console.log('⚠️ No message in update');
    return;
  }

  const message = update.message;
  const chatId = message.chat.id;
  const chatType = message.chat.type; // 'private', 'group', 'supergroup', 'channel'
  const text = message.text || '';
  const command = text.split(' ')[0].toLowerCase();
  const args = text.split(' ').slice(1);
  const telegramUserId = message.from.id;
  const messageId = message.message_id;

  console.log(`🔍 Processing command: "${command}" from user ${telegramUserId} in ${chatType}`);

  // Check if bot token is configured
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not configured!');
    try {
      await sendTelegramMessage({
        chat_id: chatId,
        text: '❌ Bot is not configured. Please contact the administrator.',
      });
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
    return;
  }

  try {
    switch (command) {
      case '/version':
      case '/botinfo':
        const botInfo = await getBotInfo();
        const versionInfo = `🤖 <b>Bot Information</b>

<b>Bot Name:</b> ${botInfo.result?.first_name || 'Yenege Bot'}
<b>Username:</b> @${botInfo.result?.username || 'Yenege_bot'}
<b>Bot ID:</b> ${botInfo.result?.id || 'N/A'}
<b>Version:</b> 2.0.0
<b>Features:</b>
✅ Event information
✅ Ticket verification
✅ Group moderation
✅ Welcome messages

<i>Last updated: ${new Date().toLocaleString()}</i>`;

        await sendTelegramMessage({
          chat_id: chatId,
          text: versionInfo,
          parse_mode: 'HTML',
        });
        break;

      case '/start':
        const isAdminForStart = await isTelegramAdmin(telegramUserId);
        const welcomeText = `👋 <b>Welcome to Yenege Events Bot!</b>

I can help you with:
• 📅 View upcoming events
• 🎫 Verify your tickets
• 🔔 Get event notifications
• ℹ️ Get event information

<b>Commands:</b>
/events - View upcoming events
/verify [tx_ref] - Verify a ticket
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message${isAdminForStart ? '\n\n🔐 <i>Admin: Use /admin_help to see admin commands</i>' : ''}

<i>Use /help for more information</i>`;

        await sendTelegramMessage({
          chat_id: chatId,
          text: welcomeText,
          parse_mode: 'HTML',
        });
        break;

      case '/help':
        const isAdminForHelpCmd = await isTelegramAdmin(telegramUserId);
        await sendTelegramMessage({
          chat_id: chatId,
          text: `📚 <b>Yenege Events Bot - Help</b>

<b>Available Commands:</b>

/start - Start the bot
/events - View upcoming events (limit: 5)
/event_[id] - Get details about a specific event
/verify [tx_ref] - Verify a ticket by transaction reference
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message${isAdminForHelpCmd ? '\n/admin_help - Show admin commands (admin only)' : ''}

<b>Examples:</b>
• <code>/events</code> - List upcoming events
• <code>/verify YENEGE123456</code> - Verify ticket
• <code>/event_abc123</code> - Get event details

${isAdminForHelpCmd ? '🔐 <b>Admin:</b> Use <code>/admin_help</code> to see all admin commands\n\n' : ''}<b>Need help?</b> Contact us at info@yenege.com`,
          parse_mode: 'HTML',
        });
        break;

      case '/events':
        const events = await getUpcomingEvents(5);
        if (events.length === 0) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '📅 No upcoming events found. Check back later!',
          });
        } else {
          for (const event of events) {
            const eventText = formatEventInfo(event);
            const keyboard = {
              inline_keyboard: [
                [
                  {
                    text: '📋 View Details',
                    callback_data: `event_${event.id}`,
                  },
                ],
              ],
            };

            // Send event image if available
            if (event.image) {
              await sendTelegramPhoto(chatId, event.image, eventText, 'HTML');
            } else {
              await sendTelegramMessage({
                chat_id: chatId,
                text: eventText,
                parse_mode: 'HTML',
                reply_markup: keyboard,
              });
            }
          }
        }
        break;

      case '/verify':
        if (args.length === 0) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please provide a transaction reference.\n\n<b>Usage:</b> <code>/verify YENEGE123456</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        const txRef = args[0].toUpperCase();
        const ticket = await verifyTicket(txRef);

        if (!ticket) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: `❌ Ticket not found.\n\nTransaction Reference: <code>${txRef}</code>\n\nPlease check your transaction reference and try again.`,
            parse_mode: 'HTML',
          });
          return;
        }

        const ticketInfo = formatTicketInfo(ticket);
        await sendTelegramMessage({
          chat_id: chatId,
          text: ticketInfo,
          parse_mode: 'HTML',
        });
        break;

      case '/subscribe':
        if (!isSupabaseConfigured()) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '⚠️ Subscription feature is not available. Database is not configured.',
          });
          return;
        }

        // Save subscription to database
        try {
          const { error: subError } = await supabase
            .from('telegram_subscriptions')
            .upsert(
              {
                chat_id: chatId.toString(),
                user_id: message.from.id.toString(),
                username: message.from.username || null,
                first_name: message.from.first_name,
                last_name: message.from.last_name || null,
                is_active: true,
                subscribed_at: new Date().toISOString(),
              },
              { onConflict: 'chat_id' }
            );

          if (subError) {
            console.error('Error saving subscription:', subError);
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ Failed to subscribe. Please try again later.',
            });
          } else {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '✅ <b>Subscribed!</b>\n\nYou will now receive notifications about new events and updates.',
              parse_mode: 'HTML',
            });
          }
        } catch (error: any) {
          console.error('Error in subscribe:', error);
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to subscribe. Please try again later.',
          });
        }
        break;

      case '/unsubscribe':
        if (!isSupabaseConfigured()) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '⚠️ Subscription feature is not available. Database is not configured.',
          });
          return;
        }

        try {
          const { error: unsubError } = await supabase
            .from('telegram_subscriptions')
            .update({ is_active: false })
            .eq('chat_id', chatId.toString());

          if (unsubError) {
            console.error('Error unsubscribing:', unsubError);
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ Failed to unsubscribe. Please try again later.',
            });
          } else {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '👋 <b>Unsubscribed</b>\n\nYou will no longer receive notifications. Use /subscribe to re-enable them.',
              parse_mode: 'HTML',
            });
          }
        } catch (error: any) {
          console.error('Error in unsubscribe:', error);
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to unsubscribe. Please try again later.',
          });
        }
        break;

      // Admin commands
      case '/stats':
      case '/statistics':
        const isAdmin = await isTelegramAdmin(telegramUserId);
        if (!isAdmin) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Access denied. This command is only available to administrators.',
          });
          return;
        }

        // Check if Supabase is configured before attempting to fetch stats
        if (!isSupabaseConfigured()) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '⚠️ <b>Statistics Unavailable</b>\n\nDatabase is not configured. Please configure Supabase credentials to use this feature.',
            parse_mode: 'HTML',
          });
          return;
        }

        await sendTelegramMessage({
          chat_id: chatId,
          text: '⏳ Fetching statistics...',
        });

        const stats = await getWebsiteStats();
        const statsText = formatWebsiteStats(stats);
        await sendTelegramMessage({
          chat_id: chatId,
          text: statsText,
          parse_mode: 'HTML',
        });
        break;

      case '/activity':
      case '/recent':
        const isAdminForActivity = await isTelegramAdmin(telegramUserId);
        if (!isAdminForActivity) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Access denied. This command is only available to administrators.',
          });
          return;
        }

        // Check if Supabase is configured before attempting to fetch activity
        if (!isSupabaseConfigured()) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '⚠️ <b>Activity Unavailable</b>\n\nDatabase is not configured. Please configure Supabase credentials to use this feature.',
            parse_mode: 'HTML',
          });
          return;
        }

        const limit = args[0] ? parseInt(args[0], 10) : 10;
        const validLimit = isNaN(limit) || limit < 1 || limit > 50 ? 10 : limit;

        await sendTelegramMessage({
          chat_id: chatId,
          text: '⏳ Fetching recent activity...',
        });

        const activities = await getRecentActivity(validLimit);
        const activityText = formatRecentActivity(activities);
        await sendTelegramMessage({
          chat_id: chatId,
          text: activityText,
          parse_mode: 'HTML',
        });
        break;

      case '/admin_help':
      case '/adminhelp':
        const isAdminForHelp = await isTelegramAdmin(telegramUserId);
        if (!isAdminForHelp) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Access denied. This command is only available to administrators.',
          });
          return;
        }

        await sendTelegramMessage({
          chat_id: chatId,
          text: `🔐 <b>Admin Commands</b>

<b>Statistics & Analytics:</b>
/stats - Get website statistics (events, tickets, revenue, subscribers)
/activity [limit] - Get recent ticket sales (default: 10, max: 50)

<b>Marketing:</b>
/broadcast [message] - Broadcast message to all subscribers
/notify_event [event_id] - Notify subscribers about an event

<b>Information:</b>
/admin_help - Show this help message

<b>Examples:</b>
• <code>/stats</code> - View all statistics
• <code>/activity 20</code> - View last 20 ticket sales
• <code>/broadcast New event announced! 🎉</code> - Send message to all subscribers

<i>Note: To use admin commands, your Telegram user ID must be added to TELEGRAM_ADMIN_USER_IDS in the server .env file.</i>`,
          parse_mode: 'HTML',
        });
        break;

      case '/broadcast':
        const isAdminForBroadcast = await isTelegramAdmin(telegramUserId);
        if (!isAdminForBroadcast) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Access denied. This command is only available to administrators.',
          });
          return;
        }

        if (args.length === 0) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please provide a message to broadcast.\n\n<b>Usage:</b> <code>/broadcast Your message here</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        const broadcastMessage = args.join(' ');
        await sendTelegramMessage({
          chat_id: chatId,
          text: '⏳ Broadcasting message to all subscribers...',
        });

        const broadcastResult = await broadcastToSubscribers(broadcastMessage, 'HTML');
        await sendTelegramMessage({
          chat_id: chatId,
          text: `✅ <b>Broadcast Complete</b>\n\nSent to: ${broadcastResult.sent} subscribers\nFailed: ${broadcastResult.failed}`,
          parse_mode: 'HTML',
        });
        break;

      // Group admin commands (only work in groups)
      case '/ban':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForBan = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForBan) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (!message.reply_to_message || !message.reply_to_message.from) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to a message from the user you want to ban.\n\n<b>Usage:</b> Reply to a message and use <code>/ban</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        const userToBan = message.reply_to_message.from.id;
        try {
          await banChatMember(chatId, userToBan);
          await sendTelegramMessage({
            chat_id: chatId,
            text: `🚫 User <b>${message.reply_to_message.from.first_name}</b> has been banned.`,
            parse_mode: 'HTML',
          });
        } catch (error: any) {
          console.error('Error banning user:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to ban user. Please try again or contact an administrator.',
          });
        }
        break;

      case '/unban':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForUnban = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForUnban) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (args.length === 0 && (!message.reply_to_message || !message.reply_to_message.from)) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to a message or provide a user ID.\n\n<b>Usage:</b> <code>/unban [user_id]</code> or reply to a message',
            parse_mode: 'HTML',
          });
          return;
        }

        const userToUnban = message.reply_to_message?.from?.id || parseInt(args[0], 10);
        if (isNaN(userToUnban)) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Invalid user ID.',
          });
          return;
        }

        try {
          await unbanChatMember(chatId, userToUnban);
          await sendTelegramMessage({
            chat_id: chatId,
            text: `✅ User has been unbanned.`,
          });
        } catch (error: any) {
          console.error('Error unbanning user:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to unban user. Please try again or contact an administrator.',
          });
        }
        break;

      case '/kick':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForKick = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForKick) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (!message.reply_to_message || !message.reply_to_message.from) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to a message from the user you want to kick.\n\n<b>Usage:</b> Reply to a message and use <code>/kick</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        const userToKick = message.reply_to_message.from.id;
        try {
          await kickChatMember(chatId, userToKick);
          await sendTelegramMessage({
            chat_id: chatId,
            text: `👢 User <b>${message.reply_to_message.from.first_name}</b> has been kicked.`,
            parse_mode: 'HTML',
          });
        } catch (error: any) {
          console.error('Error kicking user:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to kick user. Please try again or contact an administrator.',
          });
        }
        break;

      case '/mute':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForMute = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForMute) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (!message.reply_to_message || !message.reply_to_message.from) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to a message from the user you want to mute.\n\n<b>Usage:</b> Reply to a message and use <code>/mute [hours]</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        const muteHours = args[0] ? parseInt(args[0], 10) : 24;
        // Validate mute hours (max 30 days = 720 hours)
        const validMuteHours = isNaN(muteHours) || muteHours < 1 || muteHours > 720 ? 24 : muteHours;
        const muteUntil = Math.floor(Date.now() / 1000) + (validMuteHours * 3600);
        const userToMute = message.reply_to_message.from.id;

        try {
          await restrictChatMember(chatId, userToMute, {
            can_send_messages: false,
            can_send_media_messages: false,
            can_send_polls: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
          }, muteUntil);

          await sendTelegramMessage({
            chat_id: chatId,
            text: `🔇 User <b>${message.reply_to_message.from.first_name}</b> has been muted for ${validMuteHours} hour(s).`,
            parse_mode: 'HTML',
          });
        } catch (error: any) {
          console.error('Error muting user:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to mute user. Please try again or contact an administrator.',
          });
        }
        break;

      case '/unmute':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForUnmute = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForUnmute) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (!message.reply_to_message || !message.reply_to_message.from) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to a message from the user you want to unmute.\n\n<b>Usage:</b> Reply to a message and use <code>/unmute</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        const userToUnmute = message.reply_to_message.from.id;
        try {
          await restrictChatMember(chatId, userToUnmute, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_polls: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true,
          });

          await sendTelegramMessage({
            chat_id: chatId,
            text: `🔊 User <b>${message.reply_to_message.from.first_name}</b> has been unmuted.`,
            parse_mode: 'HTML',
          });
        } catch (error: any) {
          console.error('Error unmuting user:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to unmute user. Please try again or contact an administrator.',
          });
        }
        break;

      case '/del':
      case '/delete':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForDel = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForDel) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (!message.reply_to_message) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to the message you want to delete.\n\n<b>Usage:</b> Reply to a message and use <code>/del</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        try {
          await deleteMessage(chatId, message.reply_to_message.message_id);
          // Also delete the command message
          await deleteMessage(chatId, messageId).catch(() => {});
        } catch (error: any) {
          console.error('Error deleting message:', error.message || 'Unknown error');
          // Don't send error message if deletion failed (message might already be deleted)
        }
        break;

      case '/pin':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForPin = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForPin) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (!message.reply_to_message) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please reply to the message you want to pin.\n\n<b>Usage:</b> Reply to a message and use <code>/pin</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        try {
          await pinChatMessage(chatId, message.reply_to_message.message_id, args[0] === 'silent');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '📌 Message pinned.',
          });
        } catch (error: any) {
          console.error('Error pinning message:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to pin message. Please try again or contact an administrator.',
          });
        }
        break;

      case '/unpin':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const isGroupAdminForUnpin = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForUnpin) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        try {
          await unpinChatMessage(chatId);
          await sendTelegramMessage({
            chat_id: chatId,
            text: '📌 Pinned message unpinned.',
          });
        } catch (error: any) {
          console.error('Error unpinning message:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to unpin message. Please try again or contact an administrator.',
          });
        }
        break;

      case '/groupinfo':
      case '/ginfo':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        try {
          const chatInfo = await getChat(chatId);
          const adminsInfo = await getChatAdministrators(chatId);

          if (chatInfo.ok && chatInfo.result) {
            const chat = chatInfo.result;
            const adminCount = adminsInfo.ok ? adminsInfo.result?.length || 0 : 0;

            const infoText = `ℹ️ <b>Group Information</b>

<b>Title:</b> ${chat.title || 'N/A'}
<b>Type:</b> ${chat.type}
<b>Members:</b> ${chat.members_count || 'N/A'}
<b>Administrators:</b> ${adminCount}
${chat.description ? `<b>Description:</b>\n${chat.description}` : ''}
${chat.username ? `<b>Username:</b> @${chat.username}` : ''}`;

            await sendTelegramMessage({
              chat_id: chatId,
              text: infoText,
              parse_mode: 'HTML',
            });
          }
        } catch (error: any) {
          console.error('Error getting group info:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to get group information. Please try again later.',
          });
        }
        break;

      case '/rules':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        const rulesMessage = `📜 <b>Group Rules</b>

1. Be respectful to all members
2. No spam or advertising
3. No offensive content
4. Follow the group's purpose
5. Listen to administrators

<i>Violating these rules may result in a warning, mute, or ban.</i>`;

        await sendTelegramMessage({
          chat_id: chatId,
          text: rulesMessage,
          parse_mode: 'HTML',
        });
        break;

      default:
        // Handle event detail command: /event_[id]
        if (command.startsWith('/event_')) {
          const eventId = command.replace('/event_', '');
          const event = await getEventById(eventId);

          if (!event) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ Event not found.',
            });
            return;
          }

          const eventText = formatEventInfo(event);
          if (event.image) {
            await sendTelegramPhoto(chatId, event.image, eventText, 'HTML');
          } else {
            await sendTelegramMessage({
              chat_id: chatId,
              text: eventText,
              parse_mode: 'HTML',
            });
          }
        } else {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❓ Unknown command. Use /help to see available commands.',
          });
        }
        break;
    }
  } catch (error: any) {
    console.error('Error handling command:', error);
    await sendTelegramMessage({
      chat_id: chatId,
      text: '❌ An error occurred. Please try again later.',
    });
  }
};

/**
 * Handle callback queries (button clicks)
 */
export const handleTelegramCallback = async (update: TelegramUpdate): Promise<void> => {
  if (!update.callback_query) return;

  const callbackQuery = update.callback_query;
  const chatId = callbackQuery.message?.chat.id;
  const data = callbackQuery.data || '';

  if (!chatId) return;

  try {
    // Answer the callback query first
    await answerCallbackQuery(callbackQuery.id);

    // Handle different callback data
    if (data.startsWith('event_')) {
      const eventId = data.replace('event_', '');
      const event = await getEventById(eventId);

      if (!event) {
        await sendTelegramMessage({
          chat_id: chatId,
          text: '❌ Event not found.',
        });
        return;
      }

      const eventText = formatEventInfo(event);
      if (event.image) {
        await sendTelegramPhoto(chatId, event.image, eventText, 'HTML');
      } else {
        await sendTelegramMessage({
          chat_id: chatId,
          text: eventText,
          parse_mode: 'HTML',
        });
      }
    }
  } catch (error: any) {
    console.error('Error handling callback:', error);
  }
};

/**
 * Send payment confirmation message
 */
export const sendPaymentConfirmation = async (
  chatId: number | string,
  paymentData: {
    customerName?: string;
    amount: number;
    currency: string;
    txRef: string;
    eventTitle?: string;
    quantity?: number;
  }
): Promise<void> => {
  try {
    const name = paymentData.customerName || 'Valued Customer';
    const amount = paymentData.amount.toFixed(2);
    const currency = paymentData.currency || 'ETB';
    const txRef = paymentData.txRef.substring(0, 8).toUpperCase();
    const eventInfo = paymentData.eventTitle ? ` for ${paymentData.eventTitle}` : '';
    const quantityInfo = paymentData.quantity && paymentData.quantity > 1 
      ? ` (${paymentData.quantity} tickets)` 
      : '';

    const message = `🎉 <b>Payment Confirmed!</b>

Thank you, ${name}!

Your payment of <b>${amount} ${currency}</b>${quantityInfo}${eventInfo} has been successfully processed.

📋 <b>Transaction Reference:</b> <code>${txRef}</code>

Your ticket has been confirmed. Please keep this reference number for your records.

Use <code>/verify ${txRef}</code> to verify your ticket anytime.

We look forward to seeing you at the event!

Best regards,
Yenege Events Team`;

    await sendTelegramMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    console.error('Error sending payment confirmation:', error);
  }
};

/**
 * Broadcast message to all subscribers
 */
export const broadcastToSubscribers = async (
  message: string,
  parseMode: 'HTML' | 'Markdown' | 'MarkdownV2' = 'HTML'
): Promise<{ sent: number; failed: number }> => {
  if (!isSupabaseConfigured()) {
    console.warn('Cannot broadcast: Supabase not configured');
    return { sent: 0, failed: 0 };
  }

  try {
    const { data: subscriptions, error } = await supabase
      .from('telegram_subscriptions')
      .select('chat_id')
      .eq('is_active', true);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await sendTelegramMessage({
          chat_id: sub.chat_id,
          text: message,
          parse_mode: parseMode,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${sub.chat_id}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  } catch (error: any) {
    console.error('Error broadcasting to subscribers:', error);
    throw error;
  }
};

