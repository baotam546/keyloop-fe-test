import type { Dealership, ServiceType } from '../types/domain';
import { today, getTimeSlots, formatTimeSlot, isDealershipOpen } from '../utils/time';

interface Props {
  dealership: Dealership;
  serviceType: ServiceType;
  date: string;
  time: string;
  loading: boolean;
  error: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onCheckAvailability: () => void;
  onBack: () => void;
}

export function DateTimePicker({
  dealership, serviceType, date, time, loading, error,
  onDateChange, onTimeChange, onCheckAvailability, onBack,
}: Props) {
  const slots = date && isDealershipOpen(dealership.openingHours, date)
    ? getTimeSlots(dealership.openingHours, serviceType.estimatedDurationMin)
    : [];

  const isClosedDay = date && !isDealershipOpen(dealership.openingHours, date);

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Pick a Date & Time</h2>
        <p>Select when you'd like to bring in your vehicle.</p>
      </div>

      <div className="card">
        <label className="field-label">Date</label>
        <input
          type="date"
          className="date-input"
          min={today()}
          value={date}
          onChange={e => onDateChange(e.target.value)}
        />

        {isClosedDay && (
          <div className="alert alert-warning">
            {dealership.name} is closed on this day. Please select another date.
          </div>
        )}

        {slots.length > 0 && (
          <>
            <label className="field-label" style={{ marginTop: '1.25rem' }}>Time</label>
            <div className="time-grid">
              {slots.map(slot => (
                <button
                  key={slot}
                  className={`time-slot ${time === slot ? 'selected' : ''}`}
                  onClick={() => onTimeChange(slot)}
                >
                  {formatTimeSlot(slot)}
                </button>
              ))}
            </div>
          </>
        )}

        {error && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      <div className="step-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={onCheckAvailability}
          disabled={!date || !time || loading || !!isClosedDay}
        >
          {loading ? <><div className="spinner-sm" /> Checking…</> : 'Check Availability →'}
        </button>
      </div>
    </div>
  );
}
