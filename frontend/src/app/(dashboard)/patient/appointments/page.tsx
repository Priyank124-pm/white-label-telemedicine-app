'use client';

import { useEffect, useState, useCallback } from 'react';
import { appointmentApi, doctorApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import { CalendarPlus, Stethoscope, MapPin, Clock, DollarSign, Search } from 'lucide-react';

interface Doctor {
  profile_id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  clinic_name: string;
  city: string;
  is_available: boolean;
}

export default function PatientAppointmentsPage() {
  const [appts,       setAppts]       = useState<Record<string, unknown>[]>([]);
  const [meta,        setMeta]        = useState({ total: 0, totalPages: 1 });
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [doctors,     setDoctors]     = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [docSearch,   setDocSearch]   = useState('');
  const [docSpecFilter, setDocSpecFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [slots,       setSlots]       = useState<string[]>([]);
  const [form,        setForm]        = useState({ doctorId: '', date: '', startTime: '', reason: '', type: 'in_person' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getAll({ page, limit: 10 });
      setAppts(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    doctorApi.list({ limit: 100 }).then((res) => {
      setDoctors(res.data.data);
      setSpecializations(res.data.specializations || []);
    }).catch(() => {});
  }, []);

  function selectDoctor(doc: Doctor) {
    setSelectedDoc(doc);
    setForm({ ...form, doctorId: doc.profile_id, startTime: '' });
    setSlots([]);
  }

  async function loadSlots() {
    if (!form.doctorId || !form.date) return;
    const res = await appointmentApi.getSlots({ doctorId: form.doctorId, date: form.date });
    setSlots(res.data.data);
  }

  async function handleBook() {
    try {
      await appointmentApi.book({ doctorId: form.doctorId, appointmentDate: form.date, startTime: form.startTime, type: form.type, reason: form.reason });
      toast({ title: 'Appointment booked' });
      setShowForm(false);
      setSelectedDoc(null);
      setSlots([]);
      setForm({ doctorId: '', date: '', startTime: '', reason: '', type: 'in_person' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  async function cancel(id: string) {
    await appointmentApi.updateStatus(id, { status: 'cancelled' });
    toast({ title: 'Appointment cancelled' });
    load();
  }

  const filteredDoctors = doctors.filter((d) => {
    const q = docSearch.toLowerCase();
    const matchSearch = !q || `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.clinic_name?.toLowerCase().includes(q);
    const matchSpec = !docSpecFilter || d.specialization === docSpecFilter;
    return matchSearch && matchSpec;
  });

  const columns = [
    { key: 'doctor_name', header: 'Doctor', render: (_: unknown, r: Record<string, unknown>) => (
      <div><p className="font-medium text-sm">Dr. {r.doctor_name as string}</p><p className="text-xs text-muted-foreground">{r.specialization as string}</p></div>
    )},
    { key: 'appointment_date', header: 'Date',   render: (v: unknown) => formatDate(v as string) },
    { key: 'start_time',       header: 'Time',   render: (v: unknown) => formatTime(v as string) },
    { key: 'type',             header: 'Type',   render: (v: unknown) => <Badge variant="outline">{(v as string).replace('_',' ')}</Badge> },
    { key: 'status',           header: 'Status', render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'id', header: '', render: (id: unknown, r: Record<string, unknown>) =>
      (r.status === 'pending' || r.status === 'confirmed') ? (
        <Button size="sm" variant="destructive" onClick={() => cancel(id as string)}>Cancel</Button>
      ) : null
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(!showForm); setSelectedDoc(null); setSlots([]); setForm({ doctorId: '', date: '', startTime: '', reason: '', type: 'in_person' }); }}>
          <CalendarPlus size={16} className="mr-2" />Book Appointment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Book New Appointment</CardTitle></CardHeader>
          <CardContent className="space-y-6">

            {/* Step 1 – Doctor selector */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">1. Choose a Doctor</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Search by name, specialization or clinic…" value={docSearch} onChange={(e) => setDocSearch(e.target.value)} />
                </div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[180px]"
                  value={docSpecFilter}
                  onChange={(e) => setDocSpecFilter(e.target.value)}
                >
                  <option value="">All Specializations</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {filteredDoctors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No available doctors found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredDoctors.map((doc) => (
                    <button
                      key={doc.profile_id}
                      type="button"
                      onClick={() => selectDoctor(doc)}
                      className={`text-left p-4 rounded-lg border-2 transition-all hover:border-primary hover:shadow-sm ${
                        selectedDoc?.profile_id === doc.profile_id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Stethoscope size={16} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm leading-tight">Dr. {doc.first_name} {doc.last_name}</p>
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">{doc.specialization}</p>
                          {doc.qualification && <p className="text-xs text-muted-foreground mt-0.5">{doc.qualification}</p>}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                            {doc.clinic_name && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin size={10} />{doc.clinic_name}{doc.city ? `, ${doc.city}` : ''}
                              </span>
                            )}
                            {doc.experience_years > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock size={10} />{doc.experience_years} yrs exp
                              </span>
                            )}
                            {doc.consultation_fee > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <DollarSign size={10} />${doc.consultation_fee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedDoc && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Selected: Dr. {selectedDoc.first_name} {selectedDoc.last_name} — {selectedDoc.specialization}
                </p>
              )}
            </div>

            {/* Step 2 – Date & slots */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">2. Pick a Date & Time</Label>
              <div className="flex gap-2 items-end">
                <div className="space-y-1 flex-1">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value, startTime: '' }); setSlots([]); }} />
                </div>
                <Button variant="outline" onClick={loadSlots} disabled={!form.doctorId || !form.date}>Check Slots</Button>
              </div>
              {slots.length > 0 && (
                <div className="space-y-1">
                  <Label>Available Time Slots</Label>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <Button key={slot} size="sm" variant={form.startTime === slot ? 'default' : 'outline'} onClick={() => setForm({ ...form, startTime: slot })}>
                        {formatTime(slot)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {form.date && slots.length === 0 && (
                <p className="text-xs text-muted-foreground">Click "Check Slots" to see availability</p>
              )}
            </div>

            {/* Step 3 – Details */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">3. Appointment Details</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="in_person">In Person</option>
                    <option value="follow_up">Follow Up</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Reason for Visit</Label>
                  <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief description" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleBook} disabled={!form.doctorId || !form.startTime}>Book Appointment</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setSelectedDoc(null); setSlots([]); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={appts as never} isLoading={loading} emptyMessage="No appointments found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
