'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, ChevronRight } from 'lucide-react';
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

  const roleColors: Record<string, string> = {
    super_admin: 'bg-violet-100 text-violet-700',
    doctor:      'bg-sky-100 text-sky-700',
    patient:     'bg-emerald-100 text-emerald-700',
    pharmacy:    'bg-orange-100 text-orange-700',
  };

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    doctor:      'Doctor',
    patient:     'Patient',
    pharmacy:    'Pharmacy',
  };

  const role     = user?.role || 'patient';
  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      {/* Title breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">CareDesk</span>
        <ChevronRight size={14} className="text-slate-300" />
        <h1 className="text-slate-800 font-semibold">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleColors[role]}`}>
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {roleLabel[role] || role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Sign out"
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 ml-1"
        >
          <LogOut size={17} />
        </Button>
      </div>
    </header>
  );
}
