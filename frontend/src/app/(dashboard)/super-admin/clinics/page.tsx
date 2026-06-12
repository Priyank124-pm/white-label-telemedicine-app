'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Building2, Edit, ToggleLeft } from 'lucide-react';
import { Tenant } from '@/types';

export default function ClinicsPage() {
  const [clinics,  setClinics]  = useState<Tenant[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', city: '', state: '', phone: '', email: '', address: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTenants({ page, limit: 10, search });
      setClinics(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    try {
      await adminApi.createTenant(form);
      toast({ title: 'Clinic created' });
      setShowForm(false);
      setForm({ name: '', slug: '', city: '', state: '', phone: '', email: '', address: '' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'name',     header: 'Clinic Name', render: (_: unknown, row: Record<string, unknown>) => <div className="flex items-center gap-2"><Building2 size={16} className="text-blue-500" /><span className="font-medium">{row.name as string}</span></div> },
    { key: 'slug',     header: 'Slug' },
    { key: 'city',     header: 'City' },
    { key: 'phone',    header: 'Phone' },
    { key: 'email',    header: 'Email' },
    { key: 'is_active',header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search clinics..." className="w-72" />
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" />Add Clinic</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Clinic</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[['name','Clinic Name'],['slug','Slug (URL)'],['city','City'],['state','State'],['phone','Phone'],['email','Email'],['address','Address']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input value={(form as Record<string,string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={l} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate}>Save Clinic</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={clinics as never} isLoading={loading} emptyMessage="No clinics found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
