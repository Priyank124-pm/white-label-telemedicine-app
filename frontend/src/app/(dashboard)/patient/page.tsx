'use client';

import { useEffect, useState } from 'react';
import { patientApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import { Calendar, FileText, FlaskConical, Clock } from 'lucide-react';

export default function PatientDashboard() {
  const [data,    setData]    = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientApi.getDashboard()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;

  const stats    = data?.stats     as Record<string, number>;
  const upcoming = data?.upcomingAppointments as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Upcoming Appointments" value={stats?.upcomingCount     || 0} icon={<Calendar size={22} />}      color="bg-blue-500" />
        <StatsCard title="Prescriptions"         value={stats?.totalPrescriptions || 0} icon={<FileText size={22} />}     color="bg-green-500" />
        <StatsCard title="Reports"               value={stats?.totalReports       || 0} icon={<FlaskConical size={22} />} color="bg-purple-500" />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={20} />Upcoming Appointments</CardTitle></CardHeader>
        <CardContent>
          {!upcoming?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{appt.doctor_name as string}</p>
                      <p className="text-sm text-muted-foreground">{appt.specialization as string}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDate(appt.appointment_date as string)}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(appt.start_time as string)}</p>
                    <Badge className={`text-xs mt-1 ${getStatusColor(appt.status as string)}`}>{appt.status as string}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
