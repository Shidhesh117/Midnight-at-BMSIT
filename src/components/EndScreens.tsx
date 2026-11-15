import React, { useEffect, useRef } from 'react';
import { Home, RotateCcw, Skull, Trophy } from 'lucide-react';
import { getHumorRank } from '../data/runnerLevels';
import { ScoreLog } from '../types/game';

interface VictoryScreenProps {
  score: number;
  timeUsedSeconds: number;
  scoreLog: ScoreLog;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  score,
  timeUsedSeconds,
  scoreLog,
  onPlayAgain,
  onReturnTitle,
}) => {
  const rank = getHumorRank(score);
  const mins = Math.floor(timeUsedSeconds / 60);
  const secs = timeUsedSeconds % 60;
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#facc15', '#34d399', '#38bdf8', '#fb7185', '#a78bfa'];
    const pieces = Array.from({ length: 85 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 7 + Math.random() * 7,
      h: 10 + Math.random() * 8,
      vy: 110 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 90,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of pieces) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F2E9] p-6">
      <canvas
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-10"
        aria-hidden="true"
      />
      <div className="comic-panel relative z-20 w-full max-w-lg rounded-2xl bg-[#FFFDF8] p-7 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-zinc-900 bg-amber-300 text-zinc-950 shadow-[3px_3px_0px_#18181B]">
          <Trophy className="h-8 w-8" />
        </div>

        <h1 className="font-display text-4xl font-bold text-zinc-950">
          🌞 SUNRISE ESCAPE!
        </h1>

        <div className="mt-4 rounded-xl border-2 border-zinc-900 bg-amber-100 p-4">
          <p className="font-display text-2xl font-bold text-zinc-950">
            {rank.title}
          </p>
          <p className="mt-1 font-display text-xs font-bold text-amber-900">
            {rank.blurb}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-xl border-2 border-zinc-900 bg-white p-3">
            <p className="text-[11px] font-bold text-zinc-500">SCORE</p>
            <p className="mt-0.5 font-mono-tabular text-xl font-bold text-indigo-700">
              {score}
            </p>
          </div>
          <div className="rounded-xl border-2 border-zinc-900 bg-white p-3">
            <p className="text-[11px] font-bold text-zinc-500">TIME</p>
            <p className="mt-0.5 font-mono-tabular text-xl font-bold text-zinc-950">
              {mins}:{secs.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-xl border-2 border-zinc-900 bg-white p-3">
            <p className="text-[11px] font-bold text-zinc-500">👻 BUSTED</p>
            <p className="mt-0.5 font-mono-tabular text-xl font-bold text-purple-700">
              {scoreLog.ghostsBusted}
            </p>
          </div>
          <div className="rounded-xl border-2 border-zinc-900 bg-white p-3">
            <p className="text-[11px] font-bold text-zinc-500">🧠 DSA</p>
            <p className="mt-0.5 font-mono-tabular text-xl font-bold text-emerald-700">
              {scoreLog.devLocksCracked}/4
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="comic-btn inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 font-display text-base font-bold text-zinc-950 hover:bg-amber-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>AGAIN</span>
          </button>
          <button
            onClick={onReturnTitle}
            className="comic-btn inline-flex min-h-[50px] items-center justify-center rounded-xl bg-white px-5 py-3 text-zinc-900 hover:bg-zinc-100"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverScreenProps {
  reason: string;
  score: number;
  onRetry: () => void;
  onReturnTitle: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  reason,
  score,
  onRetry,
  onReturnTitle,
}) => {
  const isTime = reason.toLowerCase().includes('time');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F2E9] p-6">
      <div className="comic-panel w-full max-w-md rounded-2xl bg-[#FFFDF8] p-7 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-zinc-900 bg-rose-200 text-rose-900 shadow-[3px_3px_0px_#18181B]">
          <Skull className="h-8 w-8" />
        </div>

        <h1 className="font-display text-3xl font-bold text-zinc-950">
          {isTime ? '⏰ CURFEW GG' : '💀 SKILL ISSUE'}
        </h1>
        <p className="mt-2 font-display text-sm font-bold text-rose-700">
          {reason || '📸 CAUGHT IN 4K'}
        </p>

        <div className="mt-4 inline-block rounded-xl border-2 border-zinc-900 bg-amber-100 px-5 py-2 font-mono-tabular text-lg font-bold text-zinc-950">
          SCORE: {score}
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="comic-btn inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 font-display text-base font-bold text-zinc-950 hover:bg-amber-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RETRY</span>
          </button>
          <button
            onClick={onReturnTitle}
            className="comic-btn inline-flex min-h-[50px] items-center justify-center rounded-xl bg-white px-5 py-3 text-zinc-900 hover:bg-zinc-100"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
