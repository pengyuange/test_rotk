import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';
import { Player, Enemy, Bullet, PowerUp, ParticleView, StarField } from '@/components/GameObjects';
import { HUD, PauseScreen, GameOverScreen } from '@/components/UIComponents';
import { MenuScreen } from '@/components/MenuScreen';
import { AchievementNotification } from '@/components/AchievementNotification';
import type { Achievement } from '@/types/game';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function GameScreen() {
  const { gameData, startGame, resumeGame, movePlayer, shootBullet } = useGame();
  const shootIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const prevAchievementsRef = useRef<Achievement[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touch = evt.nativeEvent;
        if (gameData.state === 'playing') {
          movePlayer(touch.pageX, touch.pageY);
        }
      },
      onPanResponderMove: (evt) => {
        const touch = evt.nativeEvent;
        if (gameData.state === 'playing') {
          movePlayer(touch.pageX, touch.pageY);
        }
      },
    })
  ).current;

  useEffect(() => {
    if (gameData.state === 'playing') {
      shootIntervalRef.current = setInterval(() => {
        shootBullet();
      }, 200) as unknown as ReturnType<typeof setInterval>;
    } else {
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
    }

    return () => {
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
      }
    };
  }, [gameData.state, shootBullet]);

  useEffect(() => {
    const newUnlocked = gameData.achievements.find(
      (achievement) => 
        achievement.unlocked && 
        !prevAchievementsRef.current.find(
          (prev) => prev.id === achievement.id && prev.unlocked
        )
    );

    if (newUnlocked) {
      setCurrentAchievement(newUnlocked);
    }

    prevAchievementsRef.current = gameData.achievements;
  }, [gameData.achievements]);

  const handleExit = () => {
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
    startGame();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0E27', '#1A1F3A', '#0F1535', '#0A0E27']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <StarField />

      {gameData.state === 'menu' && (
        <MenuScreen onStart={startGame} highScore={gameData.highScore} />
      )}

      {(gameData.state === 'playing' || gameData.state === 'paused' || gameData.state === 'gameOver') && (
        <>
          <View style={styles.gameArea} {...panResponder.panHandlers}>
            <Player player={gameData.player} />
            
            {gameData.enemies.map((enemy, index) => (
              <Enemy key={`enemy-${index}`} enemy={enemy} />
            ))}

            {gameData.bullets.map((bullet, index) => (
              <Bullet key={`bullet-${index}`} bullet={bullet} />
            ))}

            {gameData.powerUps.map((powerUp, index) => (
              <PowerUp key={`powerup-${index}`} powerUp={powerUp} />
            ))}

            {gameData.particles.map((particle, index) => (
              <ParticleView key={`particle-${index}`} particle={particle} />
            ))}
          </View>

          <HUD player={gameData.player} score={gameData.score} level={gameData.level} />

          <AchievementNotification
            achievement={currentAchievement}
            onHide={() => setCurrentAchievement(null)}
          />

          {gameData.state === 'paused' && (
            <PauseScreen onResume={resumeGame} onExit={handleExit} />
          )}

          {gameData.state === 'gameOver' && (
            <GameOverScreen
              score={gameData.score}
              level={gameData.level}
              highScore={gameData.highScore}
              achievements={gameData.achievements}
              onRestart={startGame}
              onExit={handleExit}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameArea: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
