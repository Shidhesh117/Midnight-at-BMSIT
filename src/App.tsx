import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
  Heart,
  Magnet,
  Pause,
  Shield,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from 'lucide-react';
import { GameOverScreen, VictoryScreen } from './components/EndScreens';
import {
  ActiveModalType,
  DsaBossLockModal,
  DsaQueueLockModal,
  DsaSortLockModal,
  DsaStackLockModal,
  LeaderboardModal,
  PauseModal,
} from './components/PuzzleModals';
import { RunnerCanvas } from './components/RunnerCanvas';
import { TitleScreen } from './components/TitleScreen';
import {
  DIFFICULTY_CONFIG,
  ITEMS,
  RUNNER_LEVELS,
} from './data/runnerLevels';
import {
  ActiveBuffs,
  Difficulty,
  GameScreen,
  ItemId,
  LeaderboardEntry,
  PowerUpType,
  PuzzleId,
  SceneId,
  ScoreLog,
  StickerId,
} from './types/game';
import { soundFX } from './utils/audio';

const STORAGE_LEADERBOARD_KEY = 'bmsit_midnight_leaderboard_v1';
const STORAGE_MUTED_KEY = 'bmsit_midnight_muted_v1';

const INITIAL_BUFFS: ActiveBuffs = {
  shield: false,
  magnetSec: 0,
  doublePtsSec: 0,
  slowMoSec: 0,
  fever: false,
  dashCooldownPct: 0,
  zapCooldownPct: 0,
  combo: 0,
};

