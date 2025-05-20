
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Square } from 'lucide-react';

interface TrackingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  isActivitySet: boolean; // True if activity name is set OR timerSeconds > 0
  currentActivityName: string; // To enable/disable start/resume correctly
}

export const TrackingControls: FC<TrackingControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  isActivitySet,
  currentActivityName,
}) => {
  const canStart = !!currentActivityName.trim();

  return (
    <div className="flex justify-center space-x-4 my-8">
      {!isRunning && !isPaused && (
        <Button
          onClick={onStart}
          disabled={!canStart}
          className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md"
          aria-label="Start timer"
        >
          <Play className="mr-2 h-5 w-5" /> Start
        </Button>
      )}

      {isPaused && (
        <Button
          onClick={onStart} // onStart handles resume logic
          disabled={!canStart} // Should be able to resume if activity name exists
          className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md"
          aria-label="Resume timer"
        >
          <Play className="mr-2 h-5 w-5" /> Resume
        </Button>
      )}

      {isRunning && (
        <Button
          onClick={onPause}
          className="px-8 py-6 text-lg bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-md"
          aria-label="Pause timer"
        >
          <Pause className="mr-2 h-5 w-5" /> Pause
        </Button>
      )}
      
      {(isRunning || isPaused) && (
         <Button
            onClick={onStop}
            variant="destructive"
            className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md"
            aria-label="Stop timer"
          >
            <Square className="mr-2 h-5 w-5" /> Stop
        </Button>
      )}

      <Button
        onClick={onReset}
        variant="outline"
        className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10 rounded-md shadow-md"
        aria-label="Reset timer"
        disabled={!isRunning && !isActivitySet}
      >
        <RotateCcw className="mr-2 h-5 w-5" /> Reset
      </Button>
    </div>
  );
};
