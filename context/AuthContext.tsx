import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth init failed", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      return user;
    } catch (error: any) {
      console.error("Login failed", error);
      setIsLoading(false); // Ensure loading stops
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      const user = await AuthService.register(data);
      setUser(user);
    } catch (error: any) {
      console.error("Registration failed", error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    // We don't change global loading state here usually, but let the calling component handle UI
    return AuthService.resetPassword(email);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in");
    setIsLoading(true);
    try {
      const updatedUser = await AuthService.updateProfile(user.id, data);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};