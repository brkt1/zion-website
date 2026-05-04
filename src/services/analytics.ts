import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Visit {
  id: string;
  path: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  visitor_id?: string;
  session_id?: string;
  created_at: string;
}

export interface DailyVisitStats {
  date: string;
  count: number;
  unique_visitors: number;
}

/**
 * Get or create a persistent visitor ID
 */
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('yenege_visitor_id');
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem('yenege_visitor_id', visitorId);
  }
  return visitorId;
};

/**
 * Get or create a session ID (expires after 30 mins of inactivity)
 */
const getSessionId = (): string => {
  const sessionKey = 'yenege_session_id';
  const sessionTimeKey = 'yenege_session_time';
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  let sessionId = sessionStorage.getItem(sessionKey);
  const lastActive = parseInt(sessionStorage.getItem(sessionTimeKey) || '0');
  
  if (!sessionId || (now - lastActive > thirtyMinutes)) {
    sessionId = uuidv4();
    sessionStorage.setItem(sessionKey, sessionId);
  }
  
  sessionStorage.setItem(sessionTimeKey, now.toString());
  return sessionId;
};

/**
 * Track a page visit
 */
export const trackVisit = async (path: string): Promise<void> => {
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const referrer = document.referrer || null;
    const userAgent = navigator.userAgent || null;
    
    // Insert visit record
    // Note: We include visitor_id and session_id. 
    // If these columns don't exist in the database, Supabase will ignore them or return an error.
    // We handle the error gracefully.
    const { error } = await supabase
      .from('visits')
      .insert({
        path: path,
        referrer: referrer,
        user_agent: userAgent,
        visitor_id: visitorId,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // If columns don't exist, try falling back to standard tracking
      if (error.code === 'PGRST204' || error.message?.includes('column')) {
        await supabase.from('visits').insert({
          path,
          referrer,
          user_agent: `${userAgent} [VID:${visitorId}]`, // Embed in user agent as fallback
          created_at: new Date().toISOString(),
        });
      } else {
        console.warn('Failed to track visit:', error);
      }
    }
  } catch (error) {
    console.warn('Error tracking visit:', error);
  }
};

/**
 * Get daily visit statistics
 */
export const getDailyVisitStats = async (days: number = 7): Promise<DailyVisitStats[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('visits')
      .select('created_at, visitor_id, user_agent')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const statsMap = new Map<string, { count: number; visitors: Set<string> }>();

    data?.forEach((visit) => {
      const date = new Date(visit.created_at).toISOString().split('T')[0];
      
      if (!statsMap.has(date)) {
        statsMap.set(date, { count: 0, visitors: new Set() });
      }
      
      const stats = statsMap.get(date)!;
      stats.count += 1;
      
      // Try to get visitor identity from multiple sources
      const vId = visit.visitor_id || 
                  visit.user_agent?.match(/\[VID:(.*?)\]/)?.[1] || 
                  visit.user_agent || 
                  'unknown';
      stats.visitors.add(vId);
    });

    const stats: DailyVisitStats[] = Array.from(statsMap.entries())
      .map(([date, { count, visitors }]) => ({
        date,
        count,
        unique_visitors: visitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  } catch (error) {
    console.error('Error getting daily visit stats:', error);
    return [];
  }
};

/**
 * Get total visits count
 */
export const getTotalVisits = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting total visits:', error);
    return 0;
  }
};

/**
 * Get today's visit count
 */
export const getTodayVisits = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting today visits:', error);
    return 0;
  }
};

/**
 * Get unique visitors count
 */
export const getUniqueVisitorsToday = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('visits')
      .select('visitor_id, user_agent')
      .gte('created_at', today.toISOString());

    if (error) throw error;

    const visitors = new Set();
    data?.forEach(v => {
      const vId = v.visitor_id || 
                  v.user_agent?.match(/\[VID:(.*?)\]/)?.[1] || 
                  v.user_agent || 
                  Math.random().toString();
      visitors.add(vId);
    });
    
    return visitors.size;
  } catch (error) {
    console.error('Error getting unique visitors today:', error);
    return 0;
  }
};


