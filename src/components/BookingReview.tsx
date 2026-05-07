import { AlertCircle, ArrowLeft, Check } from 'lucide-react';
import type { Dealership, Vehicle, ServiceType, AvailableSlot, Hold, GuestCustomer } from '../types/domain';
import { formatDateTime } from '../utils/time';
import { HoldCountdown } from './HoldCountdown';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';

const BAY_LABEL: Record<string, string> = { lift: 'Lift Bay', flat: 'Flat Bay', paint: 'Paint Bay' };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-5 py-3.5">
      <span className="w-32 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-0.5">
        {label}
      </span>
      <span className="text-sm text-foreground flex-1">{children}</span>
    </div>
  );
}

interface Props {
  customerInfo: GuestCustomer;
  dealership: Dealership;
  vehicle: Vehicle;
  serviceType: ServiceType;
  slot: AvailableSlot;
  hold: Hold | null;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
  onHoldExpired: () => void;
}

export function BookingReview({
  customerInfo, dealership, vehicle, serviceType, slot, hold, loading, error,
  onConfirm, onBack, onHoldExpired,
}: Props) {
  const holdExpired = !hold;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground mt-1">Please review your appointment details.</p>
      </div>

      {hold    && <HoldCountdown expiresAt={hold.expiresAt} onExpired={onHoldExpired} />}
      {holdExpired && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>Your slot hold expired. Please go back and select a new time.</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <Row label="Contact">
          <span className="font-medium">{customerInfo.name}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">
            {customerInfo.email} · {customerInfo.phone}
          </span>
        </Row>
        <Separator />
        <Row label="Dealership">
          <span className="font-medium">{dealership.name}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">{dealership.address}, {dealership.city}</span>
        </Row>
        <Separator />
        <Row label="Vehicle">
          <span className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          {vehicle.vin && <span className="block text-xs text-muted-foreground font-mono mt-0.5">VIN: {vehicle.vin}</span>}
        </Row>
        <Separator />
        <Row label="Service">
          <span className="font-medium">{serviceType.name}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">
            {serviceType.estimatedDurationMin} min · {BAY_LABEL[serviceType.requiredBayType]}
          </span>
        </Row>
        <Separator />
        <Row label="Date & Time">
          <span className="font-medium">{formatDateTime(slot.startsAt)}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Until {formatDateTime(slot.endsAt)}</span>
        </Row>
        <Separator />
        <Row label="Technician">
          <span className="font-medium">{slot.technician.name}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Auto-assigned</span>
        </Row>
        <Separator />
        <Row label="Bay">
          Bay {slot.serviceBay.bayNumber} — {BAY_LABEL[slot.serviceBay.bayType]}
          <span className="block text-xs text-muted-foreground mt-0.5">Auto-assigned</span>
        </Row>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={loading} onClick={onBack}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          disabled={loading || holdExpired}
          onClick={onConfirm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
        >
          {loading
            ? <><span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Confirming…</>
            : <><Check className="size-4" /> Confirm Booking</>
          }
        </Button>
      </div>
    </div>
  );
}
