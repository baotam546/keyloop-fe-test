import { AlertCircle, ArrowLeft, ChevronRight, Loader2, User, Monitor } from 'lucide-react';
import type { AvailableSlot } from '../types/domain';
import { formatDateTime } from '../utils/time';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

const BAY_LABELS: Record<string, string> = { lift: 'Lift Bay', flat: 'Flat Bay', paint: 'Paint Bay' };

interface Props {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
  onSelect: (slot: AvailableSlot) => void;
  onBack: () => void;
}

export function SlotPicker({ slots, loading, error, onSelect, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Available Slots</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {slots.length} slot{slots.length !== 1 ? 's' : ''} available — pick your preferred technician and bay.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        {slots.map((slot, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => onSelect(slot)}
            className="group w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
          >
            <Card className="shadow-none ring-0 bg-transparent py-0 gap-3">
              <CardContent className="px-0 grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Start Time</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{formatDateTime(slot.startsAt)}</p>
                  </div>
                  {loading
                    ? <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    : <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  }
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{slot.technician.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {slot.technician.certifications.map(c => (
                        <Badge key={c} variant="blue">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Monitor className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground">
                    Bay {slot.serviceBay.bayNumber} — {BAY_LABELS[slot.serviceBay.bayType]}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back
        </Button>
      </div>
    </div>
  );
}
