'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { AppHeader } from '@/components/app/header';
import { TimerDisplay } from '@/components/app/timer-display';
import { ActivityInput } from '@/components/app/activity-input';
import { TrackingControls } from '@/components/app/tracking-controls';
//import { ActivitySuggestions } from '@/components/app/activity-suggestions';
import { ActivityList } from '@/components/app/activity-list';
import type { Activity } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
//import { suggestSimilarActivities } from '@/ai/flows/suggest-activity';
import { Button } from '@/components/ui/button'; // For potential future use

const LOCAL_STORAGE_KEY = 'chronoFlowActivities';

const Home: FC = () => {
  const [currentActivityName, setCurrentActivityName] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  //const [suggestedActivities, setSuggestedActivities] = useState<string[]>([]);
  //const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [pausedActivityName, setPausedActivityName] = useState<string>(''); // To store name of activity when paused

  const { toast } = useToast();

  const isPaused = !isRunning && timerSeconds > 0 && currentActivityName !== '';

  // Load activities from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedActivities = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedActivities) {
        try {
          setActivities(JSON.parse(storedActivities));
        } catch (error) {
          console.error("Failed to parse activities from localStorage", error);
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
        }
      }
      setIsInitialLoad(false);
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialLoad) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activities));
    }
  }, [activities, isInitialLoad]);

  // Timer logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimerSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  // const fetchSuggestions = useCallback(async (activityName: string, pastActivities: string[]) => {
  //   if (!activityName) return;
  //   setIsLoadingSuggestions(true);
  //   try {
  //     const result = await suggestSimilarActivities({ activity: activityName, pastActivities });
  //     setSuggestedActivities(result.suggestions || []);
  //   } catch (error) {
  //     console.error('Error fetching suggestions:', error);
  //     toast({
  //       title: "Suggestion Error",
  //       description: "Could not fetch activity suggestions.",
  //       variant: "destructive",
  //     });
  //     setSuggestedActivities([]);
  //   } finally {
  //     setIsLoadingSuggestions(false);
  //   }
  // }, [toast]);

  const handleActivityInputChange = (newName: string) => {
    if (isPaused && newName !== currentActivityName) {
      // If activity is paused and user types a *new* name, reset the timer for the new activity
      setTimerSeconds(0);
      setPausedActivityName('');
      toast({
        title: "Сброс таймера для текущей активности",
        description: `Таймер для "${currentActivityName}" был очищен.`,
      });
    }
    setCurrentActivityName(newName);
  };

  const handleStartTimer = () => {
    if (!currentActivityName.trim()) {
      toast({
        title: "Требуется название активности",
        description: "Введите, пожалуйста, название активности для запуска таймера.",
        variant: "destructive",
      });
      return;
    }
    setIsRunning(true);
    // setSuggestedActivities([]); // Clear previous suggestions
    if (isPaused && currentActivityName !== pausedActivityName) {
      // If resuming and activity name changed via input somehow (defensive)
      setTimerSeconds(0); 
    }
    setPausedActivityName(currentActivityName); // Store name in case of pause
  };

   const handlePauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setPausedActivityName(currentActivityName); // Ensure paused name is set
      toast({
        title: "Пауза",
        description: `"${currentActivityName}" приостановлена.`,
      });
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
        const activityToLog = isPaused ? pausedActivityName : currentActivityName;

    if (!activityToLog.trim() && timerSeconds === 0) {
      toast({
        title: "Нечего останавливать",
        description: "Нет запущенной или приостановленной активности.",
        variant: "default"
      });
      return;
    }
    if (!activityToLog.trim() && timerSeconds > 0) {
      toast({
        title: "Невозможно записать активность",
        description: "Для текущего таймера не задано название активности",
        variant: "destructive"
      });
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityToLog.trim(),
      duration: timerSeconds,
    };
    setActivities((prevActivities) => [...prevActivities, newActivity]);
    toast({
      title: "Активность записана",
      description: `"${newActivity.name}" for ${timerSeconds}s.`,
    });
    
    // const pastActivityNames = activities.map(act => act.name);
    // if(activityToLog.trim()){
    //    fetchSuggestions(activityToLog.trim(), pastActivityNames);
    // }

    setCurrentActivityName('');
    setPausedActivityName('');
    setTimerSeconds(0); // Reset timer after stopping
  };

  const handleResetTimer = () => {
    const activityThatWasReset = isPaused ? pausedActivityName : currentActivityName;
    const timeThatWasReset = timerSeconds;

    setIsRunning(false);
    setTimerSeconds(0);
    setCurrentActivityName(''); 
    setPausedActivityName('');

    if (activityThatWasReset.trim() || timeThatWasReset > 0) {
       toast({
        title: "Сборос таймера",
        description: `Таймер для "${activityThatWasReset}" был сброшен.`,
      });
    } else {
        toast({
            title: "Сброс таймера",
            description: "Таймер очищен.",
        });
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (isPaused && suggestion !== currentActivityName) {
       toast({
        title: "Timer Reset for New Activity",
        description: `Paused timer for "${currentActivityName}" was cleared. Starting "${suggestion}".`,
      });
    }
    setCurrentActivityName(suggestion);
    setTimerSeconds(0); 
    setIsRunning(false); // Ensure not running if a suggestion is selected
    setPausedActivityName('');
  };
  
  const activityPlaceholder = isRunning 
    ? "Таймер запущен..." 
    : isPaused 
    ? `Пауза: ${pausedActivityName || currentActivityName}` 
    : "Над чем вы работаете?";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 flex-grow flex flex-col items-center max-w-2xl pb-12">
        <TimerDisplay seconds={timerSeconds} />
        <div className="w-full mb-6">
          <ActivityInput
            value={currentActivityName}
            onChange={handleActivityInputChange}
            disabled={isRunning}
            placeholder={activityPlaceholder}
          />
        </div>
        <TrackingControls
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={handleStartTimer}
          onPause={handlePauseTimer}
          onStop={handleStopTimer}
          onReset={handleResetTimer}
          isActivitySet={!!currentActivityName.trim() || timerSeconds > 0}
          currentActivityName={currentActivityName}
        />
        {/* <ActivitySuggestions
          suggestions={suggestedActivities}
          onSelect={handleSelectSuggestion}
          isLoading={isLoadingSuggestions}
        /> */}
        <ActivityList activities={activities} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} @rkozom. Time Tracker</p>
      </footer>
    </div>
  );
};

export default Home;
