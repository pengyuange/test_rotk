import { useClockIn } from '@/constants/ClockInContext';
import Colors from '@/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { Bell, ChevronRight, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAYS = [
  { label: '日', value: 0 },
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
];

export default function SettingsScreen() {
  const { settings, updateSettings } = useClockIn();
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleDayToggle = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDays = settings.activeDays.includes(day)
      ? settings.activeDays.filter((d) => d !== day)
      : [...settings.activeDays, day].sort((a, b) => a - b);
    updateSettings({ activeDays: newDays });
  };

  const handleMorningTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowMorningPicker(false);
    }
    if (selectedDate) {
      updateSettings({
        morningTime: {
          hour: selectedDate.getHours(),
          minute: selectedDate.getMinutes(),
        },
      });
    }
  };

  const handleEveningTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEveningPicker(false);
    }
    if (selectedDate) {
      updateSettings({
        eveningTime: {
          hour: selectedDate.getHours(),
          minute: selectedDate.getMinutes(),
        },
      });
    }
  };

  const getMorningDate = () => {
    const date = new Date();
    date.setHours(settings.morningTime.hour, settings.morningTime.minute, 0, 0);
    return date;
  };

  const getEveningDate = () => {
    const date = new Date();
    date.setHours(settings.eveningTime.hour, settings.eveningTime.minute, 0, 0);
    return date;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>设置</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={Colors.light.tint} />
              <Text style={styles.sectionTitle}>提醒开关</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>启用提醒</Text>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSettings({ enabled: value });
                }}
                trackColor={{ 
                  false: Colors.light.border, 
                  true: Colors.light.purple.light 
                }}
                thumbColor={settings.enabled ? Colors.light.purple.medium : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={Colors.light.tint} />
              <Text style={styles.sectionTitle}>打卡时间</Text>
            </View>

            <Pressable 
              style={styles.timeRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMorningPicker(true);
              }}
            >
              <Text style={styles.timeLabel}>早班时间</Text>
              <View style={styles.timeValue}>
                <Text style={styles.timeText}>
                  {formatTime(settings.morningTime.hour, settings.morningTime.minute)}
                </Text>
                <ChevronRight size={20} color={Colors.light.textSecondary} />
              </View>
            </Pressable>

            {showMorningPicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={getMorningDate()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleMorningTimeChange}
                  textColor={Colors.light.text}
                  themeVariant="light"
                />
                {Platform.OS === 'ios' && (
                  <Pressable 
                    style={styles.doneButton}
                    onPress={() => setShowMorningPicker(false)}
                  >
                    <Text style={styles.doneButtonText}>完成</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Pressable 
              style={styles.timeRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowEveningPicker(true);
              }}
            >
              <Text style={styles.timeLabel}>晚班时间</Text>
              <View style={styles.timeValue}>
                <Text style={styles.timeText}>
                  {formatTime(settings.eveningTime.hour, settings.eveningTime.minute)}
                </Text>
                <ChevronRight size={20} color={Colors.light.textSecondary} />
              </View>
            </Pressable>

            {showEveningPicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={getEveningDate()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEveningTimeChange}
                  textColor={Colors.light.text}
                  themeVariant="light"
                />
                {Platform.OS === 'ios' && (
                  <Pressable 
                    style={styles.doneButton}
                    onPress={() => setShowEveningPicker(false)}
                  >
                    <Text style={styles.doneButtonText}>完成</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>生效日期</Text>
            <View style={styles.daysContainer}>
              {DAYS.map((day) => (
                <Pressable
                  key={day.value}
                  style={[
                    styles.dayButton,
                    settings.activeDays.includes(day.value) && styles.dayButtonActive,
                  ]}
                  onPress={() => handleDayToggle(day.value)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      settings.activeDays.includes(day.value) && styles.dayTextActive,
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  settingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  timeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  timeLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  timeValue: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: Colors.light.purple.medium,
    fontWeight: '600' as const,
  },
  pickerContainer: {
    marginTop: 12,
    alignItems: 'center' as const,
  },
  doneButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: Colors.light.purple.medium,
    borderRadius: 12,
  },
  doneButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  daysContainer: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 12,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  dayButtonActive: {
    backgroundColor: Colors.light.purple.light,
    borderColor: Colors.light.purple.medium,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  dayTextActive: {
    color: Colors.light.purple.deep,
  },
});
