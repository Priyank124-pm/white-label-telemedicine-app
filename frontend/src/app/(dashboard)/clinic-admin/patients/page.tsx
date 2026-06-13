'use client';

import { useEffect, useState, useCallback } from 'react';
import { clinicAdminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function ClinicPatientsPage() {
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clinicAdminApi.getPatients({ page, limit: 10, search });
      setPatients(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'first_name', header: 'Patient', render: (_: unknown, r: Record<string, unknown>) => (
      <div>
        <p className="font-semibold text-sm">{r.first_name as string} {r.last_name as string}</p>
        <p className="text-xs text-muted-foreground">{r.email as string}</p>
      </div>
    )},
    { key: 'phone',     header: 'Phone',   render: (v: unknown) => v as string || '—' },
    { key: 'gender',    header: 'Gender',  render: (v: unknown) => v ? <span className="capitalize text-sm">{v as string}</span> : '—' },
    { key: 'address',   header: 'Address', render: (v: unknown) => <span className="text-xs text-muted-foreground">{v as string || '—'}</span> },
    { key: 'is_active', header: 'Status',  render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients..." className="w-72" />
        <p className="text-sm text-muted-foreground">{meta.total} total patients</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={patients as never} isLoading={loading} emptyMessage="No patients registered yet" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
