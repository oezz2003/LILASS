import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useLogin, useRegister, useLogout } from '../hooks/api';
import { User } from '../../shared/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  
  // Get auth state from React Query
  const { data: authData, isLoading: isAuthLoading, error: authError } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const user = authData?.user || null;
  const isAuthenticated = !!user;
  const isLoading = isAuthLoading || loginMutation.isPending || registerMutation.isPending;

  // Clear error when mutations succeed
  useEffect(() => {
    if (loginMutation.isSuccess || registerMutation.isSuccess) {
      setError(null);
    }
  }, [loginMutation.isSuccess, registerMutation.isSuccess]);

  // Handle auth errors
  useEffect(() => {
    if (loginMutation.error) {
      setError(loginMutation.error.message || 'Login failed');
    } else if (registerMutation.error) {
      setError(registerMutation.error.message || 'Registration failed');
    } else if (authError && authError.message !== 'Unauthorized') {
      setError('Authentication error');
    }
  }, [loginMutation.error, registerMutation.error, authError]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      await registerMutation.mutateAsync({ name, email, password });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setError(null);
    logoutMutation.mutate();
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}