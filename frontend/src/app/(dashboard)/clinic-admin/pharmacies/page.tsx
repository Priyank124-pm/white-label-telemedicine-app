'use client';

import { useEffect, useState, useCallback } from 'react';
import { clinicAdminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

const emptyForm = { email: '', password: '', firstName: '', lastName: '', phone: '', pharmacyName: '', licenseNumber: '', address: '' };

interface CreatedPharmacy { email: string; pharmacyName: string; }

export default function ClinicPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Record<string, unknown>[]>([]);
  const [meta,       setMeta]       = useState({ total: 0, totalPages: 1 });
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [created,    setCreated]    = useState<CreatedPharmacy | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clinicAdminApi.getPharmacies({ page, limit: 10 });
      setPharmacies(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.email || !form.pharmacyName || !form.firstName || !form.lastName) {
      toast({ title: 'Email, pharmacy name, and contact name are required', variant: 'destructive' }); return;
    }
    try {
      const res = await clinicAdminApi.createPharmacy(form);
      setCreated(res.data.data as CreatedPharmacy);
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this pharmacy?')) return;
    await clinicAdminApi.deletePharmacy(id);
    toast({ title: 'Pharmacy deactivated' });
    load();
  }

  const columns = [
    { key: 'pharmacy_name', header: 'Pharmacy', render: (_: unknown, r: Record<string, unknown>) => (
      <div>
        <p className="font-semibold text-sm">{r.pharmacy_name as string}</p>
        <p className="text-xs text-muted-foreground">{r.first_name as string} {r.last_name as string}</p>
      </div>
    )},
    { key: 'email',          header: 'Email' },
    { key: 'phone',          header: 'Phone',   render: (v: unknown) => v as string || '—' },
    { key: 'license_number', header: 'License', render: (v: unknown) => v as string || '—' },
    { key: 'address',        header: 'Address', render: (v: unknown) => <span className="text-xs text-muted-foreground">{v as string || '—'}</span> },
    { key: 'is_active',      header: 'Status',  render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: '', render: (id: unknown) => (
      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 h-8 w-8 p-0" onClick={() => handleDelete(id as string)}><Trash2 size={14} /></Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(!showForm); setCreated(null); }}>
          <Plus size={16} className="mr-2" />Add Pharmacy
        </Button>
      </div>

      {created && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">Pharmacy account created!</p>
              <p className="text-sm text-green-700 mt-1">Share these login credentials with <strong>{created.pharmacyName}</strong>:</p>
              <div className="mt-2 bg-white rounded-lg border border-green-200 px-4 py-2 text-sm font-mono space-y-1">
                <p>Email: <strong>{created.email}</strong></p>
                <p>Password: <strong>{form.password || 'Pharma@123'}</strong></p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="ml-auto text-green-700" onClick={() => setCreated(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add New Pharmacy</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['pharmacyName',  'Pharmacy Name *'],
                ['email',         'Login Email *'],
                ['password',      'Password (default: Pharma@123)'],
                ['firstName',     'Contact First Name *'],
                ['lastName',      'Contact Last Name *'],
                ['phone',         'Phone'],
                ['licenseNumber', 'License Number'],
                ['address',       'Address'],
              ].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label className="text-xs">{l}</Label>
                  <Input
                    value={(form as Record<string, string>)[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    type={k === 'password' ? 'password' : 'text'}
                    placeholder={l}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate}>Create Pharmacy</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={pharmacies as never} isLoading={loading} emptyMessage="No pharmacies added yet. Click 'Add Pharmacy' to get started." />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
