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
 * Add a user to a chat (invite)
 */
export const addChatMember = async (
  chatId: number | string,
  userId: number,
  forwardLimit?: number
): Promise<TelegramResponse> => {
  try {
    const params: any = {
      chat_id: chatId,
      user_id: userId,
    };
    if (forwardLimit !== undefined) {
      params.forward_limit = forwardLimit;
    }
    return await telegramRequest('addChatMember', params);
  } catch (error: any) {
    console.error('Error adding chat member:', error);
    throw error;
  }
};

/**
 * Get chat members count
 */
export const getChatMembersCount = async (chatId: number | string): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('getChatMembersCount', {
      chat_id: chatId,
    });
  } catch (error: any) {
    console.error('Error getting chat members count:', error);
    throw error;
  }
};

/**
 * Export chat invite link
 */
export const exportChatInviteLink = async (chatId: number | string): Promise<TelegramResponse> => {
  try {
    return await telegramRequest('exportChatInviteLink', {
      chat_id: chatId,
    });
  } catch (error: any) {
    console.error('Error exporting chat invite link:', error);
    throw error;
  }
};

/**
 * Create chat invite link
 */
export const createChatInviteLink = async (
  chatId: number | string,
  name?: string,
  expireDate?: number,
  memberLimit?: number,
  createsJoinRequest?: boolean
): Promise<TelegramResponse> => {
  try {
    const params: any = {
      chat_id: chatId,
    };
    if (name) params.name = name;
    if (expireDate) params.expire_date = expireDate;
    if (memberLimit) params.member_limit = memberLimit;
    if (createsJoinRequest !== undefined) params.creates_join_request = createsJoinRequest;
    return await telegramRequest('createChatInviteLink', params);
  } catch (error: any) {
    console.error('Error creating chat invite link:', error);
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
 * Calculate countdown to event
 */
const calculateCountdown = (eventDate: string, eventTime?: string): string => {
  try {
    // Parse event date and time
    const dateStr = eventDate.split('T')[0]; // Get YYYY-MM-DD
    const timeStr = eventTime || '00:00';
    
    // Parse time (handle formats like "6:00 PM", "18:00", "6:00 PM EST")
    let hours = 0;
    let minutes = 0;
    
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      
      // Handle PM
      if (timeStr.toLowerCase().includes('pm') && hours !== 12) {
        hours += 12;
      }
      // Handle AM (12 AM = 0)
      if (timeStr.toLowerCase().includes('am') && hours === 12) {
        hours = 0;
      }
    }
    
    const eventDateTime = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    const now = new Date();
    const diff = eventDateTime.getTime() - now.getTime();
    
    if (diff < 0) {
      return '⏰ Event has passed';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `⏳ <b>${days}</b> day${days > 1 ? 's' : ''}, <b>${hoursRemaining}</b> hour${hoursRemaining !== 1 ? 's' : ''} remaining`;
    } else if (hoursRemaining > 0) {
      return `⏳ <b>${hoursRemaining}</b> hour${hoursRemaining > 1 ? 's' : ''}, <b>${minutesRemaining}</b> minute${minutesRemaining !== 1 ? 's' : ''} remaining`;
    } else {
      return `⏳ <b>${minutesRemaining}</b> minute${minutesRemaining !== 1 ? 's' : ''} remaining`;
    }
  } catch (error) {
    console.error('Error calculating countdown:', error);
    return '⏰ Countdown unavailable';
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
 * Format event announcement with countdown for Telegram groups
 */
const formatEventAnnouncement = (event: any): string => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = event.time || 'TBA';
  const price = event.price === '0' || event.price === 'Free' ? 'Free' : `${event.price} ${event.currency}`;
  const countdown = calculateCountdown(event.date, event.time);
  
  // Get website URL for event
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.yenege.com';
  const eventUrl = `${frontendUrl}/events/${event.id}`;

  let message = `🎉 <b>NEW EVENT ANNOUNCEMENT!</b>\n\n`;
  message += `🎊 <b>${event.title}</b>\n\n`;
  message += `${countdown}\n\n`;
  message += `📅 <b>Date:</b> ${date}\n`;
  message += `⏰ <b>Time:</b> ${time}\n`;
  message += `📍 <b>Location:</b> ${event.location}\n`;
  message += `💰 <b>Price:</b> ${price}\n`;
  
  if (event.category) {
    message += `🏷️ <b>Category:</b> ${event.category}\n`;
  }
  
  if (event.description) {
    message += `\n📝 ${event.description.substring(0, 200)}${event.description.length > 200 ? '...' : ''}\n`;
  }
  
  message += `\n🔗 <a href="${eventUrl}">View Details & Book Now</a>\n`;
  
  if (event.telegram_link) {
    message += `💬 <a href="${event.telegram_link}">Join Event Group</a>\n`;
  }
  
  message += `\n<i>Use /event_${event.id} for quick details</i>`;

  return message;
};

/**
 * Format event reminder message (3, 2, 1 days before)
 */
const formatEventReminder = (event: any, daysRemaining: number): string => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = event.time || 'TBA';
  const price = event.price === '0' || event.price === 'Free' ? 'Free' : `${event.price} ${event.currency}`;
  
  // Get website URL for event
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.yenege.com';
  const eventUrl = `${frontendUrl}/events/${event.id}`;

  // Different emojis and messages based on days remaining
  const dayEmojis = {
    3: '📢',
    2: '⏰',
    1: '🔥',
  };
  
  const dayMessages = {
    3: 'Just 3 days to go!',
    2: 'Only 2 days remaining!',
    1: 'Tomorrow is the day!',
  };

  const emoji = dayEmojis[daysRemaining as keyof typeof dayEmojis] || '⏰';
  const dayMessage = dayMessages[daysRemaining as keyof typeof dayMessages] || `${daysRemaining} days remaining!`;

  let message = `${emoji} <b>EVENT REMINDER</b> ${emoji}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🎊 <b>${event.title}</b>\n\n`;
  message += `⏳ <b>${dayMessage}</b>\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📅 <b>Date:</b> ${date}\n`;
  message += `⏰ <b>Time:</b> ${time}\n`;
  message += `📍 <b>Location:</b> ${event.location}\n`;
  message += `💰 <b>Price:</b> ${price}\n`;
  
  if (event.category) {
    message += `🏷️ <b>Category:</b> ${event.category}\n`;
  }
  
  if (daysRemaining === 1) {
    message += `\n🔥 <b>Don't miss out! Book your spot now!</b>\n`;
  } else {
    message += `\n💡 <b>Secure your spot before it's too late!</b>\n`;
  }
  
  message += `\n🔗 <a href="${eventUrl}">📱 View Details & Book Now</a>\n`;
  
  if (event.telegram_link) {
    message += `💬 <a href="${event.telegram_link}">Join Event Group</a>\n`;
  }
  
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `\n<i>Use /event_${event.id} for quick details</i>`;

  return message;
};

/**
 * Format "time has come" message for event day
 */
const formatEventDayMessage = (event: any): string => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = event.time || 'TBA';
  const price = event.price === '0' || event.price === 'Free' ? 'Free' : `${event.price} ${event.currency}`;
  
  // Get website URL for event
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.yenege.com';
  const eventUrl = `${frontendUrl}/events/${event.id}`;

  let message = `🎉🎊🎉 <b>THE TIME HAS COME!</b> 🎉🎊🎉\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🌟 <b>${event.title}</b> 🌟\n\n`;
  message += `🎯 <b>Today is the day!</b>\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📅 <b>Date:</b> ${date}\n`;
  message += `⏰ <b>Time:</b> ${time}\n`;
  message += `📍 <b>Location:</b> ${event.location}\n`;
  message += `💰 <b>Price:</b> ${price}\n`;
  
  if (event.category) {
    message += `🏷️ <b>Category:</b> ${event.category}\n`;
  }
  
  message += `\n🎊 <b>We can't wait to see you there!</b>\n`;
  message += `✨ <b>Get ready for an amazing experience!</b>\n\n`;
  
  message += `🔗 <a href="${eventUrl}">📱 View Event Details</a>\n`;
  
  if (event.telegram_link) {
    message += `💬 <a href="${event.telegram_link}">Join Event Group</a>\n`;
  }
  
  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `\n<i>Use /event_${event.id} for quick details</i>`;
  message += `\n\n🎉 <b>See you soon!</b> 🎉`;

  return message;
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
        const isGroupAdminForStart = chatType !== 'private' ? await isGroupAdmin(chatId, telegramUserId) : false;
        
        let welcomeText = `👋 <b>Welcome to Yenege Events Bot!</b>

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
/help - Show this help message`;

        if (isAdminForStart) {
          welcomeText += '\n\n🔐 <i>Bot Admin: Use /admin_help to see bot admin commands</i>';
        }
        
        if (isGroupAdminForStart) {
          welcomeText += '\n👥 <i>Group Admin: Use /group_help to see group admin commands</i>';
        }

        welcomeText += '\n\n<i>Use /help for more information</i>';

        await sendTelegramMessage({
          chat_id: chatId,
          text: welcomeText,
          parse_mode: 'HTML',
        });
        break;

      case '/help':
        const isAdminForHelpCmd = await isTelegramAdmin(telegramUserId);
        const isGroupAdminForHelpCmd = chatType !== 'private' ? await isGroupAdmin(chatId, telegramUserId) : false;
        
        let helpText = `📚 <b>Yenege Events Bot - Help</b>

<b>Available Commands:</b>

/start - Start the bot
/events - View upcoming events (limit: 5)
/event_[id] - Get details about a specific event
/verify [tx_ref] - Verify a ticket by transaction reference
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message`;

        if (isAdminForHelpCmd) {
          helpText += '\n/admin_help - Show bot admin commands (bot admin only)';
        }
        
        if (isGroupAdminForHelpCmd) {
          helpText += '\n/group_help - Show group admin commands (group admin only)';
        }

        helpText += `\n\n<b>Examples:</b>
• <code>/events</code> - List upcoming events
• <code>/verify YENEGE123456</code> - Verify ticket
• <code>/event_abc123</code> - Get event details`;

        if (isAdminForHelpCmd || isGroupAdminForHelpCmd) {
          helpText += '\n\n';
          if (isAdminForHelpCmd) {
            helpText += '🔐 <b>Bot Admin:</b> Use <code>/admin_help</code> to see bot admin commands\n';
          }
          if (isGroupAdminForHelpCmd) {
            helpText += '👥 <b>Group Admin:</b> Use <code>/group_help</code> to see group admin commands\n';
          }
        }

        helpText += '\n<b>Need help?</b> Contact us at info@yenege.com';

        await sendTelegramMessage({
          chat_id: chatId,
          text: helpText,
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
          text: `🔐 <b>Bot Admin Commands</b>

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

      case '/group_help':
      case '/grouphelp':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        // Check if user is group admin
        const isGroupAdminForHelp = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForHelp) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Access denied. This command is only available to group administrators.',
          });
          return;
        }

        await sendTelegramMessage({
          chat_id: chatId,
          text: `👥 <b>Group Admin Commands</b>

<b>Member Management:</b>
/add_user [user_id] - Add a user to the group by ID
/add_users [user_id1] [user_id2] ... - Add multiple users to the group
/export_invite - Get group invite link
/invite_link - Get group invite link (alias)

<b>Moderation:</b>
/ban - Ban a user (reply to their message)
/unban - Unban a user (reply to their message)
/kick - Kick a user from the group (reply to their message)
/mute [hours] - Mute a user (reply to their message, default: 24 hours)
/unmute - Unmute a user (reply to their message)

<b>Message Management:</b>
/del - Delete a message (reply to the message)
/delete - Delete a message (alias)
/pin [silent] - Pin a message (reply to the message)
/unpin - Unpin the current pinned message

<b>Information:</b>
/groupinfo - Get group information
/ginfo - Get group information (alias)
/rules - Show group rules
/group_help - Show this help message

<b>Examples:</b>
• <code>/add_user 123456789</code> - Add user by ID
• <code>/add_users 123456789 987654321</code> - Add multiple users
• <code>/export_invite</code> - Get invite link
• <code>/mute 48</code> - Mute user for 48 hours

<i>Note: These commands are only available to group administrators.</i>`,
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

      case '/add_user':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        // Check if user is admin
        const isGroupAdminForAdd = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForAdd) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (args.length === 0) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please provide a user ID or username.\n\n<b>Usage:</b> <code>/add_user &lt;user_id&gt;</code> or <code>/add_user @username</code>\n\n<b>Example:</b> <code>/add_user 123456789</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        try {
          const userIdentifier = args[0];
          let userId: number;

          // Check if it's a username (starts with @)
          if (userIdentifier.startsWith('@')) {
            // For username, we need to resolve it first
            // Note: Telegram Bot API doesn't directly support username resolution
            // We'll need the user ID. For now, show instructions.
            await sendTelegramMessage({
              chat_id: chatId,
              text: '⚠️ To add by username, please use the user ID instead.\n\nTo get a user ID, forward a message from that user to @userinfobot or use their numeric ID.\n\n<b>Usage:</b> <code>/add_user 123456789</code>',
              parse_mode: 'HTML',
            });
            return;
          }

          // Parse user ID
          userId = parseInt(userIdentifier);
          if (isNaN(userId)) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ Invalid user ID. Please provide a numeric user ID.\n\n<b>Example:</b> <code>/add_user 123456789</code>',
              parse_mode: 'HTML',
            });
            return;
          }

          const result = await addChatMember(chatId, userId);
          if (result.ok) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: `✅ User <code>${userId}</code> has been added to the group.`,
              parse_mode: 'HTML',
            });
          } else {
            throw new Error(result.description || 'Failed to add user');
          }
        } catch (error: any) {
          console.error('Error adding user:', error.message || 'Unknown error');
          const errorMsg = error.message || 'Unknown error';
          let userFriendlyMsg = '❌ Failed to add user. ';
          
          if (errorMsg.includes('USER_ALREADY_PARTICIPANT')) {
            userFriendlyMsg += 'User is already a member of this group.';
          } else if (errorMsg.includes('USER_PRIVACY_RESTRICTED')) {
            userFriendlyMsg += 'User has privacy settings that prevent adding them.';
          } else if (errorMsg.includes('CHAT_ADMIN_REQUIRED')) {
            userFriendlyMsg += 'Bot needs admin rights with "Add Users" permission.';
          } else {
            userFriendlyMsg += 'Please try again or contact an administrator.';
          }

          await sendTelegramMessage({
            chat_id: chatId,
            text: userFriendlyMsg,
          });
        }
        break;

      case '/add_users':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        // Check if user is admin
        const isGroupAdminForAddUsers = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForAddUsers) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        if (args.length === 0) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please provide user IDs separated by spaces.\n\n<b>Usage:</b> <code>/add_users &lt;user_id1&gt; &lt;user_id2&gt; ...</code>\n\n<b>Example:</b> <code>/add_users 123456789 987654321 555555555</code>',
            parse_mode: 'HTML',
          });
          return;
        }

        try {
          const userIds = args.map(id => parseInt(id)).filter(id => !isNaN(id));
          if (userIds.length === 0) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ No valid user IDs provided.',
            });
            return;
          }

          let successCount = 0;
          let failCount = 0;
          const errors: string[] = [];

          // Add users one by one (with delay to respect rate limits)
          for (const userId of userIds) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between adds
              const result = await addChatMember(chatId, userId);
              if (result.ok) {
                successCount++;
              } else {
                failCount++;
                errors.push(`User ${userId}: ${result.description || 'Failed'}`);
              }
            } catch (error: any) {
              failCount++;
              errors.push(`User ${userId}: ${error.message || 'Failed'}`);
            }
          }

          let resultMsg = `📊 <b>Add Users Result</b>\n\n`;
          resultMsg += `✅ Success: ${successCount}\n`;
          resultMsg += `❌ Failed: ${failCount}\n`;
          
          if (errors.length > 0 && errors.length <= 5) {
            resultMsg += `\n<b>Errors:</b>\n${errors.join('\n')}`;
          } else if (errors.length > 5) {
            resultMsg += `\n<b>First 5 errors:</b>\n${errors.slice(0, 5).join('\n')}`;
          }

          await sendTelegramMessage({
            chat_id: chatId,
            text: resultMsg,
            parse_mode: 'HTML',
          });
        } catch (error: any) {
          console.error('Error adding users:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to add users. Please try again or contact an administrator.',
          });
        }
        break;

      case '/copy_members':
        // This is an admin-only command (requires bot admin, not just group admin)
        const isAdminForCopy = await isTelegramAdmin(telegramUserId);
        if (!isAdminForCopy) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command is only available to bot administrators.',
          });
          return;
        }

        if (args.length < 2) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Please provide source and target group IDs.\n\n<b>Usage:</b> <code>/copy_members &lt;source_group_id&gt; &lt;target_group_id&gt;</code>\n\n<b>Example:</b> <code>/copy_members -1001234567890 -1009876543210</code>\n\n<b>Note:</b> Use negative numbers for group IDs (e.g., -1001234567890)',
            parse_mode: 'HTML',
          });
          return;
        }

        try {
          const sourceGroupId = args[0];
          const targetGroupId = args[1];

          // Verify bot is admin in both groups
          const botInfo = await getBotInfo();
          const botId = botInfo.result?.id;
          if (!botId) {
            throw new Error('Could not get bot ID');
          }

          const isBotAdminSource = await isGroupAdmin(sourceGroupId, botId);
          const isBotAdminTarget = await isGroupAdmin(targetGroupId, botId);

          if (!isBotAdminSource) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: `❌ Bot must be an administrator in the source group (${sourceGroupId}).`,
            });
            return;
          }

          if (!isBotAdminTarget) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: `❌ Bot must be an administrator in the target group (${targetGroupId}).`,
            });
            return;
          }

          // Get members count from source group
          const membersCountResult = await getChatMembersCount(sourceGroupId);
          const membersCount = membersCountResult.ok ? membersCountResult.result : 0;

          await sendTelegramMessage({
            chat_id: chatId,
            text: `⚠️ <b>Note:</b> Telegram Bot API doesn't allow getting a full list of group members.\n\nTo copy members, you have two options:\n\n1. <b>Use invite link:</b> Export an invite link from source group and share it\n2. <b>Add manually:</b> Use <code>/add_users</code> with user IDs\n\n<b>Source group has:</b> ${membersCount} members\n\n<b>Tip:</b> Use <code>/export_invite</code> in the source group to get an invite link.`,
            parse_mode: 'HTML',
          });
        } catch (error: any) {
          console.error('Error copying members:', error.message || 'Unknown error');
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Failed to process copy members request. Please try again.',
          });
        }
        break;

      case '/export_invite':
      case '/invite_link':
        if (chatType === 'private') {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ This command only works in groups.',
          });
          return;
        }

        // Check if user is admin
        const isGroupAdminForInvite = await isGroupAdmin(chatId, telegramUserId);
        if (!isGroupAdminForInvite) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ You must be a group administrator to use this command.',
          });
          return;
        }

        try {
          const result = await exportChatInviteLink(chatId);
          if (result.ok && result.result) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: `🔗 <b>Group Invite Link</b>\n\n<code>${result.result}</code>\n\nShare this link to invite members to the group.`,
              parse_mode: 'HTML',
            });
          } else {
            throw new Error(result.description || 'Failed to export invite link');
          }
        } catch (error: any) {
          console.error('Error exporting invite link:', error.message || 'Unknown error');
          const errorMsg = error.message || 'Unknown error';
          let userFriendlyMsg = '❌ Failed to export invite link. ';
          
          if (errorMsg.includes('CHAT_ADMIN_REQUIRED')) {
            userFriendlyMsg += 'Bot needs admin rights to export invite links.';
          } else {
            userFriendlyMsg += 'Please try again or contact an administrator.';
          }

          await sendTelegramMessage({
            chat_id: chatId,
            text: userFriendlyMsg,
          });
        }
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

