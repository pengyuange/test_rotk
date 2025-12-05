import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Award } from 'lucide-react-native';
import type { Achievement } from '@/types/game';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onHide: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onHide,
}) => {
  const [slideAnim] = useState(new Animated.Value(-200));

  useEffect(() => {
    if (achievement) {
      Animated.sequence([
        Animated.spring(slideAnim, {
          toValue: 20,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.delay(3000),
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [achievement, slideAnim, onHide]);

  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={80} style={styles.notification}>
        <View style={styles.iconContainer}>
          <Award size={32} color="#FFD700" fill="#FFD700" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>成就解锁!</Text>
          <Text style={styles.achievementName}>{achievement.name}</Text>
          <Text style={styles.achievementDesc}>{achievement.description}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 2000,
  },
  notification: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});
