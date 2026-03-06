import { useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ExamTimerProps {
  totalSeconds: number;
  initialSecondsLeft?: number;
  onExpire: () => void;
}

export function ExamTimer({ totalSeconds, initialSecondsLeft, onExpire }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    () => initialSecondsLeft ?? totalSeconds,
  );
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft < 300; // < 5 minutes

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full font-mono font-semibold text-sm md:text-base transition-colors',
        isWarning
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-brand-light text-brand-dark border border-brand-secondary/30'
      )}
    >
      <Timer className={cn('h-4 w-4', isWarning ? 'text-red-500' : 'text-brand-primary')} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
