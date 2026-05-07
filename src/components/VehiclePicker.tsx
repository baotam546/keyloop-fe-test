import { useState, useEffect } from 'react';
import type { Vehicle } from '../types/domain';
import { uid } from '../utils/time';

interface Props {
  loadVehicles: () => Promise<Vehicle[]>;
  onSelect: (v: Vehicle) => void;
  onBack: () => void;
}

interface CustomForm {
  year: string;
  make: string;
  model: string;
  vin: string;
}

const emptyForm: CustomForm = { year: '', make: '', model: '', vin: '' };

export function VehiclePicker({ loadVehicles, onSelect, onBack }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [form, setForm] = useState<CustomForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<CustomForm>>({});

  useEffect(() => {
    loadVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const setField = (field: keyof CustomForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateAndSubmit = () => {
    const next: Partial<CustomForm> = {};
    if (!form.year.trim() || isNaN(Number(form.year))) next.year = 'Valid year required';
    if (!form.make.trim()) next.make = 'Make is required';
    if (!form.model.trim()) next.model = 'Model is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const custom: Vehicle = {
      id: `custom-${uid()}`,
      customerId: '',
      vin: form.vin.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
    };
    onSelect(custom);
  };

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading vehicles…</p></div>;

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Select Your Vehicle</h2>
        <p>Choose an existing vehicle or enter a different one.</p>
      </div>

      {!showCustomForm ? (
        <>
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

            <button className="picker-card picker-card-other" onClick={() => setShowCustomForm(true)}>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </div>
              <div className="card-body">
                <h3 className="card-title">Other Vehicle</h3>
                <p className="card-subtitle">Enter your vehicle details manually</p>
              </div>
              <div className="card-arrow">→</div>
            </button>
          </div>

          <div className="step-actions">
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          </div>
        </>
      ) : (
        <>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field-group">
                <label className="field-label">Year</label>
                <input
                  className={`text-input${errors.year ? ' input-error' : ''}`}
                  type="number"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={e => setField('year', e.target.value)}
                />
                {errors.year && <span className="field-error">{errors.year}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Make</label>
                <input
                  className={`text-input${errors.make ? ' input-error' : ''}`}
                  type="text"
                  placeholder="Toyota"
                  value={form.make}
                  onChange={e => setField('make', e.target.value)}
                />
                {errors.make && <span className="field-error">{errors.make}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="field-group">
                <label className="field-label">Model</label>
                <input
                  className={`text-input${errors.model ? ' input-error' : ''}`}
                  type="text"
                  placeholder="Camry"
                  value={form.model}
                  onChange={e => setField('model', e.target.value)}
                />
                {errors.model && <span className="field-error">{errors.model}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">VIN <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                <input
                  className="text-input"
                  type="text"
                  placeholder="1HGCM82633A123456"
                  value={form.vin}
                  onChange={e => setField('vin', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => { setShowCustomForm(false); setForm(emptyForm); setErrors({}); }}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={validateAndSubmit}>
              Use This Vehicle →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
