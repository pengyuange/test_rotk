import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export interface CountdownEvent {
  id: string;
  title: string;
  date: string;
  isPast: boolean;
  color: string;
  syncedToCalendar: boolean;
  calendarEventId?: string;
}

const STORAGE_KEY = '@countdown_events';

const DEFAULT_FUTURE_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFA500', '#FFD93D', '#FF69B4',
];

const DEFAULT_PAST_COLORS = [
  '#6C5CE7', '#74B9FF', '#00B894', '#55EFC4', '#A29BFE',
];

export const [CountdownProvider, useCountdown] = createContextHook(() => {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [defaultCalendarId, setDefaultCalendarId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ['countdown_events'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Failed to load events:', error);
        return [];
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (events: CountdownEvent[]) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        return events;
      } catch (error) {
        console.error('Failed to save events:', error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data);
    }
  }, [eventsQuery.data]);

  useEffect(() => {
    initializeCalendar();
  }, []);

  const initializeCalendar = async () => {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        if (Platform.OS === 'ios') {
          const defaultCalendar = await Calendar.getDefaultCalendarAsync();
          setDefaultCalendarId(defaultCalendar.id);
        } else {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const primaryCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
          if (primaryCalendar) {
            setDefaultCalendarId(primaryCalendar.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize calendar:', error);
    }
  };

  const syncEventToCalendar = async (event: CountdownEvent): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' || !defaultCalendarId) {
        return null;
      }

      const { status } = await Calendar.getCalendarPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const eventDate = new Date(event.date);
      const endDate = new Date(eventDate);
      endDate.setHours(23, 59, 59);

      const calendarEventId = await Calendar.createEventAsync(defaultCalendarId, {
        title: event.title,
        startDate: eventDate,
        endDate: endDate,
        allDay: true,
        notes: '由倒数日应用创建',
      });

      return calendarEventId;
    } catch (error) {
      console.error('Failed to sync event to calendar:', error);
      return null;
    }
  };

  const unsyncEventFromCalendar = async (calendarEventId: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        return false;
      }

      const { status } = await Calendar.getCalendarPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      await Calendar.deleteEventAsync(calendarEventId, {});
      return true;
    } catch (error) {
      console.error('Failed to unsync event from calendar:', error);
      return false;
    }
  };

  const addEvent = (title: string, date: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const isPast = targetDate < now;
    const colorArray = isPast ? DEFAULT_PAST_COLORS : DEFAULT_FUTURE_COLORS;
    const color = colorArray[Math.floor(Math.random() * colorArray.length)];

    const newEvent: CountdownEvent = {
      id: Date.now().toString(),
      title,
      date: date.toISOString(),
      isPast,
      color,
      syncedToCalendar: false,
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    saveMutation.mutate(updated);
    
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CountdownEvent>) => {
    const updated = events.map((event) =>
      event.id === id ? { ...event, ...updates } : event
    );
    setEvents(updated);
    saveMutation.mutate(updated);
  };

  const deleteEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event?.syncedToCalendar && event.calendarEventId) {
      await unsyncEventFromCalendar(event.calendarEventId);
    }
    
    const updated = events.filter((event) => event.id !== id);
    setEvents(updated);
    saveMutation.mutate(updated);
  };

  const toggleCalendarSync = async (id: string): Promise<boolean> => {
    const event = events.find(e => e.id === id);
    if (!event) return false;

    if (event.syncedToCalendar && event.calendarEventId) {
      const success = await unsyncEventFromCalendar(event.calendarEventId);
      if (success) {
        updateEvent(id, { syncedToCalendar: false, calendarEventId: undefined });
        return true;
      }
    } else {
      const calendarEventId = await syncEventToCalendar(event);
      if (calendarEventId) {
        updateEvent(id, { syncedToCalendar: true, calendarEventId });
        return true;
      }
    }

    return false;
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  }, [events]);

  const calculateDaysFrom = (dateString: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return {
    events: sortedEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleCalendarSync,
    calculateDaysFrom,
    isLoading: eventsQuery.isLoading,
    isSaving: saveMutation.isPending,
    hasCalendarPermission: defaultCalendarId !== null,
  };
});
