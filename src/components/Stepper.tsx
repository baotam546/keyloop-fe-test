import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingStep } from '../hooks/useBookingFlow';

const STEPS = [
  { label: 'Your Info', step: 0 },
  { label: 'Location',  step: 1 },
  { label: 'Vehicle',   step: 2 },
  { label: 'Service',   step: 3 },
  { label: 'Schedule',  step: 4 },
  { label: 'Review',    step: 5 },
];

interface Props { currentStep: BookingStep }

export function Stepper({ currentStep }: Props) {
  if (currentStep === 6) return null;

  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, idx) => {
        const isCompleted = currentStep > s.step;
        const isActive    = currentStep === s.step;
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className={cn(
                'size-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                isCompleted ? 'bg-foreground border-foreground text-background'
                : isActive  ? 'border-foreground text-foreground bg-background'
                :             'border-border text-muted-foreground'
              )}>
                {isCompleted ? <Check className="size-3" strokeWidth={3} /> : idx + 1}
              </div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap hidden sm:block',
                isActive    ? 'text-foreground'
                : isCompleted ? 'text-muted-foreground'
                :               'text-muted-foreground/50'
              )}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-2', isCompleted ? 'bg-foreground' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
