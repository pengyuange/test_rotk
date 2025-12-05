import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pedometer } from "expo-sensors";
import { Platform } from "react-native";

const DAILY_GOAL_KEY = "daily_step_goal";
const DEFAULT_GOAL = 8000;

interface StepData {
  steps: number;
  calories: number;
  distance: number;
  goalPercentage: number;
}

export const [StepProvider, useStepSettings] = createContextHook(() => {
  const [dailyGoal, setDailyGoalState] = useState<number>(DEFAULT_GOAL);
  const [stepData, setStepData] = useState<StepData>({
    steps: 0,
    calories: 0,
    distance: 0,
    goalPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

  useEffect(() => {
    loadDailyGoal();
    checkPedometerAvailability();
  }, []);

  useEffect(() => {
    if (isPedometerAvailable && Platform.OS !== "web") {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      Pedometer.getStepCountAsync(start, end)
        .then((result) => {
          updateStepData(result.steps, dailyGoal);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error getting step count:", error);
          setIsLoading(false);
        });

      const subscription = Pedometer.watchStepCount((result) => {
        updateStepData(result.steps, dailyGoal);
      });

      return () => subscription && subscription.remove();
    } else {
      setIsLoading(false);
    }
  }, [isPedometerAvailable, dailyGoal]);

  const loadDailyGoal = async () => {
    try {
      const stored = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      if (stored) {
        setDailyGoalState(parseInt(stored));
      }
    } catch (error) {
      console.error("Failed to load daily goal:", error);
    }
  };

  const setDailyGoal = async (goal: number) => {
    try {
      await AsyncStorage.setItem(DAILY_GOAL_KEY, goal.toString());
      setDailyGoalState(goal);
      updateStepData(stepData.steps, goal);
    } catch (error) {
      console.error("Failed to save daily goal:", error);
    }
  };

  const checkPedometerAvailability = async () => {
    if (Platform.OS === "web") {
      setIsPedometerAvailable(false);
      return;
    }

    try {
      const available = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(available);
      if (!available) {
        console.log("Pedometer not available on this device");
      }
    } catch (error) {
      console.error("Error checking pedometer availability:", error);
      setIsPedometerAvailable(false);
    }
  };



  const updateStepData = (steps: number, goal: number) => {
    const calories = Math.round(steps * 0.04);
    const distance = (steps * 0.7) / 1000;
    const goalPercentage = Math.min((steps / goal) * 100, 100);

    setStepData({
      steps,
      calories,
      distance: parseFloat(distance.toFixed(2)),
      goalPercentage,
    });
  };

  return {
    dailyGoal,
    setDailyGoal,
    stepData,
    isLoading,
    isPedometerAvailable,
  };
});
