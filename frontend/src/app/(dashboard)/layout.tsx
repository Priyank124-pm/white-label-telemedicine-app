'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { isAuthenticated } from '@/lib/auth';

const PAGE_TITLES: Record<string, string> = {
  '/clinic-admin':                'Clinic Dashboard',
  '/clinic-admin/doctors':        'Manage Doctors',
  '/clinic-admin/pharmacies':     'Manage Pharmacies',
  '/clinic-admin/patients':       'Clinic Patients',
  '/super-admin':                 'Dashboard',
  '/super-admin/clinics':     'Manage Clinics',
  '/super-admin/doctors':     'Manage Doctors',
  '/super-admin/patients':    'Manage Patients',
  '/super-admin/pharmacies':  'Manage Pharmacies',
  '/super-admin/medicines':   'Medicine Master',
  '/super-admin/analytics':   'Platform Analytics',
  '/doctor':                  'Doctor Dashboard',
  '/doctor/patients':         'My Patients',
  '/doctor/appointments':     'Appointments',
  '/doctor/prescriptions':    'Prescriptions',
  '/doctor/reports':          'Medical Reports',
  '/doctor/referrals':        'Referrals',
  '/doctor/availability':     'Set Availability',
  '/doctor/my-site':          'My Website',
  '/patient':                 'Patient Dashboard',
  '/patient/appointments':    'My Appointments',
  '/patient/prescriptions':   'My Prescriptions',
  '/patient/reports':         'My Reports',
  '/pharmacy':                'Pharmacy Dashboard',
  '/pharmacy/prescriptions':  'Active Prescriptions',
  '/pharmacy/dispensing':     'Dispense Medications',
  '/pharmacy/invoices':       'Invoices',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { initAuth } = useAuth();

  useEffect(() => {
    initAuth();
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, []);

  const title = PAGE_TITLES[pathname] || 'Doctor SaaS';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6 space-y-0">
          {children}
        </main>
      </div>
    </div>
  );
}
