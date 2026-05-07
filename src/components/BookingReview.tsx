import type { Dealership, Vehicle, ServiceType, AvailableSlot, Hold, GuestCustomer } from '../types/domain';
import { formatDateTime } from '../utils/time';
import { HoldCountdown } from './HoldCountdown';

const BAY_LABELS: Record<string, string> = { lift: 'Lift Bay', flat: 'Flat Bay', paint: 'Paint Bay' };

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
    <div className="picker-section">
      <div className="picker-header">
        <h2>Review & Confirm</h2>
        <p>Please review your appointment details before confirming.</p>
      </div>

      {hold && (
        <HoldCountdown expiresAt={hold.expiresAt} onExpired={onHoldExpired} />
      )}
      {holdExpired && (
        <div className="alert alert-danger">Your slot hold has expired. Please go back and select a new time.</div>
      )}

      <div className="review-card">
        <div className="review-row">
          <span className="review-label">Contact</span>
          <span className="review-value">
            {customerInfo.name}<br />
            <small>{customerInfo.email} · {customerInfo.phone}</small>
          </span>
        </div>
        <div className="review-row">
          <span className="review-label">Dealership</span>
          <span className="review-value">{dealership.name}<br /><small>{dealership.address}, {dealership.city}</small></span>
        </div>
        <div className="review-row">
          <span className="review-label">Vehicle</span>
          <span className="review-value">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.vin && <><br /><small>VIN: {vehicle.vin}</small></>}
          </span>
        </div>
        <div className="review-row">
          <span className="review-label">Service</span>
          <span className="review-value">{serviceType.name}<br /><small>{serviceType.estimatedDurationMin} min · {BAY_LABELS[serviceType.requiredBayType]}</small></span>
        </div>
        <div className="review-row">
          <span className="review-label">Date & Time</span>
          <span className="review-value">{formatDateTime(slot.startsAt)}<br /><small>Until {formatDateTime(slot.endsAt)}</small></span>
        </div>
        <div className="review-row">
          <span className="review-label">Assigned Technician</span>
          <span className="review-value">{slot.technician.name}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Assigned Bay</span>
          <span className="review-value">Bay {slot.serviceBay.bayNumber} — {BAY_LABELS[slot.serviceBay.bayType]}</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="step-actions">
        <button className="btn btn-ghost" onClick={onBack} disabled={loading}>← Back</button>
        <button
          className="btn btn-success"
          onClick={onConfirm}
          disabled={loading || holdExpired}
        >
          {loading ? <><div className="spinner-sm" /> Confirming…</> : '✓ Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
