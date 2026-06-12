'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Building2, Stethoscope, Users, Package, FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Analytics {
  counts: { clinics: number; doctors: number; patients: number; pharmacies: number; prescriptions: number };
  appointments: Array<{ status: string; total: number }>;
  recentAppointments: Array<Record<string, unknown>>;
}

export default function SuperAdminDashboard() {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Clinics"       value={data?.counts.clinics       || 0} icon={<Building2 size={22} />}   color="bg-blue-500" />
        <StatsCard title="Doctors"       value={data?.counts.doctors       || 0} icon={<Stethoscope size={22} />} color="bg-indigo-500" />
        <StatsCard title="Patients"      value={data?.counts.patients      || 0} icon={<Users size={22} />}       color="bg-green-500" />
        <StatsCard title="Pharmacies"    value={data?.counts.pharmacies    || 0} icon={<Package size={22} />}     color="bg-purple-500" />
        <StatsCard title="Prescriptions" value={data?.counts.prescriptions || 0} icon={<FileText size={22} />}    color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} /> Appointments by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.appointments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recentAppointments || []).map((appt, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{appt.patient_name as string}</p>
                    <p className="text-xs text-muted-foreground">Dr. {appt.doctor_name as string}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatDate(appt.appointment_date as string)}</p>
                    <Badge className={getStatusColor(appt.status as string)}>
                      {appt.status as string}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
