'use client';

import { useEffect, useState } from 'react';
import { doctorApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import { Users, Calendar, Clock, FileText } from 'lucide-react';

export default function DoctorDashboard() {
  const [data,    setData]    = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorApi.getDashboard()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard…</div>;

  const stats = data?.stats as Record<string, number>;
  const todayAppts = data?.todayAppointments as Array<Record<string, unknown>>;
  const recentRx   = data?.recentPrescriptions as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="My Patients"          value={stats?.totalPatients       || 0} icon={<Users size={20} />}    color="blue"   iconBg="bg-sky-500" />
        <StatsCard title="Today's Appointments" value={stats?.todayAppointments   || 0} icon={<Calendar size={20} />} color="green"  iconBg="bg-emerald-500" />
        <StatsCard title="Pending Appointments" value={stats?.pendingAppointments || 0} icon={<Clock size={20} />}    color="orange" iconBg="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={20} />Today&apos;s Schedule</CardTitle></CardHeader>
          <CardContent>
            {todayAppts?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {todayAppts?.map((appt, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                        {(appt.patient_name as string)?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{appt.patient_name as string}</p>
                        <p className="text-xs text-muted-foreground">{appt.type as string}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatTime(appt.start_time as string)}</p>
                      <Badge className={`text-xs ${getStatusColor(appt.status as string)}`}>{appt.status as string}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={20} />Recent Prescriptions</CardTitle></CardHeader>
          <CardContent>
            {recentRx?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent prescriptions</p>
            ) : (
              <div className="space-y-3">
                {recentRx?.map((rx, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{rx.patient_name as string}</p>
                      <p className="text-xs text-muted-foreground">{rx.prescription_no as string}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatDate(rx.created_at as string)}</p>
                      <Badge className={`text-xs ${getStatusColor(rx.status as string)}`}>{rx.status as string}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
