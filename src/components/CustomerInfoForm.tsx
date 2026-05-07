import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { GuestCustomer } from '../types/domain';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';

interface Props {
  onSubmit: (info: GuestCustomer) => void;
}

export function CustomerInfoForm({ onSubmit }: Props) {
  const [form, setForm]   = useState<GuestCustomer>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Partial<GuestCustomer>>({});

  const set = (field: keyof GuestCustomer, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const next: Partial<GuestCustomer> = {};
    if (!form.name.trim())  next.name  = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.phone.trim()) next.phone = 'Phone is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Your Contact Info</h2>
        <p className="text-sm text-muted-foreground mt-1">We'll use this to confirm your appointment.</p>
      </div>

      <Card>
        <CardContent className="pt-6 grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="ci-name">Full Name</Label>
            <Input
              id="ci-name"
              placeholder="Jane Smith"
              value={form.name}
              aria-invalid={!!errors.name}
              onChange={e => set('name', e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ci-email">Email</Label>
              <Input
                id="ci-email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                aria-invalid={!!errors.email}
                onChange={e => set('email', e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ci-phone">Phone</Label>
              <Input
                id="ci-phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                aria-invalid={!!errors.phone}
                onChange={e => set('phone', e.target.value)}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={() => { if (validate()) onSubmit(form); }}>
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
