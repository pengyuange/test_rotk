import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Food, FoodWithStatus, FoodStatus } from '@/types/food';

const STORAGE_KEY = '@fridge_foods';

function calculateFoodStatus(expiryDate: string): { status: FoodStatus; daysUntilExpiry: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let status: FoodStatus;
  if (diffDays < 0) {
    status = 'expired';
  } else if (diffDays <= 3) {
    status = 'expiring';
  } else {
    status = 'fresh';
  }
  
  return { status, daysUntilExpiry: diffDays };
}

export const [FoodProvider, useFoodContext] = createContextHook(() => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Food[];
        setFoods(parsed);
      }
    } catch (error) {
      console.error('Failed to load foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFoods = async (newFoods: Food[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFoods));
    } catch (error) {
      console.error('Failed to save foods:', error);
    }
  };

  const addFood = async (food: Omit<Food, 'id' | 'createdAt'>) => {
    const newFood: Food = {
      ...food,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...foods, newFood];
    setFoods(updated);
    await saveFoods(updated);
  };

  const deleteFood = async (id: string) => {
    const updated = foods.filter(f => f.id !== id);
    setFoods(updated);
    await saveFoods(updated);
  };

  const foodsWithStatus = useMemo<FoodWithStatus[]>(() => {
    return foods.map(food => {
      const { status, daysUntilExpiry } = calculateFoodStatus(food.expiryDate);
      return {
        ...food,
        status,
        daysUntilExpiry,
      };
    }).sort((a, b) => {
      if (a.status === b.status) {
        return a.daysUntilExpiry - b.daysUntilExpiry;
      }
      const statusOrder: Record<FoodStatus, number> = { expired: 0, expiring: 1, fresh: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [foods]);

  const stats = useMemo(() => {
    const fresh = foodsWithStatus.filter(f => f.status === 'fresh').length;
    const expiring = foodsWithStatus.filter(f => f.status === 'expiring').length;
    const expired = foodsWithStatus.filter(f => f.status === 'expired').length;
    return { fresh, expiring, expired };
  }, [foodsWithStatus]);

  return {
    foods: foodsWithStatus,
    isLoading,
    addFood,
    deleteFood,
    stats,
  };
});
