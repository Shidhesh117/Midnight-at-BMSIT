import {
  Difficulty,
  DsaBossQuestion,
  DsaChoiceQuestion,
  ItemId,
  RunnerLevelDef,
  SceneId,
  StickerId,
} from '../types/game';

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; seconds: number; speedMult: number; badge: string }
> = {
  chill: { label: 'CHILL', seconds: 15 * 60, speedMult: 0.85, badge: '0.8x' },
  standard: { label: 'NORMAL', seconds: 12 * 60, speedMult: 1.05, badge: '1.0x' },
  spooky: { label: 'CHAOS', seconds: 9 * 60, speedMult: 1.3, badge: '1.3x' },
};

export const ITEMS: Record<
  ItemId,
  { id: ItemId; name: string; icon: string }
> = {
  torch: { id: 'torch', name: 'Torch', icon: '🔦' },
  classroom_key: { id: 'classroom_key', name: 'Stack Key', icon: '🗝️' },
  fuse: { id: 'fuse', name: 'Queue Fuse', icon: '⚡' },
  card_fragment_a: { id: 'card_fragment_a', name: 'ARRAY', icon: '🪪' },
  plastic_tray: { id: 'plastic_tray', name: 'Dosa', icon: '🍽️' },
  card_fragment_b: { id: 'card_fragment_b', name: 'TREE', icon: '💳' },
  full_access_card: { id: 'full_access_card', name: 'ROOT', icon: '🎫' },
};

export const STICKERS: Record<
  StickerId,
  { id: StickerId; title: string }
> = {
  sticker_lab: { id: 'sticker_lab', title: '8AM LAB 💀' },
  sticker_library: { id: 'sticker_library', title: 'SHHH 🤫' },
  sticker_dosa: { id: 'sticker_dosa', title: 'DOSA W 🥞' },
};

