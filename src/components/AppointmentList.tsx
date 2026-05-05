import { useState, useEffect } from 'react';
import type { Appointment } from '../types/domain';
import { listForCustomer, cancel, enrichAppointment } from '../services/appointments';
import { formatDateTime } from '../utils/time';
import { CURRENT_CUSTOMER } from '../mocks/data';

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'badge-green',
  'in-progress': 'badge-blue',
  completed: 'badge-gray',
  cancelled: 'badge-red',
  requested: 'badge-orange',
};

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listForCustomer(CURRENT_CUSTOMER.id).then(data => {
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

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading appointments…</p></div>;

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>No appointments yet. Book your first service!</p>
      </div>
    );
  }

  return (
    <div className="appointment-list">
      {appointments.map(appt => {
        const enriched = enrichAppointment(appt);
        const isCancellable = appt.status === 'confirmed';
        return (
          <div key={appt.id} className="appointment-card">
            <div className="appt-header">
              <div>
                <span className="appt-id">{appt.id}</span>
                <span className={`badge ${STATUS_BADGE[appt.status] ?? 'badge-gray'}`} style={{ marginLeft: '0.5rem' }}>
                  {appt.status}
                </span>
              </div>
              {isCancellable && (
                <button
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => handleCancel(appt.id)}
                  disabled={cancelling === appt.id}
                >
                  {cancelling === appt.id ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
            </div>
            <div className="appt-body">
              <div className="appt-detail">
                <strong>Service</strong>
                <span>{enriched.serviceType?.name ?? '—'}</span>
              </div>
              <div className="appt-detail">
                <strong>Vehicle</strong>
                <span>{enriched.vehicle ? `${enriched.vehicle.year} ${enriched.vehicle.make} ${enriched.vehicle.model}` : '—'}</span>
              </div>
              <div className="appt-detail">
                <strong>Location</strong>
                <span>{enriched.dealership?.name ?? '—'}</span>
              </div>
              <div className="appt-detail">
                <strong>Date & Time</strong>
                <span>{formatDateTime(appt.scheduledStart)}</span>
              </div>
              <div className="appt-detail">
                <strong>Technician</strong>
                <span>{enriched.technician?.name ?? '—'}</span>
              </div>
              <div className="appt-detail">
                <strong>Bay</strong>
                <span>{enriched.serviceBay ? `Bay ${enriched.serviceBay.bayNumber}` : '—'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
