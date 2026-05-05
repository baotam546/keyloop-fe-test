import { useCountdown } from '../hooks/useCountdown';

interface Props {
  expiresAt: string;
  onExpired: () => void;
}

export function HoldCountdown({ expiresAt, onExpired }: Props) {
  const remaining = useCountdown(expiresAt, onExpired);
  const isUrgent = remaining > 0 && remaining <= 10;
  const isExpired = remaining <= 0;

  return (
    <div className={`hold-countdown ${isUrgent ? 'urgent' : ''} ${isExpired ? 'expired' : ''}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {isExpired ? (
        <span>Hold expired — please select a new slot</span>
      ) : (
        <span>Slot held for <strong>{remaining}s</strong> — confirm before it expires</span>
      )}
    </div>
  );
}
