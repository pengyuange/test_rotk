export interface Position {
  x: number;
  y: number;
}

export interface GameObject extends Position {
  width: number;
  height: number;
  velocity: { x: number; y: number };
}

export interface Player extends GameObject {
  health: number;
  maxHealth: number;
  invincible: boolean;
  hasShield: boolean;
  hasTripleShot: boolean;
}

export interface Enemy extends GameObject {
  type: 'basic' | 'fast' | 'heavy';
  health: number;
  maxHealth: number;
  score: number;
}

export interface Bullet extends GameObject {
  damage: number;
  fromPlayer: boolean;
}

export interface PowerUp extends GameObject {
  type: 'tripleShot' | 'shield';
}

export interface Particle extends Position {
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

export interface GameData {
  state: GameState;
  score: number;
  level: number;
  highScore: number;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
  achievements: Achievement[];
  enemiesKilled: number;
  survivalTime: number;
}
