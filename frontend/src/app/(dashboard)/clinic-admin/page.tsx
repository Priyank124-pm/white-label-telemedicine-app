'use client';

import { useEffect, useState } from 'react';
import { clinicAdminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Package, Users, FileText, TrendingUp } from 'lucide-react';

interface DashboardData {
  counts: { doctors: number; pharmacies: number; patients: number; prescriptions: number; };
  appointments: Array<{ status: string; total: number }>;
}

const STAT_CARDS = [
  { key: 'doctors',       label: 'Doctors',       icon: Stethoscope, bg: '#eff6ff', color: '#2563eb' },
  { key: 'pharmacies',    label: 'Pharmacies',     icon: Package,     bg: '#fff7ed', color: '#ea580c' },
  { key: 'patients',      label: 'Patients',       icon: Users,       bg: '#f0fdf4', color: '#16a34a' },
  { key: 'prescriptions', label: 'Prescriptions',  icon: FileText,    bg: '#fdf4ff', color: '#9333ea' },
];

export default function ClinicAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    clinicAdminApi.getDashboard().then((res) => setData(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, bg, color }) => (
          <Card key={key} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-3xl font-bold mt-1" style={{ color }}>
                    {data ? (data.counts as Record<string, number>)[key] : '—'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment breakdown */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-sky-600" />
            <h3 className="font-semibold text-sm">Appointment Status Breakdown</h3>
          </div>
          {data?.appointments.length ? (
            <div className="flex flex-wrap gap-3">
              {data.appointments.map((a) => (
                <div key={a.status} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <span className="text-xs capitalize font-medium text-slate-600">{a.status}</span>
                  <span className="text-sm font-bold text-slate-800">{a.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No appointments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
