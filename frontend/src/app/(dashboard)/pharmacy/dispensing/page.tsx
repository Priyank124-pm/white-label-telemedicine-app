'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { pharmacyApi, prescriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { Package, Plus, Trash2 } from 'lucide-react';

interface InvoiceItem { medicineName: string; quantity: number; unitPrice: number; }

export default function DispensingPage() {
  const searchParams    = useSearchParams();
  const router          = useRouter();
  const prescriptionId  = searchParams.get('prescriptionId') || '';
  const [rx,       setRx]       = useState<Record<string, unknown> | null>(null);
  const [items,    setItems]    = useState<InvoiceItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(13);
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!prescriptionId) return;
    prescriptionApi.getById(prescriptionId).then((res) => {
      const data = res.data.data as Record<string, unknown>;
      setRx(data);
      const rxItems = data.items as Array<{ medicine_name: string; quantity: number }>;
      setItems(rxItems.map((i) => ({ medicineName: i.medicine_name, quantity: i.quantity, unitPrice: 10 })));
    });
  }, [prescriptionId]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * (taxPercent / 100);
  const total     = subtotal + taxAmount;

  function updateItem(idx: number, field: keyof InvoiceItem, val: string | number) {
    const updated = [...items]; updated[idx] = { ...updated[idx], [field]: val }; setItems(updated);
  }

  async function handleDispense() {
    try {
      setLoading(true);
      await pharmacyApi.dispense({ prescriptionId, notes, invoiceItems: items, taxPercent });
      toast({ title: 'Prescription dispensed', description: 'Invoice created successfully' });
      router.push('/pharmacy/invoices');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Dispense failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally { setLoading(false); }
  }

  if (!prescriptionId) return (
    <div className="text-center py-16 text-muted-foreground">
      <Package size={40} className="mx-auto mb-3 opacity-30" />
      <p>Select a prescription from the Prescriptions page to dispense.</p>
      <Button className="mt-4" variant="outline" onClick={() => router.push('/pharmacy/prescriptions')}>View Prescriptions</Button>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-4">
      {rx && (
        <Card>
          <CardHeader><CardTitle>Prescription Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium">Rx No.: </span><span className="font-mono">{rx.prescription_no as string}</span></div>
            <div><span className="font-medium">Patient: </span>{rx.patient_name as string}</div>
            <div><span className="font-medium">Doctor: </span>Dr. {rx.doctor_name as string}</div>
            <div><span className="font-medium">Diagnosis: </span>{rx.diagnosis as string}</div>
            <div><span className="font-medium">Status: </span><Badge className={getStatusColor(rx.status as string)}>{rx.status as string}</Badge></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Invoice Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input className="flex-1" value={item.medicineName} onChange={(e) => updateItem(i, 'medicineName', e.target.value)} placeholder="Medicine name" />
              <Input className="w-20" type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} min={1} />
              <Input className="w-28" type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value))} step={0.01} />
              <span className="w-24 text-right text-sm font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
              <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><Trash2 size={14} /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setItems([...items, { medicineName: '', quantity: 1, unitPrice: 0 }])}>
            <Plus size={14} className="mr-1" />Add Item
          </Button>

          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <div className="flex items-center gap-2">
                <Input type="number" value={taxPercent} onChange={(e) => setTaxPercent(parseInt(e.target.value))} className="w-16 h-7 text-xs" />
                <span>% = {formatCurrency(taxAmount)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional dispensing notes" />
          </div>

          <Button onClick={handleDispense} disabled={loading || !items.length} className="w-full">
            {loading ? 'Processing…' : 'Dispense & Generate Invoice'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
