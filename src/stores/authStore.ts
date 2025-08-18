import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../supabaseClient";

interface Profile {
  id: string;
  userId: string;
  name?: string;
  email?: string;
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
  sendMagicLink: (email: string, redirectTo?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  validateProfile: (profileData: any) => Profile | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  permissions: null,
  loading: true,
  error: null,

  // Helper function to validate profile data
  validateProfile: (profileData: any): Profile | null => {
    if (!profileData || typeof profileData !== 'object') {
      return null;
    }

    try {
      const validRoles = ['USER', 'ADMIN', 'CAFE_OWNER', 'SUPER_ADMIN'] as const;
      const role = profileData.role || profileData.role_name || 'USER';
      const upperRole = typeof role === 'string' ? role.toUpperCase() : 'USER';
      
      if (!validRoles.includes(upperRole as any)) {
        console.warn('Invalid role value:', role, 'Defaulting to USER');
        return null;
      }

      return {
        id: String(profileData.id || ''),
        userId: String(profileData.userId || profileData.user_id || ''),
        name: profileData.name ? String(profileData.name) : undefined,
        email: profileData.email ? String(profileData.email) : undefined,
        role: upperRole as "USER" | "ADMIN" | "CAFE_OWNER" | "SUPER_ADMIN",
        createdAt: String(profileData.createdAt || profileData.created_at || ''),
        updatedAt: String(profileData.updatedAt || profileData.updated_at || '')
      };
    } catch (error) {
      console.error('Error validating profile:', error);
      return null;
    }
  },

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

  sendMagicLink: async (email: string, redirectTo?: string) => {
    try {
      // Do not toggle global loading to avoid blocking password sign-in UI
      set({ error: null });

      const emailRedirectTo = redirectTo || `${window.location.origin}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message || 'Failed to send magic link' });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ error: null });
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message || 'Google sign-in failed' });
      throw error;
    }
  },

  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user) return;

    try {
      console.log("Fetching profile for user:", session.user.id);
      
      // Safety check for database connection
      if (!supabase) {
        console.error("Supabase client not available");
        throw new Error("Database connection not available");
      }

      // First, check if the profiles table exists and has the expected structure
      try {
        const { data: tableCheck, error: tableError } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);
        
        if (tableError) {
          console.error("Profiles table access error:", tableError);
          throw new Error("Profiles table not accessible");
        }
      } catch (tableCheckError) {
        console.error("Error checking profiles table:", tableCheckError);
        throw new Error("Database schema validation failed");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_id, name, email, role, created_at, updated_at")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Profile query error:", profileError);
        throw profileError;
      }

      console.log("Raw profile data:", profileData);
      console.log("Profile data keys:", Object.keys(profileData || {}));
      console.log("Profile data types:", Object.entries(profileData || {}).map(([key, value]) => `${key}: ${typeof value}`));
      console.log("Profile data values:", Object.entries(profileData || {}).map(([key, value]) => `${key}: ${JSON.stringify(value)}`));

      // Validate profile data structure
      if (!profileData || typeof profileData !== 'object') {
        console.warn('Invalid profile data received:', profileData);
        throw new Error('Invalid profile data structure');
      }

      // Use the validateProfile helper to ensure data integrity
      let validatedProfile = get().validateProfile(profileData);
      if (!validatedProfile) {
        console.warn('Profile validation failed, using default profile');
        // Create a fallback profile instead of throwing an error
        const fallbackProfile: Profile = {
          id: session.user.id,
          userId: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          email: session.user.email,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log("Using fallback profile:", fallbackProfile);
        
        // Ensure fallback profile is also properly formatted
        const finalFallbackProfile: Profile = {
          id: String(fallbackProfile.id || ''),
          userId: String(fallbackProfile.userId || ''),
          name: fallbackProfile.name ? String(fallbackProfile.name) : undefined,
          email: fallbackProfile.email ? String(fallbackProfile.email) : undefined,
          role: fallbackProfile.role,
          createdAt: String(fallbackProfile.createdAt || ''),
          updatedAt: String(fallbackProfile.updatedAt || '')
        };
        
        validatedProfile = finalFallbackProfile;
      }

      console.log("Validated profile data:", validatedProfile);
      console.log("Validated profile keys:", Object.keys(validatedProfile || {}));
      console.log("Validated profile types:", Object.entries(validatedProfile || {}).map(([key, value]) => `${key}: ${typeof value}`));
      console.log("Validated profile values:", Object.entries(validatedProfile || {}).map(([key, value]) => `${key}: ${JSON.stringify(value)}`));

      // Final validation: ensure all values are properly formatted
      const finalProfile: Profile = {
        id: String(validatedProfile.id || ''),
        userId: String(validatedProfile.userId || ''),
        name: validatedProfile.name ? String(validatedProfile.name) : undefined,
        email: validatedProfile.email ? String(validatedProfile.email) : undefined,
        role: validatedProfile.role,
        createdAt: String(validatedProfile.createdAt || ''),
        updatedAt: String(validatedProfile.updatedAt || '')
      };

      console.log("Final profile data:", finalProfile);
      console.log("Final profile types:", Object.entries(finalProfile || {}).map(([key, value]) => `${key}: ${typeof value}`));
      console.log("Final profile values:", Object.entries(finalProfile || {}).map(([key, value]) => `${key}: ${JSON.stringify(value)}`));

      // Additional safety check: ensure no object values remain
      const hasObjectValues = Object.values(finalProfile).some(value => 
        value !== null && value !== undefined && typeof value === 'object'
      );
      
      if (hasObjectValues) {
        console.error('Profile still contains object values after validation:', finalProfile);
        throw new Error('Profile validation failed: object values detected');
      }

      // Final type assertion to ensure TypeScript knows the profile is valid
      const safeProfile: Profile = {
        id: finalProfile.id,
        userId: finalProfile.userId,
        name: finalProfile.name,
        email: finalProfile.email,
        role: finalProfile.role,
        createdAt: finalProfile.createdAt,
        updatedAt: finalProfile.updatedAt
      };

      console.log("Safe profile data:", safeProfile);
      console.log("Safe profile types:", Object.entries(safeProfile || {}).map(([key, value]) => `${key}: ${typeof value}`));

      // Additional safety check: ensure all values are primitive
      const hasNonPrimitiveValues = Object.values(safeProfile).some(value => 
        value !== null && value !== undefined && (typeof value === 'object' || typeof value === 'function')
      );
      
      if (hasNonPrimitiveValues) {
        console.error('Safe profile still contains non-primitive values:', safeProfile);
        throw new Error('Profile validation failed: non-primitive values detected');
      }

      const { data: permissionsData, error: permissionsError } = await supabase
        .from("profile_permissions")
        .select("permission_name")
        .eq("profile_id", session.user.id);

      if (permissionsError) {
        console.error("Permissions query error:", permissionsError);
        throw permissionsError;
      }

      console.log("Raw permissions data:", permissionsData);

      // Safely handle permissionsData to prevent conversion errors
      let permissions: string[] = [];
      
      if (Array.isArray(permissionsData)) {
        permissions = permissionsData
          .filter((p: any) => {
            const isValid = p && typeof p === 'object' && p.permission_name;
            if (!isValid) {
              console.warn('Invalid permission object:', p);
            }
            return isValid;
          })
          .map((p: any) => {
            const permissionName = String(p.permission_name);
            console.log('Processing permission:', permissionName);
            return permissionName;
          });
      } else {
        console.warn('Permissions data is not an array:', permissionsData);
      }

      console.log("Final permissions array:", permissions);

      set({ 
        profile: safeProfile,
        permissions
      });

    } catch (error) {
      console.error("Error fetching profile or permissions:", error);
      // Set default values on error to prevent undefined state
      const { session } = get();
      if (!session?.user) return;
      const fallbackProfile = get().validateProfile({
        id: session.user.id,
        userId: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        email: session.user.email,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }) || {
        id: session.user.id,
        userId: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        email: session.user.email,
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Ensure fallback profile is also properly formatted
      const finalFallbackProfile: Profile = {
        id: String(fallbackProfile.id || ''),
        userId: String(fallbackProfile.userId || ''),
        name: fallbackProfile.name ? String(fallbackProfile.name) : undefined,
        email: fallbackProfile.email ? String(fallbackProfile.email) : undefined,
        role: fallbackProfile.role,
        createdAt: String(fallbackProfile.createdAt || ''),
        updatedAt: String(fallbackProfile.updatedAt || '')
      };
      
      set({ 
        profile: finalFallbackProfile,
        permissions: []
      });
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
        try {
          await get().fetchProfile();
        } catch (profileError) {
          console.error("Error fetching profile during initialization:", profileError);
          // Set default profile to prevent undefined state
          const defaultProfile = get().validateProfile({
            id: session.user.id,
            userId: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            email: session.user.email,
            role: 'USER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }) || {
            id: session.user.id,
            userId: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            email: session.user.email,
            role: 'USER' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Ensure default profile is also properly formatted
          const finalDefaultProfile: Profile = {
            id: String(defaultProfile.id || ''),
            userId: String(defaultProfile.userId || ''),
            name: defaultProfile.name ? String(defaultProfile.name) : undefined,
            email: defaultProfile.email ? String(defaultProfile.email) : undefined,
            role: defaultProfile.role,
            createdAt: String(defaultProfile.createdAt || ''),
            updatedAt: String(defaultProfile.updatedAt || '')
          };
          
          set({
            profile: finalDefaultProfile,
            permissions: []
          });
        }
      } else {
        // Ensure profile is null when no user
        set({ profile: null, permissions: [] });
      }
      
      set({ loading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          set({
            session,
            user: session?.user || null,
          });

          if (event === "SIGNED_IN" && session?.user) {
            await get().fetchProfile();
          } else if (event === "SIGNED_OUT") {
            set({ profile: null, permissions: [] });
          }
        } catch (authChangeError) {
          console.error("Error during auth state change:", authChangeError);
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
