import {
  BallPhysics,
  PlayerPhysics,
  AIDifficulty,
  CharacterDef
} from '../types/game';
import { COURT_WIDTH, GROUND_Y, NET_X, NET_TOP_Y } from './physics';

export function updateTeammateAI(
  teammate: PlayerPhysics,
  activePlayer: PlayerPhysics,
  ball: BallPhysics,
  charDef: CharacterDef,
  currentTouches: number
) {
  // Teammate is on LEFT team (x from 40 to NET_X - 40)
  const courtMinX = 50;
  const courtMaxX = NET_X - 45;

  // If active player is close to ball, teammate stays back or provides cover
  const activeDistToBall = Math.hypot(activePlayer.x - ball.x, activePlayer.y - ball.y);
  const teammateDistToBall = Math.hypot(teammate.x - ball.x, teammate.y - ball.y);

  // Is ball on our side of net?
  const ballOnOurSide = ball.x < NET_X;

  let targetX = teammate.playerIndex === 0 ? 200 : 420;

  if (ballOnOurSide) {
    if (activeDistToBall < 110) {
      // Active player is handling it; teammate positions for a return pass
      targetX = activePlayer.x > 320 ? 180 : 440;
    } else {
      // Teammate goes for the ball!
      targetX = Math.max(courtMinX, Math.min(courtMaxX, ball.x + ball.vx * 8));
    }
  } else {
    // Ball on opponent side: assume defensive base position
    targetX = teammate.playerIndex === 0 ? 220 : 430;
  }

  // Smooth movement towards target
  const speed = 4.2 + (charDef.speed / 10) * 2.5;
  const dx = targetX - teammate.x;

  if (Math.abs(dx) > 10) {
    teammate.vx = Math.sign(dx) * Math.min(Math.abs(dx) * 0.2, speed);
    teammate.facing = 1;
    teammate.actionState = 'RUN';
  } else {
    teammate.vx *= 0.6;
    teammate.actionState = 'IDLE';
  }

  // Jump / Action logic
  if (ballOnOurSide && teammateDistToBall < 115) {
    // Jump if ball is high
    if (ball.y < GROUND_Y - 90 && teammate.isGrounded && Math.random() < 0.65) {
      teammate.vy = -12 - (charDef.jumpPower / 10) * 3;
      teammate.isGrounded = false;
    }

    // Decide action
    if (!teammate.isGrounded) {
      if (teammate.x > NET_X - 160 && currentTouches >= 2) {
        // Near net on 3rd touch: SPIKE!
        teammate.actionState = 'SPIKE';
        teammate.actionTimer = 16;
      } else if (ball.y < teammate.y - 70) {
        teammate.actionState = 'HEADER';
        teammate.actionTimer = 14;
      } else if (Math.random() < 0.35) {
        teammate.actionState = 'BICYCLE';
        teammate.actionTimer = 18;
      }
    } else {
      if (ball.y < teammate.y - 45 && ball.y > teammate.y - 65) {
        teammate.actionState = 'CHEST';
        teammate.actionTimer = 12;
      } else {
        teammate.actionState = 'KICK';
        teammate.actionTimer = 12;
      }
    }
  }
}

