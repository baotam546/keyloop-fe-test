import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import type { Appointment } from '../types/domain';
import { listAll, cancel, enrichAppointment } from '../services/appointments';
import { formatDateTime } from '../utils/time';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

const STATUS_VARIANT: Record<string, 'success' | 'blue' | 'secondary' | 'destructive' | 'warning'> = {
  requested:     'warning',
  confirmed:     'blue',
  'in-progress': 'warning',
  completed:     'success',
  cancelled:     'destructive',
};

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-4 border-b border-r border-border last:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [cancelling,   setCancelling]   = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listAll().then(data => {
      setAppointments(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(id);
    await cancel(id);
    setCancelling(null);
    load();
  };

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <p className="text-sm">Loading appointments…</p>
    </div>
  );

  if (appointments.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <CalendarDays className="size-12 opacity-25" strokeWidth={1} />
      <p className="text-sm">No appointments yet. Book your first service!</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {appointments.map(appt => {
        const enriched     = enrichAppointment(appt);
        const isCancellable = appt.status === 'confirmed';
        return (
          <Card key={appt.id} className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{appt.id}</span>
                <Badge variant={STATUS_VARIANT[appt.status] ?? 'secondary'}>
                  {appt.status}
                </Badge>
              </div>
              {isCancellable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={cancelling === appt.id}
                  onClick={() => handleCancel(appt.id)}
                >
                  {cancelling === appt.id ? 'Cancelling…' : 'Cancel'}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3">
              <DetailCell label="Service"    value={enriched.serviceType?.name ?? '—'} />
              <DetailCell label="Vehicle"    value={enriched.vehicle ? `${enriched.vehicle.year} ${enriched.vehicle.make} ${enriched.vehicle.model}` : '—'} />
              <DetailCell label="Location"   value={enriched.dealership?.name ?? '—'} />
              <DetailCell label="Date & Time" value={formatDateTime(appt.scheduledStart)} />
              <DetailCell label="Technician" value={enriched.technician?.name ?? '—'} />
              <DetailCell label="Bay"        value={enriched.serviceBay ? `Bay ${enriched.serviceBay.bayNumber}` : '—'} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
