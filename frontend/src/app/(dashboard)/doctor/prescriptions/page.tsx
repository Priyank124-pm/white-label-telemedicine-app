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
import { Plus, Trash2, FlaskConical, UserPlus, X, Eye } from 'lucide-react';

interface MedItem    { medicineId: string; medicineName: string; dosage: string; frequency: string; duration: string; quantity: string; instructions: string; }
interface Patient    { id: string; profile_id: string; first_name: string; last_name: string; email: string; phone?: string; }
interface Appointment { id: string; appointment_date: string; status: string; patient_id: string; }
interface RxDetail   { prescription_no: string; patient_name: string; doctor_name: string; specialization: string; clinic_name: string; diagnosis: string; notes: string; follow_up_date: string; created_at: string; status: string; items: Array<{ medicine_name: string; dosage: string; frequency: string; duration: string; quantity: number; instructions: string; }>; }

const blank    : MedItem = { medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '7 days', quantity: '1', instructions: '' };
const emptyForm          = { patientId: '', diagnosis: '', notes: '', labNotes: '', followUpDate: '', appointmentId: '' };
const emptyAdd           = { email: '', firstName: '', lastName: '', phone: '', gender: 'male', address: '' };

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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddPatient,  setShowAddPatient]  = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [orderLab, setOrderLab] = useState(false);
  const [form,  setForm]  = useState(emptyForm);
  const [items, setItems] = useState<MedItem[]>([{ ...blank }]);

  // Detail view
  const [viewRx,  setViewRx]  = useState<RxDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

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
    appointmentApi.getAll({ limit: 200 }).then((res) => setAppointments(res.data.data));
  }, []);

  // Debounced patient search
  useEffect(() => {
    const t = setTimeout(() => {
      if (patientSearch.length >= 2) {
        doctorApi.getPatients({ limit: 50, search: patientSearch })
          .then((res) => setPatients(res.data.data)).catch(() => setPatients([]));
      } else { setPatients([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  async function openDetail(id: string) {
    setViewLoading(true);
    try {
      const res = await prescriptionApi.getById(id);
      setViewRx(res.data.data as RxDetail);
    } finally { setViewLoading(false); }
  }

  function selectPatient(p: Patient) {
    setSelectedPatient(p);
    setForm((f) => ({ ...f, patientId: p.profile_id, appointmentId: '' }));
    setPatientSearch('');
    setPatients([]);
    setShowAddPatient(false);
  }

  async function handleAddPatient() {
    try {
      await doctorApi.addPatient(addForm);
      toast({ title: 'Patient added' });
      // Reload and search to find new patient
      const res = await doctorApi.getPatients({ limit: 50, search: addForm.firstName });
      const newP = (res.data.data as Patient[]).find(p => p.email === addForm.email);
      if (newP) selectPatient(newP);
      setAddForm(emptyAdd);
      setShowAddPatient(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  function addItem()  { setItems([...items, { ...blank }]); }
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
    if (!form.patientId) { toast({ title: 'Select a patient', variant: 'destructive' }); return; }
    if (!form.diagnosis)  { toast({ title: 'Diagnosis is required', variant: 'destructive' }); return; }
    if (orderLab && !form.labNotes.trim()) { toast({ title: 'Lab test notes are required', variant: 'destructive' }); return; }
    try {
      const notes = [form.notes, orderLab ? `[LAB TEST REQUEST]\n${form.labNotes}` : ''].filter(Boolean).join('\n');
      await prescriptionApi.create({ ...form, notes, items });
      toast({ title: 'Prescription created' });
      setShowForm(false);
      setItems([{ ...blank }]);
      setSelectedPatient(null);
      setOrderLab(false);
      setForm(emptyForm);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; message?: string } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'prescription_no', header: 'Rx #',      render: (v: unknown) => <span className="font-mono text-sm font-semibold text-sky-700">{v as string}</span> },
    { key: 'patient_name',    header: 'Patient' },
    { key: 'diagnosis',       header: 'Diagnosis',  render: (v: unknown) => <span className="text-xs truncate max-w-40 block">{v as string}</span> },
    { key: 'created_at',      header: 'Date',       render: (v: unknown) => formatDate(v as string) },
    { key: 'follow_up_date',  header: 'Follow-up',  render: (v: unknown) => v ? formatDate(v as string) : '—' },
    { key: 'status',          header: 'Status',     render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'id',              header: '',           render: (id: unknown) => (
      <Button size="sm" variant="outline" onClick={() => openDetail(id as string)}>
        <Eye size={14} className="mr-1" />View
      </Button>
    )},
  ];

  const filteredAppointments = appointments.filter((a) => a.patient_id === form.patientId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(!showForm); setSelectedPatient(null); setForm(emptyForm); setItems([{ ...blank }]); setOrderLab(false); }}>
          <Plus size={16} className="mr-2" />New Prescription
        </Button>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Prescription</CardTitle></CardHeader>
          <CardContent className="space-y-5">

            {/* Patient search */}
            <div className="space-y-2">
              <Label>Patient *</Label>
              {selectedPatient ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-sky-200 bg-sky-50">
                  <div className="w-9 h-9 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm">
                    {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPatient.email}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedPatient(null); setForm(f => ({ ...f, patientId: '' })); }}><X size={14} /></Button>
                </div>
              ) : (
                <div className="relative">
                  <Input placeholder="Type name, email or phone…" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); setShowAddPatient(false); }} />
                  {patientSearch.length >= 2 && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                      {patients.length > 0 ? patients.map((p) => (
                        <button key={p.profile_id} type="button" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 text-left transition-colors" onClick={() => selectPatient(p)}>
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{p.first_name[0]}{p.last_name[0]}</div>
                          <div><p className="text-sm font-medium">{p.first_name} {p.last_name}</p><p className="text-xs text-muted-foreground">{p.email}</p></div>
                        </button>
                      )) : <div className="px-4 py-3 text-sm text-muted-foreground">No patient found for "{patientSearch}"</div>}
                      <button type="button" className="w-full flex items-center gap-2 px-4 py-2.5 border-t text-sky-600 hover:bg-sky-50 text-sm font-medium transition-colors" onClick={() => setShowAddPatient(true)}>
                        <UserPlus size={15} /> Add new patient
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Inline add patient */}
            {showAddPatient && !selectedPatient && (
              <Card className="border-dashed border-sky-300 bg-sky-50/40">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-sky-700">Add New Patient</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[['email','Email *'],['firstName','First Name *'],['lastName','Last Name *'],['phone','Phone'],['address','Address']].map(([k,l]) => (
                      <div key={k} className="space-y-1"><Label className="text-xs">{l}</Label><Input className="h-8 text-sm" value={(addForm as Record<string,string>)[k]} onChange={(e) => setAddForm({ ...addForm, [k]: e.target.value })} /></div>
                    ))}
                    <div className="space-y-1"><Label className="text-xs">Gender</Label>
                      <select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })} className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Default password: Patient@123</p>
                  <div className="flex gap-2 mt-3"><Button size="sm" onClick={handleAddPatient}>Add &amp; Select</Button><Button size="sm" variant="outline" onClick={() => setShowAddPatient(false)}>Cancel</Button></div>
                </CardContent>
              </Card>
            )}

            {/* Core fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Appointment (optional)</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} disabled={!form.patientId}>
                  <option value="">— No appointment —</option>
                  {filteredAppointments.map((a) => <option key={a.id} value={a.id}>{new Date(a.appointment_date).toLocaleDateString()} · {a.status}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Follow-up Date</Label>
                <Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Diagnosis *</Label>
                <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Acute bronchitis, Hypertension" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
              </div>
            </div>

            {/* Lab test order */}
            <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/40 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={orderLab} onChange={(e) => setOrderLab(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                <div className="flex items-center gap-2"><FlaskConical size={16} className="text-violet-600" /><span className="font-semibold text-sm text-violet-800">Order Lab / Blood Tests</span></div>
              </label>
              {orderLab && (
                <div className="mt-3 space-y-1">
                  <Label className="text-xs text-violet-700">Test instructions * <span className="font-normal text-muted-foreground">(tests, fasting, etc.)</span></Label>
                  <textarea className="w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="e.g. CBC, Lipid panel — fasting 8h. HbA1c." value={form.labNotes} onChange={(e) => setForm({ ...form, labNotes: e.target.value })} />
                </div>
              )}
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Medications</Label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus size={14} className="mr-1" />Add</Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-7 gap-2 mb-2 p-3 border rounded-xl bg-slate-50/50">
                  <select className="col-span-2 h-9 rounded-md border border-input bg-background px-2 text-sm" value={item.medicineId} onChange={(e) => updateItem(i, 'medicineId', e.target.value)}>
                    <option value="">Select medicine</option>
                    {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <Input placeholder="Dosage"    value={item.dosage}    onChange={(e) => updateItem(i, 'dosage',    e.target.value)} />
                  <Input placeholder="Frequency" value={item.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} />
                  <Input placeholder="Duration"  value={item.duration}  onChange={(e) => updateItem(i, 'duration',  e.target.value)} />
                  <Input placeholder="Qty"       value={item.quantity}  onChange={(e) => updateItem(i, 'quantity',  e.target.value)} />
                  <div className="flex items-center justify-center">
                    {items.length > 1 && <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50 h-9 w-9" onClick={() => removeItem(i)}><Trash2 size={14} /></Button>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleCreate}>Create Prescription</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Prescription list ── */}
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={rxList as never} isLoading={loading} emptyMessage="No prescriptions yet" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>

      {/* ── Prescription detail modal ── */}
      {(viewRx || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {viewLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading…</div>
            ) : viewRx && (
              <>
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b">
                  <div>
                    <p className="font-mono text-sky-700 font-bold text-lg">{viewRx.prescription_no}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{formatDate(viewRx.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(viewRx.status)}>{viewRx.status}</Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewRx(null)}><X size={16} /></Button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Doctor / Patient info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-sky-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Doctor</p>
                      <p className="font-semibold">Dr. {viewRx.doctor_name}</p>
                      <p className="text-muted-foreground text-xs">{viewRx.specialization}</p>
                      {viewRx.clinic_name && <p className="text-muted-foreground text-xs">{viewRx.clinic_name}</p>}
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Patient</p>
                      <p className="font-semibold">{viewRx.patient_name}</p>
                      {viewRx.follow_up_date && <p className="text-xs text-muted-foreground mt-1">Follow-up: {formatDate(viewRx.follow_up_date)}</p>}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Diagnosis</p>
                    <p className="text-sm font-medium">{viewRx.diagnosis}</p>
                  </div>

                  {/* Medications table */}
                  {viewRx.items?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Medications</p>
                      <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              {['Medicine','Dosage','Frequency','Duration','Qty'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {viewRx.items.map((it, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 font-medium">{it.medicine_name}</td>
                                <td className="px-3 py-2 text-slate-600">{it.dosage || '—'}</td>
                                <td className="px-3 py-2 text-slate-600">{it.frequency || '—'}</td>
                                <td className="px-3 py-2 text-slate-600">{it.duration || '—'}</td>
                                <td className="px-3 py-2 text-slate-600">{it.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {viewRx.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 rounded-xl p-3">{viewRx.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
