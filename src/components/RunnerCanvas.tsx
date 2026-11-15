import React, { useEffect, useRef } from 'react';
import { DIFFICULTY_CONFIG } from '../data/runnerLevels';
import {
  ActiveBuffs,
  Difficulty,
  ItemId,
  PowerUpType,
  RunnerLevelDef,
  StickerId,
} from '../types/game';
import { soundFX } from '../utils/audio';

export interface RunnerCanvasProps {
  level: RunnerLevelDef;
  difficulty: Difficulty;
  isPaused: boolean;
  jumpSignal: number;
  zapSignal: number;
  dashSignal: number;
  slamSignal: number;
  isDuckHeld: boolean;
  fastZap: boolean;
  fastDash: boolean;
  grantShieldSignal: number;
  grantMagnetSignal: number;
  resetSignal: number;
  onProgressChange: (pct: number) => void;
  onBuffsChange: (buffs: ActiveBuffs) => void;
  onCollectItem: (itemId: ItemId, label: string) => void;
  onCollectSticker: (stickerId: StickerId, label: string) => void;
  onCollectCoin: (pts: number) => void;
  onCollectPowerUp: (powerUp: PowerUpType) => void;
  onBustGhost: (pts: number) => void;
  onSmashCrate: (pts: number) => void;
  onHitHazard: (label: string) => void;
  onReachExitDoor: () => void;
}

const CANVAS_W = 960;
const CANVAS_H = 460;
const GROUND_Y = 376;
const PLAYER_X = 165;

const DODGE_MEMES = ['EZ 😎', 'NOPE 💀', 'SNEAK 100', 'CLUTCH!', 'SIGMA 🗿'];
const HIT_MEMES = ['BONK! 🔨', 'EMOTIONAL DMG', 'RIP BOZO 💀', 'OOF!'];