export function updateOpponentAI(
  opponents: PlayerPhysics[],
  ball: BallPhysics,
  characters: Record<string, CharacterDef>,
  difficulty: AIDifficulty,
  currentTouches: number
) {
  const courtMinX = NET_X + 45;
  const courtMaxX = COURT_WIDTH - 50;

  // Difficulty parameters
  const reactionLead = difficulty === 'HARD' ? 14 : difficulty === 'NORMAL' ? 10 : 6;
  const errorChance = difficulty === 'EASY' ? 0.25 : difficulty === 'NORMAL' ? 0.08 : 0.02;
  const maxSpeedMult = difficulty === 'HARD' ? 1.15 : difficulty === 'NORMAL' ? 0.95 : 0.75;

  const ballOnOpponentSide = ball.x > NET_X;

  // Decide which opponent is primary defender
  const dist0 = Math.hypot(opponents[0].x - ball.x, opponents[0].y - ball.y);
  const dist1 = Math.hypot(opponents[1].x - ball.x, opponents[1].y - ball.y);

  const primaryIdx = dist0 <= dist1 ? 0 : 1;
  const supportIdx = primaryIdx === 0 ? 1 : 0;

  const primary = opponents[primaryIdx];
  const support = opponents[supportIdx];
  const primaryChar = characters[primary.characterId] || { speed: 7, jumpPower: 7, kickPower: 7, control: 7 };
  const supportChar = characters[support.characterId] || { speed: 7, jumpPower: 7, kickPower: 7, control: 7 };

  // Primary opponent target
  let primaryTargetX = 850;
  if (ballOnOpponentSide) {
    // Anticipate landing spot
    primaryTargetX = ball.x + ball.vx * reactionLead;
    if (Math.random() < errorChance) {
      primaryTargetX += (Math.random() - 0.5) * 80; // Small tactical error
    }
  } else {
    // Waiting defensively
    primaryTargetX = 820;
  }
  primaryTargetX = Math.max(courtMinX, Math.min(courtMaxX, primaryTargetX));

  // Support opponent target (stays covering the rear or front)
  let supportTargetX = primaryTargetX > 900 ? 760 : 1020;
  supportTargetX = Math.max(courtMinX, Math.min(courtMaxX, supportTargetX));

  // Move Primary
  const pSpeed = (4.5 + (primaryChar.speed / 10) * 2.8) * maxSpeedMult;
  const pDx = primaryTargetX - primary.x;
  if (Math.abs(pDx) > 10) {
    primary.vx = Math.sign(pDx) * Math.min(Math.abs(pDx) * 0.22, pSpeed);
    primary.facing = -1;
    primary.actionState = 'RUN';
  } else {
    primary.vx *= 0.6;
    primary.actionState = 'IDLE';
  }

  // Move Support
  const sSpeed = (4.0 + (supportChar.speed / 10) * 2.2) * maxSpeedMult;
  const sDx = supportTargetX - support.x;
  if (Math.abs(sDx) > 12) {
    support.vx = Math.sign(sDx) * Math.min(Math.abs(sDx) * 0.18, sSpeed);
    support.facing = -1;
    support.actionState = 'RUN';
  } else {
    support.vx *= 0.6;
    support.actionState = 'IDLE';
  }

  // Primary jump / hit actions
  const primaryDist = Math.hypot(primary.x - ball.x, primary.y - ball.y);
  if (ballOnOpponentSide && primaryDist < 110) {
    // Jump if ball is in mid air
    if (ball.y < GROUND_Y - 80 && primary.isGrounded && Math.random() < 0.85) {
      primary.vy = -12 - (primaryChar.jumpPower / 10) * 3.5;
      primary.isGrounded = false;
    }

    if (!primary.isGrounded) {
      // Near net on 2nd or 3rd touch: Spike!
      if (primary.x < NET_X + 160 && currentTouches >= 1) {
        primary.actionState = 'SPIKE';
        primary.actionTimer = 16;
      } else if (ball.y < primary.y - 65) {
        primary.actionState = 'HEADER';
        primary.actionTimer = 14;
      } else {
        primary.actionState = 'BICYCLE';
        primary.actionTimer = 16;
      }
    } else {
      if (ball.y < primary.y - 45 && ball.y > primary.y - 65) {
        primary.actionState = 'CHEST';
        primary.actionTimer = 12;
      } else {
        primary.actionState = 'KICK';
        primary.actionTimer = 12;
      }
    }
  }

  // Support block at net if ball is high near net on left side
  if (!ballOnOpponentSide && ball.x > NET_X - 120 && ball.y < NET_TOP_Y + 50) {
    if (support.x > NET_X + 40 && support.x < NET_X + 90 && support.isGrounded) {
      support.vy = -14;
      support.isGrounded = false;
      support.actionState = 'SPIKE'; // Block wall!
      support.actionTimer = 20;
    }
  }
}
