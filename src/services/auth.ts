import { supabase } from './supabase';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

/**
 * Check if the current user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    // Check if user has admin role in user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (error || !data) {
      // Fallback: Check user metadata for admin role
      const userMetadata = session.user.user_metadata;
      if (userMetadata?.role === 'admin' || userMetadata?.is_admin === true) {
        return true;
      }
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
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
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

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

