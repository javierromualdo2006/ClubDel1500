// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { UsersAPI, User } from '@/lib/api/users';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  loading: boolean;
  isAdmin: () => boolean;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await UsersAPI.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await UsersAPI.login({ email, password });
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await UsersAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const result = await UsersAPI.register(userData);
      return result.success;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return {
    user,
    login,
    logout,
    register,
    loading,
    isAdmin
  };
}