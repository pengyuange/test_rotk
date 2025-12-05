import { useClockIn } from '@/constants/ClockInContext';
import Colors from '@/constants/colors';
import type { CheckInType } from '@/constants/types';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { CheckCircle2, Circle, Clock, Sunrise, Sunset } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { todayCheckIn, checkIn, isLoading, settings } = useClockIn();

  const handleCheckIn = (type: CheckInType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    checkIn(type);
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long' 
    };
    return today.toLocaleDateString('zh-CN', options);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

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
            <Text style={styles.greeting}>打卡提醒</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>

          <View style={styles.cardsContainer}>
            <Pressable 
              style={[
                styles.card,
                todayCheckIn.morningChecked && styles.cardChecked
              ]}
              onPress={() => !todayCheckIn.morningChecked && handleCheckIn('morning')}
              disabled={todayCheckIn.morningChecked}
            >
              <View style={styles.cardHeader}>
                <View style={[
                  styles.iconContainer,
                  todayCheckIn.morningChecked && styles.iconContainerChecked
                ]}>
                  <Sunrise 
                    size={28} 
                    color={todayCheckIn.morningChecked ? Colors.light.success : Colors.light.purple.medium}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>早班打卡</Text>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color={Colors.light.textSecondary} />
                    <Text style={styles.timeText}>
                      {formatTime(settings.morningTime.hour, settings.morningTime.minute)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                {todayCheckIn.morningChecked ? (
                  <View style={styles.statusContainer}>
                    <CheckCircle2 size={20} color={Colors.light.success} />
                    <Text style={styles.statusTextChecked}>已打卡</Text>
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <Circle size={20} color={Colors.light.purple.medium} />
                    <Text style={styles.statusText}>点击打卡</Text>
                  </View>
                )}
              </View>
            </Pressable>

            <Pressable 
              style={[
                styles.card,
                todayCheckIn.eveningChecked && styles.cardChecked
              ]}
              onPress={() => !todayCheckIn.eveningChecked && handleCheckIn('evening')}
              disabled={todayCheckIn.eveningChecked}
            >
              <View style={styles.cardHeader}>
                <View style={[
                  styles.iconContainer,
                  todayCheckIn.eveningChecked && styles.iconContainerChecked
                ]}>
                  <Sunset 
                    size={28} 
                    color={todayCheckIn.eveningChecked ? Colors.light.success : Colors.light.purple.deep}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>晚班打卡</Text>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color={Colors.light.textSecondary} />
                    <Text style={styles.timeText}>
                      {formatTime(settings.eveningTime.hour, settings.eveningTime.minute)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                {todayCheckIn.eveningChecked ? (
                  <View style={styles.statusContainer}>
                    <CheckCircle2 size={20} color={Colors.light.success} />
                    <Text style={styles.statusTextChecked}>已打卡</Text>
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <Circle size={20} color={Colors.light.purple.deep} />
                    <Text style={styles.statusText}>点击打卡</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>提醒规则</Text>
            <Text style={styles.infoText}>• 在设定时间收到打卡提醒</Text>
            <Text style={styles.infoText}>• 点击「已打卡」确认完成</Text>
            <Text style={styles.infoText}>• 未确认将每2分钟重复提醒</Text>
            <Text style={styles.infoText}>• 前往设置调整提醒时间</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
  greeting: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: '400' as const,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardChecked: {
    borderColor: Colors.light.success,
    backgroundColor: '#F0FFF4',
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.purple.light,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
  },
  iconContainerChecked: {
    backgroundColor: '#C6F6D5',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  timeText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: Colors.light.purple.medium,
    fontWeight: '600' as const,
  },
  statusTextChecked: {
    fontSize: 16,
    color: Colors.light.success,
    fontWeight: '600' as const,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 4,
  },
});
