'use client';

import { useEffect, useState, useCallback } from 'react';
import { referralApi, doctorApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Send } from 'lucide-react';

interface Patient { id: string; profile_id: string; first_name: string; last_name: string; email: string; }
interface Doctor  { profile_id: string; first_name: string; last_name: string; specialization: string; clinic_name: string; }

const URGENCIES = ['routine', 'urgent', 'emergency'];

export default function DoctorReferralsPage() {
  const [referrals,  setReferrals]  = useState<Record<string, unknown>[]>([]);
  const [meta,       setMeta]       = useState({ total: 0, totalPages: 1 });
  const [page,       setPage]       = useState(1);
  const [direction,  setDirection]  = useState('both');
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [patients,   setPatients]   = useState<Patient[]>([]);
  const [doctors,    setDoctors]    = useState<Doctor[]>([]);
  const [myProfileId, setMyProfileId] = useState('');
  const [form, setForm] = useState({ patientId: '', referredDoctorId: '', reason: '', notes: '', urgency: 'routine' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await referralApi.getAll({ page, limit: 10, direction });
      setReferrals(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, direction]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    doctorApi.getPatients({ limit: 100 }).then((res) => setPatients(res.data.data));
    doctorApi.list({ limit: 100 }).then((res) => {
      setDoctors(res.data.data);
    });
    doctorApi.getProfile().then((res) => {
      setMyProfileId((res.data.data as { profile_id: string }).profile_id || '');
    }).catch(() => {});
  }, []);

  async function handleCreate() {
    try {
      if (!form.patientId)        { toast({ title: 'Select a patient', variant: 'destructive' }); return; }
      if (!form.referredDoctorId) { toast({ title: 'Select a doctor to refer to', variant: 'destructive' }); return; }
      if (!form.reason)           { toast({ title: 'Reason is required', variant: 'destructive' }); return; }
      await referralApi.create(form);
      toast({ title: 'Referral sent' });
      setShowForm(false);
      setForm({ patientId: '', referredDoctorId: '', reason: '', notes: '', urgency: 'routine' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  async function updateStatus(id: string, status: string) {
    await referralApi.updateStatus(id, { status });
    toast({ title: 'Referral updated' });
    load();
  }

  const columns = [
    { key: 'patient_name',          header: 'Patient' },
    { key: 'referring_doctor_name', header: 'From Doctor' },
    { key: 'referred_doctor_name',  header: 'To Doctor' },
    { key: 'from_spec', header: 'Reason', render: (_: unknown, r: Record<string, unknown>) =>
      <span className="text-xs text-muted-foreground">{r.reason as string}</span> },
    { key: 'urgency', header: 'Urgency', render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'status',  header: 'Status',  render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'created_at', header: 'Date', render: (v: unknown) => formatDate(v as string) },
    { key: 'id', header: '', render: (id: unknown, r: Record<string, unknown>) => r.status === 'pending' ? (
      <div className="flex gap-1">
        <Button size="sm" onClick={() => updateStatus(id as string, 'accepted')}>Accept</Button>
        <Button size="sm" variant="destructive" onClick={() => updateStatus(id as string, 'rejected')}>Reject</Button>
      </div>
    ) : null },
  ];

  const referrableDoctors = doctors.filter((d) => d.profile_id !== myProfileId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['both', 'sent', 'received'].map((d) => (
            <Button key={d} size="sm" variant={direction === d ? 'default' : 'outline'}
              onClick={() => { setDirection(d); setPage(1); }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Send size={16} className="mr-2" />Refer Patient</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Referral</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Patient *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                >
                  <option value="">— Select patient —</option>
                  {patients.map((p) => (
                    <option key={p.profile_id} value={p.profile_id}>
                      {p.first_name} {p.last_name} — {p.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Refer To Doctor *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.referredDoctorId}
                  onChange={(e) => setForm({ ...form, referredDoctorId: e.target.value })}
                >
                  <option value="">— Select doctor —</option>
                  {referrableDoctors.map((d) => (
                    <option key={d.profile_id} value={d.profile_id}>
                      Dr. {d.first_name} {d.last_name} — {d.specialization}
                      {d.clinic_name ? ` (${d.clinic_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Reason *</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for referral" />
              </div>
              <div className="space-y-1">
                <Label>Urgency</Label>
                <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate}>Send Referral</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={referrals as never} isLoading={loading} emptyMessage="No referrals found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
