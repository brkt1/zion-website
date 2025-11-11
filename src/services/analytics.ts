import { supabase } from './supabase';

export interface Visit {
  id: string;
  path: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface DailyVisitStats {
  date: string;
  count: number;
  unique_visitors: number;
}

/**
 * Track a page visit
 */
export const trackVisit = async (path: string): Promise<void> => {
  try {
    // Get referrer and user agent from browser
    const referrer = document.referrer || null;
    const userAgent = navigator.userAgent || null;
    
    // Insert visit record
    const { error } = await supabase
      .from('visits')
      .insert({
        path: path,
        referrer: referrer,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Silently fail - don't interrupt user experience
      console.warn('Failed to track visit:', error);
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
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
      .select('created_at, path')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by date
    const statsMap = new Map<string, { count: number; uniquePaths: Set<string> }>();

    data?.forEach((visit) => {
      const date = new Date(visit.created_at).toISOString().split('T')[0];
      
      if (!statsMap.has(date)) {
        statsMap.set(date, { count: 0, uniquePaths: new Set() });
      }
      
      const stats = statsMap.get(date)!;
      stats.count += 1;
      stats.uniquePaths.add(visit.path);
    });

    // Convert to array and format
    const stats: DailyVisitStats[] = Array.from(statsMap.entries())
      .map(([date, { count, uniquePaths }]) => ({
        date,
        count,
        unique_visitors: uniquePaths.size, // Using unique paths as a proxy for unique visitors
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
 * Get unique visitors count (based on unique paths per day)
 */
export const getUniqueVisitorsToday = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('visits')
      .select('path')
      .gte('created_at', today.toISOString());

    if (error) throw error;

    // Count unique paths as a proxy for unique visitors
    const uniquePaths = new Set(data?.map(v => v.path) || []);
    return uniquePaths.size;
  } catch (error) {
    console.error('Error getting unique visitors today:', error);
    return 0;
  }
};

