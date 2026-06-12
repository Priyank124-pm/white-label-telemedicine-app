'use client';

import { useEffect, useState } from 'react';
import { doctorApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getDayName } from '@/lib/utils';
import { Plus, Trash2, Clock } from 'lucide-react';

interface Slot { dayOfWeek: number; startTime: string; endTime: string; slotDurationMins: number; }
const DAYS = [0,1,2,3,4,5,6];

export default function AvailabilityPage() {
  const [slots,   setSlots]   = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    doctorApi.getAvailability().then((res) => {
      const data = res.data.data as Array<{ day_of_week: number; start_time: string; end_time: string; slot_duration_mins: number }>;
      setSlots(data.map((d) => ({
        dayOfWeek:        d.day_of_week,
        startTime:        d.start_time,
        endTime:          d.end_time,
        slotDurationMins: d.slot_duration_mins,
      })));
    });
  }, []);

  function addSlot() { setSlots([...slots, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDurationMins: 30 }]); }
  function removeSlot(i: number) { setSlots(slots.filter((_, idx) => idx !== i)); }
  function update(i: number, field: keyof Slot, val: string | number) {
    const updated = [...slots]; updated[i] = { ...updated[i], [field]: val }; setSlots(updated);
  }

  async function save() {
    try {
      setLoading(true);
      await doctorApi.setAvailability({ slots });
      toast({ title: 'Availability saved' });
    } catch {
      toast({ title: 'Error saving availability', variant: 'destructive' });
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock size={20} />Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <select
                value={slot.dayOfWeek}
                onChange={(e) => update(i, 'dayOfWeek', parseInt(e.target.value))}
                className="w-32 h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {DAYS.map((d) => <option key={d} value={d}>{getDayName(d)}</option>)}
              </select>
              <div className="flex items-center gap-2 flex-1">
                <div className="space-y-0.5">
                  <Label className="text-xs">Start</Label>
                  <Input type="time" value={slot.startTime} onChange={(e) => update(i, 'startTime', e.target.value)} className="w-28" />
                </div>
                <span className="text-muted-foreground mt-4">—</span>
                <div className="space-y-0.5">
                  <Label className="text-xs">End</Label>
                  <Input type="time" value={slot.endTime} onChange={(e) => update(i, 'endTime', e.target.value)} className="w-28" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs">Slot (min)</Label>
                  <Input type="number" value={slot.slotDurationMins} onChange={(e) => update(i, 'slotDurationMins', parseInt(e.target.value))} className="w-20" min={15} max={120} step={15} />
                </div>
              </div>
              <Button size="icon" variant="destructive" onClick={() => removeSlot(i)}><Trash2 size={14} /></Button>
            </div>
          ))}

          {slots.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock size={32} className="mx-auto mb-2 opacity-30" />
              <p>No availability set. Add your working hours.</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={addSlot}><Plus size={16} className="mr-2" />Add Time Slot</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Availability'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
