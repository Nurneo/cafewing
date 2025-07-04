import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User, UserRole } from '../types';
import { supabaseService } from '../services/supabaseService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Enhanced logging with timestamps
const logWithTimestamp = (message: string, data?: any) => {
  const timestamp = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dhaka',
    hour12: false 
  });
  console.log(`[${timestamp} +06] AuthContext: ${message}`, data || '');
};

// Default users for development mode
const DEFAULT_USERS = {
  admin: {
    id: '05db03d2-6d8a-40ae-99b4-f1785966ebb9',
    email: 'admin@themis.cafe',
    name: 'Administrator',
    role: 'admin' as UserRole,
    createdAt: new Date().toISOString(),
  },
  player1: {
    id: '83e04aaf-d6a8-45ec-ad2e-3d637f42a793',
    email: 'player1@themis.cafe',
    name: 'Player 1',
    role: 'waiter' as UserRole,
    createdAt: new Date().toISOString(),
  },
  player2: {
    id: '59a949c0-3818-46cb-acdf-0381cf94d3b3',
    email: 'player2@themis.cafe',
    name: 'Player 2',
    role: 'waiter' as UserRole,
    createdAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logWithTimestamp('Initializing authentication with Supabase session check');
    
    const initializeAuth = async () => {
      try {
        // Check for existing Supabase session
        const currentUser = await supabaseService.getCurrentUser();
        
        if (currentUser) {
          logWithTimestamp('Found existing Supabase session', currentUser.email);
          setUser(currentUser);
        } else {
          logWithTimestamp('No existing session found');
        }
      } catch (error) {
        logWithTimestamp('Error initializing auth', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    logWithTimestamp('Attempting Supabase login', { email, role });
    setIsLoading(true);
    
    try {
      // Perform actual Supabase authentication
      const success = await supabaseService.signIn(email, password);
      
      if (success) {
        // Get the authenticated user from Supabase
        const currentUser = await supabaseService.getCurrentUser();
        
        if (currentUser && currentUser.role === role) {
          logWithTimestamp('Supabase login successful', currentUser.name);
          setUser(currentUser);
          setIsLoading(false);
          return true;
        } else if (currentUser) {
          logWithTimestamp('Role mismatch', { expected: role, actual: currentUser.role });
          await supabaseService.signOut();
          setIsLoading(false);
          return false;
        }
      }
      
      logWithTimestamp('Supabase login failed');
      setIsLoading(false);
      return false;
    } catch (error) {
      logWithTimestamp('Login error', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    logWithTimestamp('Performing Supabase logout');
    setIsLoading(true);
    
    try {
      await supabaseService.signOut();
      setUser(null);
      logWithTimestamp('Logout successful');
    } catch (error) {
      logWithTimestamp('Logout error', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch user role for testing (performs actual login)
  const switchUserRole = async (userKey: keyof typeof DEFAULT_USERS) => {
    const targetUser = DEFAULT_USERS[userKey];
    logWithTimestamp('Switching to user via actual login', targetUser.name);
    
    // Map user keys to actual passwords
    const passwords = {
      admin: 'admin123',
      player1: 'player1',
      player2: 'player2'
    };
    
    const success = await login(targetUser.email, passwords[userKey], targetUser.role);
    if (!success) {
      logWithTimestamp('Failed to switch user', targetUser.name);
    }
  };

  // Expose switchUserRole for development
  (window as any).switchUserRole = switchUserRole;
  (window as any).DEFAULT_USERS = DEFAULT_USERS;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};