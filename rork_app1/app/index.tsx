import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,

  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Calendar, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCountdown } from '@/contexts/CountdownContext';
import * as Haptics from 'expo-haptics';



export default function HomeScreen() {
  const router = useRouter();
  const { events, deleteEvent, calculateDaysFrom } = useCountdown();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddEvent = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/add-event');
  };

  const handleDeleteEvent = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDeletingId(id);
    setTimeout(() => {
      deleteEvent(id);
      setDeletingId(null);
    }, 300);
  };

  const handleCardPress = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/edit-event',
      params: { id },
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Calendar size={64} color="#CBD5E1" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>还没有倒数日</Text>
      <Text style={styles.emptyText}>点击下方按钮添加你的第一个重要日子</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#E9ECEF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>倒数日</Text>
          <Text style={styles.headerSubtitle}>记录每个重要的日子</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {events.length === 0 ? (
            renderEmptyState()
          ) : (
            events.map((event) => {
              const days = calculateDaysFrom(event.date);
              const isDeleting = deletingId === event.id;
              const eventDate = new Date(event.date);
              const formattedDate = `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;

              return (
                <Animated.View
                  key={event.id}
                  style={[
                    styles.cardWrapper,
                    isDeleting && styles.cardDeleting,
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleCardPress(event.id)}
                  >
                    <LinearGradient
                      colors={[event.color, `${event.color}DD`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.card}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle} numberOfLines={2}>
                            {event.title}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteEvent(event.id)}
                            style={styles.deleteButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Trash2 size={20} color="#FFF" strokeWidth={2} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.cardBody}>
                          <View style={styles.daysContainer}>
                            <Text style={styles.daysNumber}>
                              {Math.abs(days)}
                            </Text>
                            <Text style={styles.daysLabel}>
                              {days > 0 ? '天后' : days < 0 ? '天前' : '今天'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardFooter}>
                          <Text style={styles.dateText}>{formattedDate}</Text>
                          {event.syncedToCalendar && (
                            <View style={styles.syncBadge}>
                              <Calendar size={12} color="#FFF" />
                              <Text style={styles.syncText}>已同步</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddEvent}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Plus size={28} color="#FFF" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '400' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#64748B',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardDeleting: {
    opacity: 0,
    transform: [{ scale: 0.95 }],
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFF',
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.3,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  daysNumber: {
    fontSize: 52,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -1,
  },
  daysLabel: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFF',
    marginLeft: 8,
    opacity: 0.95,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fab: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