export const RunnerCanvas: React.FC<RunnerCanvasProps> = ({
  level,
  difficulty,
  isPaused,
  jumpSignal,
  zapSignal,
  dashSignal,
  slamSignal,
  isDuckHeld,
  fastZap,
  fastDash,
  grantShieldSignal,
  grantMagnetSignal,
  resetSignal,
  onProgressChange,
  onBuffsChange,
  onCollectItem,
  onCollectSticker,
  onCollectCoin,
  onCollectPowerUp,
  onBustGhost,
  onSmashCrate,
  onHitHazard,
  onReachExitDoor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = level.backgroundImage;
    bgImgRef.current = img;
  }, [level.backgroundImage]);

  const simRef = useRef({
    distance: 0,
    py: 0,
    vy: 0,
    jumpsUsed: 0,
    isSlamming: false,
    slamRingTimer: 0,
    invulnTimer: 1.2,
    shakeTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    zapTimer: 0,
    zapCooldown: 0,
    zapHitDone: false,
    hasShield: false,
    magnetTimer: 0,
    doublePtsTimer: 0,
    slowMoTimer: 0,
    bossHp: 2,
    combo: 0,
    feverTriggered: false,
    collectedIds: new Set<string>(),
    passedIds: new Set<string>(),
    hitIds: new Set<string>(),
    bustedIds: new Set<string>(),
    wailedIds: new Set<string>(),
    bouncedIds: new Set<string>(),
    reachedExit: false,
    timeSec: 0,
    lastJumpSignal: jumpSignal,
    lastZapSignal: zapSignal,
    lastDashSignal: dashSignal,
    lastSlamSignal: slamSignal,
    lastGrantShieldSignal: grantShieldSignal,
    lastGrantMagnetSignal: grantMagnetSignal,
    lastProgressPct: -1,
    lastBuffEmitAt: 0,
    particles: [] as {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      life: number;
      size: number;
    }[],
    floatingTexts: [] as {
      x: number;
      y: number;
      text: string;
      color: string;
      life: number;
    }[],
  });

  useEffect(() => {
    const s = simRef.current;
    s.distance = 0;
    s.py = 0;
    s.vy = 0;
    s.jumpsUsed = 0;
    s.isSlamming = false;
    s.slamRingTimer = 0;
    s.invulnTimer = 1.2;
    s.shakeTimer = 0;
    s.dashTimer = 0;
    s.dashCooldown = 0;
    s.zapTimer = 0;
    s.zapCooldown = 0;
    s.zapHitDone = false;
    s.bossHp = 2;
    s.combo = 0;
    s.feverTriggered = false;
    s.collectedIds = new Set();
    s.passedIds = new Set();
    s.hitIds = new Set();
    s.bustedIds = new Set();
    s.wailedIds = new Set();
    s.bouncedIds = new Set();
    s.reachedExit = false;
    s.particles = [];
    s.floatingTexts = [];
    s.lastProgressPct = 0;
    onProgressChange(0);
    onBuffsChange({
      shield: s.hasShield,
      magnetSec: Math.ceil(s.magnetTimer),
      doublePtsSec: Math.ceil(s.doublePtsTimer),
      slowMoSec: Math.ceil(s.slowMoTimer),
      fever: false,
      dashCooldownPct: 0,
      zapCooldownPct: 0,
      combo: 0,
    });
  }, [level.id, resetSignal, onProgressChange, onBuffsChange]);

  // Reset buffs on full game restart
  useEffect(() => {
    if (level.id === 'classroom') {
      const s = simRef.current;
      s.hasShield = false;
      s.magnetTimer = 0;
      s.doublePtsTimer = 0;
      s.slowMoTimer = 0;
    }
  }, [resetSignal, level.id]);

  // Shop Purchases
  useEffect(() => {
    const s = simRef.current;
    if (grantShieldSignal !== s.lastGrantShieldSignal) {
      s.lastGrantShieldSignal = grantShieldSignal;
      s.hasShield = true;
    }
  }, [grantShieldSignal]);

  useEffect(() => {
    const s = simRef.current;
    if (grantMagnetSignal !== s.lastGrantMagnetSignal) {
      s.lastGrantMagnetSignal = grantMagnetSignal;
      s.magnetTimer = Math.max(s.magnetTimer, 10);
    }
  }, [grantMagnetSignal]);

  // Double Jump trigger
  useEffect(() => {
    const s = simRef.current;
    if (jumpSignal !== s.lastJumpSignal) {
      s.lastJumpSignal = jumpSignal;
      if (s.jumpsUsed < 2 && !isPaused) {
        s.isSlamming = false;
        const isDouble = s.jumpsUsed === 1;
        s.vy = isDouble ? 635 : 700;
        s.jumpsUsed += 1;
        soundFX.playJump(isDouble);
        if (isDouble) {
          s.floatingTexts.push({
            x: PLAYER_X,
            y: GROUND_Y - s.py - 85,
            text: '2X HOP!',
            color: '#38bdf8',
            life: 0.7,
          });
        }
      }
    }
  }, [jumpSignal, isPaused]);

  // Airborne Ground Slam trigger (Down/Duck while in air)
  useEffect(() => {
    const s = simRef.current;
    if (slamSignal !== s.lastSlamSignal) {
      s.lastSlamSignal = slamSignal;
      if (s.py > 24 && !s.isSlamming && !isPaused) {
        s.isSlamming = true;
        s.vy = -1350;
        soundFX.playHide();
      }
    }
  }, [slamSignal, isPaused]);

  // Torch Zap trigger
  useEffect(() => {
    const s = simRef.current;
    if (zapSignal !== s.lastZapSignal) {
      s.lastZapSignal = zapSignal;
      const cd = fastZap ? 1.1 : 2.0;
      if (s.zapCooldown <= 0 && !isPaused) {
        s.zapTimer = 0.28;
        s.zapCooldown = cd;
        s.zapHitDone = false;
        soundFX.playZap();
      }
    }
  }, [zapSignal, isPaused, fastZap]);

  // Turbo Dash trigger
  useEffect(() => {
    const s = simRef.current;
    if (dashSignal !== s.lastDashSignal) {
      s.lastDashSignal = dashSignal;
      const cd = fastDash ? 1.5 : 2.8;
      if (s.dashCooldown <= 0 && !isPaused) {
        s.dashTimer = 0.48;
        s.dashCooldown = cd;
        soundFX.playDash();
        s.floatingTexts.push({
          x: PLAYER_X,
          y: GROUND_Y - s.py - 90,
          text: 'TURBO 💨',
          color: '#38bdf8',
          life: 0.65,
        });
      }
    }
  }, [dashSignal, isPaused, fastDash]);

  const propsRef = useRef({
    level,
    difficulty,
    isPaused,
    isDuckHeld,
    fastZap,
    fastDash,
    onProgressChange,
    onBuffsChange,
    onCollectItem,
    onCollectSticker,
    onCollectCoin,
    onCollectPowerUp,
    onBustGhost,
    onSmashCrate,
    onHitHazard,
    onReachExitDoor,
  });
  propsRef.current = {
    level,
    difficulty,
    isPaused,
    isDuckHeld,
    fastZap,
    fastDash,
    onProgressChange,
    onBuffsChange,
    onCollectItem,
    onCollectSticker,
    onCollectCoin,
    onCollectPowerUp,
    onBustGhost,
    onSmashCrate,
    onHitHazard,
    onReachExitDoor,
  };

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const spawnBurst = (
      x: number,
      y: number,
      color: string,
      count: number = 12
    ) => {
      const s = simRef.current;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const spd = 80 + Math.random() * 190;
        s.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 40,
          color,
          life: 0.45 + Math.random() * 0.3,
          size: 3 + Math.random() * 4,
        });
      }
    };

    const bumpCombo = () => {
      const s = simRef.current;
      s.combo += 1;
      if (s.combo >= 5 && !s.feverTriggered) {
        s.feverTriggered = true;
        soundFX.playFever();
        s.floatingTexts.push({
          x: PLAYER_X + 30,
          y: GROUND_Y - s.py - 115,
          text: '🔥 FEVER MODE! 1.5X',
          color: '#fde047',
          life: 1.2,
        });
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const cfg = propsRef.current;
      const s = simRef.current;

      if (!cfg.isPaused && !s.reachedExit) {
        s.timeSec += dt;
        if (s.invulnTimer > 0) s.invulnTimer = Math.max(0, s.invulnTimer - dt);
        if (s.shakeTimer > 0) s.shakeTimer = Math.max(0, s.shakeTimer - dt);
        if (s.slamRingTimer > 0)
          s.slamRingTimer = Math.max(0, s.slamRingTimer - dt);
        if (s.dashTimer > 0) s.dashTimer = Math.max(0, s.dashTimer - dt);
        if (s.dashCooldown > 0) s.dashCooldown = Math.max(0, s.dashCooldown - dt);
        if (s.zapTimer > 0) s.zapTimer = Math.max(0, s.zapTimer - dt);
        if (s.zapCooldown > 0) s.zapCooldown = Math.max(0, s.zapCooldown - dt);
        if (s.magnetTimer > 0) s.magnetTimer = Math.max(0, s.magnetTimer - dt);
        if (s.doublePtsTimer > 0)
          s.doublePtsTimer = Math.max(0, s.doublePtsTimer - dt);
        if (s.slowMoTimer > 0) s.slowMoTimer = Math.max(0, s.slowMoTimer - dt);

        const dashMult = s.dashTimer > 0 ? 1.85 : 1.0;
        const slowMult = s.slowMoTimer > 0 ? 0.62 : 1.0;
        const speed =
          cfg.level.baseSpeed *
          DIFFICULTY_CONFIG[cfg.difficulty].speedMult *
          dashMult *
          slowMult;
        s.distance = Math.min(cfg.level.levelLength, s.distance + speed * dt);

        const pct = Math.round((s.distance / cfg.level.levelLength) * 100);
        if (pct !== s.lastProgressPct) {
          s.lastProgressPct = pct;
          cfg.onProgressChange(pct);
        }

        if (s.jumpsUsed > 0 || s.py > 0) {
          s.py += s.vy * dt;
          s.vy -= 1850 * dt;
          if (s.py <= 0) {
            if (s.isSlamming) {
              s.isSlamming = false;
              s.slamRingTimer = 0.35;
              s.shakeTimer = 0.14;
              soundFX.playSlam();
              spawnBurst(PLAYER_X, GROUND_Y - 4, '#38bdf8', 14);
            } else if (s.jumpsUsed > 0) {
              soundFX.playLand();
            }
            s.py = 0;
            s.vy = 0;
            s.jumpsUsed = 0;
          }
        }

        // Fever ember trail
        if (s.combo >= 5 && Math.random() < 0.35) {
          s.particles.push({
            x: PLAYER_X - 18,
            y: GROUND_Y - s.py - 28 + (Math.random() - 0.5) * 16,
            vx: -110 - Math.random() * 60,
            vy: -20 + (Math.random() - 0.5) * 30,
            color: Math.random() > 0.5 ? '#facc15' : '#fb923c',
            life: 0.32,
            size: 3 + Math.random() * 3,
          });
        }

        const isDucking = cfg.isDuckHeld && s.py < 8 && s.dashTimer <= 0;
        const pTop = GROUND_Y - s.py - (isDucking ? 38 : 74);
        const pBottom = GROUND_Y - s.py;
        const pMidY = (pTop + pBottom) / 2;
        const pixelsPerMeter = 42;
        const feverMult = s.combo >= 5 ? 1.5 : 1;
        const ptsMult = (s.doublePtsTimer > 0 ? 2 : 1) * feverMult;
        const zapMaxCd = cfg.fastZap ? 1.1 : 2.0;
        const dashMaxCd = cfg.fastDash ? 1.5 : 2.8;

        for (let i = 0; i < cfg.level.entities.length; i++) {
          const ent = cfg.level.entities[i];
          const ex = PLAYER_X + (ent.atDistance - s.distance) * pixelsPerMeter;
          if (ex < -110 || ex > CANVAS_W + 130) continue;

          if (
            (ent.kind === 'ghost_spooky' || ent.kind === 'boss_ghost') &&
            !s.bustedIds.has(ent.id) &&
            !s.wailedIds.has(ent.id) &&
            ex < CANVAS_W - 60
          ) {
            s.wailedIds.add(ent.id);
            soundFX.playGhostWail();
          }

          const isTrickyFloor =
            ent.kind === 'jump_obstacle' && i % 3 === 2;
          const trickyLift = isTrickyFloor
            ? Math.max(0, Math.sin(s.timeSec * 6.5) * 18)
            : 0;

          if (ent.kind === 'spring_pad') {
            if (
              !s.bouncedIds.has(ent.id) &&
              Math.abs(ex - PLAYER_X) < 34 &&
              s.py < 24
            ) {
              s.bouncedIds.add(ent.id);
              s.isSlamming = false;
              s.vy = 940;
              s.jumpsUsed = 1;
              soundFX.playSpring();
              spawnBurst(ex, GROUND_Y - 12, '#34d399', 12);
              s.floatingTexts.push({
                x: PLAYER_X,
                y: GROUND_Y - 60,
                text: 'BOING! 🔼',
                color: '#34d399',
                life: 0.75,
              });
            }
          } else if (ent.kind === 'mystery_box') {
            if (s.collectedIds.has(ent.id)) continue;
            const baseAlt =
              ent.altitude === 'high'
                ? 152
                : ent.altitude === 'low'
                ? 44
                : 88;
            const ey =
              GROUND_Y - baseAlt + Math.sin(s.timeSec * 5 + ent.atDistance) * 8;
            const zapped =
              s.zapTimer > 0 && ex > PLAYER_X - 10 && ex < PLAYER_X + 240;
            const touched =
              Math.abs(ex - PLAYER_X) < 42 &&
              pTop <= ey + 28 &&
              pBottom >= ey - 28;
            if (zapped || touched) {
              s.collectedIds.add(ent.id);
              bumpCombo();
              soundFX.playPowerup();
              spawnBurst(ex, ey, '#facc15', 16);
              const roll = Math.floor(Math.random() * 4);
              if (roll === 0) {
                s.hasShield = true;
                cfg.onCollectPowerUp('shield');
                s.floatingTexts.push({
                  x: ex,
                  y: ey - 20,
                  text: '🎁 SHIELD!',
                  color: '#38bdf8',
                  life: 1.0,
                });
              } else if (roll === 1) {
                s.slowMoTimer = 5.5;
                soundFX.playSlowMo();
                cfg.onCollectPowerUp('slowmo');
                s.floatingTexts.push({
                  x: ex,
                  y: ey - 20,
                  text: '🎁 SLOW-MO!',
                  color: '#a78bfa',
                  life: 1.0,
                });
              } else if (roll === 2) {
                const bonus = Math.round(50 * ptsMult);
                cfg.onCollectCoin(bonus);
                s.floatingTexts.push({
                  x: ex,
                  y: ey - 20,
                  text: `🎁 +${bonus} 🪙`,
                  color: '#fde047',
                  life: 1.0,
                });
              } else {
                s.doublePtsTimer = 8.0;
                cfg.onCollectPowerUp('chai_2x');
                s.floatingTexts.push({
                  x: ex,
                  y: ey - 20,
                  text: '🎁 2X PTS!',
                  color: '#fb923c',
                  life: 1.0,
                });
              }
            }
          } else if (
            ent.kind === 'collectible_item' ||
            ent.kind === 'collectible_sticker' ||
            ent.kind === 'coin' ||
            ent.kind === 'powerup'
          ) {
            if (s.collectedIds.has(ent.id)) continue;
            const baseAlt =
              ent.altitude === 'high'
                ? 152
                : ent.altitude === 'low'
                ? 44
                : 86;
            const ey =
              GROUND_Y - baseAlt + Math.sin(s.timeSec * 5 + ent.atDistance) * 8;

            const magnetPull =
              s.magnetTimer > 0 && Math.abs(ex - PLAYER_X) < 235;
            const hitDistX = magnetPull ? 215 : 42;
            const hitOverlapY = magnetPull
              ? true
              : pTop <= ey + 28 && pBottom >= ey - 28;

            if (Math.abs(ex - PLAYER_X) < hitDistX && hitOverlapY) {
              s.collectedIds.add(ent.id);
              if (ent.kind === 'collectible_item' && ent.itemId) {
                cfg.onCollectItem(ent.itemId, ent.label);
                spawnBurst(ex, ey, '#facc15', 10);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: ey - 20,
                  text: `STONKS +${ent.label}`,
                  color: '#facc15',
                  life: 0.95,
                });
              } else if (
                ent.kind === 'collectible_sticker' &&
                ent.stickerId
              ) {
                cfg.onCollectSticker(ent.stickerId, ent.label);
                spawnBurst(ex, ey, '#34d399', 12);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: ey - 20,
                  text: `W +${Math.round(25 * ptsMult)} ⭐`,
                  color: '#34d399',
                  life: 0.95,
                });
              } else if (ent.kind === 'coin') {
                bumpCombo();
                const gain = Math.round(10 * ptsMult);
                cfg.onCollectCoin(gain);
                soundFX.playPickup();
                spawnBurst(ex, ey, '#fde047', 6);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: ey - 16,
                  text: `+${gain} 🪙`,
                  color: '#fde047',
                  life: 0.65,
                });
              } else if (ent.kind === 'powerup' && ent.powerUp) {
                spawnBurst(ex, ey, '#38bdf8', 14);
                if (ent.powerUp === 'shield') {
                  soundFX.playPowerup();
                  s.hasShield = true;
                  s.floatingTexts.push({
                    x: PLAYER_X,
                    y: ey - 20,
                    text: 'SHIELD 🛡️',
                    color: '#38bdf8',
                    life: 1.0,
                  });
                } else if (ent.powerUp === 'magnet') {
                  soundFX.playPowerup();
                  s.magnetTimer = 7.5;
                  s.floatingTexts.push({
                    x: PLAYER_X,
                    y: ey - 20,
                    text: 'MAGNET 🧲',
                    color: '#f472b6',
                    life: 1.0,
                  });
                } else if (ent.powerUp === 'chai_2x') {
                  soundFX.playPowerup();
                  s.doublePtsTimer = 8.0;
                  s.floatingTexts.push({
                    x: PLAYER_X,
                    y: ey - 20,
                    text: 'CHAI 2X ☕',
                    color: '#fb923c',
                    life: 1.0,
                  });
                } else if (ent.powerUp === 'slowmo') {
                  soundFX.playSlowMo();
                  s.slowMoTimer = 5.5;
                  s.floatingTexts.push({
                    x: PLAYER_X,
                    y: ey - 20,
                    text: 'SLOW-MO ⏱️',
                    color: '#a78bfa',
                    life: 1.0,
                  });
                } else if (ent.powerUp === 'heal') {
                  soundFX.playPowerup();
                  s.floatingTexts.push({
                    x: PLAYER_X,
                    y: ey - 20,
                    text: '+1 HEART ❤️',
                    color: '#fb7185',
                    life: 1.0,
                  });
                }
                cfg.onCollectPowerUp(ent.powerUp);
              }
            }
          } else if (ent.kind === 'boss_ghost') {
            if (s.bustedIds.has(ent.id)) continue;

            if (s.dashTimer > 0 && Math.abs(ex - PLAYER_X) < 62) {
              s.bustedIds.add(ent.id);
              bumpCombo();
              const pts = Math.round(100 * ptsMult);
              soundFX.playGhostBanish();
              cfg.onBustGhost(pts);
              spawnBurst(ex, GROUND_Y - 88, '#facc15', 22);
              s.floatingTexts.push({
                x: ex,
                y: GROUND_Y - 120,
                text: `BOSS KO +${pts} 👑`,
                color: '#facc15',
                life: 1.2,
              });
              continue;
            }

            if (
              s.zapTimer > 0 &&
              !s.zapHitDone &&
              ex > PLAYER_X - 10 &&
              ex < PLAYER_X + 250
            ) {
              s.zapHitDone = true;
              s.bossHp -= 1;
              if (s.bossHp <= 0) {
                s.bustedIds.add(ent.id);
                bumpCombo();
                const pts = Math.round(100 * ptsMult);
                soundFX.playGhostBanish();
                cfg.onBustGhost(pts);
                spawnBurst(ex, GROUND_Y - 88, '#facc15', 22);
                s.floatingTexts.push({
                  x: ex,
                  y: GROUND_Y - 120,
                  text: `BOSS KO +${pts} 👑`,
                  color: '#facc15',
                  life: 1.2,
                });
              } else {
                soundFX.playBossHit();
                spawnBurst(ex, GROUND_Y - 88, '#c4b5fd', 12);
                s.floatingTexts.push({
                  x: ex,
                  y: GROUND_Y - 120,
                  text: 'HIT! 1 HP LEFT',
                  color: '#c4b5fd',
                  life: 0.9,
                });
              }
              continue;
            }

            if (s.hitIds.has(ent.id) || s.invulnTimer > 0) continue;
            const gy = GROUND_Y - 90 + Math.sin(s.timeSec * 4.5) * 20;
            if (
              Math.abs(ex - PLAYER_X) < 36 &&
              pTop < gy + 34 &&
              pBottom > gy - 34
            ) {
              s.hitIds.add(ent.id);
              if (s.hasShield) {
                s.hasShield = false;
                s.invulnTimer = 1.0;
                soundFX.playShieldBlock();
                spawnBurst(PLAYER_X, pMidY, '#38bdf8', 14);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: 'BLOCKED! 🛡️',
                  color: '#38bdf8',
                  life: 0.9,
                });
              } else {
                s.combo = 0;
                s.feverTriggered = false;
                s.invulnTimer = 1.3;
                s.shakeTimer = 0.28;
                cfg.onHitHazard(ent.label);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: '404 BONK 💀',
                  color: '#fb7185',
                  life: 1.0,
                });
              }
            }
          } else if (ent.kind === 'ghost_spooky') {
            if (s.bustedIds.has(ent.id)) continue;

            if (
              s.zapTimer > 0 &&
              ex > PLAYER_X - 10 &&
              ex < PLAYER_X + 240
            ) {
              s.bustedIds.add(ent.id);
              bumpCombo();
              const pts = Math.round(40 * ptsMult);
              soundFX.playGhostBanish();
              cfg.onBustGhost(pts);
              const gy = GROUND_Y - 82 + Math.sin(s.timeSec * 7 + i) * 26;
              spawnBurst(ex, gy, '#a78bfa', 16);
              s.floatingTexts.push({
                x: ex,
                y: gy - 18,
                text: `GHOSTED +${pts} 👻`,
                color: '#c4b5fd',
                life: 1.0,
              });
              continue;
            }

            if (
              ex < PLAYER_X - 40 &&
              !s.hitIds.has(ent.id) &&
              !s.passedIds.has(ent.id)
            ) {
              s.passedIds.add(ent.id);
              bumpCombo();
              s.floatingTexts.push({
                x: PLAYER_X,
                y: pTop - 12,
                text: DODGE_MEMES[i % DODGE_MEMES.length],
                color: '#34d399',
                life: 0.7,
              });
            }
            if (s.hitIds.has(ent.id) || s.invulnTimer > 0 || s.dashTimer > 0)
              continue;

            const gy = GROUND_Y - 86 + Math.sin(s.timeSec * 5.2 + i) * 24;
            if (
              Math.abs(ex - PLAYER_X) < 30 &&
              pTop < gy + 26 &&
              pBottom > gy - 26
            ) {
              s.hitIds.add(ent.id);
              if (s.hasShield) {
                s.hasShield = false;
                s.invulnTimer = 1.0;
                soundFX.playShieldBlock();
                spawnBurst(PLAYER_X, pMidY, '#38bdf8', 14);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: 'BLOCKED! 🛡️',
                  color: '#38bdf8',
                  life: 0.9,
                });
              } else {
                s.combo = 0;
                s.feverTriggered = false;
                s.invulnTimer = 1.3;
                s.shakeTimer = 0.28;
                cfg.onHitHazard(ent.label);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: 'BOO! 💀',
                  color: '#fb7185',
                  life: 1.0,
                });
              }
            }
          } else if (ent.kind === 'smash_crate') {
            if (s.bustedIds.has(ent.id)) continue;

            // Ground Slam Stomp OR Dash smashes right through crates!
            const stompHit =
              (s.isSlamming || s.slamRingTimer > 0.1) &&
              Math.abs(ex - PLAYER_X) < 75;
            if ((s.dashTimer > 0 && Math.abs(ex - PLAYER_X) < 55) || stompHit) {
              s.bustedIds.add(ent.id);
              bumpCombo();
              const pts = Math.round((stompHit ? 45 : 35) * ptsMult);
              soundFX.playSmash();
              cfg.onSmashCrate(pts);
              if (stompHit && s.py > 0) s.vy = 480; // bounce after stomp!
              spawnBurst(ex, GROUND_Y - 26, '#fb923c', 16);
              s.floatingTexts.push({
                x: ex,
                y: GROUND_Y - 56,
                text: stompHit ? `STOMP +${pts} 💥` : `SMASH +${pts} 💥`,
                color: '#fb923c',
                life: 0.95,
              });
              continue;
            }

            if (
              ex < PLAYER_X - 38 &&
              !s.hitIds.has(ent.id) &&
              !s.passedIds.has(ent.id)
            ) {
              s.passedIds.add(ent.id);
              bumpCombo();
              s.floatingTexts.push({
                x: PLAYER_X,
                y: pTop - 10,
                text: DODGE_MEMES[i % DODGE_MEMES.length],
                color: '#facc15',
                life: 0.7,
              });
            }
            if (s.hitIds.has(ent.id) || s.invulnTimer > 0) continue;
            const oTop = GROUND_Y - 52;
            if (
              Math.abs(ex - PLAYER_X) < 28 &&
              pBottom > oTop + 8 &&
              pTop < GROUND_Y
            ) {
              s.hitIds.add(ent.id);
              if (s.hasShield) {
                s.hasShield = false;
                s.invulnTimer = 1.0;
                soundFX.playShieldBlock();
                spawnBurst(PLAYER_X, pMidY, '#38bdf8', 14);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: 'BLOCKED! 🛡️',
                  color: '#38bdf8',
                  life: 0.9,
                });
              } else {
                s.combo = 0;
                s.feverTriggered = false;
                s.invulnTimer = 1.3;
                s.shakeTimer = 0.28;
                cfg.onHitHazard(ent.label);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: HIT_MEMES[i % HIT_MEMES.length],
                  color: '#fb7185',
                  life: 1.0,
                });
              }
            }
          } else if (ent.kind === 'jump_obstacle') {
            // Ground Slam stomps floor obstacles too!
            if (
              (s.isSlamming || s.slamRingTimer > 0.12) &&
              Math.abs(ex - PLAYER_X) < 68 &&
              !s.bustedIds.has(ent.id)
            ) {
              s.bustedIds.add(ent.id);
              bumpCombo();
              const pts = Math.round(35 * ptsMult);
              soundFX.playSmash();
              cfg.onSmashCrate(pts);
              if (s.py > 0) s.vy = 460;
              spawnBurst(ex, GROUND_Y - 26, '#fb7185', 14);
              s.floatingTexts.push({
                x: ex,
                y: GROUND_Y - 58,
                text: `STOMP +${pts} 💥`,
                color: '#facc15',
                life: 0.9,
              });
              continue;
            }

            if (
              ex < PLAYER_X - 38 &&
              !s.hitIds.has(ent.id) &&
              !s.passedIds.has(ent.id)
            ) {
              s.passedIds.add(ent.id);
              bumpCombo();
              s.floatingTexts.push({
                x: PLAYER_X,
                y: pTop - 10,
                text: DODGE_MEMES[i % DODGE_MEMES.length],
                color: '#facc15',
                life: 0.7,
              });
            }
            if (s.hitIds.has(ent.id) || s.invulnTimer > 0 || s.dashTimer > 0)
              continue;
            const oTop = GROUND_Y - 50 - trickyLift;
            if (
              Math.abs(ex - PLAYER_X) < 28 &&
              pBottom > oTop + 8 &&
              pTop < GROUND_Y
            ) {
              s.hitIds.add(ent.id);
              if (s.hasShield) {
                s.hasShield = false;
                s.invulnTimer = 1.0;
                soundFX.playShieldBlock();
                spawnBurst(PLAYER_X, pMidY, '#38bdf8', 14);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: 'BLOCKED! 🛡️',
                  color: '#38bdf8',
                  life: 0.9,
                });
              } else {
                s.combo = 0;
                s.feverTriggered = false;
                s.invulnTimer = 1.3;
                s.shakeTimer = 0.28;
                cfg.onHitHazard(ent.label);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: HIT_MEMES[i % HIT_MEMES.length],
                  color: '#fb7185',
                  life: 1.0,
                });
              }
            }
          } else if (ent.kind === 'duck_zombie') {
            if (s.bustedIds.has(ent.id)) continue;

            if (
              s.zapTimer > 0 &&
              ex > PLAYER_X - 10 &&
              ex < PLAYER_X + 240
            ) {
              s.bustedIds.add(ent.id);
              bumpCombo();
              const pts = Math.round(30 * ptsMult);
              soundFX.playGhostBanish();
              cfg.onBustGhost(pts);
              spawnBurst(ex, GROUND_Y - 86, '#fde047', 14);
              s.floatingTexts.push({
                x: ex,
                y: GROUND_Y - 110,
                text: `ZAPPED +${pts} ⚡`,
                color: '#fde047',
                life: 0.95,
              });
              continue;
            }

            if (
              ex < PLAYER_X - 40 &&
              !s.hitIds.has(ent.id) &&
              !s.passedIds.has(ent.id)
            ) {
              s.passedIds.add(ent.id);
              bumpCombo();
              s.floatingTexts.push({
                x: PLAYER_X,
                y: pTop - 12,
                text: DODGE_MEMES[(i + 2) % DODGE_MEMES.length],
                color: '#34d399',
                life: 0.7,
              });
            }
            if (s.hitIds.has(ent.id) || s.invulnTimer > 0 || s.dashTimer > 0)
              continue;
            const zTop = GROUND_Y - 124;
            const zBottom = GROUND_Y - 46;
            if (
              Math.abs(ex - PLAYER_X) < 32 &&
              pTop < zBottom &&
              pBottom > zTop
            ) {
              s.hitIds.add(ent.id);
              if (s.hasShield) {
                s.hasShield = false;
                s.invulnTimer = 1.0;
                soundFX.playShieldBlock();
                spawnBurst(PLAYER_X, pMidY, '#38bdf8', 14);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: 'BLOCKED! 🛡️',
                  color: '#38bdf8',
                  life: 0.9,
                });
              } else {
                s.combo = 0;
                s.feverTriggered = false;
                s.invulnTimer = 1.3;
                s.shakeTimer = 0.28;
                cfg.onHitHazard(ent.label);
                s.floatingTexts.push({
                  x: PLAYER_X,
                  y: pTop - 15,
                  text: HIT_MEMES[(i + 1) % HIT_MEMES.length],
                  color: '#fb7185',
                  life: 1.0,
                });
              }
            }
          }
        }

        s.particles = s.particles
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            vy: p.vy + 450 * dt,
            life: p.life - dt,
          }))
          .filter((p) => p.life > 0);

        s.floatingTexts = s.floatingTexts
          .map((ft) => ({ ...ft, y: ft.y - 52 * dt, life: ft.life - dt }))
          .filter((ft) => ft.life > 0);

        if (now - s.lastBuffEmitAt > 90) {
          s.lastBuffEmitAt = now;
          cfg.onBuffsChange({
            shield: s.hasShield,
            magnetSec: Math.ceil(s.magnetTimer),
            doublePtsSec: Math.ceil(s.doublePtsTimer),
            slowMoSec: Math.ceil(s.slowMoTimer),
            fever: s.combo >= 5,
            dashCooldownPct: Math.min(1, s.dashCooldown / dashMaxCd),
            zapCooldownPct: Math.min(1, s.zapCooldown / zapMaxCd),
            combo: s.combo,
          });
        }

        if (s.distance >= cfg.level.levelLength) {
          s.reachedExit = true;
          cfg.onReachExitDoor();
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawRunnerFrame(ctx, cfg, simRef.current);
        }
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  function drawRunnerFrame(
    ctx: CanvasRenderingContext2D,
    cfg: typeof propsRef.current,
    s: typeof simRef.current
  ) {
    const lvl = cfg.level;
    const pixelsPerMeter = 42;

    ctx.save();
    if (s.shakeTimer > 0) {
      ctx.translate(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
    }

    ctx.fillStyle = lvl.floorColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (bgImgRef.current && bgImgRef.current.complete) {
      const scroll = (s.distance * 14) % CANVAS_W;
      ctx.save();
      ctx.globalAlpha = 0.58;
      ctx.drawImage(bgImgRef.current, -scroll, 0, CANVAS_W, GROUND_Y);
      ctx.drawImage(bgImgRef.current, CANVAS_W - scroll, 0, CANVAS_W, GROUND_Y);
      ctx.restore();
    }

    const bgOverlay = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    bgOverlay.addColorStop(0, 'rgba(11, 17, 32, 0.35)');
    bgOverlay.addColorStop(1, 'rgba(11, 17, 32, 0.72)');
    ctx.fillStyle = bgOverlay;
    ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);

    // Midnight Moon + Twinkling Stars
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.beginPath();
    ctx.arc(CANVAS_W - 95, 58, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(CANVAS_W - 86, 52, 18, 0, Math.PI * 2);
    ctx.fill();

    for (let st = 0; st < 12; st++) {
      const sx = ((st * 137 + s.distance * 3) % (CANVAS_W - 140)) + 20;
      const sy = 22 + (st * 29) % 90;
      ctx.fillStyle = `rgba(255,255,255,${
        0.35 + 0.45 * Math.sin(s.timeSec * 3 + st)
      })`;
      ctx.fillRect(sx, sy, 2.5, 2.5);
    }
    ctx.restore();

    // Slow-Mo indigo time warp tint
    if (s.slowMoTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.16)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.restore();
    }

    // Fever border glow + speed streaks
    if (s.combo >= 5) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, CANVAS_W - 6, CANVAS_H - 6);
      for (let ln = 0; ln < 5; ln++) {
        const ly = 50 + ln * 68;
        const lx = CANVAS_W - ((s.timeSec * 820 + ln * 190) % (CANVAS_W + 200));
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 75, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Ambient student torch cone
    ctx.save();
    const torchY = GROUND_Y - s.py - 44;
    const ambientCone = ctx.createLinearGradient(
      PLAYER_X + 10,
      torchY,
      PLAYER_X + 260,
      torchY
    );
    ambientCone.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
    ambientCone.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = ambientCone;
    ctx.beginPath();
    ctx.moveTo(PLAYER_X + 10, torchY - 6);
    ctx.lineTo(PLAYER_X + 260, torchY - 58);
    ctx.lineTo(PLAYER_X + 260, torchY + 58);
    ctx.lineTo(PLAYER_X + 10, torchY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = lvl.floorColor;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

    ctx.strokeStyle = lvl.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    const tileOffset = (s.distance * pixelsPerMeter) % 80;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 2;
    for (let x = -tileOffset; x < CANVAS_W; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x - 30, CANVAS_H);
      ctx.stroke();
    }

    // Ground Slam shockwave ring
    if (s.slamRingTimer > 0) {
      ctx.save();
      const prog = 1 - s.slamRingTimer / 0.35;
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - prog})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(PLAYER_X, GROUND_Y, 24 + prog * 95, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Exit Door
    const doorX = PLAYER_X + (lvl.levelLength - s.distance) * pixelsPerMeter;
    if (doorX < CANVAS_W + 100) {
      ctx.save();
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(doorX - 36, GROUND_Y - 135, 72, 135, [14, 14, 0, 0]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px "Fredoka", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lvl.clueTitle, doorX, GROUND_Y - 146);
      ctx.font = '34px system-ui, sans-serif';
      ctx.fillText('🚪', doorX, GROUND_Y - 68);
      ctx.restore();
    }

    // Torch Zap Beam Cone
    if (s.zapTimer > 0) {
      ctx.save();
      const beamY = GROUND_Y - s.py - 46;
      const grad = ctx.createLinearGradient(
        PLAYER_X + 12,
        beamY,
        PLAYER_X + 245,
        beamY
      );
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.90)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.50)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(PLAYER_X + 12, beamY - 8);
      ctx.lineTo(PLAYER_X + 245, beamY - 58);
      ctx.lineTo(PLAYER_X + 245, beamY + 58);
      ctx.lineTo(PLAYER_X + 12, beamY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Entities
    for (let i = 0; i < lvl.entities.length; i++) {
      const ent = lvl.entities[i];
      if (s.collectedIds.has(ent.id) || s.bustedIds.has(ent.id)) continue;
      const ex = PLAYER_X + (ent.atDistance - s.distance) * pixelsPerMeter;
      if (ex < -80 || ex > CANVAS_W + 80) continue;

      const isTrickyFloor = ent.kind === 'jump_obstacle' && i % 3 === 2;
      const trickyLift = isTrickyFloor
        ? Math.max(0, Math.sin(s.timeSec * 6.5) * 18)
        : 0;

      if (ent.kind === 'spring_pad') {
        ctx.save();
        ctx.fillStyle = '#34d399';
        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(ex - 24, GROUND_Y - 18, 48, 18, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = '18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔼', ex, GROUND_Y - 22);
        ctx.restore();
      } else if (ent.kind === 'mystery_box') {
        const baseAlt =
          ent.altitude === 'high' ? 152 : ent.altitude === 'low' ? 44 : 88;
        const ey =
          GROUND_Y - baseAlt + Math.sin(s.timeSec * 5 + ent.atDistance) * 8;
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(Math.sin(s.timeSec * 4) * 0.08);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-22, -22, 44, 44, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 22px "Fredoka", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 1);
        ctx.restore();
      } else if (
        ent.kind === 'collectible_item' ||
        ent.kind === 'collectible_sticker' ||
        ent.kind === 'coin' ||
        ent.kind === 'powerup'
      ) {
        const baseAlt =
          ent.altitude === 'high' ? 152 : ent.altitude === 'low' ? 44 : 86;
        const ey =
          GROUND_Y - baseAlt + Math.sin(s.timeSec * 5 + ent.atDistance) * 8;
        ctx.save();
        if (ent.kind === 'coin') {
          const spinW = 6 + Math.abs(Math.cos(s.timeSec * 6 + i)) * 9;
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#713f12';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ex, ey, spinW, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (spinW > 9) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(ex - 2, ey - 7, 3, 14);
          }
        } else {
          const ringColor =
            ent.kind === 'powerup'
              ? '#38bdf8'
              : ent.kind === 'collectible_sticker'
              ? '#34d399'
              : '#facc15';
          ctx.fillStyle =
            ent.kind === 'powerup'
              ? 'rgba(56, 189, 248, 0.30)'
              : ent.kind === 'collectible_sticker'
              ? 'rgba(52, 211, 153, 0.28)'
              : 'rgba(250, 204, 21, 0.28)';
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(ex, ey, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = '25px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ent.icon, ex, ey);

          ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(ent.label, ex, ey - 33);
        }
        ctx.restore();
      } else if (ent.kind === 'boss_ghost') {
        const gy = GROUND_Y - 90 + Math.sin(s.timeSec * 4.5) * 20;
        ctx.save();
        // Orbiting mini-skulls
        for (let k = 0; k < 2; k++) {
          const ang = s.timeSec * 4 + k * Math.PI;
          ctx.font = '16px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💀', ex + Math.cos(ang) * 48, gy + Math.sin(ang) * 34);
        }
        ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(ex, gy, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '42px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👻', ex, gy + 4);
        ctx.font = '22px system-ui, sans-serif';
        ctx.fillText('👑', ex, gy - 32);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ex - 26, gy - 58, 52, 9);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(ex - 24, gy - 56, 24 * s.bossHp, 5);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
        ctx.fillText(ent.bubble || 'ZAP x2!', ex, gy + 48);
        ctx.restore();
      } else if (ent.kind === 'smash_crate') {
        const oy = GROUND_Y - 52;
        ctx.save();
        ctx.fillStyle = 'rgba(251, 146, 60, 0.34)';
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(ex - 26, oy, 52, 52, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ent.icon, ex, oy + 26);

        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
        ctx.fillText('💨 / SLAM', ex, oy - 12);
        ctx.restore();
      } else if (ent.kind === 'ghost_spooky') {
        const gy = GROUND_Y - 86 + Math.sin(s.timeSec * 5.2 + i) * 24;
        ctx.save();
        ctx.globalAlpha = 0.88;
        // Drawn spectral ghost silhouette + glowing eyes
        ctx.fillStyle = 'rgba(221, 214, 254, 0.92)';
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ex, gy - 6, 23, Math.PI, 0);
        ctx.lineTo(ex + 23, gy + 22);
        ctx.lineTo(ex + 11, gy + 14);
        ctx.lineTo(ex, gy + 23);
        ctx.lineTo(ex - 11, gy + 14);
        ctx.lineTo(ex - 23, gy + 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.arc(ex - 7, gy - 6, 4, 0, Math.PI * 2);
        ctx.arc(ex + 7, gy - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(ex - 7, gy - 6, 1.8, 0, Math.PI * 2);
        ctx.arc(ex + 7, gy - 6, 1.8, 0, Math.PI * 2);
        ctx.fill();

        if (ent.bubble) {
          ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
          const tw = ctx.measureText(ent.bubble).width + 14;
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#c4b5fd';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(ex - tw / 2, gy - 54, tw, 20, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ent.bubble, ex, gy - 44);
        }

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ ZAP / ▼', ex, gy + 36);
        ctx.restore();
      } else if (ent.kind === 'jump_obstacle') {
        const oy = GROUND_Y - 52 - trickyLift;
        ctx.save();
        ctx.fillStyle = 'rgba(244, 63, 94, 0.30)';
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(ex - 26, oy, 52, 52, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ent.icon, ex, oy + 26);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
        ctx.fillText(`▲ ${ent.label}`, ex, oy - 12);
        ctx.restore();
      } else if (ent.kind === 'duck_zombie') {
        const hoverY = GROUND_Y - 86 + Math.sin(s.timeSec * 6) * 4;
        ctx.save();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.32)';
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(ex - 30, hoverY - 34, 60, 68, 14);
        ctx.fill();
        ctx.stroke();

        ctx.font = '32px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ent.icon, ex, hoverY);

        if (ent.bubble) {
          ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
          const tw = ctx.measureText(ent.bubble).width + 14;
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#c4b5fd';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(ex - tw / 2, hoverY - 62, tw, 22, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(ent.bubble, ex, hoverY - 51);
        }

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px "Fredoka", system-ui, sans-serif';
        ctx.fillText('▼ DUCK', ex, GROUND_Y - 14);
        ctx.restore();
      }
    }

    // Student Avatar
    const isDucking = cfg.isDuckHeld && s.py < 8 && s.dashTimer <= 0;

    if (s.dashTimer > 0) {
      for (let g = 1; g <= 3; g++) {
        ctx.save();
        ctx.globalAlpha = 0.25 / g;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(PLAYER_X - g * 24 - 16, GROUND_Y - s.py - 60, 32, 56, 10);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(PLAYER_X, GROUND_Y - s.py);
    if (s.invulnTimer > 0 && Math.floor(s.timeSec * 14) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (s.magnetTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, -38, 52 + Math.sin(s.timeSec * 10) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (s.hasShield) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -40, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (isDucking) {
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-24, -40, 48, 40, 10);
      ctx.fill();
      ctx.stroke();

      // Glowing ninja eyes peeking out of box
      ctx.fillStyle = '#022c22';
      ctx.fillRect(-14, -27, 28, 10);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-4, -22, 2.5, 0, Math.PI * 2);
      ctx.arc(7, -22, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const legSwing =
        s.py > 4 ? 10 : Math.sin(s.timeSec * (s.dashTimer > 0 ? 30 : 18)) * 9;

      // Fluttering scarf/cape
      ctx.save();
      ctx.fillStyle = s.combo >= 5 ? '#facc15' : '#f43f5e';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -52);
      ctx.quadraticCurveTo(
        -28,
        -56 + Math.sin(s.timeSec * 16) * 6,
        -38,
        -42 + Math.cos(s.timeSec * 14) * 5
      );
      ctx.lineTo(-14, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-6, -24);
      ctx.lineTo(-6 + legSwing, -3);
      ctx.moveTo(6, -24);
      ctx.lineTo(6 - legSwing, -3);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-23, -54, 13, 26, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = s.dashTimer > 0 ? '#06b6d4' : '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-13, -55, 26, 32, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(2, -68, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(2, -74, 14, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8, -68, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (const p of s.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life * 1.4);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ft of s.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life * 1.2);
      ctx.font = 'bold 15px "Fredoka", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="h-auto w-full select-none rounded-2xl bg-[#0b1120]"
      aria-label={level.title}
    />
  );
};
