import { useState } from 'react';
import type { GuestCustomer } from '../types/domain';

interface Props {
  onSubmit: (info: GuestCustomer) => void;
}

export function CustomerInfoForm({ onSubmit }: Props) {
  const [form, setForm] = useState<GuestCustomer>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Partial<GuestCustomer>>({});

  const set = (field: keyof GuestCustomer, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const next: Partial<GuestCustomer> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.phone.trim()) next.phone = 'Phone is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

  return (
    <div className="picker-section">
      <div className="picker-header">
        <h2>Your Contact Info</h2>
        <p>We'll use this to confirm your appointment and send reminders.</p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="field-group">
          <label className="field-label">Full Name</label>
          <input
            className={`text-input${errors.name ? ' input-error' : ''}`}
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={e => set('name', e.target.value)}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="field-group" style={{ marginTop: '1rem' }}>
          <label className="field-label">Email</label>
          <input
            className={`text-input${errors.email ? ' input-error' : ''}`}
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field-group" style={{ marginTop: '1rem' }}>
          <label className="field-label">Phone</label>
          <input
            className={`text-input${errors.phone ? ' input-error' : ''}`}
            type="tel"
            placeholder="(555) 000-0000"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="step-actions">
        <div />
        <button className="btn btn-primary" onClick={handleSubmit}>
          Continue →
        </button>
      </div>
    </div>
  );
}
