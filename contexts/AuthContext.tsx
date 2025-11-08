import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser } from '@/app/types';

interface AuthContextType {
  user: AppUser | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, mobile: string, address: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_user';
const USERS_KEY = 'app_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          // Validate that it's valid JSON before parsing
          if (storedUser.trim().startsWith('{')) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setSession({ user: parsedUser });
            } catch (parseError) {
              console.error('Invalid JSON in stored user:', parseError);
              await AsyncStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      let users: any[] = [];
      
      if (usersData && usersData.trim().startsWith('[')) {
        try {
          users = JSON.parse(usersData);
          if (!Array.isArray(users)) {
            users = [];
          }
        } catch (parseError) {
          console.error('Invalid JSON in users data:', parseError);
          users = [];
        }
      }
      
      const user = users.find(
        (u: any) => 
          u.email?.toLowerCase() === email.trim().toLowerCase() && 
          u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Create app user without password
      const appUser: AppUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
      };

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      setUser(appUser);
      setSession({ user: appUser });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (
    name: string,
    email: string,
    password: string,
    mobile: string,
    address: string
  ) => {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      let users: any[] = [];

      if (usersData && usersData.trim().startsWith('[')) {
        try {
          users = JSON.parse(usersData);
          if (!Array.isArray(users)) {
            users = [];
          }
        } catch (parseError) {
          console.error('Invalid JSON in users data:', parseError);
          users = [];
        }
      }

      // Check if user already exists
      const existingUser = users.find(
        (u: any) => u.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // In production, this should be hashed
        mobile: mobile.trim(),
        address: address.trim(),
        createdAt: new Date().toISOString(),
      };

      // Save user
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Create app user without password
      const appUser: AppUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        address: newUser.address,
      };

      // Auto-login after signup - save to storage first
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      
      // Update state - navigation happens synchronously so this won't cause blinking
      setUser(appUser);
      setSession({ user: appUser });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setSession(null);
    } catch (error: any) {
      throw error;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, signIn, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
