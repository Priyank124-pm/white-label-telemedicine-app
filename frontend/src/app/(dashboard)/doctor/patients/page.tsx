'use client';

import { useEffect, useState, useCallback } from 'react';
import { doctorApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';


export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', gender: 'male', address: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getPatients({ page, limit: 10, search });
      setPatients(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    try {
      await doctorApi.addPatient(form);
      toast({ title: 'Patient added' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'first_name', header: 'Patient', render: (_: unknown, r: Record<string, unknown>) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
          {(r.first_name as string)?.charAt(0)}{(r.last_name as string)?.charAt(0)}
        </div>
        <div><p className="font-medium text-sm">{r.first_name as string} {r.last_name as string}</p><p className="text-xs text-muted-foreground">{r.email as string}</p></div>
      </div>
    )},
    { key: 'phone',      header: 'Phone' },
    { key: 'last_visit', header: 'Last Visit', render: (v: unknown) => v ? new Date(v as string).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients..." className="w-72" />
        <Button onClick={() => setShowForm(!showForm)}><UserPlus size={16} className="mr-2" />Add Patient</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add New Patient</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[['email','Email'],['firstName','First Name'],['lastName','Last Name'],['phone','Phone'],['address','Address']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input type="text" value={(form as Record<string,string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-1">
                <Label>Gender</Label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Default password: Patient@123</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAdd}>Add Patient</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={patients as never} isLoading={loading} emptyMessage="No patients found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
