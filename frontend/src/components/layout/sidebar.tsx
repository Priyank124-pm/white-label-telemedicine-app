'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Users, Calendar, FileText, Pill, Building2,
  BarChart3, Stethoscope, ClipboardList, FlaskConical,
  Clock, Send, Package, Receipt, ChevronLeft, ChevronRight, Globe,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
}

const navByRole: Record<string, NavItem[]> = {
  super_admin: [
    { href: '/super-admin',            label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
    { href: '/super-admin/clinics',    label: 'Clinics',    icon: <Building2 size={18} /> },
    { href: '/super-admin/doctors',    label: 'Doctors',    icon: <Stethoscope size={18} /> },
    { href: '/super-admin/patients',   label: 'Patients',   icon: <Users size={18} /> },
    { href: '/super-admin/pharmacies', label: 'Pharmacies', icon: <Package size={18} /> },
    { href: '/super-admin/medicines',  label: 'Medicines',  icon: <Pill size={18} /> },
    { href: '/super-admin/analytics',  label: 'Analytics',  icon: <BarChart3 size={18} /> },
  ],
  doctor: [
    { href: '/doctor',               label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
    { href: '/doctor/patients',      label: 'Patients',     icon: <Users size={18} /> },
    { href: '/doctor/appointments',  label: 'Appointments', icon: <Calendar size={18} /> },
    { href: '/doctor/prescriptions', label: 'Prescriptions',icon: <ClipboardList size={18} /> },
    { href: '/doctor/reports',       label: 'Reports',      icon: <FlaskConical size={18} /> },
    { href: '/doctor/referrals',     label: 'Referrals',    icon: <Send size={18} /> },
    { href: '/doctor/availability',  label: 'Availability', icon: <Clock size={18} /> },
    { href: '/doctor/my-site',       label: 'My Website',   icon: <Globe size={18} /> },
  ],
  patient: [
    { href: '/patient',               label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
    { href: '/patient/appointments',  label: 'Appointments', icon: <Calendar size={18} /> },
    { href: '/patient/prescriptions', label: 'Prescriptions',icon: <FileText size={18} /> },
    { href: '/patient/reports',       label: 'Reports',      icon: <FlaskConical size={18} /> },
  ],
  pharmacy: [
    { href: '/pharmacy',               label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
    { href: '/pharmacy/prescriptions', label: 'Prescriptions',icon: <FileText size={18} /> },
    { href: '/pharmacy/dispensing',    label: 'Dispensing',   icon: <Package size={18} /> },
    { href: '/pharmacy/invoices',      label: 'Invoices',     icon: <Receipt size={18} /> },
  ],
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  doctor:      'Doctor',
  patient:     'Patient',
  pharmacy:    'Pharmacy',
};

const roleColors: Record<string, string> = {
  super_admin: 'from-violet-500 to-purple-600',
  doctor:      'from-sky-500 to-cyan-600',
  patient:     'from-emerald-500 to-teal-600',
  pharmacy:    'from-orange-500 to-amber-600',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user }  = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role   = user?.role || 'patient';
  const items  = navByRole[role] || [];
  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`;

  return (
    <aside
      className={cn(
        'relative flex flex-col text-white transition-all duration-300 shadow-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#0c1a2e 100%)' }}
    >
      {/* Brand */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Stethoscope size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-base tracking-tight text-white">CareDesk</span>
            <p className="text-[10px] text-sky-300 leading-none mt-0.5">Medical Platform</p>
          </div>
        )}
      </div>

      {/* Role pill */}
      {!collapsed && (
        <div className="px-4 pt-3">
          <span className={cn(
            'inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r text-white tracking-wide uppercase',
            roleColors[role]
          )}>
            {roleLabels[role]}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center px-2',
                active
                  ? 'bg-sky-500/90 text-white shadow-md shadow-sky-900/30'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              )}
            >
              <span className={cn(
                'flex-shrink-0 transition-colors',
                active ? 'text-white' : 'text-slate-400 group-hover:text-white'
              )}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className={cn(
        'px-3 py-3 border-t border-white/10',
        collapsed ? 'flex justify-center' : ''
      )}>
        {collapsed ? (
          <div className={cn(
            'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow',
            roleColors[role]
          )}>
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <div className={cn(
              'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow',
              roleColors[role]
            )}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:bg-sky-500 hover:text-white hover:border-sky-400 transition-all z-10 shadow-md"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
