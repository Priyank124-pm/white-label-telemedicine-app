'use client';

import { useEffect, useState, useCallback } from 'react';
import { prescriptionApi, medicineApi, appointmentApi, doctorApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Plus, Trash2, Download } from 'lucide-react';

interface MedItem { medicineId: string; medicineName: string; dosage: string; frequency: string; duration: string; quantity: string; instructions: string; }
interface Patient { id: string; profile_id: string; first_name: string; last_name: string; email: string; }
interface Appointment { id: string; appointment_date: string; status: string; patient_id: string; }
const blank: MedItem = { medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '7 days', quantity: '1', instructions: '' };

export default function DoctorPrescriptionsPage() {
  const [rxList,  setRxList]  = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [medicines,    setMedicines]    = useState<Array<{ id: string; name: string }>>([]);
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [form, setForm] = useState({ patientId: '', diagnosis: '', notes: '', followUpDate: '', appointmentId: '' });
  const [items, setItems] = useState<MedItem[]>([{ ...blank }]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prescriptionApi.getAll({ page, limit: 10 });
      setRxList(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    medicineApi.getAll({ limit: 100 }).then((res) => setMedicines(res.data.data));
    doctorApi.getPatients({ limit: 100 }).then((res) => setPatients(res.data.data));
    appointmentApi.getAll({ limit: 200 }).then((res) => setAppointments(res.data.data));
  }, []);

  function handlePatientChange(profileId: string) {
    setForm({ ...form, patientId: profileId, appointmentId: '' });
  }

  function addItem() { setItems([...items, { ...blank }]); }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof MedItem, val: string) {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    if (field === 'medicineId') {
      const med = medicines.find((m) => m.id === val);
      if (med) updated[i].medicineName = med.name;
    }
    setItems(updated);
  }

  async function handleCreate() {
    try {
      if (!form.patientId) throw new Error('Patient ID required');
      await prescriptionApi.create({ ...form, items });
      toast({ title: 'Prescription created' });
      setShowForm(false);
      setItems([{ ...blank }]);
      setPatientSearch('');
      setForm({ patientId: '', diagnosis: '', notes: '', followUpDate: '', appointmentId: '' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'prescription_no', header: 'Rx #', render: (v: unknown) => <span className="font-mono text-sm font-medium">{v as string}</span> },
    { key: 'patient_name',    header: 'Patient' },
    { key: 'diagnosis',       header: 'Diagnosis', render: (v: unknown) => <span className="truncate max-w-32 block text-xs">{v as string}</span> },
    { key: 'created_at',      header: 'Date', render: (v: unknown) => formatDate(v as string) },
    { key: 'follow_up_date',  header: 'Follow-up', render: (v: unknown) => v ? formatDate(v as string) : '—' },
    { key: 'status',          header: 'Status', render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'pdf_url',         header: 'PDF', render: (v: unknown) => v ? <a href={v as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs"><Download size={12} />Download</a> : '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" />New Prescription</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Prescription</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Patient *</Label>
                <div className="space-y-1">
                  <Input
                    placeholder="Search patient by name or email…"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="mb-1"
                  />
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={form.patientId}
                    onChange={(e) => handlePatientChange(e.target.value)}
                  >
                    <option value="">— Select patient —</option>
                    {patients
                      .filter((p) => {
                        const q = patientSearch.toLowerCase();
                        return !q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
                      })
                      .map((p) => (
                        <option key={p.profile_id} value={p.profile_id}>
                          {p.first_name} {p.last_name} — {p.email}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Appointment (optional)</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={form.appointmentId}
                  onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                  disabled={!form.patientId}
                >
                  <option value="">— No appointment —</option>
                  {appointments
                    .filter((a) => a.patient_id === form.patientId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {new Date(a.appointment_date).toLocaleDateString()} · {a.status}
                      </option>
                    ))}
                </select>
                {!form.patientId && <p className="text-xs text-muted-foreground">Select a patient first</p>}
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Diagnosis *</Label>
                <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis" />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
              </div>
              <div className="space-y-1">
                <Label>Follow-up Date</Label>
                <Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Medications</Label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus size={14} className="mr-1" />Add</Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 mb-2 p-2 border rounded-lg">
                  <select className="col-span-2 h-9 rounded-md border border-input bg-background px-2 text-sm" value={item.medicineId} onChange={(e) => updateItem(i, 'medicineId', e.target.value)}>
                    <option value="">Select medicine</option>
                    {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <Input placeholder="Dosage e.g. 500mg" value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} />
                  <Input placeholder="Frequency e.g. 3x/day" value={item.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} />
                  <Input placeholder="Duration e.g. 7 days" value={item.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} />
                  <div className="flex gap-1">
                    <Input placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                    {items.length > 1 && <Button size="icon" variant="destructive" onClick={() => removeItem(i)}><Trash2 size={14} /></Button>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Prescription</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={rxList as never} isLoading={loading} emptyMessage="No prescriptions found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
