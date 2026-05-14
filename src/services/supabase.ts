import { createClient } from '@supabase/supabase-js';

// Get environment variables, handling empty strings and placeholder values
const envUrl = process.env.REACT_APP_SUPABASE_URL;
const envKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if values are placeholders
const isPlaceholder = (value: string | undefined): boolean => {
  if (!value) return true;
  const trimmed = value.trim();
  return trimmed === '' || 
         trimmed.includes('your-') || 
         trimmed.includes('YOUR-') ||
         trimmed === 'your-supabase-project-url' ||
         trimmed === 'your-supabase-anon-key';
};

// Use fallback values if env vars are missing, empty, or placeholders
const supabaseUrl = (envUrl && !isPlaceholder(envUrl)) 
  ? envUrl.trim() 
  : 'https://zjhnvtegoarvdqakqqkd.supabase.co';
  
const supabaseAnonKey = (envKey && !isPlaceholder(envKey)) 
  ? envKey.trim() 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII';

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase config check:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing',
    env: process.env.NODE_ENV
  });
  throw new Error(
    'Missing Supabase configuration. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables.'
  );
}

if (!isValidUrl(supabaseUrl)) {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error(
    `Invalid Supabase URL: "${supabaseUrl}". Must be a valid HTTP or HTTPS URL.`
  );
}

// Configure Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-client-info': 'zion-website',
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  // Realtime configuration
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

/**
 * Utility to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase Error [${context}]:`, error);
  
  // Categorize errors
  if (error.message?.includes('Failed to fetch') || error.code === 'PGRST301' || error.message?.includes('network')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Connection failed. Please check your internet and try again.',
      originalError: error
    };
  }
  
  if (error.code === '42501' || error.status === 403) {
    return {
      type: 'AUTH_ERROR',
      message: 'You don\'t have permission to perform this action.',
      originalError: error
    };
  }

  return {
    type: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred.',
    originalError: error
  };
};

// Ensure realtime is disconnected on page unload/hide for bfcache compatibility
if (typeof window !== 'undefined') {
  const disconnectRealtime = () => {
    try {
      if (supabase.realtime && (supabase.realtime as any).isConnected()) {
        supabase.realtime.disconnect();
      }
    } catch (e) {
      // Ignore
    }
  };

  window.addEventListener('beforeunload', disconnectRealtime);
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      disconnectRealtime();
    }
  });

  window.addEventListener('pagehide', disconnectRealtime);
}