export const RUNNER_LEVELS: Record<SceneId, RunnerLevelDef> = {
  classroom: {
    id: 'classroom',
    levelNumber: 1,
    title: 'CLASSROOM 301',
    backgroundImage: '/src/assets/images/bmsit_classroom_scene_1794745616045.jpg',
    floorColor: '#13203b',
    accentColor: '#facc15',
    levelLength: 275,
    baseSpeed: 11.4,
    puzzleId: 'dsa_stack',
    clueTitle: '📚 STACK',
    entities: [
      { id: 'c1_torch', atDistance: 18, kind: 'collectible_item', label: 'TORCH', icon: '🔦', itemId: 'torch' },
      { id: 'c1_spring1', atDistance: 32, kind: 'spring_pad', label: 'BOING', icon: '🔼' },
      { id: 'c1_coin1', atDistance: 38, kind: 'coin', label: '+10', icon: '🪙', altitude: 'high' },
      { id: 'c1_coin2', atDistance: 42, kind: 'coin', label: '+10', icon: '🪙', altitude: 'high' },
      { id: 'c1_books1', atDistance: 58, kind: 'jump_obstacle', label: 'ARR[0]', icon: '📚' },
      { id: 'c1_ghost1', atDistance: 80, kind: 'ghost_spooky', label: 'BOO 👻', icon: '👻', bubble: 'WOOO!' },
      { id: 'c1_shield', atDistance: 98, kind: 'powerup', label: 'SHIELD', icon: '🛡️', powerUp: 'shield', altitude: 'mid' },
      { id: 'c1_zombie1', atDistance: 116, kind: 'duck_zombie', label: 'BRO 💀', icon: '🧟', bubble: 'LIFO!!' },
      { id: 'c1_crate1', atDistance: 140, kind: 'smash_crate', label: 'DESK', icon: '📦' },
      { id: 'c1_mystery', atDistance: 158, kind: 'mystery_box', label: 'DROP', icon: '❓', altitude: 'mid' },
      { id: 'c1_sticker', atDistance: 174, kind: 'collectible_sticker', label: 'STONKS', icon: '⭐', stickerId: 'sticker_lab' },
      { id: 'c1_coin3', atDistance: 188, kind: 'coin', label: '+10', icon: '🪙', altitude: 'low' },
      { id: 'c1_ghost2', atDistance: 204, kind: 'ghost_spooky', label: 'POP 👻', icon: '👻', bubble: 'STACK FULL!' },
      { id: 'c1_books2', atDistance: 226, kind: 'jump_obstacle', label: 'SIKE 🍌', icon: '🍌' },
      { id: 'c1_zombie2', atDistance: 250, kind: 'duck_zombie', label: 'PROF Z', icon: '🧟', bubble: 'O(1) POP!' },
    ],
  },

  library: {
    id: 'library',
    levelNumber: 2,
    title: 'LIBRARY',
    backgroundImage: '/src/assets/images/bmsit_library_scene_1794745614414.jpg',
    floorColor: '#1b1638',
    accentColor: '#38bdf8',
    levelLength: 290,
    baseSpeed: 12.0,
    puzzleId: 'dsa_queue',
    clueTitle: '🚶 QUEUE',
    entities: [
      { id: 'l1_magnet', atDistance: 20, kind: 'powerup', label: 'MAGNET', icon: '🧲', powerUp: 'magnet', altitude: 'mid' },
      { id: 'l1_ladder1', atDistance: 40, kind: 'jump_obstacle', label: 'FIFO', icon: '🪜' },
      { id: 'l1_spring1', atDistance: 58, kind: 'spring_pad', label: 'BOING', icon: '🔼' },
      { id: 'l1_coin1', atDistance: 64, kind: 'coin', label: '+10', icon: '🪙', altitude: 'high' },
      { id: 'l1_fuse', atDistance: 72, kind: 'collectible_item', label: 'FUSE', icon: '⚡', itemId: 'fuse', altitude: 'high' },
      { id: 'l1_ghost1', atDistance: 96, kind: 'ghost_spooky', label: 'SHHH 👻', icon: '👻', bubble: 'WAIT IN LINE' },
      { id: 'l1_slowmo', atDistance: 114, kind: 'powerup', label: 'SLOW-MO', icon: '⏱️', powerUp: 'slowmo', altitude: 'mid' },
      { id: 'l1_shhh1', atDistance: 132, kind: 'duck_zombie', label: 'LIB Z', icon: '🤫', bubble: 'NODE → NULL' },
      { id: 'l1_crate1', atDistance: 156, kind: 'smash_crate', label: 'BOX', icon: '📦' },
      { id: 'l1_mystery', atDistance: 174, kind: 'mystery_box', label: 'DROP', icon: '❓', altitude: 'high' },
      { id: 'l1_sticker', atDistance: 192, kind: 'collectible_sticker', label: 'HEAD W', icon: '⭐', stickerId: 'sticker_library' },
      { id: 'l1_ghost2', atDistance: 214, kind: 'ghost_spooky', label: 'WIFI 0%', icon: '👻', bubble: 'DEQUEUE!' },
      { id: 'l1_card_a', atDistance: 234, kind: 'collectible_item', label: 'ARRAY', icon: '🪪', itemId: 'card_fragment_a' },
      { id: 'l1_heal', atDistance: 250, kind: 'powerup', label: '+1 HP', icon: '❤️', powerUp: 'heal', altitude: 'mid' },
      { id: 'l1_shhh2', atDistance: 268, kind: 'duck_zombie', label: 'FINE ₹999', icon: '💸', bubble: 'NO LINE JUMP!' },
    ],
  },

  canteen: {
    id: 'canteen',
    levelNumber: 3,
    title: 'CANTEEN',
    backgroundImage: '/src/assets/images/bmsit_canteen_scene_1794745616883.jpg',
    floorColor: '#0f2b30',
    accentColor: '#fb923c',
    levelLength: 305,
    baseSpeed: 12.6,
    puzzleId: 'dsa_sort',
    clueTitle: '🔍 SORT',
    entities: [
      { id: 'k1_chai2x', atDistance: 20, kind: 'powerup', label: '2X PTS', icon: '☕', powerUp: 'chai_2x', altitude: 'mid' },
      { id: 'k1_juice1', atDistance: 40, kind: 'jump_obstacle', label: 'BUBBLE', icon: '🧃' },
      { id: 'k1_tray', atDistance: 62, kind: 'collectible_item', label: 'DOSA W', icon: '🍽️', itemId: 'plastic_tray' },
      { id: 'k1_ghost1', atDistance: 86, kind: 'ghost_spooky', label: 'CHILLI 👻', icon: '👻', bubble: 'O(N) SCAN' },
      { id: 'k1_spring1', atDistance: 102, kind: 'spring_pad', label: 'BOING', icon: '🔼' },
      { id: 'k1_coin1', atDistance: 108, kind: 'coin', label: '+10', icon: '🪙', altitude: 'high' },
      { id: 'k1_coin2', atDistance: 114, kind: 'coin', label: '+10', icon: '🪙', altitude: 'high' },
      { id: 'k1_chef1', atDistance: 132, kind: 'duck_zombie', label: 'PAN 🍳', icon: '🍳', bubble: 'SORT FAST!' },
      { id: 'k1_crate1', atDistance: 158, kind: 'smash_crate', label: 'BUG 📦', icon: '🛒' },
      { id: 'k1_slowmo', atDistance: 174, kind: 'powerup', label: 'SLOW-MO', icon: '⏱️', powerUp: 'slowmo', altitude: 'mid' },
      { id: 'k1_sticker', atDistance: 192, kind: 'collectible_sticker', label: 'CHAI OP', icon: '⭐', stickerId: 'sticker_dosa' },
      { id: 'k1_ghost2', atDistance: 214, kind: 'ghost_spooky', label: 'LOOP 👻', icon: '👻', bubble: 'FIND MIN!' },
      { id: 'k1_mystery', atDistance: 230, kind: 'mystery_box', label: 'DROP', icon: '❓', altitude: 'low' },
      { id: 'k1_card_b', atDistance: 244, kind: 'collectible_item', label: 'TREE', icon: '💳', itemId: 'card_fragment_b' },
      { id: 'k1_juice2', atDistance: 266, kind: 'jump_obstacle', label: 'SWAP 🌶️', icon: '🌶️' },
      { id: 'k1_chef2', atDistance: 286, kind: 'duck_zombie', label: 'CHEF 💀', icon: '👨‍🍳', bubble: 'BINARY SEARCH!' },
    ],
  },

  gate: {
    id: 'gate',
    levelNumber: 4,
    title: 'MAIN GATE',
    backgroundImage: '/src/assets/images/bmsit_gate_scene_1794745614982.jpg',
    floorColor: '#0e192e',
    accentColor: '#34d399',
    levelLength: 325,
    baseSpeed: 13.2,
    puzzleId: 'dsa_boss',
    clueTitle: '🌳 DSA BOSS',
    entities: [
      { id: 'g1_shield', atDistance: 20, kind: 'powerup', label: 'SHIELD', icon: '🛡️', powerUp: 'shield', altitude: 'mid' },
      { id: 'g1_cone1', atDistance: 42, kind: 'jump_obstacle', label: 'NODE', icon: '🚧' },
      { id: 'g1_ghost1', atDistance: 68, kind: 'ghost_spooky', label: '4K CAM 👻', icon: '👻', bubble: 'GRAPH EDGE' },
      { id: 'g1_magnet', atDistance: 88, kind: 'powerup', label: 'MAGNET', icon: '🧲', powerUp: 'magnet', altitude: 'high' },
      { id: 'g1_spring1', atDistance: 102, kind: 'spring_pad', label: 'BOING', icon: '🔼' },
      { id: 'g1_coin1', atDistance: 108, kind: 'coin', label: '+10', icon: '🪙', altitude: 'high' },
      { id: 'g1_guard1', atDistance: 126, kind: 'duck_zombie', label: 'ROOT!', icon: '🧟‍♂️', bubble: 'BFS / DFS!' },
      { id: 'g1_crate1', atDistance: 152, kind: 'smash_crate', label: 'HEAP', icon: '📦' },
      { id: 'g1_mystery', atDistance: 168, kind: 'mystery_box', label: 'DROP', icon: '❓', altitude: 'mid' },
      { id: 'g1_slowmo', atDistance: 184, kind: 'powerup', label: 'SLOW-MO', icon: '⏱️', powerUp: 'slowmo', altitude: 'mid' },
      { id: 'g1_ghost2', atDistance: 202, kind: 'ghost_spooky', label: 'SIREN 👻', icon: '👻', bubble: 'LEAF NODE' },
      { id: 'g1_barrier1', atDistance: 226, kind: 'jump_obstacle', label: 'PATH', icon: '⛓️' },
      { id: 'g1_heal', atDistance: 244, kind: 'powerup', label: '+1 HP', icon: '❤️', powerUp: 'heal', altitude: 'mid' },
      { id: 'g1_boss', atDistance: 278, kind: 'boss_ghost', label: '404 BOSS', icon: '👻', bubble: 'ZAP x2 OR 💨!' },
      { id: 'g1_cone2', atDistance: 304, kind: 'jump_obstacle', label: 'EXIT HOP', icon: '🚧' },
    ],
  },
};

