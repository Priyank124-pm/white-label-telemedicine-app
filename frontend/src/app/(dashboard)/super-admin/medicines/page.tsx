'use client';

import { useEffect, useState, useCallback } from 'react';
import { medicineApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Pill } from 'lucide-react';

const FORMS = ['tablet','capsule','syrup','injection','cream','drops','inhaler','patch','other'];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Record<string, unknown>[]>([]);
  const [meta,      setMeta]      = useState({ total: 0, totalPages: 1 });
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', category: '', form: 'tablet', strength: '', manufacturer: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicineApi.getAll({ page, limit: 15, search });
      setMedicines(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    try {
      await medicineApi.create(form);
      toast({ title: 'Medicine created' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    await medicineApi.delete(id);
    toast({ title: 'Medicine deactivated' });
    load();
  }

  const columns = [
    { key: 'name', header: 'Medicine', render: (_: unknown, r: Record<string, unknown>) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center"><Pill size={14} className="text-blue-500" /></div>
        <div><p className="font-medium text-sm">{r.name as string}</p><p className="text-xs text-muted-foreground">{r.generic_name as string}</p></div>
      </div>
    )},
    { key: 'category',     header: 'Category' },
    { key: 'form',         header: 'Form', render: (v: unknown) => <Badge variant="outline">{v as string}</Badge> },
    { key: 'strength',     header: 'Strength' },
    { key: 'manufacturer', header: 'Manufacturer' },
    { key: 'is_active',    header: 'Status', render: (v: unknown) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: '', render: (v: unknown) => <Button variant="destructive" size="sm" onClick={() => handleDelete(v as string)}>Deactivate</Button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search medicines..." className="w-72" />
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" />Add Medicine</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Medicine</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[['name','Name'],['genericName','Generic Name'],['category','Category'],['strength','Strength'],['manufacturer','Manufacturer'],['description','Description']].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input value={(form as Record<string,string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-1">
                <Label>Form</Label>
                <select value={form.form} onChange={(e) => setForm({ ...form, form: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate}>Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={medicines as never} isLoading={loading} emptyMessage="No medicines found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
