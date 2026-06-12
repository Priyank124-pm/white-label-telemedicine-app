'use client';

import { useEffect, useState, useCallback } from 'react';
import { pharmacyApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function PharmacyInvoicesPage() {
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1 });
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pharmacyApi.getInvoices({ page, limit: 10 });
      setInvoices(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'invoice_no',    header: 'Invoice No.',  render: (v: unknown) => <span className="font-mono font-medium text-sm">{v as string}</span> },
    { key: 'patient_name',  header: 'Patient' },
    { key: 'prescription_no',header: 'Rx No.',      render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: 'subtotal',      header: 'Subtotal',     render: (v: unknown) => formatCurrency(v as number) },
    { key: 'tax_amount',    header: 'Tax',          render: (v: unknown) => formatCurrency(v as number) },
    { key: 'total_amount',  header: 'Total',        render: (v: unknown) => <span className="font-bold">{formatCurrency(v as number)}</span> },
    { key: 'status',        header: 'Status',       render: (v: unknown) => <Badge className={getStatusColor(v as string)}>{v as string}</Badge> },
    { key: 'created_at',    header: 'Date',         render: (v: unknown) => formatDate(v as string) },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns as never} data={invoices as never} isLoading={loading} emptyMessage="No invoices found" />
          <div className="p-4"><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
