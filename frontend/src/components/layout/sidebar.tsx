'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Users, Calendar, FileText, Pill, Building2,
  BarChart3, Stethoscope, ClipboardList, FlaskConical, UserRound,
  Clock, Send, Package, Receipt, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
}

const navByRole: Record<string, NavItem[]> = {
  super_admin: [
    { href: '/super-admin',            label: 'Dashboard',  icon: <LayoutDashboard size={20} /> },
    { href: '/super-admin/clinics',    label: 'Clinics',    icon: <Building2 size={20} /> },
    { href: '/super-admin/doctors',    label: 'Doctors',    icon: <Stethoscope size={20} /> },
    { href: '/super-admin/patients',   label: 'Patients',   icon: <Users size={20} /> },
    { href: '/super-admin/pharmacies', label: 'Pharmacies', icon: <Package size={20} /> },
    { href: '/super-admin/medicines',  label: 'Medicines',  icon: <Pill size={20} /> },
    { href: '/super-admin/analytics',  label: 'Analytics',  icon: <BarChart3 size={20} /> },
  ],
  doctor: [
    { href: '/doctor',              label: 'Dashboard',     icon: <LayoutDashboard size={20} /> },
    { href: '/doctor/patients',     label: 'Patients',      icon: <Users size={20} /> },
    { href: '/doctor/appointments', label: 'Appointments',  icon: <Calendar size={20} /> },
    { href: '/doctor/prescriptions',label: 'Prescriptions', icon: <ClipboardList size={20} /> },
    { href: '/doctor/reports',      label: 'Reports',       icon: <FlaskConical size={20} /> },
    { href: '/doctor/referrals',    label: 'Referrals',     icon: <Send size={20} /> },
    { href: '/doctor/availability', label: 'Availability',  icon: <Clock size={20} /> },
  ],
  patient: [
    { href: '/patient',              label: 'Dashboard',    icon: <LayoutDashboard size={20} /> },
    { href: '/patient/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { href: '/patient/prescriptions',label: 'Prescriptions',icon: <FileText size={20} /> },
    { href: '/patient/reports',      label: 'Reports',      icon: <FlaskConical size={20} /> },
  ],
  pharmacy: [
    { href: '/pharmacy',              label: 'Dashboard',    icon: <LayoutDashboard size={20} /> },
    { href: '/pharmacy/prescriptions',label: 'Prescriptions',icon: <FileText size={20} /> },
    { href: '/pharmacy/dispensing',   label: 'Dispensing',   icon: <Package size={20} /> },
    { href: '/pharmacy/invoices',     label: 'Invoices',     icon: <Receipt size={20} /> },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user }  = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role  = user?.role || 'patient';
  const items = navByRole[role] || [];

  return (
    <aside className={cn(
      'relative flex flex-col bg-slate-900 text-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-700', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Stethoscope size={18} />
        </div>
        {!collapsed && <span className="font-bold text-lg">Doctor SaaS</span>}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors mb-1',
                collapsed && 'justify-center px-2',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-slate-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
