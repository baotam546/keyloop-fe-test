import { useState, useEffect, useRef } from 'react';

export function useCountdown(expiresAt: string, onExpired?: () => void): number {
  const calcRemaining = () => Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const [remaining, setRemaining] = useState(calcRemaining);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    setRemaining(calcRemaining());
    const interval = setInterval(() => {
      const secs = calcRemaining();
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(interval);
        onExpiredRef.current?.();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}
