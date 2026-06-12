'use client';

import { useEffect, useState, useCallback } from 'react';
import { prescriptionApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function PatientPrescriptionsPage() {
  const [rxList,  setRxList]  = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prescriptionApi.getAll({ page, limit: 10 });
      setRxList(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'prescription_no', header: 'Rx Number', render: (v: unknown) => <span className="font-mono font-medium text-sm">{v as string}</span> },
    { key: 'doctor_name',     header: 'Doctor', render: (v: unknown) => `Dr. ${v}` },
    { key: 'diagnosis',       header: 'Diagnosis', render: (v: unknown) => <span className="text-xs">{v as string}</span> },
    { key: 'created_at',      header: 'Date', render: (v: unknown) => formatDate(v as string) },
    { key: 'follow_up_date',  header: 'Follow-up', render: (v: unknown) => v ? formatDate(v as string) : '—' },
    { key: 'status',          header: 'Status', render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'pdf_url',         header: 'Download', render: (v: unknown) => v ? (
      <a href={v as string} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline" className="text-blue-600"><Download size={14} className="mr-1" />PDF</Button>
      </a>
    ) : <span className="text-xs text-muted-foreground">Generating…</span> },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={rxList as never} isLoading={loading} emptyMessage="No prescriptions found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
