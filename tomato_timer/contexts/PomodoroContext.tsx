import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

const POMODORO_DURATION = 25 * 60;
const STORAGE_KEY = 'pomodoro_records';

interface PomodoroRecord {
  date: string;
  count: number;
}

const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const loadTodayCount = async (setTodayCount: (count: number) => void) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const records: PomodoroRecord[] = JSON.parse(stored);
      const todayString = getTodayString();
      const todayRecord = records.find(r => r.date === todayString);
      setTodayCount(todayRecord?.count || 0);
    }
  } catch (error) {
    console.error('Failed to load pomodoro count:', error);
  }
};

const incrementTodayCount = async (setTodayCount: (count: number) => void) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let records: PomodoroRecord[] = stored ? JSON.parse(stored) : [];
    const todayString = getTodayString();
    
    const todayIndex = records.findIndex(r => r.date === todayString);
    if (todayIndex >= 0) {
      records[todayIndex].count += 1;
    } else {
      records.push({ date: todayString, count: 1 });
    }

    records = records.filter(r => {
      const recordDate = new Date(r.date);
      const daysDiff = (Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < 30;
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    setTodayCount(records.find(r => r.date === todayString)?.count || 0);
  } catch (error) {
    console.error('Failed to save pomodoro count:', error);
  }
};

export const [PomodoroProvider, usePomodoro] = createContextHook(() => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    loadTodayCount(setTodayCount);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const start = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(POMODORO_DURATION);
  };

  const complete = () => {
    incrementTodayCount(setTodayCount);
    reset();
  };

  const progress = 1 - (timeLeft / POMODORO_DURATION);

  return {
    timeLeft,
    isRunning,
    todayCount,
    progress,
    start,
    pause,
    reset,
    complete,
  };
});
