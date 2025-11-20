import { supabase } from './supabase';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user' | 'event_organizer';
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
export const getUserRole = async (): Promise<'admin' | 'user' | 'event_organizer' | null> => {
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
      return data.role as 'admin' | 'user' | 'event_organizer';
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
 * Check if the current user is an event organizer
 */
export const isEventOrganizer = async (): Promise<boolean> => {
  try {
    const role = await getUserRole();
    return role === 'event_organizer' || role === 'admin';
  } catch (error) {
    console.error('Error checking event organizer status:', error);
    return false;
  }
};

/**
 * Get events assigned to the current event organizer
 */
export const getOrganizerEvents = async (): Promise<string[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('event_organizers')
      .select('event_id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching organizer events:', error);
      return [];
    }

    return (data || []).map(item => item.event_id);
  } catch (error) {
    console.error('Error getting organizer events:', error);
    return [];
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

    if (data) {
      console.log('Commission seller found:', data);
    } else {
      console.log('Commission seller not found for email:', normalizedEmail);
    }

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

/**
 * Check if an email has an accepted internship application
 * This can be used before signup to verify eligibility
 * Uses an RPC function to bypass RLS for unauthenticated users
 */
export const hasAcceptedApplication = async (email: string): Promise<boolean> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // First, try using the RPC function (works for unauthenticated users)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('check_accepted_application', { check_email: normalizedEmail });

    if (!rpcError && rpcData === true) {
      return true;
    }

    // Fallback: Try direct query (works if RLS allows it)
    // This is useful if the RPC function doesn't exist yet
    let { data, error } = await supabase
      .from('applications')
      .select('id, email, status, type')
      .eq('email', normalizedEmail)
      .eq('status', 'accepted')
      .eq('type', 'internship')
      .maybeSingle();

    // If not found with exact match, try case-insensitive search
    if (!data && !error) {
      const { data: allApplications } = await supabase
        .from('applications')
        .select('id, email, status, type');
      
      if (allApplications) {
        data = allApplications.find(
          app => 
            app.email?.toLowerCase().trim() === normalizedEmail && 
            app.status === 'accepted' && 
            app.type === 'internship'
        ) || null;
      }
    }

    // If RPC function worked, return its result
    if (!rpcError && rpcData !== null) {
      return rpcData === true;
    }

    // If RPC function doesn't exist or failed, try direct query
    if (rpcError) {
      console.warn('RPC function check_accepted_application not available, using direct query:', rpcError.message);
    }

    if (error) {
      console.error('Error checking application status (Direct query):', error);
      // If it's an RLS/permission error, suggest running the SQL script
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('RLS policy blocking access. Please run the SQL script: docs/scripts/fix-elearning-access-check.sql');
      }
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
};

/**
 * Check if the current user has access to e-learning
 * Users with accepted internship applications can access e-learning
 */
export const isElearningUser = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const userEmail = session.user.email;

    if (!userEmail) {
      return false;
    }

    return await hasAcceptedApplication(userEmail);
  } catch (error) {
    console.error('Error checking e-learning access:', error);
    return false;
  }
};

