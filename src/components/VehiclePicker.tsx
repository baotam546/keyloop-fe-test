import { useState, useEffect } from 'react';
import type { Vehicle } from '../types/domain';

interface Props {
  loadVehicles: () => Promise<Vehicle[]>;
  onSelect: (v: Vehicle) => void;
  onBack: () => void;
}

export function VehiclePicker({ loadVehicles, onSelect, onBack }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading vehicles…</p></div>;

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Select Your Vehicle</h2>
        <p>Choose which vehicle needs service.</p>
      </div>
      <div className="card-grid">
        {vehicles.map(v => (
          <button key={v.id} className="picker-card" onClick={() => onSelect(v)}>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/>
                <circle cx="15.5" cy="17.5" r="2.5"/>
                <circle cx="4.5" cy="17.5" r="2.5"/>
              </svg>
            </div>
            <div className="card-body">
              <h3 className="card-title">{v.year} {v.make} {v.model}</h3>
              <p className="card-subtitle">VIN: {v.vin}</p>
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
