import type { BookingStep } from '../hooks/useBookingFlow';

const STEPS = [
  { label: 'Your Info', steps: [0] },
  { label: 'Location', steps: [1] },
  { label: 'Vehicle', steps: [2] },
  { label: 'Service', steps: [3] },
  { label: 'Schedule', steps: [4] },
  { label: 'Review', steps: [5] },
];

interface Props {
  currentStep: BookingStep;
}

export function Stepper({ currentStep }: Props) {
  if (currentStep === 6) return null;

  return (
    <div className="stepper">
      {STEPS.map((s, idx) => {
        const isActive = s.steps.includes(currentStep);
        const isCompleted = s.steps[s.steps.length - 1] < currentStep;
        return (
          <div key={s.label} className="stepper-item">
            <div className={`stepper-circle ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>
            <span className={`stepper-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