/* Stage 1: Super Simple Array & Stack Basics */
export const DSA_STAGE1_QUESTIONS: DsaChoiceQuestion[] = [
  {
    id: 'arr_idx0',
    badge: 'ARRAY · INDEX 0',
    visualData: 'arr = [ 10, 20, 30 ]',
    promptLabel: 'WHAT IS arr[0] ?',
    options: [
      { id: '10', label: '10' },
      { id: '20', label: '20' },
      { id: '30', label: '30' },
      { id: '0', label: '0' },
    ],
    answerId: '10',
  },
  {
    id: 'stack_pop',
    badge: 'STACK · POP',
    visualData: 'STACK TOP → [ 9, 5, 2 ]',
    promptLabel: 'POP() REMOVES TOP?',
    options: [
      { id: '9', label: '9' },
      { id: '5', label: '5' },
      { id: '2', label: '2' },
      { id: 'all', label: 'ALL' },
    ],
    answerId: '9',
  },
  {
    id: 'stack_rule',
    badge: 'STACK · RULE',
    visualData: '🥞 STACK OF PLATES',
    promptLabel: 'STACK FOLLOWS?',
    options: [
      { id: 'lifo', label: 'LIFO (LAST IN FIRST OUT)' },
      { id: 'fifo', label: 'FIFO (FIRST IN FIRST OUT)' },
      { id: 'rand', label: 'RANDOM' },
      { id: 'none', label: 'SORTED' },
    ],
    answerId: 'lifo',
  },
  {
    id: 'arr_len',
    badge: 'ARRAY · SIZE',
    visualData: '[ 🍎, 🍌, 🍇, 🥭 ]',
    promptLabel: 'LENGTH OF ARRAY?',
    options: [
      { id: '4', label: '4' },
      { id: '3', label: '3' },
      { id: '5', label: '5' },
      { id: '1', label: '1' },
    ],
    answerId: '4',
  },
];

