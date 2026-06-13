'use client';

import { useEffect, useState, useCallback } from 'react';
import { pharmacyApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Search, X, User, ChevronRight } from 'lucide-react';

interface PatientResult {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export default function PharmacyPrescriptionsPage() {
  const router = useRouter();

  const [query,           setQuery]           = useState('');
  const [results,         setResults]         = useState<PatientResult[]>([]);
  const [searching,       setSearching]       = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);

  const [rxList,    setRxList]   = useState<Record<string, unknown>[]>([]);
  const [rxLoading, setRxLoading] = useState(false);

  // Live search with 350ms debounce
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await pharmacyApi.searchPatients(query);
        setResults(res.data.data as PatientResult[]);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Load prescriptions when patient selected
  const loadRx = useCallback(async (profileId: string) => {
    setRxLoading(true);
    try {
      const res = await pharmacyApi.getPrescriptions({ patientId: profileId, limit: 50 });
      setRxList(res.data.data);
    } finally { setRxLoading(false); }
  }, []);

  function selectPatient(p: PatientResult) {
    setSelectedPatient(p);
    setQuery('');
    setResults([]);
    loadRx(p.profile_id);
  }

  function clearPatient() {
    setSelectedPatient(null);
    setRxList([]);
    setQuery('');
  }

  const columns = [
    { key: 'prescription_no', header: 'Rx No.', render: (v: unknown) => <span className="font-mono font-semibold text-sky-700">{v as string}</span> },
    { key: 'doctor_name',     header: 'Doctor',     render: (v: unknown) => <span>Dr. {v as string}</span> },
    { key: 'diagnosis',       header: 'Diagnosis',  render: (v: unknown) => <span className="text-xs">{v as string}</span> },
    { key: 'created_at',      header: 'Issued',     render: (v: unknown) => formatDate(v as string) },
    { key: 'id',              header: '',           render: (id: unknown, row: Record<string, unknown>) => (
      row.status === 'active'
        ? <Button size="sm" onClick={() => router.push(`/pharmacy/dispensing?prescriptionId=${id}`)}>
            Dispense <ChevronRight size={14} className="ml-1" />
          </Button>
        : null
    )},
  ];

  return (
    <div className="space-y-5">

      {/* ── Step 1: Patient search ── */}
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Step 1 — Find the patient
          </p>

          {selectedPatient ? (
            /* Selected patient chip */
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-sky-200 bg-sky-50">
              <div className="w-12 h-12 rounded-2xl bg-sky-200 text-sky-700 font-bold text-base flex items-center justify-center flex-shrink-0">
                {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {selectedPatient.phone && <p className="text-sm text-slate-500">{selectedPatient.phone}</p>}
                  <p className="text-sm text-slate-400">{selectedPatient.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearPatient} className="text-slate-400 hover:text-red-500">
                <X size={16} className="mr-1" /> Clear
              </Button>
            </div>
          ) : (
            /* Search box */
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
              <Input
                className="pl-9 h-11"
                placeholder="Search patient by name, phone or email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Searching…</div>
              )}

              {/* Dropdown */}
              {results.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-2 border-b bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {results.length} patient{results.length > 1 ? 's' : ''} found
                  </div>
                  {results.map((p) => (
                    <button
                      key={p.profile_id}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 text-left transition-colors border-b last:border-0"
                      onClick={() => selectPatient(p)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-slate-500">{p.phone || p.email}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !searching && results.length === 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-4 text-center">
                  <User size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No patient found for "<strong>{query}</strong>"</p>
                  <p className="text-xs text-slate-400 mt-1">Ask the patient to register via the CareDesk patient app.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Step 2: Prescriptions ── */}
      {selectedPatient && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Step 2 — Select a prescription to dispense
          </p>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns as never}
                data={rxList as never}
                isLoading={rxLoading}
                emptyMessage={`No prescriptions found for ${selectedPatient.first_name} ${selectedPatient.last_name}`}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state before search */}
      {!selectedPatient && (
        <div className="text-center py-16 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Search for a patient to view their prescriptions</p>
          <p className="text-sm mt-1">Patients can come from any clinic — search works across all records.</p>
        </div>
      )}
    </div>
  );
}
