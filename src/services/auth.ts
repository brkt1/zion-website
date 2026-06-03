import { supabase } from './supabase';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'sponsorship_manager' | 'masterclass_manager' | 'masterclass_sales' | 'user';
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
    // Use case-insensitive comparison by converting both to lowercase
    const normalizedEmail = userEmail.toLowerCase().trim();
    
    // Try to find the user in commission_sellers table
    // First try exact match with normalized email
    let { data, error } = await supabase
      .from('commission_sellers')
      .select('id, email, is_active')
      .eq('email', normalizedEmail)
      .eq('is_active', true)
      .maybeSingle();

    // If not found with exact match, try case-insensitive search
    // This handles cases where email in DB might have different casing
    if (!data && !error) {
      const { data: allSellers } = await supabase
        .from('commission_sellers')
        .select('id, email, is_active');
      
      if (allSellers) {
        data = allSellers.find(
          seller => seller.email?.toLowerCase().trim() === normalizedEmail && seller.is_active
        ) || null;
      }
    }

    if (error) {
      console.error('Error checking commission seller status:', error);
      // If RLS error, try using RPC function if available
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.log('RLS policy blocking query, trying alternative method...');
        // The RLS policy might be blocking - this will be fixed by running the SQL script
        return false;
      }
      return false;
    }

    // Return true if commission seller found, false otherwise
    // Don't log - this is a normal check that happens frequently
    return !!data;
  } catch (error) {
    console.error('Error checking commission seller status:', error);
    return false;
  }
};

/**
 * Check if the current user is a ticket scanner
 * Ticket scanners are identified by matching their email with ticket_scanners table
 */
export const isTicketScanner = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const userEmail = session.user.email;

    if (!userEmail) {
      return false;
    }

    // Check if user's email exists in ticket_scanners table and is active
    // Use case-insensitive comparison by converting both to lowercase
    const normalizedEmail = userEmail.toLowerCase().trim();
    
    // Try to find the user in ticket_scanners table
    // First try exact match, then try case-insensitive match
    let { data, error } = await supabase
      .from('ticket_scanners')
      .select('id, email, is_active')
      .eq('email', normalizedEmail)
      .eq('is_active', true)
      .maybeSingle();

    // If not found with exact match, try case-insensitive search
    if (!data && !error) {
      const { data: allScanners } = await supabase
        .from('ticket_scanners')
        .select('id, email, is_active');
      
      if (allScanners) {
        data = allScanners.find(
          scanner => scanner.email?.toLowerCase().trim() === normalizedEmail && scanner.is_active
        ) || null;
      }
    }

    if (error) {
      console.error('Error checking ticket scanner status:', error);
      return false;
    }

    if (data) {
      console.log('Ticket scanner found:', data);
    } else {
      console.log('Ticket scanner not found for email:', normalizedEmail);
    }

    return !!data;
  } catch (error) {
    console.error('Error checking ticket scanner status:', error);
    return false;
  }
};

/**
 * Check if the current user is a sponsorship representative
 */
export const isSponsorshipRepresentative = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const userEmail = session.user.email;
    if (!userEmail) return false;

    const normalizedEmail = userEmail.toLowerCase().trim();
    
    // Check sponsorship_representatives table
    const { data, error } = await supabase
      .from('sponsorship_representatives')
      .select('id, email, is_active')
      .eq('email', normalizedEmail)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking rep status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking rep status:', error);
    return false;
  }
};

/**
 * Check if the current user is a sponsorship manager
 */
export const isSponsorshipManager = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (data?.role === 'sponsorship_manager') {
      return true;
    }

    // Fallback: Check user metadata
    const userMetadata = session.user.user_metadata;
    if (userMetadata?.role === 'sponsorship_manager') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking manager status:', error);
    return false;
  }
};

/**
 * Check if the current user is a masterclass manager
 */
export const isMasterclassManager = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (data?.role === 'masterclass_manager') {
      return true;
    }

    // Fallback: Check user metadata
    const userMetadata = session.user.user_metadata;
    if (userMetadata?.role === 'masterclass_manager') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking masterclass manager status:', error);
    return false;
  }
};

/**
 * Check if the current user is a masterclass sales agent
 */
export const isMasterclassSales = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (data?.role === 'masterclass_sales') {
      return true;
    }

    // Fallback: Check user metadata
    const userMetadata = session.user.user_metadata;
    if (userMetadata?.role === 'masterclass_sales') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking masterclass sales status:', error);
    return false;
  }
};

/**
 * Check if user has any admin access (either full admin, sponsorship manager, masterclass manager, commission seller, or rep)
 */
export const hasAdminAccess = async (): Promise<boolean> => {
  const admin = await isAdmin();
  const manager = await isSponsorshipManager();
  const masterclass = await isMasterclassManager();
  const masterclassSales = await isMasterclassSales();
  const seller = await isCommissionSeller();
  const rep = await isSponsorshipRepresentative();
  return admin || manager || masterclass || masterclassSales || seller || rep;
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

const ADMIN_NAMES: Record<string, string> = {
  'ed8a03e2-8099-4b4f-b517-7a23abfcdea2': 'Event Organizer',
  '9b2baa05-55b6-47a5-b13a-1e006c3dceee': 'Masterclass Manager',
  '103303ca-5f7d-485f-a03e-e7c8b1585ed1': 'Masterclass Manager',
  'ea95563d-e2bd-4334-b214-51e8491be89a': 'Masterclass Manager',
  '9f47e5ca-f4d6-4c6c-b91b-16644d9f0d64': 'Masterclass Manager',
  '654f4ef9-0a77-4ccb-8a46-cdc1391348e8': 'Masterclass Manager',
  '9fdb6dac-0e9b-4201-a11a-f9828f98aa1f': 'Masterclass Manager'
};

export const resolveAdminName = (uuid?: string): string => {
  if (!uuid) return 'System';
  return ADMIN_NAMES[uuid] || uuid;
};


