import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
import type { GameData, Enemy, Bullet, PowerUp, Particle, Achievement } from '@/types/game';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const initialAchievements: Achievement[] = [
  {
    id: 'first_blood',
    name: '第一滴血',
    description: '击败第一个敌人',
    icon: 'target',
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: 'survivor',
    name: '生存者',
    description: '生存60秒',
    icon: 'shield',
    unlocked: false,
    progress: 0,
    target: 60,
  },
  {
    id: 'destroyer',
    name: '毁灭者',
    description: '击败50个敌人',
    icon: 'bomb',
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: 'ace_pilot',
    name: '王牌飞行员',
    description: '达到第5关',
    icon: 'star',
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: 'unstoppable',
    name: '势不可挡',
    description: '连续击败10个敌人',
    icon: 'zap',
    unlocked: false,
    progress: 0,
    target: 10,
  },
];

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameData, setGameData] = useState<GameData>({
    state: 'menu',
    score: 0,
    level: 1,
    highScore: 0,
    player: {
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT - 100,
      width: 50,
      height: 50,
      velocity: { x: 0, y: 0 },
      health: 3,
      maxHealth: 3,
      invincible: false,
      hasShield: false,
      hasTripleShot: false,
    },
    enemies: [],
    bullets: [],
    powerUps: [],
    particles: [],
    achievements: initialAchievements,
    enemiesKilled: 0,
    survivalTime: 0,
  });

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemySpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerUpSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const survivalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef<number>(0);

  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem('highScore');
      if (saved) {
        setGameData(prev => ({ ...prev, highScore: parseInt(saved, 10) }));
      }
    } catch (error) {
      console.error('Failed to load high score:', error);
    }
  };

  const saveHighScore = async (score: number) => {
    try {
      await AsyncStorage.setItem('highScore', score.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  };

  const updateAchievementProgress = useCallback((achievements: Achievement[], id: string, progress: number): Achievement[] => {
    return achievements.map(a => {
      if (a.id === id && !a.unlocked) {
        const newProgress = progress;
        const unlocked = newProgress >= a.target;
        return { ...a, progress: newProgress, unlocked };
      }
      return a;
    });
  }, []);

  const checkCollision = useCallback((obj1: { x: number; y: number; width: number; height: number }, obj2: { x: number; y: number; width: number; height: number }): boolean => {
    return (
      obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
      obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
      obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
      obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2
    );
  }, []);

  const createExplosion = useCallback((x: number, y: number, count: number = 20) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x,
        y,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2,
        color: ['#FF6B00', '#FFAA00', '#FF0000', '#FFFF00'][Math.floor(Math.random() * 4)],
      });
    }
    return particles;
  }, []);

  const endGame = useCallback(() => {
    setGameData(prev => {
      if (prev.score > prev.highScore) {
        saveHighScore(prev.score);
        return { ...prev, state: 'gameOver' as const, highScore: prev.score };
      }
      return { ...prev, state: 'gameOver' as const };
    });

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (enemySpawnRef.current) clearInterval(enemySpawnRef.current);
    if (powerUpSpawnRef.current) clearInterval(powerUpSpawnRef.current);
    if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
  }, []);

  const updateGame = useCallback(() => {
    setGameData(prev => {
      if (prev.state !== 'playing') return prev;

      let newEnemies = [...prev.enemies];
      let newBullets = [...prev.bullets];
      let newPowerUps = [...prev.powerUps];
      let newParticles = [...prev.particles];
      let newPlayer = { ...prev.player };
      let newScore = prev.score;
      let newLevel = prev.level;
      let newAchievements = [...prev.achievements];
      let newEnemiesKilled = prev.enemiesKilled;

      newBullets = newBullets
        .map(b => ({ ...b, x: b.x + b.velocity.x, y: b.y + b.velocity.y }))
        .filter(b => b.y > -20 && b.y < SCREEN_HEIGHT + 20);

      newEnemies = newEnemies.map(e => ({ ...e, y: e.y + e.velocity.y }));

      const escapedEnemies = newEnemies.filter(e => e.y > SCREEN_HEIGHT + e.height);
      if (escapedEnemies.length > 0) {
        newScore = Math.max(0, newScore - 5 * escapedEnemies.length);
      }
      newEnemies = newEnemies.filter(e => e.y <= SCREEN_HEIGHT + e.height);

      for (let i = newBullets.length - 1; i >= 0; i--) {
        const bullet = newBullets[i];
        if (!bullet.fromPlayer) continue;

        for (let j = newEnemies.length - 1; j >= 0; j--) {
          const enemy = newEnemies[j];
          if (checkCollision(bullet, enemy)) {
            newEnemies[j] = { ...enemy, health: enemy.health - bullet.damage };
            newBullets.splice(i, 1);
            newParticles.push(...createExplosion(bullet.x, bullet.y, 8));

            if (newEnemies[j].health <= 0) {
              newParticles.push(...createExplosion(enemy.x, enemy.y, 20));
              newScore += enemy.score;
              newEnemiesKilled++;
              comboRef.current++;
              newAchievements = updateAchievementProgress(newAchievements, 'first_blood', 1);
              newAchievements = updateAchievementProgress(newAchievements, 'destroyer', newEnemiesKilled);
              newAchievements = updateAchievementProgress(newAchievements, 'unstoppable', comboRef.current);
              newEnemies.splice(j, 1);
            }
            break;
          }
        }
      }

      if (!newPlayer.invincible) {
        for (let i = newEnemies.length - 1; i >= 0; i--) {
          const enemy = newEnemies[i];
          if (checkCollision(newPlayer, enemy)) {
            if (newPlayer.hasShield) {
              newPlayer.hasShield = false;
              newParticles.push(...createExplosion(enemy.x, enemy.y, 20));
              newEnemies.splice(i, 1);
            } else {
              newPlayer.health--;
              newPlayer.invincible = true;
              comboRef.current = 0;
              newParticles.push(...createExplosion(enemy.x, enemy.y, 20));
              newEnemies.splice(i, 1);

              setTimeout(() => {
                setGameData(p => ({
                  ...p,
                  player: { ...p.player, invincible: false },
                }));
              }, 2000);

              if (newPlayer.health <= 0) {
                endGame();
                return prev;
              }
            }
          }
        }
      }

      newPowerUps = newPowerUps.map(p => ({ ...p, y: p.y + p.velocity.y }));
      newPowerUps = newPowerUps.filter(p => p.y <= SCREEN_HEIGHT + p.height);

      for (let i = newPowerUps.length - 1; i >= 0; i--) {
        const powerUp = newPowerUps[i];
        if (checkCollision(newPlayer, powerUp)) {
          if (powerUp.type === 'tripleShot') {
            newPlayer.hasTripleShot = true;
            setTimeout(() => {
              setGameData(p => ({
                ...p,
                player: { ...p.player, hasTripleShot: false },
              }));
            }, 10000);
          } else if (powerUp.type === 'shield') {
            newPlayer.hasShield = true;
          }
          newPowerUps.splice(i, 1);
        }
      }

      newParticles = newParticles
        .map(p => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y,
          life: p.life - 1,
        }))
        .filter(p => p.life > 0);

      if (newScore >= newLevel * 200) {
        newLevel++;
        newAchievements = updateAchievementProgress(newAchievements, 'ace_pilot', newLevel);
      }

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies,
        bullets: newBullets,
        powerUps: newPowerUps,
        particles: newParticles,
        score: newScore,
        level: newLevel,
        achievements: newAchievements,
        enemiesKilled: newEnemiesKilled,
      };
    });
  }, [checkCollision, createExplosion, updateAchievementProgress, endGame]);

  const startGame = useCallback(() => {
    comboRef.current = 0;
    setGameData(prev => ({
      ...prev,
      state: 'playing' as const,
      score: 0,
      level: 1,
      player: {
        ...prev.player,
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT - 100,
        health: 3,
        invincible: false,
        hasShield: false,
        hasTripleShot: false,
      },
      enemies: [],
      bullets: [],
      powerUps: [],
      particles: [],
      enemiesKilled: 0,
      survivalTime: 0,
      achievements: prev.achievements.map(a => ({ ...a, unlocked: false, progress: 0 })),
    }));

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (enemySpawnRef.current) clearInterval(enemySpawnRef.current);
    if (powerUpSpawnRef.current) clearInterval(powerUpSpawnRef.current);
    if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);

    const spawnEnemy = () => {
      setGameData(prev => {
        const types: ('basic' | 'fast' | 'heavy')[] = ['basic', 'fast', 'heavy'];
        const weights = [0.6, 0.3, 0.1];
        const random = Math.random();
        let type: 'basic' | 'fast' | 'heavy' = 'basic';
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
          cumulative += weights[i];
          if (random < cumulative) {
            type = types[i];
            break;
          }
        }

        const configs = {
          basic: { health: 1, speed: 2 + prev.level * 0.3, size: 40, score: 10 },
          fast: { health: 1, speed: 4 + prev.level * 0.5, size: 30, score: 20 },
          heavy: { health: 3, speed: 1 + prev.level * 0.2, size: 60, score: 50 },
        };

        const config = configs[type];
        const newEnemy: Enemy = {
          x: Math.random() * (SCREEN_WIDTH - config.size) + config.size / 2,
          y: -config.size,
          width: config.size,
          height: config.size,
          velocity: { x: 0, y: config.speed },
          type,
          health: config.health,
          maxHealth: config.health,
          score: config.score,
        };

        return { ...prev, enemies: [...prev.enemies, newEnemy] };
      });
    };

    const spawnPowerUp = () => {
      setGameData(prev => {
        const types: ('tripleShot' | 'shield')[] = ['tripleShot', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];

        const newPowerUp: PowerUp = {
          x: Math.random() * (SCREEN_WIDTH - 40) + 20,
          y: -20,
          width: 40,
          height: 40,
          velocity: { x: 0, y: 2 },
          type,
        };

        return { ...prev, powerUps: [...prev.powerUps, newPowerUp] };
      });
    };

    gameLoopRef.current = setInterval(updateGame, 1000 / 60) as unknown as ReturnType<typeof setInterval>;
    enemySpawnRef.current = setInterval(spawnEnemy, 2000) as unknown as ReturnType<typeof setInterval>;
    powerUpSpawnRef.current = setInterval(spawnPowerUp, 15000) as unknown as ReturnType<typeof setInterval>;
    survivalTimerRef.current = setInterval(() => {
      setGameData(prev => {
        const newTime = prev.survivalTime + 1;
        return {
          ...prev,
          survivalTime: newTime,
          achievements: updateAchievementProgress(prev.achievements, 'survivor', newTime),
        };
      });
    }, 1000) as unknown as ReturnType<typeof setInterval>;
  }, [updateGame, updateAchievementProgress]);

  const pauseGame = useCallback(() => {
    setGameData(prev => ({ ...prev, state: 'paused' as const }));
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (enemySpawnRef.current) clearInterval(enemySpawnRef.current);
    if (powerUpSpawnRef.current) clearInterval(powerUpSpawnRef.current);
    if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
  }, []);

  const resumeGame = useCallback(() => {
    setGameData(prev => ({ ...prev, state: 'playing' as const }));
    
    const spawnEnemy = () => {
      setGameData(prev => {
        const types: ('basic' | 'fast' | 'heavy')[] = ['basic', 'fast', 'heavy'];
        const weights = [0.6, 0.3, 0.1];
        const random = Math.random();
        let type: 'basic' | 'fast' | 'heavy' = 'basic';
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
          cumulative += weights[i];
          if (random < cumulative) {
            type = types[i];
            break;
          }
        }

        const configs = {
          basic: { health: 1, speed: 2 + prev.level * 0.3, size: 40, score: 10 },
          fast: { health: 1, speed: 4 + prev.level * 0.5, size: 30, score: 20 },
          heavy: { health: 3, speed: 1 + prev.level * 0.2, size: 60, score: 50 },
        };

        const config = configs[type];
        const newEnemy: Enemy = {
          x: Math.random() * (SCREEN_WIDTH - config.size) + config.size / 2,
          y: -config.size,
          width: config.size,
          height: config.size,
          velocity: { x: 0, y: config.speed },
          type,
          health: config.health,
          maxHealth: config.health,
          score: config.score,
        };

        return { ...prev, enemies: [...prev.enemies, newEnemy] };
      });
    };

    const spawnPowerUp = () => {
      setGameData(prev => {
        const types: ('tripleShot' | 'shield')[] = ['tripleShot', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];

        const newPowerUp: PowerUp = {
          x: Math.random() * (SCREEN_WIDTH - 40) + 20,
          y: -20,
          width: 40,
          height: 40,
          velocity: { x: 0, y: 2 },
          type,
        };

        return { ...prev, powerUps: [...prev.powerUps, newPowerUp] };
      });
    };

    gameLoopRef.current = setInterval(updateGame, 1000 / 60) as unknown as ReturnType<typeof setInterval>;
    enemySpawnRef.current = setInterval(spawnEnemy, 2000) as unknown as ReturnType<typeof setInterval>;
    powerUpSpawnRef.current = setInterval(spawnPowerUp, 15000) as unknown as ReturnType<typeof setInterval>;
    survivalTimerRef.current = setInterval(() => {
      setGameData(prev => {
        const newTime = prev.survivalTime + 1;
        return {
          ...prev,
          survivalTime: newTime,
          achievements: updateAchievementProgress(prev.achievements, 'survivor', newTime),
        };
      });
    }, 1000) as unknown as ReturnType<typeof setInterval>;
  }, [updateGame, updateAchievementProgress]);

  const movePlayer = useCallback((x: number, y: number) => {
    setGameData(prev => ({
      ...prev,
      player: {
        ...prev.player,
        x: Math.max(25, Math.min(SCREEN_WIDTH - 25, x)),
        y: Math.max(25, Math.min(SCREEN_HEIGHT - 25, y)),
      },
    }));
  }, []);

  const shootBullet = useCallback(() => {
    setGameData(prev => {
      const newBullets: Bullet[] = [];
      
      if (prev.player.hasTripleShot) {
        newBullets.push(
          {
            x: prev.player.x - 20,
            y: prev.player.y - 20,
            width: 8,
            height: 20,
            velocity: { x: -2, y: -12 },
            damage: 1,
            fromPlayer: true,
          },
          {
            x: prev.player.x,
            y: prev.player.y - 20,
            width: 8,
            height: 20,
            velocity: { x: 0, y: -15 },
            damage: 1,
            fromPlayer: true,
          },
          {
            x: prev.player.x + 20,
            y: prev.player.y - 20,
            width: 8,
            height: 20,
            velocity: { x: 2, y: -12 },
            damage: 1,
            fromPlayer: true,
          }
        );
      } else {
        newBullets.push({
          x: prev.player.x,
          y: prev.player.y - 20,
          width: 8,
          height: 20,
          velocity: { x: 0, y: -15 },
          damage: 1,
          fromPlayer: true,
        });
      }

      return { ...prev, bullets: [...prev.bullets, ...newBullets] };
    });
  }, []);

  return {
    gameData,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    movePlayer,
    shootBullet,
  };
});
