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
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const { toast } = useToast();

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

  const handleStartTimer = () => {
    if (!currentActivityName.trim()) {
      toast({
        title: "Activity Name Required",
        description: "Please enter an activity name to start the timer.",
        variant: "destructive",
      });
      return;
    }
    setIsRunning(true);
    // setSuggestedActivities([]); // Clear previous suggestions
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: currentActivityName.trim(),
      duration: timerSeconds,
    };
    setActivities((prevActivities) => [...prevActivities, newActivity]);
    toast({
      title: "Деятельность добавлена",
      description: `"${newActivity.name}" for ${timerSeconds}s.`,
    });
    
    const pastActivityNames = activities.map(act => act.name);
    // if(currentActivityName.trim()){
    //    fetchSuggestions(currentActivityName.trim(), pastActivityNames);
    // }

    setCurrentActivityName(''); // Ready for new activity
    // Timer will be reset by handleReset or when starting a new activity to 0
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(0);
    // setCurrentActivityName(''); // Optional: clear activity name on reset
    // setSuggestedActivities([]);
    if (currentActivityName.trim() || timerSeconds > 0) {
       toast({
        title: "Сброс таймера",
        description: "Таймер и текущая деятельность были сброшены",
      });
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setCurrentActivityName(suggestion);
    // setSuggestedActivities([]); // Clear suggestions once one is selected
    setTimerSeconds(0); // Reset timer for the new suggested activity
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 flex-grow flex flex-col items-center max-w-2xl pb-12">
        <TimerDisplay seconds={timerSeconds} />
        <div className="w-full mb-6">
          <ActivityInput
            value={currentActivityName}
            onChange={setCurrentActivityName}
            disabled={isRunning}
            placeholder={isRunning ? "Таймер запущен..." : "Над чем вы сейчас работаете?"}
          />
        </div>
        <TrackingControls
          isRunning={isRunning}
          onStart={handleStartTimer}
          onStop={handleStopTimer}
          onReset={handleResetTimer}
          isActivitySet={!!currentActivityName.trim() || timerSeconds > 0}
        />
        <ActivityList activities={activities} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Personal Time Tracker. @rkozom.</p>
      </footer>
    </div>
  );
};

export default Home;
