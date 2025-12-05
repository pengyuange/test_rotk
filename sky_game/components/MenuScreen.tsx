import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Target } from 'lucide-react-native';

interface MenuScreenProps {
  onStart: () => void;
  highScore: number;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onStart, highScore }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0E27', '#1A1F3A', '#0A0E27']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>太空战机</Text>
          <Text style={styles.subtitle}>SPACE FIGHTER</Text>
        </View>

        {highScore > 0 && (
          <BlurView intensity={20} style={styles.highScoreCard}>
            <Trophy size={32} color="#FFD700" />
            <View style={styles.highScoreText}>
              <Text style={styles.highScoreLabel}>最高分</Text>
              <Text style={styles.highScoreValue}>{highScore}</Text>
            </View>
          </BlurView>
        )}

        <TouchableOpacity onPress={onStart} activeOpacity={0.8}>
          <BlurView intensity={30} style={styles.startButton}>
            <LinearGradient
              colors={['rgba(0, 217, 255, 0.3)', 'rgba(0, 153, 255, 0.3)']}
              style={styles.buttonGradient}
            >
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startButtonText}>开始游戏</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        <View style={styles.instructionsContainer}>
          <BlurView intensity={20} style={styles.instructionCard}>
            <Target size={24} color="#00D9FF" />
            <View style={styles.instructionText}>
              <Text style={styles.instructionTitle}>操作方式</Text>
              <Text style={styles.instructionDetail}>触摸屏幕移动战机</Text>
              <Text style={styles.instructionDetail}>自动射击</Text>
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#00D9FF',
    letterSpacing: 4,
    marginTop: 10,
  },
  highScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
  },
  highScoreText: {
    marginLeft: 15,
    alignItems: 'center',
  },
  highScoreLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  highScoreValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 217, 255, 0.5)',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginLeft: 15,
  },
  instructionsContainer: {
    marginTop: 40,
    width: '100%',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    overflow: 'hidden',
  },
  instructionText: {
    marginLeft: 15,
    flex: 1,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 2,
  },
});
