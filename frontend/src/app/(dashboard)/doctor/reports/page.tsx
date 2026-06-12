'use client';

import { useEffect, useState, useCallback } from 'react';
import { reportApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Upload, Download, Trash2 } from 'lucide-react';

const REPORT_TYPES = ['lab','imaging','pathology','other'];

export default function DoctorReportsPage() {
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', reportType: 'lab', title: '', description: '', reportDate: new Date().toISOString().split('T')[0] });
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page, limit: 10 });
      setReports(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload() {
    if (!file) { toast({ title: 'Please select a file', variant: 'destructive' }); return; }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', file);
      await reportApi.upload(fd);
      toast({ title: 'Report uploaded' });
      setShowForm(false);
      setFile(null);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  const columns = [
    { key: 'title', header: 'Report', render: (_: unknown, r: Record<string, unknown>) => (
      <div><p className="font-medium text-sm">{r.title as string}</p><p className="text-xs text-muted-foreground">{r.patient_name as string}</p></div>
    )},
    { key: 'report_type', header: 'Type', render: (v: unknown) => <Badge variant="outline" className="capitalize">{v as string}</Badge> },
    { key: 'report_date', header: 'Date', render: (v: unknown) => formatDate(v as string) },
    { key: 'file_name',   header: 'File', render: (v: unknown) => <span className="text-xs font-mono">{v as string}</span> },
    { key: 'file_url',    header: '', render: (v: unknown) => (
      <a href={v as string} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline"><Download size={14} className="mr-1" />View</Button>
      </a>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}><Upload size={16} className="mr-2" />Upload Report</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Upload Medical Report</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Patient Profile ID *</Label>
                <Input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="Patient profile UUID" />
              </div>
              <div className="space-y-1">
                <Label>Report Type</Label>
                <select value={form.reportType} onChange={(e) => setForm({ ...form, reportType: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Report Date</Label>
                <Input type="date" value={form.reportDate} onChange={(e) => setForm({ ...form, reportDate: e.target.value })} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>File (PDF, JPG, PNG — max 10MB)</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleUpload}>Upload</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={reports as never} isLoading={loading} emptyMessage="No reports found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
