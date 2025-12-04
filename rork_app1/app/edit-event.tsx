import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Trash2, Cloud } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useCountdown } from '@/contexts/CountdownContext';
import * as Haptics from 'expo-haptics';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, updateEvent, deleteEvent, toggleCalendarSync, hasCalendarPermission } = useCountdown();
  
  const event = events.find(e => e.id === id);
  
  const [title, setTitle] = useState<string>(event?.title || '');
  const [date, setDate] = useState<Date>(event ? new Date(event.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(event?.syncedToCalendar || false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(new Date(event.date));
      setIsSynced(event.syncedToCalendar);
    }
  }, [event]);

  if (!event) {
    return null;
  }

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const isPast = targetDate < now;

    updateEvent(id, {
      title: title.trim(),
      date: date.toISOString(),
      isPast,
    });
    
    router.back();
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (confirm('确定要删除这个倒数日吗？')) {
        deleteEvent(id);
        router.back();
      }
    } else {
      Alert.alert(
        '删除倒数日',
        '确定要删除这个倒数日吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              deleteEvent(id);
              router.back();
            },
          },
        ]
      );
    }
  };

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#F8F9FA', '#E9ECEF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>标题</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="例如：春节、生日、纪念日..."
            placeholderTextColor="#9CA3AF"
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>日期</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowDatePicker(true);
            }}
          >
            <Calendar size={20} color="#6366F1" strokeWidth={2} />
            <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
        </View>

        {(showDatePicker || Platform.OS === 'ios') && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              textColor="#1F2937"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              title.trim()
                ? ['#6366F1', '#8B5CF6']
                : ['#D1D5DB', '#D1D5DB']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </LinearGradient>
        </TouchableOpacity>

        {hasCalendarPermission && Platform.OS !== 'web' && (
          <View style={styles.section}>
            <View style={styles.syncRow}>
              <View style={styles.syncLabelContainer}>
                <Cloud size={20} color="#6366F1" strokeWidth={2} />
                <View style={styles.syncTextContainer}>
                  <Text style={styles.syncLabel}>同步到系统日历</Text>
                  <Text style={styles.syncDescription}>在日历应用中查看这个日期</Text>
                </View>
              </View>
              <Switch
                value={isSynced}
                onValueChange={async (value) => {
                  const success = await toggleCalendarSync(id);
                  if (success) {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setIsSynced(value);
                  }
                }}
                trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                thumbColor={isSynced ? '#6366F1' : '#F3F4F6'}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={20} color="#EF4444" strokeWidth={2} />
          <Text style={styles.deleteButtonText}>删除倒数日</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  dateButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    fontWeight: '500' as const,
  },
  datePickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  deleteButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
    marginLeft: 8,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  syncLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  syncLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  syncDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
