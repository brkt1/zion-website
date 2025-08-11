import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../supabaseClient";

interface Profile {
  id: string;
  userId: string;
  role: "USER" | "ADMIN" | "CAFE_OWNER" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  permissions: string[] | null;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  permissions: null,
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
        loading: false,
      });

      // Fetch user profile from Supabase
      await get().fetchProfile();
    } catch (error: any) {
      set({
        error: error.message || "Sign in failed",
        loading: false,
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
        permissions: null,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Sign out failed",
        loading: false,
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
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Sign up failed",
        loading: false,
      });
      throw error;
    }
  },

  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      const { data: permissionsData, error: permissionsError } = await supabase
        .from("profile_permissions")
        .select("permission_name")
        .eq("profile_id", session.user.id);

      if (permissionsError) throw permissionsError;

      console.log("fetchProfile permissionsData:", permissionsData);

      set({ 
        profile: profileData,
        permissions: permissionsData.map((p: any) => p.permission_name) 
      });

    } catch (error) {
      console.error("Error fetching profile or permissions:", error);
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        set({ loading: false });
        return;
      }

      set({
        session,
        user: session?.user || null,
      });

      // Fetch profile if user is authenticated
      if (session?.user) {
        await get().fetchProfile();
      }
      set({ loading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({
          session,
          user: session?.user || null,
        });

        if (event === "SIGNED_IN" && session?.user) {
          await get().fetchProfile();
        } else if (event === "SIGNED_OUT") {
          set({ profile: null, permissions: null });
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
