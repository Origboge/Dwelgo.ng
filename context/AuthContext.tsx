import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_AGENTS } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('propertyhub_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // MOCK LOGIC: Check if the email matches one of our mock agents
        // This allows us to "login as agent" and see their specific profile
        const matchedAgent = MOCK_AGENTS.find(a => a.email.toLowerCase() === email.toLowerCase());

        let mockUser: User;

        if (matchedAgent) {
           mockUser = {
             id: matchedAgent.id, // Use the correct Agent ID
             firstName: matchedAgent.firstName,
             lastName: matchedAgent.lastName,
             email: matchedAgent.email,
             role: 'agent',
             avatar: matchedAgent.avatar,
             isVerified: true,
             agencyName: matchedAgent.agencyName
           };
        } else {
           // Default fallback for generic users
           mockUser = {
             id: 'u1',
             firstName: 'Demo',
             lastName: 'User',
             email: email,
             role: email.includes('agent') ? 'agent' : 'user',
             avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
             isVerified: true,
             agencyName: email.includes('agent') ? 'Demo Agency' : undefined
           };
        }
        
        setUser(mockUser);
        localStorage.setItem('propertyhub_user', JSON.stringify(mockUser));
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const register = async (data: Partial<User> & { password: string }) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          role: data.role || 'user',
          avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=10b981&color=fff`,
          isVerified: data.role === 'agent' ? false : true, // Agents need verification
          agencyName: data.agencyName,
          phone: data.phone
        };

        setUser(newUser);
        localStorage.setItem('propertyhub_user', JSON.stringify(newUser));
        setIsLoading(false);
        resolve();
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('propertyhub_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
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