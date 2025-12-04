import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FoodWithStatus } from '@/types/food';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleNotificationsForFoods(foods: FoodWithStatus[]) {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const expiringFoods = foods.filter(f => f.status === 'expiring');
  const expiredFoods = foods.filter(f => f.status === 'expired');

  if (expiringFoods.length > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ 食品即将过期',
        body: `你有 ${expiringFoods.length} 件食品即将过期，请尽快食用！`,
        data: { type: 'expiring', count: expiringFoods.length },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }

  if (expiredFoods.length > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 食品已过期',
        body: `你有 ${expiredFoods.length} 件食品已过期，请及时处理！`,
        data: { type: 'expired', count: expiredFoods.length },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  }
}
