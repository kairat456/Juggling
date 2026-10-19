export type BodyPartHit = 'HEAD' | 'CHEST' | 'FOOT' | 'BICYCLE' | 'SPIKE' | 'BUMP';

export type GameMode = 'MATCH_2V2' | 'ENDLESS_JUGGLE' | 'LOCAL_PVP';

export type AIDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  sport: 'football' | 'volleyball' | 'footvolley' | 'freestyle';
  description: string;
  speed: number;       // 1 - 10
  jumpPower: number;   // 1 - 10
  kickPower: number;   // 1 - 10
  control: number;     // 1 - 10 (cushion / accuracy)
  specialMove: string;
  skinColor: string;
  hairColor: string;
  hairStyle: 'short' | 'spiky' | 'ponytail' | 'curly' | 'afro';
  jerseyColor: string;
  shortsColor: string;
  shoesColor: string;
  price: number;
  unlocked: boolean;
}

export interface LocationDef {
  id: string;
  name: string;
  category: string;
  description: string;
  skyGradient: [string, string];
  groundColor: string;
  groundSubColor: string;
  groundType: 'sand' | 'grass' | 'stadium_turf' | 'wood';
  netPostColor: string;
  netTapeColor: string;
  unlocked: boolean;
  price: number;
  weatherEffect?: 'leaves' | 'sand_particles' | 'stadium_lights' | 'indoor_shine';
}

export interface BallDef {
  id: string;
  name: string;
  description: string;
  radius: number;
  restitution: number;
  pattern: 'soccer' | 'volleyball' | 'gold' | 'fire' | 'neon';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  unlocked: boolean;
  price: number;
  bonusCoinMultiplier: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type?: 'spark' | 'smoke' | 'confetti' | 'sand' | 'leaf';
  rotation?: number;
  rotSpeed?: number;
}

export interface HitFloatText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export interface PlayerPhysics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 1 | -1;
  team: 'LEFT' | 'RIGHT'; // LEFT is User Team, RIGHT is Opponent Team
  playerIndex: 0 | 1;     // Duo index (Player 1 or Player 2)
  characterId: string;
  actionState: 'IDLE' | 'RUN' | 'JUMP' | 'KICK' | 'BICYCLE' | 'HEADER' | 'SPIKE' | 'CHEST';
  actionTimer: number;
  cooldown: number;
  scoreTouches: number;
}

export interface BallPhysics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  spin: number;
  lastTouchTeam: 'LEFT' | 'RIGHT' | null;
  lastTouchPlayer: string | null;
  lastHitType: BodyPartHit | null;
  consecutiveTouches: number;
  netHits: number;
}

export interface MatchStats {
  leftScore: number;
  rightScore: number;
  targetScore: number;
  leftTouches: number;    // Current touches on left side (max 3 in match mode)
  rightTouches: number;   // Current touches on right side
  keepUpCombo: number;    // Juggle count in current rally
  maxCombo: number;
  totalHits: number;
  bicycleKicks: number;
  spikes: number;
  headers: number;
  chestControls: number;
  coinsEarned: number;
  winner: 'LEFT' | 'RIGHT' | null;
  matchOver: boolean;
  isPaused: boolean;
}
