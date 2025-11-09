import { supabase } from './supabase';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Cache for admin status to reduce database queries
let adminCache: { userId: string; isAdmin: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Check if the current user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const userId = session.user.id;

    // Check cache first
    if (adminCache && adminCache.userId === userId) {
      const cacheAge = Date.now() - adminCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        return adminCache.isAdmin;
      }
    }

    // Check if user has admin role in user_roles table
    // Use maybeSingle() instead of single() to avoid errors when no row is found
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    let isAdminUser = false;

    if (error) {
      // Fallback: Check user metadata for admin role
      const userMetadata = session.user.user_metadata;
      if (userMetadata?.role === 'admin' || userMetadata?.is_admin === true) {
        isAdminUser = true;
      }
    } else if (data && data.role === 'admin') {
      isAdminUser = true;
    } else {
      // Fallback: Check user metadata for admin role
      const userMetadata = session.user.user_metadata;
      if (userMetadata?.role === 'admin' || userMetadata?.is_admin === true) {
        isAdminUser = true;
      }
    }

    // Update cache
    adminCache = {
      userId,
      isAdmin: isAdminUser,
      timestamp: Date.now(),
    };

    return isAdminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Clear the admin cache (useful after role changes)
 */
export const clearAdminCache = () => {
  adminCache = null;
};

/**
 * Get current user's role
 */
export const getUserRole = async (): Promise<'admin' | 'user' | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Check user_roles table first
    // Use maybeSingle() instead of single() to avoid errors when no row is found
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!error && data) {
      return data.role as 'admin' | 'user';
    }

    // Fallback: Check user metadata
    const userMetadata = session.user.user_metadata;
    if (userMetadata?.role === 'admin' || userMetadata?.is_admin === true) {
      return 'admin';
    }

    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Check if the current user is a commission seller
 * Commission sellers are identified by matching their email with commission_sellers table
 */
export const isCommissionSeller = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const userEmail = session.user.email;

    if (!userEmail) {
      return false;
    }

    // Check if user's email exists in commission_sellers table and is active
    const { data, error } = await supabase
      .from('commission_sellers')
      .select('id, email, is_active')
      .eq('email', userEmail.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking commission seller status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking commission seller status:', error);
    return false;
  }
};

/**
 * Check if user has any admin access (either full admin or commission seller)
 */
export const hasAdminAccess = async (): Promise<boolean> => {
  const admin = await isAdmin();
  const seller = await isCommissionSeller();
  return admin || seller;
};

/**
 * Require admin access - redirects to login if not admin
 */
export const requireAdmin = async (): Promise<boolean> => {
  const admin = await isAdmin();
  if (!admin) {
    // Redirect will be handled by the component
    return false;
  }
  return true;
};

