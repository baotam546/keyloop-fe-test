import { useState, useEffect } from 'react';
import { Wrench, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import type { ServiceType } from '../types/domain';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const BAY_LABEL: Record<string, string> = { lift: 'Lift Bay', flat: 'Flat Bay', paint: 'Paint Bay' };

interface Props {
  loadServiceTypes: () => Promise<ServiceType[]>;
  onSelect: (st: ServiceType) => void;
  onBack: () => void;
}

export function ServiceTypePicker({ loadServiceTypes, onSelect, onBack }: Props) {
  const [types,   setTypes]   = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceTypes().then(data => { setTypes(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <p className="text-sm">Loading services…</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Select a Service</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose the type of service your vehicle needs.</p>
      </div>

      <div className="flex flex-col gap-3">
        {types.map(st => (
          <button
            key={st.id}
            className="group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
            onClick={() => onSelect(st)}
          >
            <div className="mt-0.5 flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <Wrench className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{st.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{st.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" /> {st.estimatedDurationMin} min
                </Badge>
                <Badge variant="outline">{BAY_LABEL[st.requiredBayType]}</Badge>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>

      <div>
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="size-4" /> Back</Button>
      </div>
    </div>
  );
}
