import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  /**
   * Initialize authentication status
   * Check current session and set user info
   */
  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      set({ 
        user: session?.user ?? null,
        session: session,
        loading: false,
        initialized: true
      });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user ?? null,
          session: session
        });
      });
    } catch (err) {
      console.error('Error initializing auth:', err);
      set({ loading: false, initialized: true });
    }
  },

  /**
   * User registration
   */
  signUp: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  },

  /**
   * User login
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If email not confirmed, provide a friendly hint
        if (error.message === 'Email not confirmed' || error.code === 'email_not_confirmed') {
          return { 
            error: new Error('Email not confirmed. Please check your inbox and click the verification link.') 
          };
        }
        return { error };
      }
      
      // Update state
      set({ 
        user: data.user ?? null,
        session: data.session
      });
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  },

  /**
   * User logout
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        user: null,
        session: null
      });
    } catch (err) {
      console.error('Error signing out:', err);
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  },
}));

