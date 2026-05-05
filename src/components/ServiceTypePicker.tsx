import { useState, useEffect } from 'react';
import type { ServiceType } from '../types/domain';

const BAY_LABELS: Record<string, string> = {
  lift: 'Lift Bay',
  flat: 'Flat Bay',
  paint: 'Paint Bay',
};

const BAY_COLORS: Record<string, string> = {
  lift: 'badge-green',
  flat: 'badge-blue',
  paint: 'badge-purple',
};

interface Props {
  loadServiceTypes: () => Promise<ServiceType[]>;
  onSelect: (st: ServiceType) => void;
  onBack: () => void;
}

export function ServiceTypePicker({ loadServiceTypes, onSelect, onBack }: Props) {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceTypes().then(data => {
      setTypes(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading services…</p></div>;

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Select a Service</h2>
        <p>Choose the type of service your vehicle needs.</p>
      </div>
      <div className="card-grid">
        {types.map(st => (
          <button key={st.id} className="picker-card" onClick={() => onSelect(st)}>
            <div className="card-body" style={{ flex: 1 }}>
              <h3 className="card-title">{st.name}</h3>
              <p className="card-subtitle">{st.description}</p>
              <div className="card-meta">
                <span className="badge badge-orange">⏱ {st.estimatedDurationMin} min</span>
                <span className={`badge ${BAY_COLORS[st.requiredBayType]}`}>{BAY_LABELS[st.requiredBayType]}</span>
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
