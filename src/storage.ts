import type { Level } from './game/ai';
import type { GameState } from './game/game';

export type SideChoice = 'black' | 'white' | 'random';

export interface Settings {
  level: Level;
  side: SideChoice;
  showHints: boolean;
  showLast: boolean;
  allowUndo: boolean;
  boardColor: string;
}

export interface Stats { win: number; lose: number; draw: number }

export const BOARD_COLORS: { value: string; label: string }[] = [
  { value: '#008000', label: 'みどり' },
  { value: '#008080', label: 'あおみどり' },
  { value: '#808000', label: 'オリーブ' },
  { value: '#800080', label: 'むらさき' },
];

export const DEFAULT_SETTINGS: Settings = {
  level: 'normal',
  side: 'black',
  showHints: true,
  showLast: true,
  allowUndo: true,
  boardColor: '#008000',
};

const K = { settings: 'reversi.settings', stats: 'reversi.stats', save: 'reversi.save' };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* 保存できなくても続行 */ }
}

export const loadSettings = () => read<Settings>(K.settings, DEFAULT_SETTINGS);
export const saveSettings = (s: Settings) => write(K.settings, s);
export const loadStats = () => read<Stats>(K.stats, { win: 0, lose: 0, draw: 0 });
export const saveStats = (s: Stats) => write(K.stats, s);

export function loadSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(K.save);
    if (!raw) return null;
    const g = JSON.parse(raw) as GameState;
    return g && Array.isArray(g.board) && g.board.length === 64 && !g.over ? g : null;
  } catch {
    return null;
  }
}
export const saveGame = (g: GameState) => write(K.save, g);
export function clearSavedGame() {
  try { localStorage.removeItem(K.save); } catch { /* noop */ }
}
