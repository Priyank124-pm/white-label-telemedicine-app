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
import { Plus, Package, Eye, X } from 'lucide-react';

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Record<string, unknown>[]>([]);
  const [meta,       setMeta]       = useState({ total: 0, totalPages: 1 });
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [viewPh,     setViewPh]     = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', tenantId: '', pharmacyName: '', licenseNumber: '', address: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPharmacies({ page, limit: 10, search });
      setPharmacies(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    try {
      await adminApi.createPharmacy(form);
      toast({ title: 'Pharmacy created' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'pharmacy_name', header: 'Pharmacy', render: (_: unknown, r: Record<string, unknown>) => (
      <div className="flex items-center gap-2"><Package size={16} className="text-purple-500" /><span className="font-medium">{r.pharmacy_name as string}</span></div>
    )},
    { key: 'first_name', header: 'Manager', render: (_: unknown, r: Record<string, unknown>) => `${r.first_name} ${r.last_name}` },
    { key: 'email',          header: 'Email' },
    { key: 'phone',          header: 'Phone' },
    { key: 'license_number', header: 'License' },
    { key: 'is_active', header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: '', render: (_: unknown, r: Record<string, unknown>) => (
      <Button size="sm" variant="outline" onClick={() => setViewPh(r)}><Eye size={14} className="mr-1" />View</Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search pharmacies..." className="w-72" />
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" />Add Pharmacy</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Pharmacy</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[['email','Email'],['firstName','First Name'],['lastName','Last Name'],['phone','Phone'],['pharmacyName','Pharmacy Name'],['licenseNumber','License Number'],['address','Address']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input value={(form as Record<string,string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Default password: Pharma@123</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate}>Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={pharmacies as never} isLoading={loading} emptyMessage="No pharmacies found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>

      {viewPh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Package size={18} className="text-purple-600" /></div>
                <div><p className="font-bold">{viewPh.pharmacy_name as string}</p><p className="text-xs text-muted-foreground">{viewPh.email as string}</p></div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewPh(null)}><X size={16} /></Button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[['Manager', null],['Phone','phone'],['License','license_number'],['Address','address']].map(([label, key]) => {
                if (!key) return <div key="manager" className="flex justify-between"><span className="text-muted-foreground">Manager</span><span className="font-medium">{viewPh.first_name as string} {viewPh.last_name as string}</span></div>;
                return viewPh[key] ? <div key={key} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{viewPh[key] as string}</span></div> : null;
              })}
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={viewPh.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{viewPh.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
