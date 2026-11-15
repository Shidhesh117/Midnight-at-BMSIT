import React from 'react';
import { Play, Trophy, Volume2, VolumeX } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../data/runnerLevels';
import { Difficulty, LeaderboardEntry } from '../types/game';
import { soundFX } from '../utils/audio';

interface TitleScreenProps {
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPlay: () => void;
  onOpenLeaderboard: () => void;
  leaderboard: LeaderboardEntry[];
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  difficulty,
  onSelectDifficulty,
  isMuted,
  onToggleMute,
  onPlay,
  onOpenLeaderboard,
  leaderboard,
}) => {
  const bestScore = leaderboard[0]?.score ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F2E9] p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        {/* Clean Minimal Top Bar */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="font-display text-2xl font-bold text-zinc-950">
            MIDNIGHT @ BMSIT 🧟
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="comic-btn inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 font-mono-tabular text-xs font-bold text-zinc-950 hover:bg-amber-200"
              aria-label="Top Runs"
            >
              <Trophy className="h-4 w-4 text-amber-600" />
              <span>{bestScore > 0 ? bestScore : 'TOP'}</span>
            </button>
            <button
              onClick={onToggleMute}
              className="comic-btn flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-900"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-rose-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-700" />
              )}
            </button>
          </div>
        </div>

        {/* Visual Hero Frame (Zero Paragraphs) */}
        <div className="comic-panel overflow-hidden rounded-2xl bg-[#FFFDF8]">
          <div className="relative aspect-[16/9] w-full bg-[#1E1B4B]">
            <img
              src="/src/assets/images/bmsit_title_night_clean_1794745631589.jpg"
              alt="Midnight at BMSIT"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent p-6">
              <button
                onClick={onPlay}
                className="comic-btn inline-flex min-h-[58px] items-center gap-3 rounded-2xl bg-amber-300 px-12 py-3 font-display text-2xl font-bold text-zinc-950 hover:bg-amber-200"
              >
                <Play className="h-7 w-7 fill-current" />
                <span>PLAY</span>
              </button>
            </div>
          </div>

          {/* Mode & Visual Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-zinc-900 bg-[#FFFDF8] px-5 py-3.5">
            <div className="flex items-center gap-2">
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((key) => {
                const active = difficulty === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      soundFX.playClick();
                      onSelectDifficulty(key);
                    }}
                    className={`rounded-lg px-3 py-1.5 font-display text-xs font-bold transition-colors ${
                      active
                        ? 'border-2 border-zinc-900 bg-amber-300 text-zinc-950'
                        : 'border-2 border-transparent text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {DIFFICULTY_CONFIG[key].label}{' '}
                    <span className="font-mono-tabular text-[10px] opacity-75">
                      {DIFFICULTY_CONFIG[key].badge}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 font-display text-xs font-bold text-zinc-800">
              <span>▲ 2X JUMP</span>
              <span>▼ DUCK / SLAM</span>
              <span>⚡ ZAP 👻</span>
              <span>💨 DASH</span>
              <span>🧠 DSA LOCKS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
