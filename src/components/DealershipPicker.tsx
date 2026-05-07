import { useState, useEffect } from 'react';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import type { Dealership } from '../types/domain';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtHour(h: number) {
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h > 12 ? h - 12 : h}:00 ${p}`;
}

interface Props {
  loadDealerships: () => Promise<Dealership[]>;
  onSelect: (d: Dealership) => void;
  onBack: () => void;
}

export function DealershipPicker({ loadDealerships, onSelect, onBack }: Props) {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDealerships().then(data => { setDealerships(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <p className="text-sm">Loading locations…</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Choose a Location</h2>
        <p className="text-sm text-muted-foreground mt-1">Select the service location for your appointment.</p>
      </div>

      <div className="flex flex-col gap-3">
        {dealerships.map(d => (
          <button
            key={d.id}
            className="group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
            onClick={() => onSelect(d)}
          >
            <div className="mt-0.5 flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <MapPin className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{d.address}, {d.city}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">
                  {d.openingHours.daysOfWeek.map(n => DAY_NAMES[n]).join(' · ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {fmtHour(d.openingHours.startHour)} – {fmtHour(d.openingHours.endHour)}
                </span>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>

      <div>
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="size-4" /> Back</Button>
      </div>
    </div>
  );
}
