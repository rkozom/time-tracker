import type { FC } from 'react';
import { formatDuration } from '@/lib/utils';

interface TimerDisplayProps {
  seconds: number;
}

export const TimerDisplay: FC<TimerDisplayProps> = ({ seconds }) => {
  return (
    <div className="text-7xl font-mono font-bold text-center text-foreground my-8 p-6 bg-card rounded-lg shadow-lg">
      {formatDuration(seconds)}
    </div>
  );
};