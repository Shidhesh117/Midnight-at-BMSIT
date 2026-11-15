export type GameScreen =
  | 'TITLE'
  | 'PLAYING'
  | 'LEVEL_TRANSITION'
  | 'GAME_OVER'
  | 'VICTORY';

export type SceneId = 'classroom' | 'library' | 'canteen' | 'gate';

export type Difficulty = 'chill' | 'standard' | 'spooky';

export type ItemId =
  | 'torch'
  | 'classroom_key'
  | 'fuse'
  | 'card_fragment_a'
  | 'plastic_tray'
  | 'card_fragment_b'
  | 'full_access_card';

export type StickerId = 'sticker_lab' | 'sticker_library' | 'sticker_dosa';

export type PuzzleId =
  | 'dsa_stack'
  | 'dsa_queue'
  | 'dsa_sort'
  | 'dsa_boss';

export type PowerUpType = 'shield' | 'magnet' | 'chai_2x' | 'heal' | 'slowmo';

export type RunnerEntityKind =
  | 'jump_obstacle'
  | 'duck_zombie'
  | 'ghost_spooky'
  | 'boss_ghost'
  | 'smash_crate'
  | 'spring_pad'
  | 'mystery_box'
  | 'collectible_item'
  | 'collectible_sticker'
  | 'coin'
  | 'powerup';

export interface RunnerEntityDef {
  id: string;
  atDistance: number; // 0 to levelLength
  kind: RunnerEntityKind;
  label: string;
  icon: string;
  itemId?: ItemId;
  stickerId?: StickerId;
  powerUp?: PowerUpType;
  altitude?: 'low' | 'mid' | 'high';
  bubble?: string;
}

export interface RunnerLevelDef {
  id: SceneId;
  levelNumber: number;
  title: string;
  backgroundImage: string;
  floorColor: string;
  accentColor: string;
  levelLength: number;
  baseSpeed: number;
  puzzleId: PuzzleId;
  clueTitle: string;
  entities: RunnerEntityDef[];
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  rank: string;
  difficulty: Difficulty;
  timeUsedSeconds: number;
  date: string;
}

export interface ScoreLog {
  roomsCompleted: number;
  devLocksCracked: number;
  stickersFound: number;
  hitsTaken: number;
  ghostsBusted: number;
  coinsCollected: number;
  timeBonus: number;
}

export interface ActiveBuffs {
  shield: boolean;
  magnetSec: number;
  doublePtsSec: number;
  slowMoSec: number;
  fever: boolean;
  dashCooldownPct: number;
  zapCooldownPct: number;
  combo: number;
}

export interface DsaChoiceQuestion {
  id: string;
  badge: string;
  visualData: string;
  promptLabel: string;
  options: { id: string; label: string }[];
  answerId: string;
}

export interface DsaBossQuestion {
  id: string;
  promptCode: string;
  answerDigits: string;
  hintChip: string;
  sortNumbers: number[]; // smallest to largest
}
