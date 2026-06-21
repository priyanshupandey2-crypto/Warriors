'use client';

import { create } from 'zustand';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token:
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,
  isAuthenticated: false,

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token: string | null) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
    set({ token });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
