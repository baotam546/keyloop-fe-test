import type { Appointment, Dealership, Vehicle, ServiceType, Technician, ServiceBay, GuestCustomer } from '../types/domain';
import { formatDateTime } from '../utils/time';

const BAY_LABELS: Record<string, string> = { lift: 'Lift Bay', flat: 'Flat Bay', paint: 'Paint Bay' };

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
    <div className="confirmation-page">
      <div className="confirmation-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="confirmation-title">Appointment Confirmed!</h2>
      <p className="confirmation-subtitle">Your booking has been secured. See you soon, {customerInfo.name.split(' ')[0]}!</p>

      <div className="confirmation-id">
        <span className="conf-id-label">Confirmation ID</span>
        <span className="conf-id-value">{appointment.id}</span>
      </div>

      <div className="review-card" style={{ marginTop: '1.5rem' }}>
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
          <span className="review-value">{serviceType.name}<br /><small>{serviceType.estimatedDurationMin} min</small></span>
        </div>
        <div className="review-row">
          <span className="review-label">Date & Time</span>
          <span className="review-value">{formatDateTime(appointment.scheduledStart)}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Technician</span>
          <span className="review-value">{technician.name}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Bay</span>
          <span className="review-value">Bay {serviceBay.bayNumber} — {BAY_LABELS[serviceBay.bayType]}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Status</span>
          <span className="review-value"><span className="badge badge-green">Confirmed</span></span>
        </div>
      </div>

      <div className="confirmation-actions">
        <button className="btn btn-ghost" onClick={onViewAppointments}>View My Appointments</button>
        <button className="btn btn-primary" onClick={onBookAnother}>Book Another Service</button>
      </div>
    </div>
  );
}
