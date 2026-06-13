'use client';

import { useEffect, useState, useCallback } from 'react';
import { appointmentApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function DoctorAppointmentsPage() {
  const [appts,   setAppts]   = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (status) params.status = status;
      const res = await appointmentApi.getAll(params);
      setAppts(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      await appointmentApi.updateStatus(id, { status: newStatus });
      toast({ title: 'Appointment updated' });
      load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  const columns = [
    { key: 'patient_name', header: 'Patient', render: (_: unknown, r: Record<string, unknown>) => (
      <div><p className="font-medium text-sm">{r.patient_name as string}</p><p className="text-xs text-muted-foreground">{r.patient_phone as string}</p></div>
    )},
    { key: 'appointment_date', header: 'Date', render: (v: unknown) => formatDate(v as string) },
    { key: 'start_time',       header: 'Time', render: (v: unknown) => formatTime(v as string) },
    { key: 'type',             header: 'Type', render: (v: unknown) => <Badge variant="outline">{(v as string).replace('_',' ')}</Badge> },
    { key: 'status',           header: 'Status', render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'id', header: 'Actions', render: (id: unknown, r: Record<string, unknown>) => (
      <div className="flex gap-1">
        {r.status === 'pending' && <Button size="sm" onClick={() => updateStatus(id as string, 'confirmed')}>Confirm</Button>}
        {(r.status === 'pending' || r.status === 'confirmed') && (
          <Button size="sm" variant="outline" onClick={() => updateStatus(id as string, 'completed')}>Complete</Button>
        )}
        {r.status !== 'cancelled' && r.status !== 'completed' && (
          <Button size="sm" variant="destructive" onClick={() => updateStatus(id as string, 'cancelled')}>Cancel</Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {STATUSES.map((s) => (
          <Button key={s} size="sm" variant={status === s ? 'default' : 'outline'} onClick={() => { setStatus(s); setPage(1); }}>
            {s || 'All'}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={appts as never} isLoading={loading} emptyMessage="No appointments found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
