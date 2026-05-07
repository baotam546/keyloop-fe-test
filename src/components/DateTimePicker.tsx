import { AlertCircle, AlertTriangle, ArrowLeft, CalendarDays, Loader2 } from 'lucide-react';
import type { Dealership, ServiceType } from '../types/domain';
import { today, getTimeSlots, formatTimeSlot, isDealershipOpen } from '../utils/time';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

interface Props {
  dealership: Dealership;
  serviceType: ServiceType;
  date: string;
  time: string;
  slotAvailability: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  onDateChange: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

export function DateTimePicker({
  dealership, serviceType, date, time, slotAvailability, loading, error,
  onDateChange, onTimeSelect, onBack,
}: Props) {
  const allSlots      = date && isDealershipOpen(dealership.openingHours, date)
    ? getTimeSlots(dealership.openingHours, serviceType.estimatedDurationMin)
    : [];
  const isClosedDay   = date && !isDealershipOpen(dealership.openingHours, date);
  const hasAvail      = allSlots.length > 0 && Object.keys(slotAvailability).length > 0;
  const anyAvailable  = allSlots.some(s => slotAvailability[s]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Pick a Date & Time</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Available time slots are highlighted — click one to book.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="date-pick" className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" /> Date
            </Label>
            <Input
              id="date-pick"
              type="date"
              min={today()}
              value={date}
              disabled={loading}
              className="max-w-xs"
              onChange={e => onDateChange(e.target.value)}
            />
          </div>

          {isClosedDay && (
            <Alert variant="warning">
              <AlertTriangle />
              <AlertDescription>{dealership.name} is closed on this day. Please choose another date.</AlertDescription>
            </Alert>
          )}

          {date && !isClosedDay && loading && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Checking available times…
            </div>
          )}

          {hasAvail && (
            <div className="grid gap-2">
              <Label className="text-muted-foreground">
                Available Times
                <span className="ml-1.5 font-normal text-xs">(greyed = fully booked)</span>
              </Label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {allSlots.map(slot => {
                  const available = slotAvailability[slot] ?? false;
                  const selected  = time === slot;
                  return (
                    <button
                      key={slot}
                      disabled={!available || loading}
                      onClick={() => onTimeSelect(slot)}
                      className={cn(
                        'rounded-lg border py-2 text-xs font-medium transition-all',
                        selected
                          ? 'border-foreground bg-foreground text-background'
                          : available
                            ? 'border-border bg-card text-foreground hover:border-foreground/30 hover:bg-accent'
                            : 'border-border/40 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through'
                      )}
                    >
                      {formatTimeSlot(slot)}
                    </button>
                  );
                })}
              </div>
              {!anyAvailable && (
                <Alert variant="warning">
                  <AlertTriangle />
                  <AlertDescription>No availability on this day. Please choose a different date.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={loading} onClick={onBack}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        {loading && time && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Finding the best slot for you…
          </span>
        )}
      </div>
    </div>
  );
}
