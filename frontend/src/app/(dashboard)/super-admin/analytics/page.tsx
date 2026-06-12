'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Stethoscope, Users, Package, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6'];

export default function AnalyticsPage() {
  const [data, setData]       = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading analytics…</div>;

  const counts = data?.counts as Record<string, number>;
  const appts  = data?.appointments as Array<{ status: string; total: number }>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Clinics"       value={counts?.clinics       || 0} icon={<Building2 size={22} />}   color="bg-blue-500" />
        <StatsCard title="Doctors"       value={counts?.doctors       || 0} icon={<Stethoscope size={22} />} color="bg-indigo-500" />
        <StatsCard title="Patients"      value={counts?.patients      || 0} icon={<Users size={22} />}       color="bg-green-500" />
        <StatsCard title="Pharmacies"    value={counts?.pharmacies    || 0} icon={<Package size={22} />}     color="bg-purple-500" />
        <StatsCard title="Prescriptions" value={counts?.prescriptions || 0} icon={<FileText size={22} />}    color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Appointments by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={appts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" radius={[6,6,0,0]}>
                  {(appts || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Appointment Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={appts || []} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                  {(appts || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
