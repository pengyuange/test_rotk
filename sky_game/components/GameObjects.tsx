import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Shield } from 'lucide-react-native';
import type { Player as PlayerType, Enemy as EnemyType, Bullet as BulletType, PowerUp as PowerUpType, Particle as ParticleType } from '@/types/game';

export const Player = memo(({ player }: { player: PlayerType }) => {
  const opacity = player.invincible ? 0.5 : 1;
  
  return (
    <View
      style={[
        styles.player,
        {
          left: player.x - player.width / 2,
          top: player.y - player.height / 2,
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={['#00D9FF', '#0099FF', '#0066FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.playerGradient}
      >
        <View style={styles.playerCore} />
        <View style={styles.playerWing} />
        <View style={styles.playerWingRight} />
      </LinearGradient>
      {player.hasShield && (
        <View style={styles.shieldContainer}>
          <Shield size={60} color="#00FFFF" strokeWidth={3} />
        </View>
      )}
      {player.hasTripleShot && (
        <View style={styles.powerUpIndicator}>
          <Zap size={16} color="#FFD700" fill="#FFD700" />
        </View>
      )}
    </View>
  );
});

Player.displayName = 'Player';

export const Enemy = memo(({ enemy }: { enemy: EnemyType }) => {
  const colors: Record<'basic' | 'fast' | 'heavy', [string, string, ...string[]]> = {
    basic: ['#FF6B00', '#FF3300'],
    fast: ['#FF00FF', '#CC00CC'],
    heavy: ['#FF0000', '#990000'],
  };

  const healthPercent = enemy.health / enemy.maxHealth;
  
  return (
    <View
      style={[
        styles.enemy,
        {
          left: enemy.x - enemy.width / 2,
          top: enemy.y - enemy.height / 2,
          width: enemy.width,
          height: enemy.height,
        },
      ]}
    >
      <LinearGradient
        colors={colors[enemy.type]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.enemyGradient}
      >
        <View style={styles.enemyCore} />
      </LinearGradient>
      {enemy.maxHealth > 1 && (
        <View style={styles.healthBarContainer}>
          <View style={[styles.healthBar, { width: `${healthPercent * 100}%` }]} />
        </View>
      )}
    </View>
  );
});

Enemy.displayName = 'Enemy';

export const Bullet = memo(({ bullet }: { bullet: BulletType }) => {
  return (
    <View
      style={[
        styles.bullet,
        {
          left: bullet.x - bullet.width / 2,
          top: bullet.y - bullet.height / 2,
          width: bullet.width,
          height: bullet.height,
        },
      ]}
    >
      <LinearGradient
        colors={['#00FFFF', '#00CCFF', '#0099FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bulletGradient}
      />
    </View>
  );
});

Bullet.displayName = 'Bullet';

export const PowerUp = memo(({ powerUp }: { powerUp: PowerUpType }) => {
  const Icon = powerUp.type === 'tripleShot' ? Zap : Shield;
  const color = powerUp.type === 'tripleShot' ? '#FFD700' : '#00FFFF';
  
  return (
    <View
      style={[
        styles.powerUp,
        {
          left: powerUp.x - powerUp.width / 2,
          top: powerUp.y - powerUp.height / 2,
        },
      ]}
    >
      <View style={[styles.powerUpGlow, { backgroundColor: color }]} />
      <View style={styles.powerUpIcon}>
        <Icon size={24} color={color} strokeWidth={3} />
      </View>
    </View>
  );
});

PowerUp.displayName = 'PowerUp';

export const ParticleView = memo(({ particle }: { particle: ParticleType }) => {
  const opacity = particle.life / particle.maxLife;
  
  return (
    <View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity,
        },
      ]}
    />
  );
});

ParticleView.displayName = 'ParticleView';

const AnimatedStar = memo(({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity, delay]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          opacity,
        },
      ]}
    />
  );
});

AnimatedStar.displayName = 'AnimatedStar';

export const StarField = memo(() => {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    key: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2000,
  }));

  return (
    <View style={styles.starField}>
      {stars.map(star => (
        <AnimatedStar
          key={star.key}
          x={star.x}
          y={star.y}
          size={star.size}
          delay={star.delay}
        />
      ))}
    </View>
  );
});

StarField.displayName = 'StarField';

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  playerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  playerCore: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  playerWing: {
    position: 'absolute',
    top: 10,
    left: -5,
    width: 15,
    height: 30,
    backgroundColor: '#0099FF',
    borderRadius: 5,
  },
  playerWingRight: {
    position: 'absolute',
    top: 10,
    right: -5,
    width: 15,
    height: 30,
    backgroundColor: '#0099FF',
    borderRadius: 5,
  },
  shieldContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
  },
  powerUpIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  enemy: {
    position: 'absolute',
  },
  enemyGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  enemyCore: {
    width: '50%',
    height: '50%',
    backgroundColor: '#FFFF00',
    borderRadius: 5,
  },
  healthBarContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 2,
  },
  healthBar: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 2,
  },
  bullet: {
    position: 'absolute',
  },
  bulletGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  powerUp: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerUpGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
  },
  powerUpIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});
