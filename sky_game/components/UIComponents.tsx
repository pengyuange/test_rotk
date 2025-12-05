import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, Star, Trophy, Award } from 'lucide-react-native';
import type { Player, Achievement } from '@/types/game';

interface HUDProps {
  player: Player;
  score: number;
  level: number;
}

export const HUD: React.FC<HUDProps> = ({ player, score, level }) => {
  return (
    <View style={styles.hud}>
      <BlurView intensity={20} style={styles.hudTop}>
        <View style={styles.healthContainer}>
          {Array.from({ length: player.maxHealth }).map((_, i) => (
            <Heart
              key={i}
              size={24}
              color={i < player.health ? '#FF0066' : '#666666'}
              fill={i < player.health ? '#FF0066' : 'transparent'}
              strokeWidth={2}
            />
          ))}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Trophy size={20} color="#FFD700" />
            <Text style={styles.statText}>{score}</Text>
          </View>
          <View style={styles.stat}>
            <Star size={20} color="#00D9FF" />
            <Text style={styles.statText}>LV {level}</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

interface PauseScreenProps {
  onResume: () => void;
  onExit: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onExit }) => {
  return (
    <View style={styles.overlay}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill}>
        <View style={styles.pauseContainer}>
          <Text style={styles.pauseTitle}>游戏暂停</Text>
          
          <TouchableOpacity onPress={onResume} activeOpacity={0.8} style={styles.button}>
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={styles.buttonText}>继续游戏</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={onExit} activeOpacity={0.8} style={styles.button}>
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={[styles.buttonText, styles.exitText]}>退出</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

interface GameOverScreenProps {
  score: number;
  level: number;
  highScore: number;
  achievements: Achievement[];
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  highScore,
  achievements,
  onRestart,
  onExit,
}) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const isNewHighScore = score === highScore && score > 0;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>游戏结束</Text>
          
          {isNewHighScore && (
            <View style={styles.newRecordBadge}>
              <Trophy size={24} color="#FFD700" />
              <Text style={styles.newRecordText}>新纪录!</Text>
            </View>
          )}

          <BlurView intensity={20} style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>得分</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>关卡</Text>
              <Text style={styles.scoreValue}>{level}</Text>
            </View>
            <View style={[styles.scoreRow, styles.highScoreRow]}>
              <Text style={styles.scoreLabel}>最高分</Text>
              <Text style={[styles.scoreValue, styles.highScoreText]}>{highScore}</Text>
            </View>
          </BlurView>

          {unlockedAchievements.length > 0 && (
            <BlurView intensity={20} style={styles.achievementsCard}>
              <View style={styles.achievementsHeader}>
                <Award size={20} color="#FFD700" />
                <Text style={styles.achievementsTitle}>解锁成就</Text>
              </View>
              {unlockedAchievements.slice(0, 3).map(achievement => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
              ))}
            </BlurView>
          )}

          <TouchableOpacity onPress={onRestart} activeOpacity={0.8} style={styles.button}>
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={styles.buttonText}>再来一局</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={onExit} activeOpacity={0.8} style={styles.button}>
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={[styles.buttonText, styles.exitText]}>返回菜单</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.2)',
  },
  healthContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  pauseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pauseTitle: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 60,
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gameOverTitle: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: '#FF0066',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  newRecordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  newRecordText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  scoreCard: {
    width: '100%',
    maxWidth: 350,
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  highScoreRow: {
    marginBottom: 0,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  highScoreText: {
    color: '#FFD700',
  },
  achievementsCard: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginBottom: 30,
    overflow: 'hidden',
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  achievementItem: {
    marginBottom: 12,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 2,
  },
  button: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 217, 255, 0.5)',
  },
  buttonBlur: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  exitText: {
    color: '#FF6B6B',
  },
});
