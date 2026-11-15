import React, { useMemo, useState } from 'react';
import {
  Check,
  Delete,
  Layers,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  Search,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  DSA_BOSS_QUESTIONS,
  DSA_STAGE1_QUESTIONS,
  DSA_STAGE2_QUESTIONS,
  DSA_STAGE3_QUESTIONS,
  pickRandom,
} from '../data/runnerLevels';
import { soundFX } from '../utils/audio';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
  >
    <div className="comic-panel w-full max-w-md overflow-hidden rounded-2xl bg-[#FFFDF8] text-zinc-900">
      <div className="flex items-center justify-between border-b-2 border-zinc-900 bg-[#F6F2E9] px-5 py-3.5">
        <h3 className="font-display text-xl font-bold text-zinc-950">
          {title}
        </h3>
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-zinc-900 bg-white text-zinc-800 hover:bg-zinc-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

/* Reusable Visual DSA Card */
const DsaChoiceLock: React.FC<{
  title: string;
  badgeColor: string;
  icon: React.ReactNode;
  question: {
    badge: string;
    visualData: string;
    promptLabel: string;
    options: { id: string; label: string }[];
    answerId: string;
  };
  onSolve: () => void;
  onClose: () => void;
}> = ({ title, badgeColor, icon, question, onSolve, onClose }) => {
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePick = (optId: string) => {
    setPicked(optId);
    if (optId === question.answerId) {
      soundFX.playUnlock();
      window.setTimeout(onSolve, 260);
    } else {
      soundFX.playError();
      setError('NOPE 💀 TRY AGAIN');
    }
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-zinc-900 px-2.5 py-1 font-display text-xs font-bold ${badgeColor}`}
        >
          {icon}
          <span>{question.badge}</span>
        </span>
        <span className="font-display text-xs font-bold text-indigo-700">
          {question.promptLabel}
        </span>
      </div>

      <div className="mb-4 rounded-xl border-2 border-zinc-900 bg-zinc-950 p-4 text-center font-mono-tabular text-base font-bold text-amber-300">
        {question.visualData}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border-2 border-rose-700 bg-rose-100 px-3 py-1.5 text-center font-display text-xs font-bold text-rose-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handlePick(opt.id)}
            className={`comic-btn rounded-xl px-3 py-3 font-display text-sm font-bold ${
              picked === opt.id && opt.id === question.answerId
                ? 'bg-emerald-300 text-zinc-950'
                : 'bg-white text-zinc-950 hover:bg-amber-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </ModalShell>
  );
};

/* 1. Stage 1: Stack & Array Basics */
export const DsaStackLockModal: React.FC<{
  onSolve: () => void;
  onClose: () => void;
}> = ({ onSolve, onClose }) => {
  const q = useMemo(() => pickRandom(DSA_STAGE1_QUESTIONS), []);
  return (
    <DsaChoiceLock
      title="📚 STACK LOCK"
      badgeColor="bg-amber-200"
      icon={<Layers className="h-3.5 w-3.5" />}
      question={q}
      onSolve={onSolve}
      onClose={onClose}
    />
  );
};

/* 2. Stage 2: Queue & Linked List Basics */
export const DsaQueueLockModal: React.FC<{
  onSolve: () => void;
  onClose: () => void;
}> = ({ onSolve, onClose }) => {
  const q = useMemo(() => pickRandom(DSA_STAGE2_QUESTIONS), []);
  return (
    <DsaChoiceLock
      title="🚶 QUEUE LOCK"
      badgeColor="bg-sky-200"
      icon={<ListOrdered className="h-3.5 w-3.5" />}
      question={q}
      onSolve={onSolve}
      onClose={onClose}
    />
  );
};

/* 3. Stage 3: Searching & Sorting Basics */
export const DsaSortLockModal: React.FC<{
  onSolve: () => void;
  onClose: () => void;
}> = ({ onSolve, onClose }) => {
  const q = useMemo(() => pickRandom(DSA_STAGE3_QUESTIONS), []);
  return (
    <DsaChoiceLock
      title="🔍 SORT LOCK"
      badgeColor="bg-orange-200"
      icon={<Search className="h-3.5 w-3.5" />}
      question={q}
      onSolve={onSolve}
      onClose={onClose}
    />
  );
};

/* 4. Stage 4: Simple DSA Boss Gate (Easy 2-Digit Keypad + Sort 3 Numbers) */
export const DsaBossLockModal: React.FC<{
  onSolve: () => void;
  onClose: () => void;
}> = ({ onSolve, onClose }) => {
  const question = useMemo(() => pickRandom(DSA_BOSS_QUESTIONS), []);
  const [step, setStep] = useState<'calc' | 'sort'>('calc');
  const [code, setCode] = useState('');
  const [pickedNums, setPickedNums] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const shuffledNums = useMemo(
    () => [
      question.sortNumbers[1],
      question.sortNumbers[2],
      question.sortNumbers[0],
    ],
    [question]
  );

  const pressDigit = (d: string) => {
    soundFX.playClick();
    setError(null);
    if (code.length < 2) setCode((prev) => prev + d);
  };

  const submitCalc = () => {
    if (code === question.answerDigits) {
      soundFX.playUnlock();
      setError(null);
      setStep('sort');
    } else {
      soundFX.playError();
      setError(`NOPE 💀 · TRY ${question.hintChip}`);
      setCode('');
    }
  };

  const pickSortNum = (n: number) => {
    soundFX.playClick();
    setError(null);
    if (!pickedNums.includes(n)) {
      const next = [...pickedNums, n];
      setPickedNums(next);
      if (next.length === 3) {
        const ok = next.every((v, idx) => v === question.sortNumbers[idx]);
        if (ok) {
          soundFX.playUnlock();
          window.setTimeout(onSolve, 260);
        } else {
          soundFX.playError();
          setError('SMALLEST → BIGGEST 💀');
          setPickedNums([]);
        }
      }
    }
  };

  return (
    <ModalShell
      title={step === 'calc' ? '🌳 DSA GATE 1/2' : '🔢 SORT 2/2'}
      onClose={onClose}
    >
      {step === 'calc' ? (
        <>
          <div className="mb-4 rounded-xl border-2 border-zinc-900 bg-zinc-950 p-3 text-center font-mono-tabular text-sm font-bold text-emerald-300">
            {question.promptCode}
          </div>

          <div className="mb-4 flex items-center justify-center gap-2.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex h-12 w-14 items-center justify-center rounded-xl border-2 border-zinc-900 bg-white font-mono-tabular text-2xl font-bold text-emerald-700 shadow-[2px_2px_0px_#18181B]"
              >
                {code[i] ?? '•'}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-3 rounded-xl border-2 border-rose-700 bg-rose-100 px-3 py-1.5 text-center font-display text-xs font-bold text-rose-900">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => pressDigit(n)}
                className="comic-btn h-11 rounded-xl bg-white font-mono-tabular text-base font-bold text-zinc-950 hover:bg-zinc-100"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setCode((c) => c.slice(0, -1))}
              className="comic-btn flex h-11 items-center justify-center rounded-xl bg-[#EAE4D7] text-zinc-800 hover:bg-zinc-200"
            >
              <Delete className="h-4 w-4" />
            </button>
            <button
              onClick={() => pressDigit('0')}
              className="comic-btn h-11 rounded-xl bg-white font-mono-tabular text-base font-bold text-zinc-950 hover:bg-zinc-100"
            >
              0
            </button>
            <button
              onClick={submitCalc}
              className="comic-btn flex h-11 items-center justify-center gap-1 rounded-xl bg-emerald-300 font-display text-xs font-bold text-zinc-950 hover:bg-emerald-200"
            >
              <Check className="h-4 w-4" />
              <span>NEXT</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 rounded-xl border-2 border-zinc-900 bg-emerald-100 p-2.5 text-center font-display text-sm font-bold text-zinc-950">
            SORT: SMALL → BIG
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border-2 border-zinc-900 bg-[#F6F2E9] p-2.5">
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className="flex h-12 items-center justify-center rounded-lg border-2 border-zinc-900 bg-white font-mono-tabular text-lg font-bold text-zinc-950"
              >
                {pickedNums[slot] !== undefined ? pickedNums[slot] : `#${slot + 1}`}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-3 rounded-xl border-2 border-rose-700 bg-rose-100 px-3 py-1.5 text-center font-display text-xs font-bold text-rose-900">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            {shuffledNums.map((num) => (
              <button
                key={num}
                onClick={() => pickSortNum(num)}
                disabled={pickedNums.includes(num)}
                className={`comic-btn h-14 rounded-xl font-mono-tabular text-xl font-bold ${
                  pickedNums.includes(num)
                    ? 'bg-emerald-300 text-zinc-950'
                    : 'bg-white text-zinc-950 hover:bg-amber-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </>
      )}
    </ModalShell>
  );
};

/* Pause Menu Modal */
export const PauseModal: React.FC<{
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}> = ({ isMuted, onToggleMute, onResume, onRestart, onReturnTitle }) => (
  <ModalShell title="⏸️ PAUSED" onClose={onResume}>
    <div className="flex flex-col gap-3">
      <button
        onClick={onResume}
        className="comic-btn flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-display text-sm font-bold text-zinc-950 hover:bg-amber-200"
      >
        <Play className="h-4 w-4" />
        <span>RESUME</span>
      </button>
      <button
        onClick={onToggleMute}
        className="comic-btn flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-display text-sm font-bold text-zinc-900 hover:bg-zinc-100"
      >
        {isMuted ? (
          <>
            <VolumeX className="h-4 w-4 text-rose-600" />
            <span>SFX: OFF</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 text-emerald-700" />
            <span>SFX: ON</span>
          </>
        )}
      </button>
      <button
        onClick={onRestart}
        className="comic-btn flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-display text-sm font-bold text-zinc-900 hover:bg-zinc-100"
      >
        <RotateCcw className="h-4 w-4" />
        <span>RESTART</span>
      </button>
      <button
        onClick={onReturnTitle}
        className="comic-btn flex items-center justify-center gap-2 rounded-xl bg-rose-100 px-5 py-3 font-display text-sm font-bold text-rose-900 hover:bg-rose-200"
      >
        <Pause className="h-4 w-4" />
        <span>HOME</span>
      </button>
    </div>
  </ModalShell>
);

/* 5. Leaderboard Modal */
export const LeaderboardModal: React.FC<{
  entries: { id: string; score: number; rank: string; difficulty: string }[];
  onClose: () => void;
}> = ({ entries, onClose }) => (
  <ModalShell title="🏆 TOP RUNS" onClose={onClose}>
    {entries.length === 0 ? (
      <div className="rounded-xl border-2 border-zinc-900 bg-[#F6F2E9] p-5 text-center font-display text-sm font-bold text-zinc-700">
        NO RUNS YET · HIT PLAY!
      </div>
    ) : (
      <div className="space-y-2">
        {entries.slice(0, 5).map((e, idx) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-xl border-2 border-zinc-900 bg-white px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-900 bg-amber-200 font-mono-tabular text-xs font-bold">
                #{idx + 1}
              </span>
              <div>
                <p className="font-display text-xs font-bold text-zinc-950">
                  {e.rank}
                </p>
                <p className="font-mono-tabular text-[10px] font-bold uppercase text-zinc-500">
                  {e.difficulty}
                </p>
              </div>
            </div>
            <span className="font-mono-tabular text-sm font-bold text-indigo-700">
              {e.score}
            </span>
          </div>
        ))}
      </div>
    )}
  </ModalShell>
);

export type ActiveModalType =
  | null
  | 'dsa_stack'
  | 'dsa_queue'
  | 'dsa_sort'
  | 'dsa_boss'
  | 'leaderboard'
  | 'pause';
