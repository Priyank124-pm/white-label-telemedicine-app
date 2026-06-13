'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPatients({ page, limit: 10, search });
      setPatients(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(id: string) {
    await adminApi.toggleUser(id);
    load();
  }

  const columns = [
    { key: 'first_name', header: 'Patient', render: (_: unknown, r: Record<string, unknown>) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
          {(r.first_name as string)?.charAt(0)}{(r.last_name as string)?.charAt(0)}
        </div>
        <div><p className="font-medium">{r.first_name as string} {r.last_name as string}</p><p className="text-xs text-muted-foreground">{r.email as string}</p></div>
      </div>
    )},
    { key: 'phone',       header: 'Phone' },
    { key: 'clinic_name', header: 'Clinic' },
    { key: 'is_active',    header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: 'Actions', render: (v: unknown) => <Button variant="outline" size="sm" onClick={() => handleToggle(v as string)}>Toggle</Button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients..." className="w-72" />
        <p className="text-sm text-muted-foreground flex items-center gap-1"><Users size={16} /> {meta.total} total</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={patients as never} isLoading={loading} emptyMessage="No patients found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
