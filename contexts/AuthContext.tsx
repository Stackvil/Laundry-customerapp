import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AppUser } from '@/app/types';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, mobile: string, address: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUser = session?.user;
      const appUser: AppUser | null = supabaseUser
        ? {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name,
            email: supabaseUser.email,
            mobile: supabaseUser.user_metadata?.mobile,
            address: supabaseUser.user_metadata?.address,
          }
        : null;

      setUser(appUser);
      setSession(session);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const supabaseUser = session?.user;
      const appUser: AppUser | null = supabaseUser
        ? {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name,
            email: supabaseUser.email,
            mobile: supabaseUser.user_metadata?.mobile,
            address: supabaseUser.user_metadata?.address,
          }
        : null;

      setUser(appUser);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Fast login with minimal data transfer
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    if (error) throw error;
    
    // Immediate user state update for faster UI response
    if (data.user) {
      const appUser: AppUser = {
        id: data.user.id,
        name: data.user.user_metadata?.name,
        email: data.user.email,
        mobile: data.user.user_metadata?.mobile,
        address: data.user.user_metadata?.address,
      };
      setUser(appUser);
      setSession(data.session);
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    mobile: string,
    address: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, mobile, address },
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
