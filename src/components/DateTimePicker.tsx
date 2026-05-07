import type { Dealership, ServiceType } from '../types/domain';
import { today, getTimeSlots, formatTimeSlot, isDealershipOpen } from '../utils/time';

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
  const allSlots = date && isDealershipOpen(dealership.openingHours, date)
    ? getTimeSlots(dealership.openingHours, serviceType.estimatedDurationMin)
    : [];

  const isClosedDay = date && !isDealershipOpen(dealership.openingHours, date);
  const hasLoadedAvailability = allSlots.length > 0 && Object.keys(slotAvailability).length > 0;

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Pick a Date & Time</h2>
        <p>Select when you'd like to bring in your vehicle. Available times are highlighted.</p>
      </div>

      <div className="card">
        <label className="field-label">Date</label>
        <input
          type="date"
          className="date-input"
          min={today()}
          value={date}
          disabled={loading}
          onChange={e => onDateChange(e.target.value)}
        />

        {isClosedDay && (
          <div className="alert alert-warning">
            {dealership.name} is closed on this day. Please select another date.
          </div>
        )}

        {date && !isClosedDay && loading && (
          <div className="loading-state" style={{ padding: '1.5rem 0 0.5rem' }}>
            <div className="spinner" />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Checking available times…</p>
          </div>
        )}

        {hasLoadedAvailability && (
          <>
            <label className="field-label" style={{ marginTop: '1.25rem' }}>
              Time
              <span style={{ marginLeft: '0.5rem', fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                — click an available slot
              </span>
            </label>
            <div className="time-grid">
              {allSlots.map(slot => {
                const available = slotAvailability[slot] ?? false;
                const isSelected = time === slot;
                return (
                  <button
                    key={slot}
                    className={`time-slot ${isSelected ? 'selected' : ''} ${!available ? 'unavailable' : ''}`}
                    onClick={() => available && !loading && onTimeSelect(slot)}
                    disabled={!available || loading}
                    title={available ? '' : 'No availability at this time'}
                  >
                    {formatTimeSlot(slot)}
                  </button>
                );
              })}
            </div>
            {!allSlots.some(s => slotAvailability[s]) && (
              <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                No availability on this day. Please choose a different date.
              </div>
            )}
          </>
        )}

        {error && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      <div className="step-actions">
        <button className="btn btn-ghost" onClick={onBack} disabled={loading}>← Back</button>
        {loading && time && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <div className="spinner-sm" /> Finding you the best available slot…
          </div>
        )}
      </div>
    </div>
  );
}
