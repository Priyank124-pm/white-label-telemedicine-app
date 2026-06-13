'use client';

import { useEffect, useState } from 'react';
import { pharmacyApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Package, Receipt, Clock, CheckCircle } from 'lucide-react';

export default function PharmacyDashboard() {
  const [data,    setData]    = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pharmacyApi.getDashboard()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;

  const stats    = data?.stats           as Record<string, number>;
  const recent   = data?.recentDispensing as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Dispensed"  value={stats?.totalDispensed  || 0} icon={<CheckCircle size={20} />} color="green"  iconBg="bg-emerald-500" />
        <StatsCard title="Today Dispensed"  value={stats?.todayDispensed  || 0} icon={<Package size={20} />}     color="blue"   iconBg="bg-sky-500" />
        <StatsCard title="Pending Invoices" value={stats?.pendingInvoices || 0} icon={<Receipt size={20} />}     color="orange" iconBg="bg-orange-500" />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock size={20} />Recent Dispensing</CardTitle></CardHeader>
        <CardContent>
          {!recent?.length ? (
            <p className="text-center py-8 text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recent.map((rec, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{rec.patient_name as string}</p>
                    <p className="text-xs font-mono text-muted-foreground">{rec.prescription_no as string}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(rec.dispensed_at as string)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
