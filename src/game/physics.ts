import {
  BallPhysics,
  PlayerPhysics,
  BodyPartHit,
  CharacterDef,
  Particle,
  HitFloatText
} from '../types/game';
import { soundManager } from '../audio/soundManager';

export const COURT_WIDTH = 1200;
export const COURT_HEIGHT = 680;
export const GROUND_Y = 560;
export const NET_X = 600;
export const NET_WIDTH = 6;
export const NET_TOP_Y = 320; // 240px net height
export const GRAVITY = 0.42;

export function createBall(radius: number = 17, restitution: number = 0.86): BallPhysics {
  return {
    x: 350,
    y: 220,
    vx: 3,
    vy: -2,
    radius,
    rotation: 0,
    spin: 0.05,
    lastTouchTeam: null,
    lastTouchPlayer: null,
    lastHitType: null,
    consecutiveTouches: 0,
    netHits: 0,
  };
}

export function createPlayer(
  team: 'LEFT' | 'RIGHT',
  playerIndex: 0 | 1,
  characterId: string
): PlayerPhysics {
  const isLeft = team === 'LEFT';
  // Position players nicely spaced out
  const defaultX = isLeft
    ? playerIndex === 0 ? 250 : 450
    : playerIndex === 0 ? 950 : 750;

  return {
    x: defaultX,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    width: 38,
    height: 84,
    isGrounded: true,
    facing: isLeft ? 1 : -1,
    team,
    playerIndex,
    characterId,
    actionState: 'IDLE',
    actionTimer: 0,
    cooldown: 0,
    scoreTouches: 0,
  };
}

export interface CollisionResult {
  hit: boolean;
  hitType?: BodyPartHit;
  player?: PlayerPhysics;
  speed: number;
}

export function updateBallPhysics(
  ball: BallPhysics,
  particles: Particle[],
  addFloatText: (x: number, y: number, text: string, color: string) => void,
  onGroundHit: (teamSide: 'LEFT' | 'RIGHT') => void
) {
  // Apply gravity
  ball.vy += GRAVITY;
  // Apply light air resistance
  ball.vx *= 0.996;
  ball.vy *= 0.998;

  // Update position
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Spin rotation
  ball.rotation += ball.vx * 0.04 + ball.spin;
  ball.spin *= 0.98;

  // Wall collisions
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = -ball.vx * 0.75;
    soundManager.playNetHit();
  } else if (ball.x + ball.radius > COURT_WIDTH) {
    ball.x = COURT_WIDTH - ball.radius;
    ball.vx = -ball.vx * 0.75;
    soundManager.playNetHit();
  }

  // Ceiling collision
  if (ball.y - ball.radius < 20) {
    ball.y = 20 + ball.radius;
    ball.vy = Math.abs(ball.vy) * 0.7;
  }

  // Net collision
  const netLeft = NET_X - NET_WIDTH / 2;
  const netRight = NET_X + NET_WIDTH / 2;

  // If ball intersects net horizontally
  if (ball.x + ball.radius > netLeft && ball.x - ball.radius < netRight) {
    // Check if it hits the top rounded tape / cable of the net
    const topDistX = ball.x - NET_X;
    const topDistY = ball.y - NET_TOP_Y;
    const distToTop = Math.hypot(topDistX, topDistY);

    if (distToTop < ball.radius + 4 && ball.y < NET_TOP_Y + 8) {
      // Net cord bounce
      const angle = Math.atan2(topDistY, topDistX);
      const speed = Math.hypot(ball.vx, ball.vy) * 0.75;
      ball.vx = Math.cos(angle) * Math.max(speed, 4);
      ball.vy = Math.sin(angle) * Math.max(speed, 3);
      ball.y = NET_TOP_Y - ball.radius - 2;
      ball.netHits++;
      soundManager.playNetHit();
      addFloatText(NET_X, NET_TOP_Y - 20, 'КАСАНИЕ СЕТКИ!', '#FACC15');
    } else if (ball.y >= NET_TOP_Y) {
      // Hits the body of the net mesh
      if (ball.vx > 0) {
        ball.x = netLeft - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.5;
      } else {
        ball.x = netRight + ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.5;
      }
      ball.netHits++;
      soundManager.playNetHit();
    }
  }

  // Ground collision (BALL FELL!)
  if (ball.y + ball.radius >= GROUND_Y) {
    ball.y = GROUND_Y - ball.radius;
    const landingSide: 'LEFT' | 'RIGHT' = ball.x < NET_X ? 'LEFT' : 'RIGHT';
    onGroundHit(landingSide);
  }
}

