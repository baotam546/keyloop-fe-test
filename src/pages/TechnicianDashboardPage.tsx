import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../types/domain';
import { listAll, enrichAppointment, setStatus } from '../services/appointments';
import { formatDateTime, today } from '../utils/time';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const STATUS_VARIANT: Record<string, 'success' | 'blue' | 'secondary' | 'destructive' | 'warning'> = {
  confirmed:     'blue',
  'in-progress': 'warning',
  completed:     'secondary',
  cancelled:     'destructive',
  requested:     'warning',
};

type Tab = 'today' | 'upcoming' | 'completed';

const TRANSITIONS: Partial<Record<AppointmentStatus, { label: string; next: AppointmentStatus }[]>> = {
  requested:     [{ label: 'Confirm',   next: 'confirmed'    }, { label: 'Cancel', next: 'cancelled' }],
  confirmed:     [{ label: 'Start Job', next: 'in-progress'  }, { label: 'Cancel', next: 'cancelled' }],
  'in-progress': [{ label: 'Complete',  next: 'completed'    }],
};

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 border-b border-r border-border last:border-r-0 [&:nth-last-child(-n+3)]:border-b-0">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function AppointmentCard({
  appt,
  onStatusChange,
}: {
  appt: Appointment;
  onStatusChange: (id: string, next: AppointmentStatus) => void;
}) {
  const enriched = enrichAppointment(appt);
  const actions = TRANSITIONS[appt.status] ?? [];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{appt.id}</span>
          <Badge variant={STATUS_VARIANT[appt.status] ?? 'secondary'}>{appt.status}</Badge>
        </div>
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map(action => (
              <Button
                key={action.next}
                variant={action.next === 'cancelled' ? 'ghost' : 'outline'}
                size="sm"
                className={action.next === 'cancelled' ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : ''}
                onClick={() => onStatusChange(appt.id, action.next)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3">
        <DetailCell label="Date & Time" value={formatDateTime(appt.scheduledStart)} />
        <DetailCell label="Service"     value={enriched.serviceType?.name ?? '—'} />
        <DetailCell label="Customer"    value={enriched.vehicle?.customerId ? `Customer #${enriched.vehicle.customerId}` : '—'} />
        <DetailCell label="Vehicle"     value={enriched.vehicle ? `${enriched.vehicle.year} ${enriched.vehicle.make} ${enriched.vehicle.model}` : '—'} />
        <DetailCell label="Bay"         value={enriched.serviceBay ? `Bay ${enriched.serviceBay.bayNumber} (${enriched.serviceBay.bayType})` : '—'} />
        <DetailCell label="Location"    value={enriched.dealership?.name ?? '—'} />
      </div>
    </Card>
  );
}

export function TechnicianDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('today');
  const [query, setQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listAll().then(data => {
      setAppointments(data.sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, next: AppointmentStatus) => {
    setUpdating(id);
    await setStatus(id, next);
    setUpdating(null);
    load();
  };

  const todayStr = today();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const byTab = appointments.filter(appt => {
      const dateStr = appt.scheduledStart.slice(0, 10);
      if (tab === 'today')     return dateStr === todayStr && appt.status !== 'cancelled' && appt.status !== 'completed';
      if (tab === 'upcoming')  return dateStr > todayStr  && appt.status !== 'cancelled' && appt.status !== 'completed';
      if (tab === 'completed') return appt.status === 'completed' || appt.status === 'cancelled';
      return true;
    });

    if (!q) return byTab;

    return byTab.filter(appt => {
      const enriched = enrichAppointment(appt);
      return (
        enriched.serviceType?.name.toLowerCase().includes(q) ||
        enriched.vehicle?.make.toLowerCase().includes(q) ||
        enriched.vehicle?.model.toLowerCase().includes(q) ||
        String(enriched.vehicle?.year).includes(q) ||
        enriched.vehicle?.vin.toLowerCase().includes(q) ||
        appt.id.toLowerCase().includes(q)
      );
    });
  }, [appointments, tab, query, todayStr]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today',     label: "Today's Jobs" },
    { key: 'upcoming',  label: 'Upcoming'     },
    { key: 'completed', label: 'History'      },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Technician Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage your assigned service appointments.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              tab === t.key
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by service, vehicle, VIN, or ID…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
          <p className="text-sm">Loading schedule…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <CalendarDays className="size-12 opacity-25" strokeWidth={1} />
          <p className="text-sm">
            {query ? 'No appointments match your search.' : 'No appointments in this view.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(appt => (
            <div key={appt.id} className={updating === appt.id ? 'opacity-50 pointer-events-none' : ''}>
              <AppointmentCard appt={appt} onStatusChange={handleStatusChange} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