export function App() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_MUTED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [currentScene, setCurrentScene] = useState<SceneId>('classroom');
  const [pendingNextScene, setPendingNextScene] = useState<SceneId | null>(
    null
  );

  const [hearts, setHearts] = useState<number>(4);
  const [coins, setCoins] = useState<number>(0);
  const [fastZap, setFastZap] = useState<boolean>(false);
  const [fastDash, setFastDash] = useState<boolean>(false);
  const [grantShieldSignal, setGrantShieldSignal] = useState<number>(0);
  const [grantMagnetSignal, setGrantMagnetSignal] = useState<number>(0);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [buffs, setBuffs] = useState<ActiveBuffs>(INITIAL_BUFFS);
  const [inventory, setInventory] = useState<ItemId[]>([]);
  const [collectedStickers, setCollectedStickers] = useState<StickerId[]>([]);
  const [, setCompletedPuzzles] = useState<PuzzleId[]>([]);

  const [timerRemaining, setTimerRemaining] = useState<number>(
    DIFFICULTY_CONFIG.standard.seconds
  );
  const [score, setScore] = useState<number>(0);
  const [scoreLog, setScoreLog] = useState<ScoreLog>({
    roomsCompleted: 0,
    devLocksCracked: 0,
    stickersFound: 0,
    hitsTaken: 0,
    ghostsBusted: 0,
    coinsCollected: 0,
    timeBonus: 0,
  });

  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  // Runner Controls
  const [jumpSignal, setJumpSignal] = useState<number>(0);
  const [zapSignal, setZapSignal] = useState<number>(0);
  const [dashSignal, setDashSignal] = useState<number>(0);
  const [slamSignal, setSlamSignal] = useState<number>(0);
  const [isDuckHeld, setIsDuckHeld] = useState<boolean>(false);
  const [resetSignal, setResetSignal] = useState<number>(0);

  useEffect(() => {
    soundFX.setMuted(isMuted);
    try {
      localStorage.setItem(STORAGE_MUTED_KEY, String(isMuted));
    } catch {
      // ignore
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      soundFX.stopAmbient();
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundFX.setMuted(next);
      if (!next && screen === 'PLAYING') {
        soundFX.startAmbient();
      }
      return next;
    });
  }, [screen]);

  const resetGameRun = useCallback(
    (goToPlay: boolean = true) => {
      const totalSeconds = DIFFICULTY_CONFIG[difficulty].seconds;
      setCurrentScene('classroom');
      setPendingNextScene(null);
      setHearts(4);
      setCoins(0);
      setFastZap(false);
      setFastDash(false);
      setProgressPct(0);
      setBuffs(INITIAL_BUFFS);
      setInventory([]);
      setCollectedStickers([]);
      setCompletedPuzzles([]);
      setTimerRemaining(totalSeconds);
      setScore(0);
      setScoreLog({
        roomsCompleted: 0,
        devLocksCracked: 0,
        stickersFound: 0,
        hitsTaken: 0,
        ghostsBusted: 0,
        coinsCollected: 0,
        timeBonus: 0,
      });
      setIsDuckHeld(false);
      setActiveModal(null);
      setGameOverReason('');
      setResetSignal((n) => n + 1);

      if (goToPlay) {
        setScreen('PLAYING');
        if (!isMuted) soundFX.startAmbient();
      }
    },
    [difficulty, isMuted]
  );

  const triggerVictory = useCallback(() => {
    soundFX.stopAmbient();
    soundFX.playVictory();
    const totalBudget = DIFFICULTY_CONFIG[difficulty].seconds;
    const timeUsed = Math.max(1, totalBudget - timerRemaining);
    const timeBonus = Math.round(timerRemaining * 0.5);
    const finalScore = score + 150 + timeBonus;

    setScore(finalScore);
    setScoreLog((prev) => ({
      ...prev,
      roomsCompleted: prev.roomsCompleted + 1,
      devLocksCracked: prev.devLocksCracked + 1,
      timeBonus,
    }));

    const rankTitle =
      finalScore >= 1100
        ? 'O(1) GIGACHAD'
        : finalScore >= 700
        ? 'BINARY BOSS'
        : finalScore >= 380
        ? 'ARRAY SURVIVOR'
        : 'INDEX 0 NOOB';

    const newEntry: LeaderboardEntry = {
      id: `${Date.now()}`,
      playerName: 'BMSIT',
      score: finalScore,
      rank: rankTitle,
      difficulty,
      timeUsedSeconds: timeUsed,
      date: new Date().toISOString(),
    };

    setLeaderboard((prev) => {
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      try {
        localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setActiveModal(null);
    setScreen('VICTORY');
  }, [difficulty, score, timerRemaining]);

  const isGamePaused = screen !== 'PLAYING' || activeModal !== null;

  // Countdown Timer
  useEffect(() => {
    if (isGamePaused) return;
    const id = window.setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          soundFX.stopAmbient();
          soundFX.playGameOver();
          setGameOverReason('TIME OUT ⏰');
          setScreen('GAME_OVER');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isGamePaused]);

  // Keyboard Controls (Jump, Duck/Slam, Zap, Dash)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'PLAYING') {
        setActiveModal((m) => (m === 'pause' ? null : 'pause'));
        return;
      }
      if (screen !== 'PLAYING' || activeModal !== null) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'arrowup' || k === 'w') {
        e.preventDefault();
        setJumpSignal((s) => s + 1);
      } else if (k === 'arrowdown' || k === 's') {
        e.preventDefault();
        setIsDuckHeld(true);
        setSlamSignal((s) => s + 1);
      } else if (k === 'f' || k === 'shift') {
        e.preventDefault();
        setZapSignal((s) => s + 1);
      } else if (k === 'e' || k === 'd' || k === 'arrowright') {
        e.preventDefault();
        setDashSignal((s) => s + 1);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowdown' || k === 's') {
        setIsDuckHeld(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [activeModal, screen]);

  // Auto-combine card fragments A + B
  useEffect(() => {
    if (
      inventory.includes('card_fragment_a') &&
      inventory.includes('card_fragment_b')
    ) {
      setInventory((prev) => [
        ...prev.filter((i) => i !== 'card_fragment_a' && i !== 'card_fragment_b'),
        'full_access_card',
      ]);
    }
  }, [inventory]);

  const activeLevel = RUNNER_LEVELS[currentScene];

  const handleCollectItem = useCallback((itemId: ItemId) => {
    soundFX.playPickup();
    setInventory((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    setScore((s) => s + 30);
  }, []);

  const handleCollectSticker = useCallback((stickerId: StickerId) => {
    soundFX.playPickup();
    setCollectedStickers((prev) =>
      prev.includes(stickerId) ? prev : [...prev, stickerId]
    );
    setScore((s) => s + 25);
    setScoreLog((l) => ({ ...l, stickersFound: l.stickersFound + 1 }));
  }, []);

  const handleCollectCoin = useCallback((pts: number) => {
    setScore((s) => s + pts);
    setCoins((c) => c + pts);
    setScoreLog((l) => ({ ...l, coinsCollected: l.coinsCollected + 1 }));
  }, []);

  const handleCollectPowerUp = useCallback((powerUp: PowerUpType) => {
    if (powerUp === 'heal') {
      setHearts((h) => Math.min(4, h + 1));
    }
    setScore((s) => s + 20);
  }, []);

  const handleBustGhost = useCallback((pts: number) => {
    setScore((s) => s + pts);
    setCoins((c) => c + 10);
    setScoreLog((l) => ({ ...l, ghostsBusted: l.ghostsBusted + 1 }));
  }, []);

  const handleSmashCrate = useCallback((pts: number) => {
    setScore((s) => s + pts);
    setCoins((c) => c + 5);
  }, []);

  const handleHitHazard = useCallback((label: string) => {
    soundFX.playNoiseAlert();
    setScore((s) => Math.max(0, s - 20));
    setScoreLog((l) => ({ ...l, hitsTaken: l.hitsTaken + 1 }));
    setHearts((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        soundFX.stopAmbient();
        soundFX.playGameOver();
        setGameOverReason(`BONKED BY ${label}`);
        setScreen('GAME_OVER');
        return 0;
      }
      return next;
    });
  }, []);

  const handleReachExitDoor = useCallback(() => {
    soundFX.playUnlock();
    setActiveModal(activeLevel.puzzleId);
  }, [activeLevel.puzzleId]);

  const completeZoneAndAdvance = (
    puzzleId: PuzzleId,
    nextScene: SceneId | null,
    rewardItem?: ItemId
  ) => {
    setCompletedPuzzles((p) => [...p, puzzleId]);
    if (rewardItem) {
      setInventory((prev) =>
        prev.includes(rewardItem) ? prev : [...prev, rewardItem]
      );
    }
    setScore((s) => s + 150);
    setCoins((c) => c + 20);
    setScoreLog((l) => ({
      ...l,
      roomsCompleted: l.roomsCompleted + 1,
      devLocksCracked: l.devLocksCracked + 1,
    }));
    setActiveModal(null);

    if (nextScene) {
      setPendingNextScene(nextScene);
      setScreen('LEVEL_TRANSITION');
    }
  };

  const confirmEnterNextScene = () => {
    if (!pendingNextScene) return;
    soundFX.playClick();
    setCurrentScene(pendingNextScene);
    setProgressPct(0);
    setIsDuckHeld(false);
    setResetSignal((n) => n + 1);
    setPendingNextScene(null);
    setScreen('PLAYING');
  };

  const buyShopShield = () => {
    if (coins < 20 || buffs.shield) return;
    soundFX.playCoinBuy();
    setCoins((c) => c - 20);
    setGrantShieldSignal((n) => n + 1);
    setBuffs((b) => ({ ...b, shield: true }));
  };

  const buyShopHeart = () => {
    if (coins < 20 || hearts >= 4) return;
    soundFX.playCoinBuy();
    setCoins((c) => c - 20);
    setHearts((h) => Math.min(4, h + 1));
  };

  const buyShopFastZap = () => {
    if (coins < 30 || fastZap) return;
    soundFX.playCoinBuy();
    setCoins((c) => c - 30);
    setFastZap(true);
  };

  const buyShopFastDash = () => {
    if (coins < 30 || fastDash) return;
    soundFX.playCoinBuy();
    setCoins((c) => c - 30);
    setFastDash(true);
  };

  const buyShopMagnet = () => {
    if (coins < 25 || buffs.magnetSec > 0) return;
    soundFX.playCoinBuy();
    setCoins((c) => c - 25);
    setGrantMagnetSignal((n) => n + 1);
    setBuffs((b) => ({ ...b, magnetSec: 10 }));
  };

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, [timerRemaining]);

  return (
    <div className="min-h-screen bg-[#F6F2E9] text-zinc-900">
      {screen === 'TITLE' && (
        <TitleScreen
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onPlay={() => {
            soundFX.playUnlock();
            resetGameRun(true);
          }}
          onOpenLeaderboard={() => {
            soundFX.playClick();
            setActiveModal('leaderboard');
          }}
          leaderboard={leaderboard}
        />
      )}

      {/* Between-Stage Coin Upgrade Shop + Next Level */}
      {screen === 'LEVEL_TRANSITION' && pendingNextScene && (
        <div className="flex min-h-screen items-center justify-center bg-[#F6F2E9] p-6">
          <div className="comic-panel w-full max-w-lg rounded-2xl bg-[#FFFDF8] p-7 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="rounded-lg border-2 border-zinc-900 bg-emerald-200 px-3 py-1 font-mono-tabular text-xs font-bold text-zinc-950">
                +150 PTS
              </span>
              <span className="rounded-lg border-2 border-zinc-900 bg-amber-200 px-3 py-1 font-mono-tabular text-xs font-bold text-zinc-950">
                🪙 {coins}
              </span>
            </div>

            <h2 className="mt-3 font-display text-3xl font-bold text-zinc-950">
              LVL {RUNNER_LEVELS[pendingNextScene].levelNumber} ·{' '}
              {RUNNER_LEVELS[pendingNextScene].title}
            </h2>

            {/* Coin Upgrade Shop */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              <button
                onClick={buyShopShield}
                disabled={coins < 20 || buffs.shield}
                className={`comic-btn flex flex-col items-center gap-1 rounded-xl p-2.5 font-display text-xs font-bold ${
                  buffs.shield
                    ? 'bg-sky-200 text-zinc-900'
                    : coins >= 20
                    ? 'bg-white text-zinc-950 hover:bg-sky-100'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-500 shadow-none'
                }`}
              >
                <Shield className="h-5 w-5 text-sky-600" />
                <span>{buffs.shield ? 'OWNED' : 'SHIELD'}</span>
                <span className="font-mono-tabular text-[11px] text-amber-700">
                  20 🪙
                </span>
              </button>

              <button
                onClick={buyShopHeart}
                disabled={coins < 20 || hearts >= 4}
                className={`comic-btn flex flex-col items-center gap-1 rounded-xl p-2.5 font-display text-xs font-bold ${
                  hearts >= 4
                    ? 'bg-rose-100 text-zinc-800'
                    : coins >= 20
                    ? 'bg-white text-zinc-950 hover:bg-rose-100'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-500 shadow-none'
                }`}
              >
                <Heart className="h-5 w-5 fill-rose-500 text-zinc-900" />
                <span>{hearts >= 4 ? 'FULL' : '+1 HP'}</span>
                <span className="font-mono-tabular text-[11px] text-amber-700">
                  20 🪙
                </span>
              </button>

              <button
                onClick={buyShopFastZap}
                disabled={coins < 30 || fastZap}
                className={`comic-btn flex flex-col items-center gap-1 rounded-xl p-2.5 font-display text-xs font-bold ${
                  fastZap
                    ? 'bg-purple-200 text-zinc-900'
                    : coins >= 30
                    ? 'bg-white text-zinc-950 hover:bg-purple-100'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-500 shadow-none'
                }`}
              >
                <Zap className="h-5 w-5 text-purple-600" />
                <span>{fastZap ? 'MAXED' : '2X ZAP'}</span>
                <span className="font-mono-tabular text-[11px] text-amber-700">
                  30 🪙
                </span>
              </button>

              <button
                onClick={buyShopFastDash}
                disabled={coins < 30 || fastDash}
                className={`comic-btn flex flex-col items-center gap-1 rounded-xl p-2.5 font-display text-xs font-bold ${
                  fastDash
                    ? 'bg-sky-200 text-zinc-900'
                    : coins >= 30
                    ? 'bg-white text-zinc-950 hover:bg-sky-100'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-500 shadow-none'
                }`}
              >
                <Wind className="h-5 w-5 text-sky-600" />
                <span>{fastDash ? 'MAXED' : '2X DASH'}</span>
                <span className="font-mono-tabular text-[11px] text-amber-700">
                  30 🪙
                </span>
              </button>

              <button
                onClick={buyShopMagnet}
                disabled={coins < 25 || buffs.magnetSec > 0}
                className={`comic-btn flex flex-col items-center gap-1 rounded-xl p-2.5 font-display text-xs font-bold ${
                  buffs.magnetSec > 0
                    ? 'bg-pink-200 text-zinc-900'
                    : coins >= 25
                    ? 'bg-white text-zinc-950 hover:bg-pink-100'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-500 shadow-none'
                }`}
              >
                <Magnet className="h-5 w-5 text-pink-600" />
                <span>{buffs.magnetSec > 0 ? 'READY' : 'MAGNET'}</span>
                <span className="font-mono-tabular text-[11px] text-amber-700">
                  25 🪙
                </span>
              </button>
            </div>

            <button
              onClick={confirmEnterNextScene}
              className="comic-btn mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-7 py-3 font-display text-lg font-bold text-zinc-950 hover:bg-amber-200"
            >
              <span>RUN</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {screen === 'PLAYING' && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          {/* Clean Minimal HUD with Fever, Slow-Mo & Active Buffs */}
          <header className="comic-panel flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#FFFDF8] px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border-2 border-zinc-900 bg-amber-200 px-2.5 py-1 font-display text-xs font-bold text-zinc-950">
                LVL {activeLevel.levelNumber}/4
              </span>
              <h1 className="font-display text-base font-bold text-zinc-950 sm:text-lg">
                {activeLevel.title}
              </h1>
              <span className="font-mono-tabular text-sm font-bold text-indigo-700">
                ⭐ {score}
              </span>
              <span className="font-mono-tabular text-sm font-bold text-amber-700">
                🪙 {coins}
              </span>
              {buffs.combo >= 2 && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-lg border-2 border-zinc-900 px-2 py-0.5 font-mono-tabular text-xs font-bold text-zinc-950 ${
                    buffs.fever ? 'bg-amber-300' : 'bg-orange-200'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 text-orange-600" />
                  <span>
                    {buffs.fever ? `FEVER ${buffs.combo}x` : `${buffs.combo}x`}
                  </span>
                </span>
              )}
              {buffs.shield && (
                <span className="rounded-lg border-2 border-zinc-900 bg-sky-200 px-2 py-0.5 text-xs font-bold">
                  🛡️
                </span>
              )}
              {buffs.magnetSec > 0 && (
                <span className="rounded-lg border-2 border-zinc-900 bg-pink-200 px-2 py-0.5 font-mono-tabular text-xs font-bold">
                  🧲 {buffs.magnetSec}s
                </span>
              )}
              {buffs.doublePtsSec > 0 && (
                <span className="rounded-lg border-2 border-zinc-900 bg-amber-200 px-2 py-0.5 font-mono-tabular text-xs font-bold">
                  ☕ 2X {buffs.doublePtsSec}s
                </span>
              )}
              {buffs.slowMoSec > 0 && (
                <span className="rounded-lg border-2 border-zinc-900 bg-indigo-200 px-2 py-0.5 font-mono-tabular text-xs font-bold">
                  ⏱️ {buffs.slowMoSec}s
                </span>
              )}
            </div>

            {/* Door Progress, Hearts & Timer */}
            <div className="flex flex-wrap items-center gap-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🚪</span>
                <div className="h-3.5 w-28 overflow-hidden rounded-full border-2 border-zinc-900 bg-[#EAE4D7] sm:w-36">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-150"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                  {progressPct}%
                </span>
              </div>

              <div
                className="flex items-center gap-1"
                aria-label={`${hearts} hearts`}
              >
                {[0, 1, 2, 3].map((idx) => (
                  <Heart
                    key={idx}
                    className={`h-5 w-5 ${
                      idx < hearts
                        ? 'fill-rose-500 text-zinc-900'
                        : 'text-zinc-300'
                    }`}
                  />
                ))}
              </div>

              <span
                className={`font-mono-tabular text-lg font-bold ${
                  timerRemaining <= 90 ? 'text-rose-600' : 'text-zinc-950'
                }`}
              >
                {formattedTimer}
              </span>
            </div>

            {/* Audio & Pause */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="comic-btn flex h-9 w-9 items-center justify-center rounded-lg bg-white text-zinc-900 hover:bg-zinc-100"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-rose-600" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-700" />
                )}
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setActiveModal('pause');
                }}
                className="comic-btn flex h-9 w-9 items-center justify-center rounded-lg bg-white text-zinc-900 hover:bg-zinc-100"
                aria-label="Pause"
              >
                <Pause className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Framed 60fps Side-Scroller Stage */}
          <div className="comic-panel overflow-hidden rounded-2xl bg-[#0b1120]">
            <RunnerCanvas
              level={activeLevel}
              difficulty={difficulty}
              isPaused={isGamePaused}
              jumpSignal={jumpSignal}
              zapSignal={zapSignal}
              dashSignal={dashSignal}
              slamSignal={slamSignal}
              isDuckHeld={isDuckHeld}
              fastZap={fastZap}
              fastDash={fastDash}
              grantShieldSignal={grantShieldSignal}
              grantMagnetSignal={grantMagnetSignal}
              resetSignal={resetSignal}
              onProgressChange={setProgressPct}
              onBuffsChange={setBuffs}
              onCollectItem={handleCollectItem}
              onCollectSticker={handleCollectSticker}
              onCollectCoin={handleCollectCoin}
              onCollectPowerUp={handleCollectPowerUp}
              onBustGhost={handleBustGhost}
              onSmashCrate={handleSmashCrate}
              onHitHazard={handleHitHazard}
              onReachExitDoor={handleReachExitDoor}
            />
          </div>

          {/* 4-Action Tactile Arcade Deck + Inventory Chips */}
          <div className="grid gap-3 md:grid-cols-12">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:col-span-8">
              <button
                type="button"
                onPointerDown={() => setJumpSignal((s) => s + 1)}
                className="comic-btn flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-2.5 font-display text-base font-bold text-zinc-950 hover:bg-amber-200"
              >
                <ArrowUp className="h-5 w-5" />
                <span>2X JUMP</span>
              </button>

              <button
                type="button"
                onPointerDown={() => {
                  setIsDuckHeld(true);
                  setSlamSignal((s) => s + 1);
                }}
                onPointerUp={() => setIsDuckHeld(false)}
                onPointerLeave={() => setIsDuckHeld(false)}
                className={`comic-btn flex min-h-[58px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-display text-base font-bold ${
                  isDuckHeld
                    ? 'bg-emerald-400 text-zinc-950'
                    : 'bg-emerald-200 text-zinc-950 hover:bg-emerald-300'
                }`}
              >
                <ArrowDown className="h-5 w-5" />
                <span>DUCK / SLAM</span>
              </button>

              <button
                type="button"
                onPointerDown={() => setZapSignal((s) => s + 1)}
                disabled={buffs.zapCooldownPct > 0}
                className={`comic-btn relative flex min-h-[58px] items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 font-display text-base font-bold ${
                  buffs.zapCooldownPct > 0
                    ? 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                    : 'bg-purple-300 text-zinc-950 hover:bg-purple-200'
                }`}
              >
                {buffs.zapCooldownPct > 0 && (
                  <span
                    className="absolute inset-y-0 left-0 bg-purple-400/40"
                    style={{ width: `${(1 - buffs.zapCooldownPct) * 100}%` }}
                  />
                )}
                <Zap className="relative h-5 w-5" />
                <span className="relative">ZAP (F)</span>
              </button>

              <button
                type="button"
                onPointerDown={() => setDashSignal((s) => s + 1)}
                disabled={buffs.dashCooldownPct > 0}
                className={`comic-btn relative flex min-h-[58px] items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 font-display text-base font-bold ${
                  buffs.dashCooldownPct > 0
                    ? 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                    : 'bg-sky-300 text-zinc-950 hover:bg-sky-200'
                }`}
              >
                {buffs.dashCooldownPct > 0 && (
                  <span
                    className="absolute inset-y-0 left-0 bg-sky-400/40"
                    style={{ width: `${(1 - buffs.dashCooldownPct) * 100}%` }}
                  />
                )}
                <Wind className="relative h-5 w-5" />
                <span className="relative">DASH (E)</span>
              </button>
            </div>

            <div className="comic-panel flex items-center justify-between gap-2 rounded-2xl bg-[#FFFDF8] px-3.5 py-2.5 md:col-span-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {inventory.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-lg border-2 border-zinc-900 bg-[#F6F2E9] px-2 py-1 font-display text-xs font-bold text-zinc-900"
                  >
                    <span>{ITEMS[id].icon}</span>
                    <span>{ITEMS[id].name}</span>
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-lg border-2 border-zinc-900 bg-amber-100 px-2 py-1 font-mono-tabular text-xs font-bold text-zinc-900">
                  ⭐ {collectedStickers.length}/3
                </span>
              </div>

              <span className="shrink-0 rounded-lg border-2 border-zinc-900 bg-sky-100 px-2.5 py-1 font-mono-tabular text-xs font-bold text-indigo-900">
                {activeLevel.clueTitle}
              </span>
            </div>
          </div>
        </div>
      )}

      {screen === 'VICTORY' && (
        <VictoryScreen
          score={score}
          timeUsedSeconds={Math.max(
            1,
            DIFFICULTY_CONFIG[difficulty].seconds - timerRemaining
          )}
          scoreLog={scoreLog}
          onPlayAgain={() => resetGameRun(true)}
          onReturnTitle={() => {
            soundFX.stopAmbient();
            setScreen('TITLE');
          }}
        />
      )}

      {screen === 'GAME_OVER' && (
        <GameOverScreen
          reason={gameOverReason}
          score={score}
          onRetry={() => resetGameRun(true)}
          onReturnTitle={() => {
            soundFX.stopAmbient();
            setScreen('TITLE');
          }}
        />
      )}

      {activeModal === 'dsa_stack' && (
        <DsaStackLockModal
          onSolve={() =>
            completeZoneAndAdvance('dsa_stack', 'library', 'classroom_key')
          }
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'dsa_queue' && (
        <DsaQueueLockModal
          onSolve={() =>
            completeZoneAndAdvance('dsa_queue', 'canteen', 'fuse')
          }
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'dsa_sort' && (
        <DsaSortLockModal
          onSolve={() =>
            completeZoneAndAdvance('dsa_sort', 'gate', 'card_fragment_b')
          }
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'dsa_boss' && (
        <DsaBossLockModal
          onSolve={() => {
            setCompletedPuzzles((p) => [...p, 'dsa_boss']);
            triggerVictory();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          entries={leaderboard}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'pause' && (
        <PauseModal
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onResume={() => setActiveModal(null)}
          onRestart={() => resetGameRun(true)}
          onReturnTitle={() => {
            soundFX.stopAmbient();
            setActiveModal(null);
            setScreen('TITLE');
          }}
        />
      )}
    </div>
  );
}

export default App;
