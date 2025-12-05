import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { CheckInStatus, CheckInType, ReminderSettings } from './types';

const STORAGE_KEYS = {
  SETTINGS: 'reminder_settings',
  CHECK_IN: 'check_in_status',
} as const;

const DEFAULT_SETTINGS: ReminderSettings = {
  morningTime: { hour: 9, minute: 0 },
  eveningTime: { hour: 18, minute: 0 },
  activeDays: [1, 2, 3, 4, 5],
  enabled: true,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [ClockInProvider, useClockIn] = createContextHook(() => {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckInStatus>({
    date: new Date().toDateString(),
    morningChecked: false,
    eveningChecked: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [repeatTimers, setRepeatTimers] = useState<{
    morning?: NodeJS.Timeout;
    evening?: NodeJS.Timeout;
  }>({});

  useEffect(() => {
    loadData();
    setupNotifications();
    
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      const type = notification.request.content.data?.type as CheckInType | undefined;
      if (type) {
        startRepeatReminder(type);
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const type = response.notification.request.content.data?.type as CheckInType | undefined;
      if (type) {
        startRepeatReminder(type);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    if (todayCheckIn.date !== today) {
      setTodayCheckIn({
        date: today,
        morningChecked: false,
        eveningChecked: false,
      });
    }
  }, [todayCheckIn.date]);

  const saveCheckInStatus = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHECK_IN, JSON.stringify(todayCheckIn));
    } catch (error) {
      console.error('Failed to save check-in status:', error);
    }
  };

  useEffect(() => {
    saveCheckInStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayCheckIn]);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const scheduleNotifications = async () => {
    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) {
      return;
    }

    const now = new Date();
    const currentDay = now.getDay();

    if (!settings.activeDays.includes(currentDay)) {
      return;
    }

    const morningTrigger = new Date();
    morningTrigger.setHours(settings.morningTime.hour, settings.morningTime.minute, 0, 0);

    const eveningTrigger = new Date();
    eveningTrigger.setHours(settings.eveningTime.hour, settings.eveningTime.minute, 0, 0);

    if (morningTrigger > now && !todayCheckIn.morningChecked) {
      const secondsUntilMorning = Math.floor((morningTrigger.getTime() - now.getTime()) / 1000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '早班打卡提醒',
          body: '该打早班卡了！请打开应用确认打卡。',
          data: { type: 'morning' },
        },
        trigger: { seconds: secondsUntilMorning } as Notifications.TimeIntervalTriggerInput,
      });
    }

    if (eveningTrigger > now && !todayCheckIn.eveningChecked) {
      const secondsUntilEvening = Math.floor((eveningTrigger.getTime() - now.getTime()) / 1000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '晚班打卡提醒',
          body: '该打晚班卡了！请打开应用确认打卡。',
          data: { type: 'evening' },
        },
        trigger: { seconds: secondsUntilEvening } as Notifications.TimeIntervalTriggerInput,
      });
    }
  };

  useEffect(() => {
    saveSettings();
    scheduleNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, todayCheckIn.morningChecked, todayCheckIn.eveningChecked]);

  const setupNotifications = async () => {
    if (Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
      }
    }
  };

  const loadData = async () => {
    try {
      const [savedSettings, savedCheckIn] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CHECK_IN),
      ]);

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      if (savedCheckIn) {
        const parsed = JSON.parse(savedCheckIn);
        const today = new Date().toDateString();
        if (parsed.date === today) {
          setTodayCheckIn(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const checkIn = (type: CheckInType) => {
    setTodayCheckIn((prev) => ({
      ...prev,
      morningChecked: type === 'morning' ? true : prev.morningChecked,
      eveningChecked: type === 'evening' ? true : prev.eveningChecked,
    }));

    if (repeatTimers[type]) {
      clearInterval(repeatTimers[type]);
      setRepeatTimers((prev) => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
    }
  };

  const updateSettings = (newSettings: Partial<ReminderSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startRepeatReminder = (type: CheckInType) => {
    if (repeatTimers[type]) {
      return;
    }

    const timer = setInterval(() => {
      if (Platform.OS !== 'web') {
        Notifications.scheduleNotificationAsync({
          content: {
            title: type === 'morning' ? '早班打卡提醒' : '晚班打卡提醒',
            body: '您还未打卡！请打开应用确认打卡。',
            data: { type },
          },
          trigger: null,
        });
      }
    }, 2 * 60 * 1000);

    setRepeatTimers((prev) => ({ ...prev, [type]: timer }));
  };

  return {
    settings,
    todayCheckIn,
    isLoading,
    checkIn,
    updateSettings,
    startRepeatReminder,
  };
});
