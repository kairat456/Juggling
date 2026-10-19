import {
  BallPhysics,
  PlayerPhysics,
  LocationDef,
  BallDef,
  CharacterDef,
  Particle,
  HitFloatText
} from '../types/game';
import { COURT_WIDTH, COURT_HEIGHT, GROUND_Y, NET_X, NET_WIDTH, NET_TOP_Y } from './physics';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    ball: BallPhysics,
    players: PlayerPhysics[],
    activePlayerIndex: 0 | 1,
    location: LocationDef,
    ballDef: BallDef,
    characters: Record<string, CharacterDef>,
    particles: Particle[],
    floatTexts: HitFloatText[],
    isLocalPvp: boolean = false,
    render2DPlayers: boolean = false
  ) {
    this.animTime += 0.025;
    const ctx = this.ctx;

    // Clear frame
    ctx.clearRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

    // 1. Render Location Background & Environment
    this.renderEnvironment(location);

    // 2. Render Parquet reflection if indoor arena
    if (location.groundType === 'wood') {
      this.renderFloorReflection(players, ball, characters);
    }

    // 3. Render Court Ground
    this.renderCourt(location);

    // 4. Render Net
    this.renderNet(location);

    // 5. Render Players (only if 2D mode fallback requested)
    if (render2DPlayers) {
      for (const player of players) {
        const charDef = characters[player.characterId] || {
          name: 'Player',
          skinColor: '#F5D0A9',
          hairColor: '#4A3728',
          hairStyle: 'short',
          jerseyColor: '#2563EB',
          shortsColor: '#1E293B',
          shoesColor: '#EF4444',
        };
        const isActive = player.team === 'LEFT' && player.playerIndex === activePlayerIndex;
        const isSecondActive = isLocalPvp && player.team === 'RIGHT' && player.playerIndex === 0;
        this.renderPlayer(player, charDef as CharacterDef, isActive, isSecondActive);
      }
    }

    // 6. Render Ball & Trail
    this.renderBall(ball, ballDef);

    // 7. Render Particles
    this.renderParticles(particles);

    // 8. Render Floating Hit Texts
    this.renderFloatTexts(floatTexts);
  }

  private renderEnvironment(loc: LocationDef) {
    const ctx = this.ctx;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, loc.skyGradient[0]);
    skyGrad.addColorStop(1, loc.skyGradient[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, COURT_WIDTH, GROUND_Y);

    if (loc.id === 'beach') {
      this.renderBeachBackground();
    } else if (loc.id === 'lawn') {
      this.renderLawnBackground();
    } else if (loc.id === 'stadium') {
      this.renderStadiumBackground();
    } else if (loc.id === 'arena') {
      this.renderArenaBackground();
    }
  }

  private renderBeachBackground() {
    const ctx = this.ctx;
    // Glowing Sun
    ctx.save();
    const sunGrad = ctx.createRadialGradient(220, 140, 10, 220, 140, 90);
    sunGrad.addColorStop(0, '#FFFBEB');
    sunGrad.addColorStop(0.3, '#FDE047');
    sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(220, 140, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ocean Waves
    const oceanY = GROUND_Y - 140;
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(0, oceanY, COURT_WIDTH, 140);

    // Animated surf crest
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, oceanY);
    for (let x = 0; x <= COURT_WIDTH; x += 30) {
      const y = oceanY + Math.sin(x * 0.02 + this.animTime * 2) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(COURT_WIDTH, oceanY + 50);
    ctx.lineTo(0, oceanY + 50);
    ctx.fill();

    // Foam crest
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= COURT_WIDTH; x += 25) {
      const y = oceanY + Math.sin(x * 0.02 + this.animTime * 2) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Swaying Palm Trees on Left and Right borders
    this.drawPalmTree(70, oceanY + 120, -0.15 + Math.sin(this.animTime) * 0.04);
    this.drawPalmTree(1140, oceanY + 120, 0.12 + Math.cos(this.animTime) * 0.04);
  }

  private drawPalmTree(baseX: number, baseY: number, sway: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(sway);

    // Trunk
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -120, 5, -230);
    ctx.stroke();

    // Trunk segments
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -120, 5, -230);
    ctx.stroke();

    // Fronds
    const frondColors = ['#15803D', '#16A34A', '#22C55E'];
    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI) / 3.5 - Math.PI / 1.2;
      ctx.strokeStyle = frondColors[i % 3];
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(5, -230);
      const endX = 5 + Math.cos(angle) * 90;
      const endY = -230 + Math.sin(angle) * 70;
      ctx.quadraticCurveTo(5 + Math.cos(angle) * 45, -260 + Math.sin(angle) * 30, endX, endY);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderLawnBackground() {
    const ctx = this.ctx;

    // Distant City Skyline
    ctx.fillStyle = '#0F172A22';
    const buildings = [
      { x: 40, w: 90, h: 220 },
      { x: 150, w: 120, h: 280 },
      { x: 290, w: 80, h: 190 },
      { x: 390, w: 130, h: 320 },
      { x: 540, w: 110, h: 260 },
      { x: 670, w: 140, h: 310 },
      { x: 830, w: 100, h: 240 },
      { x: 950, w: 130, h: 290 },
      { x: 1100, w: 90, h: 210 },
    ];
    for (const b of buildings) {
      ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
    }

    // Midground trees & fence
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    for (let x = 0; x <= COURT_WIDTH; x += 120) {
      ctx.arc(x + 60, GROUND_Y - 40, 55, Math.PI, 0);
    }
    ctx.fill();

    // Chainlink fence line
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 70);
    ctx.lineTo(COURT_WIDTH, GROUND_Y - 70);
    ctx.stroke();
  }

  private renderStadiumBackground() {
    const ctx = this.ctx;

    // Stadium Grandstand Tiers
    const standY = 160;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, standY, COURT_WIDTH, GROUND_Y - standY);

    // Cheering Crowd rows (animated multi-colored dots)
    const dotColors = ['#EF4444', '#3B82F6', '#F59E0B', '#FFFFFF', '#10B981', '#A855F7'];
    ctx.save();
    for (let row = standY + 15; row < GROUND_Y - 90; row += 22) {
      for (let col = 20; col < COURT_WIDTH; col += 24) {
        // Subtle cheering bobbing
        const bob = Math.sin(this.animTime * 4 + col * 0.1) > 0.4 ? -3 : 0;
        const colorIdx = Math.floor((col * 17 + row * 11) % dotColors.length);
        ctx.fillStyle = dotColors[colorIdx];
        ctx.beginPath();
        ctx.arc(col, row + bob, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Digital LED banner strip
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, GROUND_Y - 85, COURT_WIDTH, 40);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    const bannerOffset = (this.animTime * 80) % 600;
    for (let i = -600; i < COURT_WIDTH + 600; i += 600) {
      ctx.fillText('⚽ FOOTVOLLEY DUO CHAMPIONSHIP 2026 ✦ KEEP THE BALL FLYING! ✦ 🏆', i + bannerOffset, GROUND_Y - 60);
    }

    // Floodlight beams shining down
    ctx.save();
    const lightTowers = [150, 420, 780, 1050];
    for (const lx of lightTowers) {
      const grad = ctx.createRadialGradient(lx, 30, 10, lx, 300, 380);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(lx - 25, 30);
      ctx.lineTo(lx + 25, 30);
      ctx.lineTo(lx + 220, GROUND_Y);
      ctx.lineTo(lx - 220, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Floodlight housing
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(lx - 25, 15, 50, 18);
    }
    ctx.restore();
  }

  private renderArenaBackground() {
    const ctx = this.ctx;

    // Rafters / Industrial Ceiling Grid
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 3;
    for (let x = 0; x <= COURT_WIDTH; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 50, 120);
      ctx.lineTo(x + 100, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(COURT_WIDTH, 120);
    ctx.stroke();

    // Central suspended scoreboard / Jumbotron
    ctx.fillStyle = '#09090B';
    ctx.fillRect(NET_X - 110, 30, 220, 75);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.strokeRect(NET_X - 110, 30, 220, 75);

    // Scoreboard cables
    ctx.strokeStyle = '#71717A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(NET_X - 90, 0);
    ctx.lineTo(NET_X - 90, 30);
    ctx.moveTo(NET_X + 90, 0);
    ctx.lineTo(NET_X + 90, 30);
    ctx.stroke();

    // Scoreboard display text
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRO ARENA LEAGUE', NET_X, 56);
    ctx.fillStyle = '#38BDF8';
    ctx.font = '13px monospace';
    ctx.fillText('VOLLEYBALL & FOOTBALL', NET_X, 82);
  }

  private renderFloorReflection(
    players: PlayerPhysics[],
    ball: BallPhysics,
    characters: Record<string, CharacterDef>
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.16;

    // Render upside down players on wood reflection
    for (const player of players) {
      const charDef = characters[player.characterId];
      if (!charDef) continue;
      ctx.save();
      ctx.translate(player.x, GROUND_Y);
      ctx.scale(1, -0.6); // flip vertically
      ctx.fillStyle = charDef.jerseyColor;
      ctx.fillRect(-player.width / 2, 0, player.width, player.height * 0.8);
      ctx.restore();
    }

    // Ball reflection
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ball.x, GROUND_Y + (GROUND_Y - ball.y) * 0.6, ball.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderCourt(loc: LocationDef) {
    const ctx = this.ctx;

    // Ground fill
    ctx.fillStyle = loc.groundColor;
    ctx.fillRect(0, GROUND_Y, COURT_WIDTH, COURT_HEIGHT - GROUND_Y);

    // Ground bottom layer
    ctx.fillStyle = loc.groundSubColor;
    ctx.fillRect(0, GROUND_Y + 18, COURT_WIDTH, COURT_HEIGHT - GROUND_Y - 18);

    // Court White Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    // Baseline
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(COURT_WIDTH, GROUND_Y);
    // Left service line
    ctx.moveTo(250, GROUND_Y);
    ctx.lineTo(250, GROUND_Y + 14);
    // Right service line
    ctx.moveTo(950, GROUND_Y);
    ctx.lineTo(950, GROUND_Y + 14);
    ctx.stroke();

    // Specific surface textures
    if (loc.groundType === 'sand') {
      ctx.fillStyle = 'rgba(202, 138, 4, 0.25)';
      for (let x = 10; x < COURT_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.arc(x + Math.sin(x) * 10, GROUND_Y + 8 + (x % 7), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (loc.groundType === 'wood') {
      // Wood plank lines
      ctx.strokeStyle = 'rgba(113, 63, 18, 0.35)';
      ctx.lineWidth = 1;
      for (let y = GROUND_Y + 8; y < COURT_HEIGHT; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(COURT_WIDTH, y);
        ctx.stroke();
      }
    } else if (loc.groundType === 'stadium_turf') {
      // Striped grass pattern
      ctx.fillStyle = 'rgba(22, 101, 52, 0.3)';
      for (let x = 0; x < COURT_WIDTH; x += 100) {
        if ((x / 100) % 2 === 0) {
          ctx.fillRect(x, GROUND_Y, 100, COURT_HEIGHT - GROUND_Y);
        }
      }
    }
  }

  private renderNet(loc: LocationDef) {
    const ctx = this.ctx;
    const netH = GROUND_Y - NET_TOP_Y;
    const thinWidth = 4; // Slim and thin post width

    ctx.save();

    // 1. Sleek Thin Net Pole / Post
    ctx.fillStyle = loc.netPostColor;
    ctx.fillRect(NET_X - thinWidth / 2, NET_TOP_Y - 6, thinWidth, netH + 6);

    // Slim post highlight reflection (1px)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(NET_X - thinWidth / 2, NET_TOP_Y - 6, 1.2, netH + 6);

    // Slim base plate on ground
    ctx.fillStyle = '#334155';
    ctx.fillRect(NET_X - 6, GROUND_Y - 3, 12, 3);

    // 2. Thin Volleyball Mesh Netting
    // Elegant narrow vertical mesh profile (6px width)
    const meshHalf = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    // Vertical border cords
    ctx.moveTo(NET_X - meshHalf, NET_TOP_Y);
    ctx.lineTo(NET_X - meshHalf, GROUND_Y);
    ctx.moveTo(NET_X + meshHalf, NET_TOP_Y);
    ctx.lineTo(NET_X + meshHalf, GROUND_Y);

    // Horizontal mesh links
    for (let y = NET_TOP_Y + 6; y < GROUND_Y - 6; y += 8) {
      ctx.moveTo(NET_X - meshHalf, y);
      ctx.lineTo(NET_X + meshHalf, y);
    }
    // Subtle cross threads for authentic volleyball mesh look
    for (let y = NET_TOP_Y + 10; y < GROUND_Y - 10; y += 16) {
      ctx.moveTo(NET_X - meshHalf, y);
      ctx.lineTo(NET_X + meshHalf, y + 8);
    }
    ctx.stroke();

    // 3. Thin White Top Tape / Cable (4px high, 8px wide)
    ctx.fillStyle = loc.netTapeColor || '#FFFFFF';
    ctx.fillRect(NET_X - 4, NET_TOP_Y - 2, 8, 4);

    // Subtle edge contour on top tape
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(NET_X - 4, NET_TOP_Y - 2, 8, 4);

    // 4. Thin Bottom Tape (3px high)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(NET_X - 3.5, GROUND_Y - 8, 7, 3);

    // 5. Thin Flexible Antenna Rod (2px wide, red and white striped)
    const antennaX = NET_X;
    const antennaTop = NET_TOP_Y - 38;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let y = antennaTop; y < NET_TOP_Y - 2; y += 7) {
      ctx.strokeStyle = ((y - antennaTop) / 7) % 2 === 0 ? '#EF4444' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(antennaX, y);
      ctx.lineTo(antennaX, y + 7);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderPlayer(
    player: PlayerPhysics,
    char: CharacterDef,
    isActive: boolean,
    isSecondActive: boolean = false
  ) {
    const ctx = this.ctx;
    const x = player.x;
    const y = player.y;
    const facing = player.facing;

    ctx.save();

    // 1. Shadow on ground
    const shadowDist = GROUND_Y - y;
    const shadowWidth = Math.max(16, player.width * (1 - shadowDist / 250));
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y, shadowWidth, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Active Player Glow / Overhead Indicator
    if (isActive || isSecondActive) {
      const tagColor = isActive ? '#38BDF8' : '#F59E0B';
      const tagLabel = isActive ? 'ВЫ (АКТИВЕН)' : 'ИГРОК 2';

      // Animated pulsing arrow
      const pulseY = y - player.height - 24 + Math.sin(this.animTime * 6) * 4;
      ctx.fillStyle = tagColor;
      ctx.beginPath();
      ctx.moveTo(x, pulseY + 12);
      ctx.lineTo(x - 9, pulseY);
      ctx.lineTo(x + 9, pulseY);
      ctx.closePath();
      ctx.fill();

      // Text badge
      ctx.fillStyle = tagColor;
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tagLabel, x, pulseY - 4);
    } else {
      // Inactive teammate or opponent label
      const tag = player.team === 'LEFT' ? `P${player.playerIndex + 1}` : `BOT ${player.playerIndex + 1}`;
      ctx.fillStyle = player.team === 'LEFT' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(248, 113, 113, 0.8)';
      ctx.font = 'bold 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tag, x, y - player.height - 12);
    }

    // 3. Render Articulated Body
    ctx.translate(x, y);

    // Bicycle kick rotation
    if (player.actionState === 'BICYCLE') {
      ctx.rotate(facing * (Math.PI / 2.2 + Math.sin(this.animTime * 10) * 0.3));
    }

    // A. Legs & Shoes
    const isRunning = player.actionState === 'RUN';
    const legOffset1 = isRunning ? Math.sin(this.animTime * 12) * 12 : 0;
    const legOffset2 = isRunning ? -Math.sin(this.animTime * 12) * 12 : 0;

    // Leg 1 (back)
    ctx.strokeStyle = char.skinColor;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -30);
    ctx.lineTo(-6 + legOffset1, -12);
    ctx.lineTo(-4 + legOffset1 * 1.2, 0);
    ctx.stroke();

    // Shoe 1
    ctx.fillStyle = char.shoesColor;
    ctx.fillRect(-7 + legOffset1 * 1.2, -4, 12 * facing, 6);

    // Leg 2 (front / kicking)
    const isKicking = player.actionState === 'KICK';
    const kickX = isKicking ? facing * 24 : legOffset2;
    const kickY = isKicking ? -18 : 0;

    ctx.strokeStyle = char.skinColor;
    ctx.beginPath();
    ctx.moveTo(4, -30);
    ctx.lineTo(6 + kickX * 0.6, -14 + kickY * 0.5);
    ctx.lineTo(6 + kickX, kickY);
    ctx.stroke();

    // Shoe 2
    ctx.fillStyle = char.shoesColor;
    ctx.fillRect(4 + kickX, kickY - 4, 14 * facing, 6);

    // B. Shorts
    ctx.fillStyle = char.shortsColor;
    ctx.fillRect(-15, -42, 30, 16);

    // C. Torso & Jersey
    ctx.fillStyle = char.jerseyColor;
    ctx.beginPath();
    ctx.roundRect(-14, -68, 28, 30, 4);
    ctx.fill();

    // Jersey stripes / detail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(-4, -68, 8, 30);

    // Chest puff when cushioning
    if (player.actionState === 'CHEST') {
      ctx.fillStyle = char.skinColor;
      ctx.beginPath();
      ctx.arc(facing * 12, -54, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // D. Arms (swing or spike posture)
    const isSpiking = player.actionState === 'SPIKE';
    ctx.strokeStyle = char.skinColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    if (isSpiking) {
      // Raised arms for overhead spike / block
      ctx.beginPath();
      ctx.moveTo(-6, -62);
      ctx.lineTo(facing * 8, -82);
      ctx.lineTo(facing * 16, -92);
      ctx.stroke();
    } else {
      // Relaxed or running arms
      const armSwing = isRunning ? -Math.sin(this.animTime * 12) * 14 : 0;
      ctx.beginPath();
      ctx.moveTo(facing * 8, -62);
      ctx.lineTo(facing * 12 + armSwing, -48);
      ctx.stroke();
    }

    // E. Head & Face
    const headY = -76;
    // Neck
    ctx.fillStyle = char.skinColor;
    ctx.fillRect(-4, headY + 6, 8, 8);

    // Face circle
    ctx.fillStyle = char.skinColor;
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(facing * 5, headY - 1, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth / smile
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(facing * 4, headY + 4, 3, 0, Math.PI);
    ctx.stroke();

    // F. Hair Styles
    ctx.fillStyle = char.hairColor;
    if (char.hairStyle === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(-13, headY - 2);
      ctx.lineTo(-8, headY - 18);
      ctx.lineTo(-2, headY - 13);
      ctx.lineTo(3, headY - 20);
      ctx.lineTo(9, headY - 13);
      ctx.lineTo(13, headY - 18);
      ctx.lineTo(13, headY);
      ctx.closePath();
      ctx.fill();
    } else if (char.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, headY - 4, 13, Math.PI, 0);
      ctx.fill();
      // Ponytail tail
      ctx.beginPath();
      ctx.moveTo(-facing * 10, headY - 4);
      ctx.quadraticCurveTo(-facing * 24, headY - 2, -facing * 22, headY + 14);
      ctx.lineWidth = 6;
      ctx.strokeStyle = char.hairColor;
      ctx.stroke();
    } else if (char.hairStyle === 'afro' || char.hairStyle === 'curly') {
      ctx.beginPath();
      ctx.arc(0, headY - 5, 17, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Short / standard
      ctx.beginPath();
      ctx.arc(0, headY - 4, 14, Math.PI, 0);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderBall(ball: BallPhysics, ballDef: BallDef) {
    const ctx = this.ctx;
    const r = ball.radius;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    // Ball glow for fire or neon
    if (ballDef.pattern === 'fire') {
      const fireGlow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.2);
      fireGlow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      fireGlow.addColorStop(0.6, 'rgba(249, 115, 22, 0.4)');
      fireGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = fireGlow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (ballDef.pattern === 'neon') {
      const neonGlow = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.0);
      neonGlow.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
      neonGlow.addColorStop(0.7, 'rgba(236, 72, 153, 0.35)');
      neonGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = neonGlow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ball Base Circle
    ctx.fillStyle = ballDef.primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Pattern specifics
    if (ballDef.pattern === 'soccer') {
      // Hexagons / Pentagons
      ctx.fillStyle = ballDef.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Outer patches
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (ballDef.pattern === 'volleyball') {
      // Curved color waves (classic 3-color panel)
      ctx.fillStyle = ballDef.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 3, Math.PI / 3);
      ctx.lineTo(0, 0);
      ctx.fill();

      ctx.fillStyle = ballDef.accentColor;
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI / 3, Math.PI);
      ctx.lineTo(0, 0);
      ctx.fill();

      // Panel seam lines
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
    } else if (ballDef.pattern === 'gold') {
      // Shimmer reflection
      const shine = ctx.createLinearGradient(-r, -r, r, r);
      shine.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      shine.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
      shine.addColorStop(1, 'rgba(180, 83, 9, 0.6)');
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ball Outline & 3D Sphere Shading
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // 3D Sphere Highlight
    const sphereShine = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 1, -r * 0.35, -r * 0.35, r);
    sphereShine.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sphereShine.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    sphereShine.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = sphereShine;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
      } else if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spark / sand
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderFloatTexts(texts: HitFloatText[]) {
    const ctx = this.ctx;
    for (const item of texts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, item.alpha);
      ctx.font = `900 ${Math.round(18 * item.scale)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';

      // Text stroke for ultra high contrast
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4;
      ctx.strokeText(item.text, item.x, item.y);

      // Text fill
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, item.x, item.y);

      ctx.restore();
    }
  }
}
