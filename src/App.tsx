/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BallPhysics,
  PlayerPhysics,
  MatchStats,
  GameMode,
  AIDifficulty,
  LocationDef,
  BallDef,
  CharacterDef,
  Particle,
  HitFloatText,
} from './types/game';
import { INITIAL_CHARACTERS } from './game/characters';
import { INITIAL_LOCATIONS } from './game/locations';
import { INITIAL_BALLS } from './game/balls';
import {
  COURT_WIDTH,
  COURT_HEIGHT,
  GROUND_Y,
  NET_X,
  createBall,
  createPlayer,
  updateBallPhysics,
  checkPlayerBallCollision,
} from './game/physics';
import { updateTeammateAI, updateOpponentAI } from './game/ai';
import { GameRenderer } from './game/renderer';
import { GameScene3D } from './game/scene3d';
import { soundManager } from './audio/soundManager';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { LocationSelectModal } from './components/LocationSelectModal';
import { ShopModal } from './components/ShopModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { ModeSelectModal } from './components/ModeSelectModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const scene3DRef = useRef<GameScene3D | null>(null);

  // Persistence State
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('footvolley_coins');
    return saved !== null ? parseInt(saved, 10) : 150;
  });

  const [characters, setCharacters] = useState<CharacterDef[]>(() => {
    const saved = localStorage.getItem('footvolley_characters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_CHARACTERS.map((c) => ({
          ...c,
          unlocked: parsed[c.id] !== undefined ? parsed[c.id] : c.unlocked,
        }));
      } catch {
        return INITIAL_CHARACTERS;
      }
    }
    return INITIAL_CHARACTERS;
  });

  const [locations, setLocations] = useState<LocationDef[]>(() => {
    const saved = localStorage.getItem('footvolley_locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_LOCATIONS.map((l) => ({
          ...l,
          unlocked: parsed[l.id] !== undefined ? parsed[l.id] : l.unlocked,
        }));
      } catch {
        return INITIAL_LOCATIONS;
      }
    }
    return INITIAL_LOCATIONS;
  });

  const [balls, setBalls] = useState<BallDef[]>(() => {
    const saved = localStorage.getItem('footvolley_balls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_BALLS.map((b) => ({
          ...b,
          unlocked: parsed[b.id] !== undefined ? parsed[b.id] : b.unlocked,
        }));
      } catch {
        return INITIAL_BALLS;
      }
    }
    return INITIAL_BALLS;
  });

  // Selected Assets
  const [p1CharId, setP1CharId] = useState<string>('leo');
  const [p2CharId, setP2CharId] = useState<string>('mia');
  const [activeLocationId, setActiveLocationId] = useState<string>('beach');
  const [activeBallId, setActiveBallId] = useState<string>('soccer');
  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0);

  // Game Settings & UI States
  const [gameMode, setGameMode] = useState<GameMode>('MATCH_2V2');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('NORMAL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTitleOpen, setIsTitleOpen] = useState<boolean>(true);
  const [isCharModalOpen, setIsCharModalOpen] = useState<boolean>(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState<boolean>(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);

  // Match Statistics
  const [stats, setStats] = useState<MatchStats>({
    leftScore: 0,
    rightScore: 0,
    targetScore: 5,
    leftTouches: 0,
    rightTouches: 0,
    keepUpCombo: 0,
    maxCombo: 0,
    totalHits: 0,
    bicycleKicks: 0,
    spikes: 0,
    headers: 0,
    chestControls: 0,
    coinsEarned: 0,
    winner: null,
    matchOver: false,
    isPaused: false,
  });

  // Physics References
  const ballRef = useRef<BallPhysics>(createBall());
  const playersRef = useRef<PlayerPhysics[]>([
    createPlayer('LEFT', 0, 'leo'),
    createPlayer('LEFT', 1, 'mia'),
    createPlayer('RIGHT', 0, 'bruno'),
    createPlayer('RIGHT', 1, 'sasha'),
  ]);
  const particlesRef = useRef<Particle[]>([]);
  const floatTextsRef = useRef<HitFloatText[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const mobileInputRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Update Character IDs in players and refresh 3D models
  useEffect(() => {
    playersRef.current[0].characterId = p1CharId;
    playersRef.current[1].characterId = p2CharId;
    if (scene3DRef.current) {
      scene3DRef.current.updateCharactersAppearance(characters, playersRef.current);
    }
  }, [p1CharId, p2CharId, characters]);

  // Update 3D Ball appearance
  useEffect(() => {
    if (scene3DRef.current) {
      const curBall = balls.find((b) => b.id === activeBallId) || balls[0];
      scene3DRef.current.updateBallAppearance(curBall);
    }
  }, [activeBallId, balls]);

  // Save coins
  useEffect(() => {
    localStorage.setItem('footvolley_coins', coins.toString());
  }, [coins]);

  // Particle and Float text helpers
  const addParticles = useCallback(
    (count: number, x: number, y: number, color: string, type: Particle['type'] = 'spark') => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color,
          size: Math.random() * 4 + 3,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          type,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.2,
        });
      }
    },
    []
  );

  const addFloatText = useCallback((x: number, y: number, text: string, color: string) => {
    floatTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1,
      vy: -2,
    });
  }, []);

  // Switch Active Player
  const handleSwitchPlayer = useCallback(() => {
    soundManager.playSwitchPlayer();
    setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
  }, []);

  // Reset ball after point
  const resetBall = useCallback(
    (servingTeam: 'LEFT' | 'RIGHT') => {
      const serveX = servingTeam === 'LEFT' ? 320 : 880;
      ballRef.current = {
        ...createBall(),
        x: serveX,
        y: 200,
        vx: servingTeam === 'LEFT' ? 3 : -3,
        vy: -4,
        lastTouchTeam: null,
      };
      setStats((prev) => ({
        ...prev,
        leftTouches: 0,
        rightTouches: 0,
      }));
    },
    []
  );

  // Handle Point Scored
  const handlePointScored = useCallback(
    (scoringTeam: 'LEFT' | 'RIGHT') => {
      soundManager.playWhistle();

      setStats((prev) => {
        const nextLeft = scoringTeam === 'LEFT' ? prev.leftScore + 1 : prev.leftScore;
        const nextRight = scoringTeam === 'RIGHT' ? prev.rightScore + 1 : prev.rightScore;
        const isMatchOver =
          gameMode === 'MATCH_2V2' && (nextLeft >= prev.targetScore || nextRight >= prev.targetScore);

        if (scoringTeam === 'LEFT') {
          soundManager.playScorePoint();
          soundManager.playCheer();
          addFloatText(COURT_WIDTH / 4, 300, 'ОЧКО ВАМ! 🏆', '#38BDF8');
          addParticles(35, COURT_WIDTH / 4, 300, '#38BDF8', 'confetti');

          // Add coins
          const activeBall = balls.find((b) => b.id === activeBallId);
          const bonusMult = activeBall ? activeBall.bonusCoinMultiplier : 1;
          const pointCoins = Math.round(15 * bonusMult);
          setCoins((c) => c + pointCoins);

          if (isMatchOver) {
            setCoins((c) => c + 100); // Win bonus
            setTimeout(() => {
              setIsGameOverOpen(true);
            }, 600);
          }
        } else {
          addFloatText((COURT_WIDTH * 3) / 4, 300, 'ОЧКО СОПЕРНИКУ!', '#F43F5E');
          if (isMatchOver) {
            setTimeout(() => {
              setIsGameOverOpen(true);
            }, 600);
          }
        }

        if (gameMode === 'ENDLESS_JUGGLE') {
          // In endless mode, ball touching ground ends current rally
          setTimeout(() => {
            setIsGameOverOpen(true);
          }, 400);
        }

        return {
          ...prev,
          leftScore: nextLeft,
          rightScore: nextRight,
          leftTouches: 0,
          rightTouches: 0,
          keepUpCombo: 0,
          coinsEarned: prev.coinsEarned + (scoringTeam === 'LEFT' ? 15 : 0),
          winner: isMatchOver ? (nextLeft >= prev.targetScore ? 'LEFT' : 'RIGHT') : null,
          matchOver: isMatchOver,
        };
      });

      // Serve to team that just won point
      resetBall(scoringTeam);
    },
    [gameMode, balls, activeBallId, addFloatText, addParticles, resetBall]
  );

  // Keyboard Event Handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === 'Space' || e.code === 'KeyQ') {
        e.preventDefault();
        handleSwitchPlayer();
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleSwitchPlayer]);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    if (threeCanvasRef.current && !scene3DRef.current) {
      scene3DRef.current = new GameScene3D(threeCanvasRef.current);
      scene3DRef.current.initCharacters(characters, playersRef.current);
      const curBall = balls.find((b) => b.id === activeBallId) || balls[0];
      scene3DRef.current.updateBallAppearance(curBall);
    }
    let animFrameId: number;
    let animTime = 0;

    const charsMap = characters.reduce<Record<string, CharacterDef>>((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    const gameLoop = () => {
      animFrameId = requestAnimationFrame(gameLoop);
      animTime += 0.025;

      if (isPaused || isTitleOpen || isGameOverOpen) {
        // Just render paused frame
        const currentLoc = locations.find((l) => l.id === activeLocationId) || locations[0];
        const currentBall = balls.find((b) => b.id === activeBallId) || balls[0];
        rendererRef.current?.render(
          ballRef.current,
          playersRef.current,
          activePlayerIndex,
          currentLoc,
          currentBall,
          charsMap,
          particlesRef.current,
          floatTextsRef.current,
          gameMode === 'LOCAL_PVP',
          false
        );
        scene3DRef.current?.render(
          ballRef.current,
          playersRef.current,
          activePlayerIndex,
          animTime,
          gameMode === 'LOCAL_PVP'
        );
        return;
      }

      const keys = keysRef.current;
      const mInput = mobileInputRef.current;
      const activeChar = charsMap[playersRef.current[activePlayerIndex].characterId] || characters[0];
      const activeP = playersRef.current[activePlayerIndex];

      // 1. User Control of Active Player (Left Team)
      const pSpeed = 4.8 + (activeChar.speed / 10) * 2.8;
      const moveLeft = keys['KeyA'] || keys['ArrowLeft'] || mInput.left;
      const moveRight = keys['KeyD'] || keys['ArrowRight'] || mInput.right;

      if (moveLeft && !moveRight) {
        activeP.vx = -pSpeed;
        activeP.facing = 1; // Always face the net
        activeP.actionState = 'RUN';
      } else if (moveRight && !moveLeft) {
        activeP.vx = pSpeed;
        activeP.facing = 1;
        activeP.actionState = 'RUN';
      } else {
        activeP.vx *= 0.65;
        if (activeP.actionTimer <= 0) {
          activeP.actionState = 'IDLE';
        }
      }

      // Jump
      const jumpKey = keys['KeyW'] || keys['ArrowUp'];
      if (jumpKey && activeP.isGrounded) {
        activeP.vy = -12.5 - (activeChar.jumpPower / 10) * 3.5;
        activeP.isGrounded = false;
        soundManager.playHeader();
      }

      // Action: Kick / Bicycle
      const kickKey = keys['KeyJ'] || keys['KeyZ'] || keys['KeyF'];
      if (kickKey && activeP.actionTimer <= 0) {
        if (!activeP.isGrounded) {
          activeP.actionState = 'BICYCLE';
          activeP.actionTimer = 16;
        } else {
          activeP.actionState = 'KICK';
          activeP.actionTimer = 14;
        }
      }

      // Action: Header / Chest
      const headKey = keys['KeyK'] || keys['KeyX'];
      if (headKey && activeP.actionTimer <= 0) {
        if (!activeP.isGrounded) {
          activeP.actionState = 'HEADER';
          activeP.actionTimer = 14;
        } else {
          activeP.actionState = 'CHEST';
          activeP.actionTimer = 12;
        }
      }

      // Action: Spike / Hands
      const spikeKey = keys['KeyL'] || keys['KeyC'];
      if (spikeKey && activeP.actionTimer <= 0) {
        activeP.actionState = 'SPIKE';
        activeP.actionTimer = 16;
      }

      // Decrement action timers
      for (const p of playersRef.current) {
        if (p.actionTimer > 0) {
          p.actionTimer--;
          if (p.actionTimer === 0 && p.isGrounded) {
            p.actionState = 'IDLE';
          }
        }
      }

      // 2. Teammate AI (Inactive player on Left Team)
      const inactivePlayerIndex = activePlayerIndex === 0 ? 1 : 0;
      const teammateP = playersRef.current[inactivePlayerIndex];
      const teammateChar = charsMap[teammateP.characterId] || characters[1];
      updateTeammateAI(teammateP, activeP, ballRef.current, teammateChar, stats.leftTouches);

      // 3. Opponent AI (Right Team) or Local P2
      if (gameMode === 'LOCAL_PVP') {
        // Player 2 controls right player 0
        const p2 = playersRef.current[2];
        const p2Speed = 5.2;
        if (keys['KeyI'] && p2.isGrounded) {
          p2.vy = -14;
          p2.isGrounded = false;
        }
        if (keys['KeyJ']) {
          p2.vx = -p2Speed;
          p2.actionState = 'RUN';
        } else if (keys['KeyL']) {
          p2.vx = p2Speed;
          p2.actionState = 'RUN';
        } else {
          p2.vx *= 0.65;
        }
        if (keys['KeyU']) {
          p2.actionState = 'KICK';
          p2.actionTimer = 14;
        }
      } else {
        updateOpponentAI(
          [playersRef.current[2], playersRef.current[3]],
          ballRef.current,
          charsMap,
          difficulty,
          stats.rightTouches
        );
      }

      // 4. Update Player Positions & Ground Collisions
      for (const p of playersRef.current) {
        // Apply player gravity
        if (!p.isGrounded) {
          p.vy += 0.68;
        }
        p.x += p.vx;
        p.y += p.vy;

        // Ground constraint
        if (p.y >= GROUND_Y) {
          p.y = GROUND_Y;
          p.vy = 0;
          p.isGrounded = true;
        }

        // Court side limits (cannot cross net!)
        if (p.team === 'LEFT') {
          p.x = Math.max(30, Math.min(NET_X - 35, p.x));
        } else {
          p.x = Math.max(NET_X + 35, Math.min(COURT_WIDTH - 30, p.x));
        }
      }

      // 5. Update Ball Physics
      updateBallPhysics(
        ballRef.current,
        particlesRef.current,
        addFloatText,
        (groundSide) => {
          // Ball hit the ground!
          if (groundSide === 'LEFT') {
            handlePointScored('RIGHT');
          } else {
            handlePointScored('LEFT');
          }
        }
      );

      // 6. Check Player-Ball Collisions
      for (const p of playersRef.current) {
        const char = charsMap[p.characterId] || characters[0];
        const res = checkPlayerBallCollision(
          p,
          ballRef.current,
          char,
          addParticles,
          addFloatText
        );

        if (res.hit) {
          const ball = ballRef.current;
          const isLeft = p.team === 'LEFT';

          // Keep-Up Rally Combo
          setStats((prev) => {
            const nextCombo = prev.keepUpCombo + 1;
            const newMax = Math.max(prev.maxCombo, nextCombo);
            let nextLeftTouches = prev.leftTouches;
            let nextRightTouches = prev.rightTouches;

            if (isLeft) {
              if (ball.lastTouchTeam === 'RIGHT') {
                nextLeftTouches = 1;
              } else {
                nextLeftTouches++;
              }
            } else {
              if (ball.lastTouchTeam === 'LEFT') {
                nextRightTouches = 1;
              } else {
                nextRightTouches++;
              }
            }

            // Max 3 touches check in Match Mode
            if (gameMode === 'MATCH_2V2') {
              if (nextLeftTouches > 3) {
                // Foul: 4 touches!
                setTimeout(() => handlePointScored('RIGHT'), 100);
                addFloatText(p.x, p.y - 40, 'БОЛЕЕ 3 КАСАНИЙ!', '#EF4444');
              } else if (nextRightTouches > 3) {
                setTimeout(() => handlePointScored('LEFT'), 100);
                addFloatText(p.x, p.y - 40, 'БОЛЕЕ 3 КАСАНИЙ!', '#38BDF8');
              }
            }

            // Record trick stats
            const isBicycle = res.hitType === 'BICYCLE';
            const isSpike = res.hitType === 'SPIKE';
            const isHeader = res.hitType === 'HEAD';
            const isChest = res.hitType === 'CHEST';

            // Earn coins on keep-up
            const curBall = balls.find((b) => b.id === activeBallId);
            const mult = curBall ? curBall.bonusCoinMultiplier : 1;
            const earnedCoins = Math.round((isBicycle ? 6 : isSpike ? 5 : 2) * mult);
            setCoins((c) => c + earnedCoins);

            return {
              ...prev,
              keepUpCombo: nextCombo,
              maxCombo: newMax,
              totalHits: prev.totalHits + 1,
              leftTouches: nextLeftTouches,
              rightTouches: nextRightTouches,
              bicycleKicks: prev.bicycleKicks + (isBicycle ? 1 : 0),
              spikes: prev.spikes + (isSpike ? 1 : 0),
              headers: prev.headers + (isHeader ? 1 : 0),
              chestControls: prev.chestControls + (isChest ? 1 : 0),
              coinsEarned: prev.coinsEarned + earnedCoins,
            };
          });

          ball.lastTouchTeam = p.team;
          ball.lastTouchPlayer = char.name;
          ball.lastHitType = res.hitType || 'FOOT';
          break; // Avoid double collision within single tick
        }
      }

      // 7. Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.18; // particle gravity
        pt.alpha -= pt.decay;
        if (pt.rotation !== undefined && pt.rotSpeed !== undefined) {
          pt.rotation += pt.rotSpeed;
        }
        if (pt.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 8. Update Floating Texts
      for (let i = floatTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatTextsRef.current[i];
        ft.y += ft.vy;
        ft.alpha -= 0.022;
        ft.scale = Math.min(1.2, ft.scale + 0.015);
        if (ft.alpha <= 0) {
          floatTextsRef.current.splice(i, 1);
        }
      }

      // 9. Render Frame
      const currentLoc = locations.find((l) => l.id === activeLocationId) || locations[0];
      const currentBall = balls.find((b) => b.id === activeBallId) || balls[0];

      rendererRef.current?.render(
        ballRef.current,
        playersRef.current,
        activePlayerIndex,
        currentLoc,
        currentBall,
        charsMap,
        particlesRef.current,
        floatTextsRef.current,
        gameMode === 'LOCAL_PVP',
        false
      );

      scene3DRef.current?.render(
        ballRef.current,
        playersRef.current,
        activePlayerIndex,
        animTime,
        gameMode === 'LOCAL_PVP'
      );
    };

    animFrameId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animFrameId);
      scene3DRef.current?.dispose();
      scene3DRef.current = null;
    };
  }, [
    activeLocationId,
    activeBallId,
    activePlayerIndex,
    gameMode,
    difficulty,
    isPaused,
    isTitleOpen,
    isGameOverOpen,
    characters,
    locations,
    balls,
    addParticles,
    addFloatText,
    handlePointScored,
  ]);

  // Touch triggers
  const handleTouchJump = () => {
    const activeP = playersRef.current[activePlayerIndex];
    if (activeP.isGrounded) {
      activeP.vy = -14;
      activeP.isGrounded = false;
      soundManager.playHeader();
    }
  };

  const handleTouchKick = () => {
    const activeP = playersRef.current[activePlayerIndex];
    if (!activeP.isGrounded) {
      activeP.actionState = 'BICYCLE';
      activeP.actionTimer = 16;
    } else {
      activeP.actionState = 'KICK';
      activeP.actionTimer = 14;
    }
  };

  const handleTouchHeader = () => {
    const activeP = playersRef.current[activePlayerIndex];
    if (!activeP.isGrounded) {
      activeP.actionState = 'HEADER';
      activeP.actionTimer = 14;
    } else {
      activeP.actionState = 'CHEST';
      activeP.actionTimer = 12;
    }
  };

  const handleTouchSpike = () => {
    const activeP = playersRef.current[activePlayerIndex];
    activeP.actionState = 'SPIKE';
    activeP.actionTimer = 16;
  };

  // Unlocking helpers
  const handleUnlockCharacter = (id: string, price: number) => {
    if (coins < price) return;
    setCoins((c) => c - price);
    setCharacters((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, unlocked: true } : c));
      const saveObj = updated.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = item.unlocked;
        return acc;
      }, {});
      localStorage.setItem('footvolley_characters', JSON.stringify(saveObj));
      return updated;
    });
    soundManager.playCoin();
  };

  const handleUnlockLocation = (id: string, price: number) => {
    if (coins < price) return;
    setCoins((c) => c - price);
    setLocations((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, unlocked: true } : l));
      const saveObj = updated.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = item.unlocked;
        return acc;
      }, {});
      localStorage.setItem('footvolley_locations', JSON.stringify(saveObj));
      return updated;
    });
    soundManager.playCoin();
  };

  const handleUnlockBall = (id: string, price: number) => {
    if (coins < price) return;
    setCoins((c) => c - price);
    setBalls((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, unlocked: true } : b));
      const saveObj = updated.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = item.unlocked;
        return acc;
      }, {});
      localStorage.setItem('footvolley_balls', JSON.stringify(saveObj));
      return updated;
    });
    soundManager.playCoin();
  };

  // Restart match
  const handleRestart = () => {
    setIsPaused(false);
    setIsGameOverOpen(false);
    setStats({
      leftScore: 0,
      rightScore: 0,
      targetScore: 5,
      leftTouches: 0,
      rightTouches: 0,
      keepUpCombo: 0,
      maxCombo: 0,
      totalHits: 0,
      bicycleKicks: 0,
      spikes: 0,
      headers: 0,
      chestControls: 0,
      coinsEarned: 0,
      winner: null,
      matchOver: false,
      isPaused: false,
    });
    resetBall('LEFT');
  };

  const activeChar = characters.find((c) =>
    activePlayerIndex === 0 ? c.id === p1CharId : c.id === p2CharId
  ) || characters[0];
  const p1Char = characters.find((c) => c.id === p1CharId) || characters[0];
  const p2Char = characters.find((c) => c.id === p2CharId) || characters[1];
  const activeLocation = locations.find((l) => l.id === activeLocationId) || locations[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center font-['Outfit',sans-serif]">
      {/* Heads Up Display */}
      <HUD
        stats={stats}
        location={activeLocation}
        gameMode={gameMode}
        activePlayerIndex={activePlayerIndex}
        p1Char={p1Char}
        p2Char={p2Char}
        soundEnabled={soundEnabled}
        coins={coins}
        onToggleSound={() => {
          soundManager.enabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
        onPause={() => setIsPaused(true)}
        onSwitchPlayer={handleSwitchPlayer}
        onOpenCharacters={() => setIsCharModalOpen(true)}
        onOpenLocations={() => setIsLocModalOpen(true)}
        onOpenShop={() => setIsShopModalOpen(true)}
      />

      {/* Main Game Canvases: 2D Environment & 3D Three.js Articulated Characters */}
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={COURT_WIDTH}
          height={COURT_HEIGHT}
          className="w-full h-full max-h-screen object-contain shadow-2xl"
        />
        <canvas
          ref={threeCanvasRef}
          width={COURT_WIDTH}
          height={COURT_HEIGHT}
          className="absolute inset-0 w-full h-full max-h-screen object-contain pointer-events-none"
        />
      </div>

      {/* Touch Screen Controls for Mobile */}
      <TouchControls
        onMoveLeft={(val) => {
          mobileInputRef.current.left = val;
        }}
        onMoveRight={(val) => {
          mobileInputRef.current.right = val;
        }}
        onJump={handleTouchJump}
        onKick={handleTouchKick}
        onHeader={handleTouchHeader}
        onSpike={handleTouchSpike}
        onSwitchPlayer={handleSwitchPlayer}
        activePlayerName={activeChar.name}
      />

      {/* Modals */}
      {isTitleOpen && (
        <ModeSelectModal
          currentMode={gameMode}
          onSelectMode={(m) => setGameMode(m)}
          onStartGame={() => {
            soundManager.playWhistle();
            setIsTitleOpen(false);
            handleRestart();
          }}
          onOpenCharacters={() => setIsCharModalOpen(true)}
          onOpenLocations={() => setIsLocModalOpen(true)}
          onOpenShop={() => setIsShopModalOpen(true)}
        />
      )}

      {isCharModalOpen && (
        <CharacterSelectModal
          characters={characters}
          p1CharId={p1CharId}
          p2CharId={p2CharId}
          coins={coins}
          onSelectP1={(id) => setP1CharId(id)}
          onSelectP2={(id) => setP2CharId(id)}
          onUnlockCharacter={handleUnlockCharacter}
          onClose={() => setIsCharModalOpen(false)}
        />
      )}

      {isLocModalOpen && (
        <LocationSelectModal
          locations={locations}
          activeLocationId={activeLocationId}
          coins={coins}
          onSelectLocation={(id) => setActiveLocationId(id)}
          onUnlockLocation={handleUnlockLocation}
          onClose={() => setIsLocModalOpen(false)}
        />
      )}

      {isShopModalOpen && (
        <ShopModal
          balls={balls}
          activeBallId={activeBallId}
          coins={coins}
          onSelectBall={(id) => setActiveBallId(id)}
          onUnlockBall={handleUnlockBall}
          onClose={() => setIsShopModalOpen(false)}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onSelectMode={(m) => {
            setGameMode(m);
            handleRestart();
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            soundManager.enabled = !soundEnabled;
            setSoundEnabled(!soundEnabled);
          }}
          difficulty={difficulty}
          onChangeDifficulty={(d) => setDifficulty(d)}
          gameMode={gameMode}
        />
      )}

      {isGameOverOpen && (
        <GameOverModal
          stats={stats}
          gameMode={gameMode}
          onPlayAgain={handleRestart}
          onOpenCharacters={() => {
            setIsGameOverOpen(false);
            setIsCharModalOpen(true);
          }}
          onOpenLocations={() => {
            setIsGameOverOpen(false);
            setIsLocModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
