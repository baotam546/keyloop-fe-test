import { useState, useEffect } from 'react';
import { Car, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import type { Vehicle } from '../types/domain';
import { uid } from '../utils/time';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';

interface Props {
  loadVehicles: () => Promise<Vehicle[]>;
  onSelect: (v: Vehicle) => void;
  onBack: () => void;
}

interface CustomForm { year: string; make: string; model: string; vin: string }
const emptyForm: CustomForm = { year: '', make: '', model: '', vin: '' };

export function VehiclePicker({ loadVehicles, onSelect, onBack }: Props) {
  const [vehicles,       setVehicles]       = useState<Vehicle[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [form,           setForm]           = useState<CustomForm>(emptyForm);
  const [errors,         setErrors]         = useState<Partial<CustomForm>>({});

  useEffect(() => {
    loadVehicles().then(data => { setVehicles(data); setLoading(false); });
  }, []);

  const setField = (field: keyof CustomForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const submitCustom = () => {
    const next: Partial<CustomForm> = {};
    if (!form.year.trim() || isNaN(Number(form.year))) next.year = 'Valid year required';
    if (!form.make.trim())  next.make  = 'Make is required';
    if (!form.model.trim()) next.model = 'Model is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSelect({ id: `custom-${uid()}`, customerId: '', vin: form.vin.trim(), make: form.make.trim(), model: form.model.trim(), year: Number(form.year) });
  };

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <p className="text-sm">Loading vehicles…</p>
    </div>
  );

  if (showCustomForm) return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Enter Your Vehicle</h2>
        <p className="text-sm text-muted-foreground mt-1">Fill in your vehicle details below.</p>
      </div>

      <Card>
        <CardContent className="pt-6 grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="v-year">Year</Label>
              <Input id="v-year" type="number" placeholder="2020" min="1900" max={new Date().getFullYear() + 1}
                value={form.year} aria-invalid={!!errors.year} onChange={e => setField('year', e.target.value)} />
              {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="v-make">Make</Label>
              <Input id="v-make" placeholder="Toyota"
                value={form.make} aria-invalid={!!errors.make} onChange={e => setField('make', e.target.value)} />
              {errors.make && <p className="text-xs text-destructive">{errors.make}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="v-model">Model</Label>
              <Input id="v-model" placeholder="Camry"
                value={form.model} aria-invalid={!!errors.model} onChange={e => setField('model', e.target.value)} />
              {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="v-vin">VIN <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="v-vin" placeholder="1HGCM82633A…"
                value={form.vin} onChange={e => setField('vin', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => { setShowCustomForm(false); setForm(emptyForm); setErrors({}); }}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button onClick={submitCustom}>Use This Vehicle <ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Select Your Vehicle</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose which vehicle needs service.</p>
      </div>

      <div className="flex flex-col gap-3">
        {vehicles.map(v => (
          <button
            key={v.id}
            className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
            onClick={() => onSelect(v)}
          >
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <Car className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{v.year} {v.make} {v.model}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">VIN: {v.vin}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
          </button>
        ))}

        <button
          className="group flex w-full items-center gap-4 rounded-xl border border-dashed border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-accent/30"
          onClick={() => setShowCustomForm(true)}
        >
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <Plus className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Other Vehicle</p>
            <p className="text-sm text-muted-foreground mt-0.5">Enter your vehicle details manually</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
        </button>
      </div>

      <div>
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="size-4" /> Back</Button>
      </div>
    </div>
  );
}
