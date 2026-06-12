'use client';

import { Suspense, useEffect, useState } from 'react';
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

interface InvoiceItem {
  medicineName: string;
  quantity: number;
  unitPrice: number;
}

function DispensingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prescriptionId = searchParams.get('prescriptionId') || '';

  const [rx, setRx] = useState<Record<string, unknown> | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(13);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prescriptionId) return;

    prescriptionApi.getById(prescriptionId).then((res) => {
      const data = res.data.data as Record<string, unknown>;
      setRx(data);

      const rxItems = data.items as Array<{
        medicine_name: string;
        quantity: number;
      }>;

      setItems(
        rxItems.map((i) => ({
          medicineName: i.medicine_name,
          quantity: i.quantity,
          unitPrice: 10,
        }))
      );
    });
  }, [prescriptionId]);

  const subtotal = items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0
  );

  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  function updateItem(
    idx: number,
    field: keyof InvoiceItem,
    val: string | number
  ) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  }

  async function handleDispense() {
    try {
      setLoading(true);

      await pharmacyApi.dispense({
        prescriptionId,
        notes,
        invoiceItems: items,
        taxPercent,
      });

      toast({
        title: 'Prescription dispensed',
        description: 'Invoice created successfully',
      });

      router.push('/pharmacy/invoices');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Dispense failed';

      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (!prescriptionId) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Package size={40} className="mx-auto mb-3 opacity-30" />
        <p>Select a prescription from the Prescriptions page to dispense.</p>

        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push('/pharmacy/prescriptions')}
        >
          View Prescriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* KEEP THE REST OF YOUR EXISTING JSX HERE UNCHANGED */}
    </div>
  );
}

export default function DispensingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DispensingContent />
    </Suspense>
  );
}