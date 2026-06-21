import { useAuthStore } from '@/store';
import { apiClient } from '@/lib/api';
import { LoginRequest, SignupRequest, LoginResponse } from '@/types/auth';
import { useState } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);

      setToken(data.token);
      setUser(data.user as any);
      setError(null);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupRequest) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/signup', credentials);

      setToken(data.token);
      setUser(data.user as any);
      setError(null);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setError(null);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout: handleLogout,
  };
}
