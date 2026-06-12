'use client';

import { useEffect, useState, useCallback } from 'react';
import { pharmacyApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PharmacyPrescriptionsPage() {
  const router = useRouter();
  const [rxList,  setRxList]  = useState<Record<string, unknown>[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (patientId) params.patientId = patientId;
      const res = await pharmacyApi.getPrescriptions(params);
      setRxList(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page, patientId]);

  useEffect(() => { load(); }, [load]);

  async function searchPatient() {
    if (search.length < 2) return;
    const res = await pharmacyApi.searchPatients(search);
    const found = (res.data.data as Array<{ profile_id: string }>)[0];
    if (found) { setPatientId(found.profile_id); }
  }

  const columns = [
    { key: 'prescription_no', header: 'Rx No.',      render: (v: unknown) => <span className="font-mono font-medium text-sm">{v as string}</span> },
    { key: 'patient_name',    header: 'Patient',     render: (_: unknown, r: Record<string, unknown>) => (
      <div><p className="font-medium text-sm">{r.patient_name as string}</p><p className="text-xs text-muted-foreground">{r.patient_phone as string}</p></div>
    )},
    { key: 'doctor_name',     header: 'Doctor',      render: (v: unknown) => `Dr. ${v}` },
    { key: 'diagnosis',       header: 'Diagnosis',   render: (v: unknown) => <span className="text-xs">{v as string}</span> },
    { key: 'created_at',      header: 'Issued',      render: (v: unknown) => formatDate(v as string) },
    { key: 'status',          header: 'Status',      render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'id',              header: '',            render: (id: unknown) => (
      <Button size="sm" onClick={() => router.push(`/pharmacy/dispensing?prescriptionId=${id}`)}>Dispense</Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search patient by name/email..." className="w-72" />
        <Button variant="outline" onClick={searchPatient}>Search</Button>
        {patientId && <Button variant="ghost" size="sm" onClick={() => { setPatientId(''); setSearch(''); }}>Clear</Button>}
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={rxList as never} isLoading={loading} emptyMessage="No active prescriptions found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
