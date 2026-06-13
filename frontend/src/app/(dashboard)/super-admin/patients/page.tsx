'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Eye, X } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [viewPat,  setViewPat]  = useState<Record<string, unknown> | null>(null);

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
    { key: 'phone',       header: 'Phone',  render: (v: unknown) => v as string || '—' },
    { key: 'clinic_name', header: 'Clinic', render: (v: unknown) => v as string || '—' },
    { key: 'is_active',   header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: '', render: (v: unknown, r: Record<string, unknown>) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => setViewPat(r)}><Eye size={14} className="mr-1" />View</Button>
        <Button size="sm" variant="ghost" className={r.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} onClick={() => handleToggle(v as string)}>{r.is_active ? 'Deactivate' : 'Activate'}</Button>
      </div>
    )},
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

      {viewPat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                  {(viewPat.first_name as string)?.charAt(0)}{(viewPat.last_name as string)?.charAt(0)}
                </div>
                <div><p className="font-bold">{viewPat.first_name as string} {viewPat.last_name as string}</p><p className="text-xs text-muted-foreground">{viewPat.email as string}</p></div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewPat(null)}><X size={16} /></Button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[['Phone','phone'],['Gender','gender'],['Clinic','clinic_name'],['Address','address']].map(([label, key]) => (
                viewPat[key] ? <div key={key} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium capitalize">{viewPat[key] as string}</span></div> : null
              ))}
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={viewPat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{viewPat.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
