import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  userId: string;
  role: 'USER' | 'ADMIN' | 'CAFE_OWNER';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ 
        user: data.user,
        session: data.session,
        loading: false 
      });

      // Fetch user profile
      await get().fetchProfile();
    } catch (error: any) {
      set({ 
        error: error.message || 'Sign in failed',
        loading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ 
        user: null,
        session: null,
        profile: null,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Sign out failed',
        loading: false 
      });
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({ 
        user: data.user,
        session: data.session,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Sign up failed',
        loading: false 
      });
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      const { session } = get();
      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profile = await response.json();
        set({ profile });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ loading: false });
        return;
      }

      set({ 
        session,
        user: session?.user || null,
        loading: false 
      });

      // Fetch profile if user is authenticated
      if (session?.user) {
        await get().fetchProfile();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ 
          session,
          user: session?.user || null 
        });

        if (event === 'SIGNED_IN' && session?.user) {
          await get().fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          set({ profile: null });
        }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
