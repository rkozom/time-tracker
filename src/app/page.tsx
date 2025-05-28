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

  const isPaused = !isRunning && timerSeconds > 0 && (currentActivityName !== '' || pausedActivityName !== '');

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
    if (isPaused && newName !== pausedActivityName) {
      // If activity is paused and user types a *new* name, reset the timer for the new activity
      setTimerSeconds(0);

      toast({
        title: "Сброс таймера для текущей активности",
        description: `Таймер для "${pausedActivityName}" был очищен.`,
      });
      setPausedActivityName('');
    }
    setCurrentActivityName(newName);
  };

  const handleStartTimer = () => {
    const activityToStart = currentActivityName.trim();
    if (!activityToStart) {
      toast({
        title: "Требуется название активности",
        description: "Введите, пожалуйста, название активности для запуска таймера.",
        variant: "destructive",
      });
      return;
    }
    setIsRunning(true);
    if (isPaused) { // Resuming
      if (activityToStart !== pausedActivityName) { // Resuming with a changed name (e.g. typed in input)
        setTimerSeconds(0); // Reset timer for new activity
        toast({
          title: "Запущена новая активность",
          description: `Таймер для "${pausedActivityName}" очищен. Стартует "${activityToStart}".`,
        });
      } else { // Resuming the same paused activity
         toast({
          title: "Активнось возобновлен",
          description: `"${activityToStart}" была возобновлена.`,
        });
      }
    } else { // Starting fresh
      setTimerSeconds(0); // Ensure timer is reset if it wasn't (e.g. after selecting suggestion/past activity)
      toast({
        title: "Activity Started",
        description: `"${activityToStart}" has started.`,
      });
    }
    
    // setSuggestedActivities([]); // Clear suggestions when timer starts/resumes
    setCurrentActivityName(activityToStart); // Ensure currentActivityName is the one running
    setPausedActivityName(activityToStart); // Store name in case of pause
  };

   const handlePauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      // pausedActivityName is already set by handleStartTimer or if activity name was changed while paused.
      // We rely on currentActivityName for the display if input is not disabled,
      // but pausedActivityName holds the true "paused" activity.
      const activityActuallyPaused = currentActivityName.trim() || pausedActivityName;
      setPausedActivityName(activityActuallyPaused); // Ensure it's set to what was running
      
      toast({
        title: "Пауза",
        description: `"${activityActuallyPaused}" приостановлена.`,
      });
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    setIsRunning(false);
    const activityToLog = (isPaused ? pausedActivityName : currentActivityName).trim();

    if (!activityToLog && timerSeconds === 0) {
      toast({
        title: "Нечего записывать",
        description: "Нет запущенной активности или активности на паузе.",
        variant: "default"
      });
      setCurrentActivityName('');
      setPausedActivityName('');
      setTimerSeconds(0);
      return;
    }
     if (!activityToLog && timerSeconds > 0) {
      toast({
        title: "Невозможно записать активность",
        description: "Не задано название активности для текущего таймера.",
        variant: "destructive"
      });
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityToLog,
      duration: timerSeconds,
    };
    setActivities((prevActivities) => [newActivity, ...prevActivities]);
    toast({
      title: "Активность завершена и записана",
      description: `Активность "${newActivity.name}" длилась ${timerSeconds} с.`,
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
    const activityThatWasReset = (isPaused ? pausedActivityName : currentActivityName).trim();
    const timeThatWasReset = timerSeconds;

    setIsRunning(false);
    setTimerSeconds(0);
    setCurrentActivityName(''); 
    setPausedActivityName('');

    if (activityThatWasReset || timeThatWasReset > 0) {
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
    const newActivitySelected = suggestion.trim();
    if (isPaused && newActivitySelected !== pausedActivityName) {
       toast({
        title: "Timer Reset for New Activity",
        description: `Paused timer for "${pausedActivityName}" was cleared. "${newActivitySelected}" is ready.`,
      });
       setPausedActivityName(''); // Clear paused name as it's being replaced
    } else if (isRunning && newActivitySelected !== currentActivityName) {
        toast({
            title: "Timer Reset for New Activity",
            description: `Timer for "${currentActivityName}" was cleared. "${newActivitySelected}" is ready.`,
        });
    }
    
    setCurrentActivityName(newActivitySelected);
    // setSuggestedActivities([]); 
    setTimerSeconds(0); 
    setIsRunning(false);
    setPausedActivityName(''); // Ensure paused state is clean for the new activity
  };
  
  const handleSelectPastActivity = (activityName: string) => {
    const selected = activityName.trim();
    if (isRunning || isPaused) {
        const currentActiveOrPausedActivity = (isRunning ? currentActivityName : pausedActivityName).trim();
        if (currentActiveOrPausedActivity && currentActiveOrPausedActivity !== selected) {
            toast({
                title: "Сброс текущего таймера",
                description: `Таймер для "${currentActiveOrPausedActivity}" был сброшен. "${selected}"  готова к запуску.`,
            });
        } else if (!currentActiveOrPausedActivity) {
             toast({
                title: "Активность выбрана",
                description: `"${selected}" готова к запуску.`,
            });
        }
    } else {
        toast({
            title: "Активность выбрана",
            description: `"${selected}" готова к запуску.`,
        });
    }

    setCurrentActivityName(selected);
    setTimerSeconds(0);
    setIsRunning(false);
    setPausedActivityName('');
    // setSuggestedActivities([]);
  };

  const activityPlaceholder = isRunning 
    ? `Время: ${currentActivityName.trim() || 'Без названия'}`
    : isPaused 
    ? `Пауза: ${pausedActivityName.trim() || 'Без названия'}`
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
            disabled={isRunning} // Only disable if truly running, not just paused
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
          isActivitySet={!!currentActivityName.trim() || !!pausedActivityName.trim() || timerSeconds > 0}
          currentActivityName={currentActivityName.trim()}
          pausedActivityName={pausedActivityName.trim()}
        />
        <ActivityList 
            activities={activities}
            onSelectActivity={handleSelectPastActivity}
        />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} @rkozom. Персональный трекер времени</p>
      </footer>
    </div>
  );
};

export default Home;
