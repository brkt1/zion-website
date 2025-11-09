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

// Configure Supabase client - explicitly disable realtime to prevent WebSocket connections
// This is critical for bfcache to work properly
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
    // Disable realtime for auth to prevent WebSocket
    flowType: 'pkce',
  },
  // Explicitly disable realtime
  realtime: {
    // Set to null to completely disable realtime
    // This prevents any WebSocket connections
    params: {
      eventsPerSecond: 0,
    },
  },
});

// Prevent realtime from initializing at all - critical for bfcache
// Override WebSocket constructor to prevent any WebSocket connections from Supabase
if (typeof window !== 'undefined') {
  // Store original WebSocket
  const OriginalWebSocket = window.WebSocket;
  
  // Override WebSocket to block Supabase realtime connections
  (window as any).WebSocket = class BlockedWebSocket extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      // Block WebSocket connections to Supabase realtime
      if (typeof url === 'string' && url.includes('realtime.supabase.co')) {
        console.warn('Supabase realtime WebSocket blocked for bfcache compatibility');
        // Create a no-op WebSocket that never connects
        super('ws://localhost', protocols);
        // Immediately close it
        setTimeout(() => {
          try {
            this.close();
          } catch (e) {
            // Ignore
          }
        }, 0);
        return;
      }
      // Allow other WebSocket connections
      super(url, protocols);
    }
  };
  
  // Also prevent realtime methods
  if (supabase.realtime) {
    supabase.realtime.channel = () => {
      return {
        subscribe: () => ({ unsubscribe: () => {} }),
        on: () => ({ unsubscribe: () => {} }),
        send: () => {},
        unsubscribe: () => {},
      } as any;
    };
    
    if (supabase.realtime.connect) {
      supabase.realtime.connect = () => Promise.resolve();
    }
  }
}

// Ensure realtime is disconnected on page unload/hide for bfcache compatibility
if (typeof window !== 'undefined') {
  const disconnectRealtime = () => {
    try {
      // Only disconnect if realtime is actually connected
      if (supabase.realtime.isConnected()) {
        supabase.realtime.disconnect();
      }
    } catch (e) {
      // Ignore errors if realtime isn't initialized
    }
  };

  window.addEventListener('beforeunload', disconnectRealtime);
  
  // Disconnect when page is hidden (critical for bfcache)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      disconnectRealtime();
    }
  });

  // Disconnect on pagehide (bfcache event)
  window.addEventListener('pagehide', disconnectRealtime);
}