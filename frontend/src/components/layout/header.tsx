'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import Cookies from 'js-cookie';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      const refreshToken = Cookies.get('refreshToken') || '';
      await authApi.logout(refreshToken);
    } catch { /* silent */ }
    logout();
    router.push('/login');
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
        </Button>

        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  );
}
