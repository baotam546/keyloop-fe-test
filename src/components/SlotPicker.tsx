import type { AvailableSlot } from '../types/domain';
import { formatDateTime } from '../utils/time';

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
    <div className="picker-section">
      <div className="picker-header">
        <h2>Available Slots</h2>
        <p>{slots.length} slot{slots.length !== 1 ? 's' : ''} available — pick your preferred technician and bay.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="slot-list">
        {slots.map((slot, idx) => (
          <button
            key={idx}
            className="slot-card"
            onClick={() => onSelect(slot)}
            disabled={loading}
          >
            <div className="slot-time">
              <div className="slot-time-label">Start</div>
              <div className="slot-time-value">{formatDateTime(slot.startsAt)}</div>
            </div>
            <div className="slot-divider" />
            <div className="slot-details">
              <div className="slot-detail-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span><strong>{slot.technician.name}</strong></span>
                <div className="cert-tags">
                  {slot.technician.certifications.map(c => (
                    <span key={c} className="badge badge-blue">{c}</span>
                  ))}
                </div>
              </div>
              <div className="slot-detail-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span>Bay {slot.serviceBay.bayNumber} — {BAY_LABELS[slot.serviceBay.bayType]}</span>
              </div>
            </div>
            <div className="slot-action">
              {loading ? <div className="spinner-sm" /> : 'Select →'}
            </div>
          </button>
        ))}
      </div>

      <div className="step-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}
