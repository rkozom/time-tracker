import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TrackingControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  isActivitySet: boolean;
}

export const TrackingControls: FC<TrackingControlsProps> = ({ isRunning, onStart, onStop, onReset, isActivitySet }) => {
  return (
    <div className="flex justify-center space-x-4 my-8">
      {!isRunning ? (
        <Button
          onClick={onStart}
          disabled={!isActivitySet}
          className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md"
          aria-label="Start timer"
        >
          <Play className="mr-2 h-5 w-5" /> Start
        </Button>
      ) : (
        <Button
          onClick={onStop}
          variant="destructive"
          className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md"
          aria-label="Stop timer"
        >
          <Pause className="mr-2 h-5 w-5" /> Stop
        </Button>
      )}
      <Button
        onClick={onReset}
        variant="outline"
        className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10 rounded-md shadow-md"
        aria-label="Reset timer"
        disabled={!isRunning && !isActivitySet} // Disable if not running AND no activity set or timer isn't 0
      >
        <RotateCcw className="mr-2 h-5 w-5" /> Reset
      </Button>
    </div>
  );
};
