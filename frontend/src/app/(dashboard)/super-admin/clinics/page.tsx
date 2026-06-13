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
import { Plus, Building2, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Tenant } from '@/types';

const emptyForm = { name: '', slug: '', city: '', state: '', phone: '', email: '', address: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' };

interface CreatedResult { clinic: Tenant; admin: { email: string; firstName: string; lastName: string } }

export default function ClinicsPage() {
  const [clinics,  setClinics]  = useState<Tenant[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(emptyForm);
  const [created,  setCreated]  = useState<CreatedResult | null>(null);

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
    if (!form.name || !form.slug) { toast({ title: 'Clinic name and slug are required', variant: 'destructive' }); return; }
    if (!form.adminEmail || !form.adminPassword || !form.adminFirstName || !form.adminLastName) {
      toast({ title: 'Admin credentials are required', variant: 'destructive' }); return;
    }
    try {
      const res = await adminApi.createTenant(form);
      setCreated(res.data.data as CreatedResult);
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  async function handleToggle(id: string) {
    try {
      await adminApi.toggleTenant(id);
      toast({ title: 'Clinic status updated' });
      load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  const columns = [
    { key: 'name',      header: 'Clinic Name', render: (_: unknown, row: Record<string, unknown>) => <div className="flex items-center gap-2"><Building2 size={16} className="text-blue-500" /><span className="font-medium">{row.name as string}</span></div> },
    { key: 'slug',      header: 'Slug' },
    { key: 'city',      header: 'City' },
    { key: 'phone',     header: 'Phone' },
    { key: 'email',     header: 'Email' },
    { key: 'is_active', header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: '', render: (id: unknown, row: Record<string, unknown>) => (
      <button onClick={() => handleToggle(id as string)} title={row.is_active ? 'Deactivate' : 'Activate'}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${row.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
        {row.is_active ? <><ToggleRight size={16} />Deactivate</> : <><ToggleLeft size={16} />Activate</>}
      </button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search clinics..." className="w-72" />
        <Button onClick={() => { setShowForm(!showForm); setCreated(null); }}><Plus size={16} className="mr-2" />Add Clinic</Button>
      </div>

      {/* Created success card */}
      {created && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5 flex items-start gap-3">
            <CheckCircle size={22} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 text-base">Clinic "{created.clinic?.name}" created!</p>
              <p className="text-sm text-green-700 mt-1">
                Share these admin credentials with <strong>{created.admin?.firstName} {created.admin?.lastName}</strong> to log in:
              </p>
              <div className="mt-3 bg-white rounded-xl border border-green-200 px-5 py-3 text-sm font-mono space-y-1 inline-block">
                <p>Email: <strong>{created.admin?.email}</strong></p>
                <p>Password: <strong>{form.adminPassword}</strong></p>
                <p className="text-muted-foreground font-sans text-xs mt-1">Role: Clinic Admin</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-green-700" onClick={() => setCreated(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Clinic</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Clinic info */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Clinic Details</p>
              <div className="grid grid-cols-2 gap-4">
                {[['name','Clinic Name *'],['slug','Slug (URL-friendly) *'],['city','City'],['state','Province / State'],['phone','Phone'],['email','Clinic Email'],['address','Address']].map(([k, l]) => (
                  <div key={k} className={`space-y-1 ${k === 'address' ? 'col-span-2' : ''}`}>
                    <Label className="text-xs">{l}</Label>
                    <Input value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={l} />
                  </div>
                ))}
              </div>
            </div>

            {/* Clinic admin */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Clinic Admin Account</p>
              <p className="text-xs text-muted-foreground mb-3">This person will log in as Clinic Admin to manage doctors and pharmacies.</p>
              <div className="grid grid-cols-2 gap-4">
                {[['adminFirstName','Admin First Name *'],['adminLastName','Admin Last Name *'],['adminEmail','Admin Email *'],['adminPassword','Admin Password *']].map(([k, l]) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs">{l}</Label>
                    <Input type={k === 'adminPassword' ? 'password' : 'text'} value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={l} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Clinic &amp; Admin</Button>
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