/**
 * Announce new event to Telegram groups
 * @param event Event object from database
 * @param groupChatIds Array of Telegram group chat IDs (optional, uses env var if not provided)
 * @returns Result with sent/failed counts
 */
export const announceEventToGroups = async (
  event: any,
  groupChatIds?: string[]
): Promise<{ sent: number; failed: number; errors: string[] }> => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not configured!');
    return { sent: 0, failed: 0, errors: ['Bot token not configured'] };
  }

  // Get group chat IDs from parameter or environment variable
  let chatIds: string[] = [];
  
  if (groupChatIds && groupChatIds.length > 0) {
    chatIds = groupChatIds;
  } else {
    // Get from environment variable (comma-separated)
    const envGroups = process.env.TELEGRAM_EVENT_GROUPS;
    if (envGroups) {
      chatIds = envGroups.split(',').map(id => id.trim()).filter(id => id.length > 0);
    }
  }

  if (chatIds.length === 0) {
    console.warn('⚠️  No Telegram groups configured for event announcements');
    return { sent: 0, failed: 0, errors: ['No groups configured'] };
  }

  const announcementText = formatEventAnnouncement(event);
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const chatId of chatIds) {
    try {
      // Send with photo if available
      if (event.image) {
        await sendTelegramPhoto(chatId, event.image, announcementText, 'HTML');
      } else {
        await sendTelegramMessage({
          chat_id: chatId,
          text: announcementText,
          parse_mode: 'HTML',
        });
      }
      console.log(`✅ Event announcement sent to group ${chatId}`);
      sent++;
    } catch (error: any) {
      const errorMsg = `Failed to send to group ${chatId}: ${error.message || error}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      failed++;
    }
  }

  return { sent, failed, errors };
};

/**
 * Get events that need reminders (3, 2, 1 days before, or today)
 */
const getEventsNeedingReminders = async (): Promise<{ event: any; daysRemaining: number }[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get events in the next 3 days (including today)
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', threeDaysLater.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    if (!events || events.length === 0) return [];

    const eventsNeedingReminders: { event: any; daysRemaining: number }[] = [];

    for (const event of events) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Check if event is 3, 2, 1 days away, or today
      if (diffDays >= 0 && diffDays <= 3) {
        eventsNeedingReminders.push({
          event,
          daysRemaining: diffDays,
        });
      }
    }

    return eventsNeedingReminders;
  } catch (error) {
    console.error('Error getting events needing reminders:', error);
    return [];
  }
};

/**
 * Send event reminders to Telegram groups
 * Checks for events 3, 2, 1 days before, and on the day
 */
export const sendEventReminders = async (): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not configured!');
    return { sent: 0, failed: 0, errors: ['Bot token not configured'] };
  }

  if (!isSupabaseConfigured()) {
    console.warn('⚠️  Supabase not configured. Cannot send reminders.');
    return { sent: 0, failed: 0, errors: ['Supabase not configured'] };
  }

  // Get group chat IDs
  const envGroups = process.env.TELEGRAM_EVENT_GROUPS;
  if (!envGroups) {
    console.warn('⚠️  No Telegram groups configured for reminders');
    return { sent: 0, failed: 0, errors: ['No groups configured'] };
  }

  const chatIds = envGroups.split(',').map(id => id.trim()).filter(id => id.length > 0);
  if (chatIds.length === 0) {
    return { sent: 0, failed: 0, errors: ['No groups configured'] };
  }

  const eventsNeedingReminders = await getEventsNeedingReminders();
  if (eventsNeedingReminders.length === 0) {
    console.log('✅ No events needing reminders today');
    return { sent: 0, failed: 0, errors: [] };
  }

  let totalSent = 0;
  let totalFailed = 0;
  const errors: string[] = [];

  for (const { event, daysRemaining } of eventsNeedingReminders) {
    let message: string;
    
    if (daysRemaining === 0) {
      // Event is today - "Time has come" message
      message = formatEventDayMessage(event);
    } else {
      // 3, 2, or 1 days before - reminder message
      message = formatEventReminder(event, daysRemaining);
    }

    // Send to all configured groups
    for (const chatId of chatIds) {
      try {
        if (event.image) {
          await sendTelegramPhoto(chatId, event.image, message, 'HTML');
        } else {
          await sendTelegramMessage({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          });
        }
        console.log(`✅ Reminder sent for "${event.title}" (${daysRemaining} days) to group ${chatId}`);
        totalSent++;
      } catch (error: any) {
        const errorMsg = `Failed to send reminder for "${event.title}" to group ${chatId}: ${error.message || error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        totalFailed++;
      }
    }
  }

  return { sent: totalSent, failed: totalFailed, errors };
};