/* Stage 2: Super Simple Queue & Linked List Basics */
export const DSA_STAGE2_QUESTIONS: DsaChoiceQuestion[] = [
  {
    id: 'queue_rule',
    badge: 'QUEUE · LINE',
    visualData: 'FRONT → 🧍 🧍‍♀️ 🧟 ← BACK',
    promptLabel: 'QUEUE FOLLOWS?',
    options: [
      { id: 'fifo', label: 'FIFO (FIRST IN FIRST OUT)' },
      { id: 'lifo', label: 'LIFO (LAST IN FIRST OUT)' },
      { id: 'loop', label: 'LOOP' },
      { id: 'tree', label: 'TREE' },
    ],
    answerId: 'fifo',
  },
  {
    id: 'queue_front',
    badge: 'QUEUE · EXIT',
    visualData: 'FRONT [ 10, 20, 30 ] BACK',
    promptLabel: 'WHO LEAVES FIRST?',
    options: [
      { id: '10', label: '10' },
      { id: '20', label: '20' },
      { id: '30', label: '30' },
      { id: 'none', label: 'NONE' },
    ],
    answerId: '10',
  },
  {
    id: 'll_head',
    badge: 'LINKED LIST · HEAD',
    visualData: '[ 7 ] → [ 4 ] → [ 2 ] → NULL',
    promptLabel: 'FIRST NODE (HEAD)?',
    options: [
      { id: '7', label: '7' },
      { id: '4', label: '4' },
      { id: '2', label: '2' },
      { id: 'null', label: 'NULL' },
    ],
    answerId: '7',
  },
  {
    id: 'll_end',
    badge: 'LINKED LIST · END',
    visualData: '[ 5 ] → [ 8 ] → ____',
    promptLabel: 'LAST NODE POINTS TO?',
    options: [
      { id: 'null', label: 'NULL' },
      { id: '5', label: '5' },
      { id: '0', label: '0' },
      { id: '8', label: '8' },
    ],
    answerId: 'null',
  },
];

