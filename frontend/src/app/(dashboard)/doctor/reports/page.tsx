'use client';

import { useEffect, useState, useCallback } from 'react';
import { reportApi, doctorApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Plus, X, Eye } from 'lucide-react';

interface Patient    { id: string; profile_id: string; first_name: string; last_name: string; email: string; }
interface ReportDetail { title: string; report_type: string; report_date: string; description: string; doctor_name: string; patient_name: string; created_at: string; }

const REPORT_TYPES = ['lab', 'imaging', 'pathology', 'other'];

export default function DoctorReportsPage() {
  const [reports,  setReports]  = useState<Record<string, unknown>[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [patients,        setPatients]        = useState<Patient[]>([]);
  const [patientSearch,   setPatientSearch]   = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [viewReport,    setViewReport]    = useState<ReportDetail | null>(null);
  const [viewLoading,   setViewLoading]   = useState(false);

  const [form, setForm] = useState({
    reportType: 'lab',
    title: '',
    description: '',
    reportDate: new Date().toISOString().split('T')[0],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page, limit: 10 });
      setReports(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (patientSearch.length >= 2) {
        doctorApi.getPatients({ limit: 50, search: patientSearch })
          .then((res) => setPatients(res.data.data))
          .catch(() => setPatients([]));
      } else { setPatients([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  function selectPatient(p: Patient) {
    setSelectedPatient(p);
    setPatientSearch('');
    setPatients([]);
  }

  async function openDetail(id: string) {
    setViewLoading(true);
    try {
      const res = await reportApi.getById(id);
      setViewReport(res.data.data as ReportDetail);
    } finally { setViewLoading(false); }
  }

  async function handleCreate() {
    if (!selectedPatient) { toast({ title: 'Select a patient', variant: 'destructive' }); return; }
    if (!form.title)      { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    try {
      await reportApi.create({ patientId: selectedPatient.profile_id, ...form });
      toast({ title: 'Report created' });
      setShowForm(false);
      setSelectedPatient(null);
      setForm({ reportType: 'lab', title: '', description: '', reportDate: new Date().toISOString().split('T')[0] });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'title', header: 'Report', render: (_: unknown, r: Record<string, unknown>) => (
      <div>
        <p className="font-semibold text-sm">{r.title as string}</p>
        <p className="text-xs text-muted-foreground">{r.patient_name as string}</p>
      </div>
    )},
    { key: 'report_type', header: 'Type',    render: (v: unknown) => <Badge variant="outline" className="capitalize">{v as string}</Badge> },
    { key: 'report_date', header: 'Date',    render: (v: unknown) => formatDate(v as string) },
    { key: 'doctor_name', header: 'Doctor',  render: (v: unknown) => <span className="text-sm">Dr. {v as string}</span> },
    { key: 'id',          header: '',        render: (id: unknown) => (
      <Button size="sm" variant="outline" onClick={() => openDetail(id as string)}>
        <Eye size={14} className="mr-1" />View
      </Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(!showForm); setSelectedPatient(null); setForm({ reportType: 'lab', title: '', description: '', reportDate: new Date().toISOString().split('T')[0] }); }}>
          <Plus size={16} className="mr-2" />Add Report
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add Medical Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">

            {/* Patient search */}
            <div className="space-y-2">
              <Label>Patient *</Label>
              {selectedPatient ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-sky-200 bg-sky-50">
                  <div className="w-9 h-9 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm flex-shrink-0">
                    {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPatient.email}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedPatient(null)}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input placeholder="Type name or email to search patients…" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
                  {patientSearch.length >= 2 && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                      {patients.length > 0 ? patients.map((p) => (
                        <button key={p.profile_id} type="button" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 text-left transition-colors" onClick={() => selectPatient(p)}>
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{p.first_name[0]}{p.last_name[0]}</div>
                          <div><p className="text-sm font-medium">{p.first_name} {p.last_name}</p><p className="text-xs text-muted-foreground">{p.email}</p></div>
                        </button>
                      )) : <div className="px-4 py-3 text-sm text-muted-foreground">No patient found</div>}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Report Type</Label>
                <select value={form.reportType} onChange={(e) => setForm({ ...form, reportType: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {REPORT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Report Date</Label>
                <Input type="date" value={form.reportDate} onChange={(e) => setForm({ ...form, reportDate: e.target.value })} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. CBC Blood Test Results" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Description / Findings</Label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Enter report findings, observations, or notes…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Save Report</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={reports as never} isLoading={loading} emptyMessage="No reports yet" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>

      {/* Detail modal */}
      {(viewReport || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {viewLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading…</div>
            ) : viewReport && (
              <>
                <div className="flex items-start justify-between p-6 border-b">
                  <div>
                    <p className="font-bold text-base">{viewReport.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(viewReport.report_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">{viewReport.report_type}</Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewReport(null)}><X size={16} /></Button>
                  </div>
                </div>
                <div className="p-6 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-sky-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Doctor</p>
                      <p className="font-semibold">Dr. {viewReport.doctor_name}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Patient</p>
                      <p className="font-semibold">{viewReport.patient_name}</p>
                    </div>
                  </div>
                  {viewReport.description && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Findings / Notes</p>
                      <p className="whitespace-pre-line bg-slate-50 rounded-xl p-3 text-slate-700">{viewReport.description}</p>
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