export function checkPlayerBallCollision(
  player: PlayerPhysics,
  ball: BallPhysics,
  charDef: CharacterDef,
  addParticles: (count: number, x: number, y: number, color: string, type?: Particle['type']) => void,
  addFloatText: (x: number, y: number, text: string, color: string) => void
): CollisionResult {
  // Bounding box pre-check
  const playerTop = player.y - player.height;
  const playerBottom = player.y;
  const playerLeft = player.x - player.width / 2 - 10;
  const playerRight = player.x + player.width / 2 + 10;

  // Extend detection if performing kick / bicycle / spike
  const reachBonus = player.actionState !== 'IDLE' && player.actionState !== 'RUN' ? 24 : 8;

  if (
    ball.x + ball.radius < playerLeft - reachBonus ||
    ball.x - ball.radius > playerRight + reachBonus ||
    ball.y + ball.radius < playerTop - reachBonus ||
    ball.y - ball.radius > playerBottom + 8
  ) {
    return { hit: false, speed: 0 };
  }

  // Determine specific body part hit based on relative ball Y and player state
  const relY = ball.y - playerTop; // 0 = head, ~30 = chest, ~65 = knees, ~84 = feet
  let hitType: BodyPartHit = 'FOOT';
  let floatLabel = 'УДАР НОГОЙ!';
  let labelColor = '#38BDF8';
  let power = 1.0;

  const facing = player.facing;
  const kickMult = (charDef.kickPower / 10);
  const jumpMult = (charDef.jumpPower / 10);
  const ctrlMult = (charDef.control / 10);

  if (player.actionState === 'BICYCLE') {
    hitType = 'BICYCLE';
    floatLabel = 'УДАР ЧЕРЕЗ СЕБЯ!';
    labelColor = '#EC4899';
    power = 1.55 * (0.8 + kickMult * 0.4);
    soundManager.playBicycleKick();

    // High velocity trajectory towards the net & opponent side
    ball.vx = facing * (12 + kickMult * 6);
    ball.vy = -7 - kickMult * 3;
    ball.spin = facing * 0.25;

    addParticles(20, ball.x, ball.y, '#EC4899', 'confetti');
    addParticles(10, ball.x, ball.y, '#FEF08A', 'spark');

  } else if (player.actionState === 'SPIKE') {
    hitType = 'SPIKE';
    floatLabel = 'ВОЛЕЙБОЛЬНЫЙ СПАЙК!';
    labelColor = '#EF4444';
    power = 1.6 * (0.8 + jumpMult * 0.4);
    soundManager.playSpike();

    // Sharp downward spike or steep drive over net
    const distToNet = Math.abs(NET_X - player.x);
    if (distToNet < 180 && player.y < GROUND_Y - 40) {
      ball.vx = facing * (14 + kickMult * 4);
      ball.vy = 8 + kickMult * 3; // Drive down!
    } else {
      ball.vx = facing * (13 + kickMult * 4);
      ball.vy = -4;
    }
    ball.spin = facing * 0.2;

    addParticles(18, ball.x, ball.y, '#EF4444', 'spark');

  } else if (player.actionState === 'HEADER' || (relY <= 26 && !player.isGrounded)) {
    hitType = 'HEAD';
    floatLabel = 'УДАР ГОЛОВОЙ!';
    labelColor = '#F59E0B';
    power = 1.2;
    soundManager.playHeader();

    // High looping setup / header pass
    ball.vx = facing * (6 + kickMult * 4);
    ball.vy = -12 - (player.actionState === 'HEADER' ? 3 : 0);
    ball.spin = facing * 0.1;

    addParticles(12, ball.x, ball.y, '#F59E0B', 'spark');

  } else if (player.actionState === 'CHEST' || (relY > 26 && relY <= 50 && player.actionState === 'IDLE')) {
    hitType = 'CHEST';
    floatLabel = 'ПРИЕМ ГРУДЬЮ!';
    labelColor = '#10B981';
    power = 0.9;
    soundManager.playChest();

    // Soft cushion bounce
    ball.vx = facing * (2 + ctrlMult * 3);
    ball.vy = -7.5 - ctrlMult * 2.5;
    ball.spin = 0;

    addParticles(8, ball.x, ball.y, '#10B981', 'smoke');

  } else if (player.actionState === 'KICK' || relY > 50) {
    hitType = 'FOOT';
    floatLabel = 'ЧЕКАНКА НОГОЙ!';
    labelColor = '#06B6D4';
    power = 1.25 * (0.8 + kickMult * 0.35);
    soundManager.playKick();

    // Powerful foot volley
    const upwardAngle = player.isGrounded ? -13 : -11;
    ball.vx = facing * (8 + kickMult * 5);
    ball.vy = upwardAngle - kickMult * 2;
    ball.spin = facing * 0.15;

    addParticles(14, ball.x, ball.y, '#06B6D4', 'spark');

  } else {
    // Default bump / contact
    hitType = 'BUMP';
    floatLabel = 'ПАС РУКАМИ!';
    labelColor = '#A855F7';
    power = 1.0;
    soundManager.playBump();

    ball.vx = facing * 5;
    ball.vy = -10;

    addParticles(8, ball.x, ball.y, '#A855F7', 'spark');
  }

  // Float text indicator
  addFloatText(ball.x, ball.y - 25, floatLabel, labelColor);

  // Position ball slightly away from player to avoid sticking
  ball.y = Math.min(ball.y, playerTop - 4);

  return { hit: true, hitType, player, speed: power };
}
