import { CheckCircle2 } from 'lucide-react';
import type { Appointment, Dealership, Vehicle, ServiceType, Technician, ServiceBay, GuestCustomer } from '../types/domain';
import { formatDateTime } from '../utils/time';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

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
  appointment: Appointment;
  dealership: Dealership;
  vehicle: Vehicle;
  serviceType: ServiceType;
  technician: Technician;
  serviceBay: ServiceBay;
  onBookAnother: () => void;
  onViewAppointments: () => void;
}

export function ConfirmationCard({
  customerInfo, appointment, dealership, vehicle, serviceType, technician, serviceBay,
  onBookAnother, onViewAppointments,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6 text-center pt-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-8" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appointment Confirmed!</h2>
        <p className="text-muted-foreground mt-1.5">
          Your booking is secured. See you soon, {customerInfo.name.split(' ')[0]}!
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/40 px-6 py-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirmation ID</span>
        <span className="font-mono text-lg font-semibold tracking-wide">{appointment.id}</span>
      </div>

      <Card className="w-full text-left overflow-hidden">
        <Row label="Contact">
          <span className="font-medium">{customerInfo.name}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">{customerInfo.email} · {customerInfo.phone}</span>
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
          <span className="block text-xs text-muted-foreground mt-0.5">{serviceType.estimatedDurationMin} min</span>
        </Row>
        <Separator />
        <Row label="Date & Time">
          {formatDateTime(appointment.scheduledStart)}
        </Row>
        <Separator />
        <Row label="Technician">{technician.name}</Row>
        <Separator />
        <Row label="Bay">Bay {serviceBay.bayNumber} — {BAY_LABEL[serviceBay.bayType]}</Row>
        <Separator />
        <Row label="Status"><Badge variant="success">Confirmed</Badge></Row>
      </Card>

      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="outline" onClick={onViewAppointments}>View My Appointments</Button>
        <Button onClick={onBookAnother}>Book Another Service</Button>
      </div>
    </div>
  );
}
