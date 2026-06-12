'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { saveAuth, clearAuth, getStoredUser } from '@/lib/auth';

interface AuthStore {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout:  () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:            null,
  accessToken:     null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    saveAuth(accessToken, refreshToken, user);
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    clearAuth();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initAuth: () => {
    const user = getStoredUser();
    if (user) set({ user, isAuthenticated: true });
  },
}));