/* Stage 3: Super Simple Searching & Sorting */
export const DSA_STAGE3_QUESTIONS: DsaChoiceQuestion[] = [
  {
    id: 'find_max',
    badge: 'SEARCH · MAX',
    visualData: '[ 4, 9, 2, 7 ]',
    promptLabel: 'BIGGEST NUMBER?',
    options: [
      { id: '9', label: '9' },
      { id: '4', label: '4' },
      { id: '2', label: '2' },
      { id: '7', label: '7' },
    ],
    answerId: '9',
  },
  {
    id: 'find_min',
    badge: 'SEARCH · MIN',
    visualData: '[ 8, 3, 6, 5 ]',
    promptLabel: 'SMALLEST NUMBER?',
    options: [
      { id: '3', label: '3' },
      { id: '8', label: '8' },
      { id: '6', label: '6' },
      { id: '5', label: '5' },
    ],
    answerId: '3',
  },
  {
    id: 'bsearch_req',
    badge: 'BINARY SEARCH',
    visualData: '[ 1, 3, 5, 7, 9 ]',
    promptLabel: 'BINARY SEARCH NEEDS?',
    options: [
      { id: 'sorted', label: 'SORTED ARRAY' },
      { id: 'empty', label: 'EMPTY ARRAY' },
      { id: 'random', label: 'RANDOM ORDER' },
      { id: 'neg', label: 'ONLY NEGATIVES' },
    ],
    answerId: 'sorted',
  },
  {
    id: 'linear_idx',
    badge: 'LINEAR SEARCH',
    visualData: '[ 10, 25, 40 ]',
    promptLabel: 'INDEX OF 25?',
    options: [
      { id: '1', label: '1' },
      { id: '0', label: '0' },
      { id: '2', label: '2' },
      { id: '3', label: '3' },
    ],
    answerId: '1',
  },
];

/* Stage 4: Super Simple 2-Step DSA Boss (Easy Math/Tree + Sort 3 Numbers!) */
export const DSA_BOSS_QUESTIONS: DsaBossQuestion[] = [
  {
    id: 'boss_sum',
    promptCode: 'SUM OF [ 10, 20, 30 ] = ?',
    answerDigits: '60',
    hintChip: '60',
    sortNumbers: [2, 5, 9],
  },
  {
    id: 'boss_max',
    promptCode: 'MAX OF [ 15, 45, 25 ] = ?',
    answerDigits: '45',
    hintChip: '45',
    sortNumbers: [1, 4, 8],
  },
  {
    id: 'boss_min',
    promptCode: 'MIN OF [ 99, 12, 50 ] = ?',
    answerDigits: '12',
    hintChip: '12',
    sortNumbers: [3, 6, 7],
  },
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getHumorRank(score: number): {
  title: string;
  blurb: string;
} {
  if (score >= 1100) {
    return {
      title: 'O(1) GIGACHAD 🗿',
      blurb: 'ZERO TLE · ZERO SKILL ISSUE',
    };
  }
  if (score >= 700) {
    return {
      title: 'BINARY BOSS 🦉',
      blurb: 'PASSED ALL TEST CASES',
    };
  }
  if (score >= 380) {
    return {
      title: 'ARRAY SURVIVOR 😅',
      blurb: 'ACCEPTED ON 1ST SUBMIT',
    };
  }
  return {
    title: 'INDEX 0 NOOB 💀',
    blurb: 'BRUTE FORCE SAVED YOU',
  };
}
