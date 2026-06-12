'use client';

import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout, initAuth } = useAuthStore();
  return { user, isAuthenticated, setAuth, logout, initAuth };
}
