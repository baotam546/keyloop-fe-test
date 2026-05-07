import { useState, useEffect } from 'react';
import type { Dealership } from '../types/domain';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatHours(h: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h;
  return `${hour}:00 ${period}`;
}

interface Props {
  loadDealerships: () => Promise<Dealership[]>;
  onSelect: (d: Dealership) => void;
  onBack: () => void;
}

export function DealershipPicker({ loadDealerships, onSelect, onBack }: Props) {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDealerships().then(data => {
      setDealerships(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading locations…</p></div>;

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Choose a Dealership</h2>
        <p>Select the service location for your appointment.</p>
      </div>
      <div className="card-grid">
        {dealerships.map(d => (
          <button key={d.id} className="picker-card" onClick={() => onSelect(d)}>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="card-body">
              <h3 className="card-title">{d.name}</h3>
              <p className="card-subtitle">{d.address}, {d.city}</p>
              <div className="card-meta">
                <span className="badge badge-blue">
                  {d.openingHours.daysOfWeek.map(n => DAY_NAMES[n]).join(', ')}
                </span>
                <span className="card-hours">
                  {formatHours(d.openingHours.startHour)} – {formatHours(d.openingHours.endHour)}
                </span>
              </div>
            </div>
            <div className="card-arrow">→</div>
          </button>
        ))}
      </div>
      <div className="step-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}
