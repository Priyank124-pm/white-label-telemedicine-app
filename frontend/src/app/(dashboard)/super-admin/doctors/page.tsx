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
import { Plus, Stethoscope, Eye, X } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewDoc,  setViewDoc]  = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', tenantId: '', specialization: '', qualification: '', licenseNumber: '', experienceYears: '0', consultationFee: '0' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDoctors({ page, limit: 10, search });
      setDoctors(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    try {
      await adminApi.createDoctor(form);
      toast({ title: 'Doctor created' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  async function handleToggle(id: string) {
    await adminApi.toggleUser(id);
    toast({ title: 'Status updated' });
    load();
  }

  const columns = [
    { key: 'first_name', header: 'Doctor', render: (_: unknown, r: Record<string, unknown>) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><Stethoscope size={14} className="text-indigo-600" /></div>
        <div><p className="font-medium">Dr. {r.first_name as string} {r.last_name as string}</p><p className="text-xs text-muted-foreground">{r.email as string}</p></div>
      </div>
    )},
    { key: 'specialization', header: 'Specialization' },
    { key: 'clinic_name',    header: 'Clinic' },
    { key: 'experience_years', header: 'Exp (yrs)' },
    { key: 'consultation_fee', header: 'Fee', render: (v: unknown) => `$${v}` },
    { key: 'is_active', header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: '', render: (v: unknown, r: Record<string, unknown>) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => setViewDoc(r)}><Eye size={14} className="mr-1" />View</Button>
        <Button size="sm" variant="ghost" className={r.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} onClick={() => handleToggle(v as string)}>{r.is_active ? 'Deactivate' : 'Activate'}</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search doctors..." className="w-72" />
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" />Add Doctor</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Doctor</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[['email','Email'],['firstName','First Name'],['lastName','Last Name'],['phone','Phone'],['tenantId','Clinic ID'],['specialization','Specialization'],['qualification','Qualification'],['licenseNumber','License No'],['experienceYears','Experience (yrs)'],['consultationFee','Consultation Fee']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={l} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Default password: Doctor@123</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate}>Save Doctor</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={doctors as never} isLoading={loading} emptyMessage="No doctors found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>

      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Stethoscope size={18} className="text-indigo-600" /></div>
                <div><p className="font-bold">Dr. {viewDoc.first_name as string} {viewDoc.last_name as string}</p><p className="text-xs text-muted-foreground">{viewDoc.specialization as string}</p></div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewDoc(null)}><X size={16} /></Button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[['Email', 'email'],['Phone','phone'],['Clinic','clinic_name'],['License','license_number'],['Qualification','qualification'],['Experience','experience_years'],['Fee','consultation_fee']].map(([label, key]) => (
                viewDoc[key] ? <div key={key} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{key === 'consultation_fee' ? `$${viewDoc[key]}` : viewDoc[key] as string}</span></div> : null
              ))}
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={viewDoc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{viewDoc.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
