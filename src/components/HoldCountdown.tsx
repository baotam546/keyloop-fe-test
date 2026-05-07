import { Timer } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { Alert, AlertDescription } from './ui/alert';

interface Props {
  expiresAt: string;
  onExpired: () => void;
}

export function HoldCountdown({ expiresAt, onExpired }: Props) {
  const remaining = useCountdown(expiresAt, onExpired);
  const isUrgent  = remaining > 0 && remaining <= 10;
  const isExpired = remaining <= 0;

  const variant = isExpired ? 'destructive' : isUrgent ? 'warning' : 'success';

  return (
    <Alert variant={variant}>
      <Timer />
      <AlertDescription>
        {isExpired
          ? 'Hold expired — please select a new time.'
          : <span>Slot held for <strong>{remaining}s</strong> — confirm before it expires.</span>
        }
      </AlertDescription>
    </Alert>
  );
}
