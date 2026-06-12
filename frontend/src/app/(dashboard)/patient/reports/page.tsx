'use client';

import { useEffect, useState, useCallback } from 'react';
import { reportApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function PatientReportsPage() {
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page, limit: 10 });
      setReports(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'title', header: 'Report Title', render: (_: unknown, r: Record<string, unknown>) => (
      <div><p className="font-medium text-sm">{r.title as string}</p><p className="text-xs text-muted-foreground">{r.description as string}</p></div>
    )},
    { key: 'doctor_name',  header: 'Doctor',   render: (v: unknown) => `Dr. ${v}` },
    { key: 'report_type',  header: 'Type',     render: (v: unknown) => <Badge variant="outline" className="capitalize">{v as string}</Badge> },
    { key: 'report_date',  header: 'Date',     render: (v: unknown) => formatDate(v as string) },
    { key: 'file_name',    header: 'File',     render: (v: unknown) => <span className="text-xs font-mono text-muted-foreground">{v as string}</span> },
    { key: 'file_url',     header: '',         render: (v: unknown) => (
      <a href={v as string} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline"><Download size={14} className="mr-1" />View</Button>
      </a>
    )},
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={reports as never} isLoading={loading} emptyMessage="No reports found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
