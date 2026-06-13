import Cookies from 'js-cookie';
import { User } from '@/types';

export function saveAuth(accessToken: string, refreshToken: string, user: User): void {
  Cookies.set('accessToken',  accessToken,  { expires: 1 / 96, secure: true, sameSite: 'strict' });
  Cookies.set('refreshToken', refreshToken, { expires: 7,       secure: true, sameSite: 'strict' });
  Cookies.set('user', JSON.stringify(user), { expires: 7,       secure: true, sameSite: 'strict' });
}

export function clearAuth(): void {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('user');
}

export function getStoredUser(): User | null {
  const raw = Cookies.get('user');
  if (!raw) return null;
  try { return JSON.parse(raw) as User; }
  catch { return null; }
}

export function isAuthenticated(): boolean {
  return !!Cookies.get('accessToken');
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'super_admin':  return '/super-admin';
    case 'clinic_admin': return '/clinic-admin';
    case 'doctor':       return '/doctor';
    case 'patient':      return '/patient';
    case 'pharmacy':     return '/pharmacy';
    default:             return '/login';
  }
}
