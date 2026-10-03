import { applyMove, countStones, initialBoard, legalMoves, opponent, Board, Player, BLACK, WHITE } from './rules';
import type { Level } from './ai';

export type Mode = 'cpu' | 'two';

export interface Snap {
  board: Board;
  turn: Player;
  last: number | null;
  passed: Player | null;
}

export interface GameState extends Snap {
  id: number;
  mode: Mode;
  level: Level;
  human: Player; // cpu モードでの人間側。two モードでは未使用
  history: Snap[]; // 着手前の状態
  over: boolean;
  resigned: Player | null;
}

export function newGame(mode: Mode, level: Level, human: Player): GameState {
  return {
    id: Date.now(),
    mode, level, human,
    board: initialBoard(),
    turn: BLACK,
    last: null,
    passed: null,
    history: [],
    over: false,
    resigned: null,
  };
}

export const isCpuTurn = (g: GameState) => g.mode === 'cpu' && !g.over && g.turn !== g.human;

/** 次の手番を決める。相手が打てなければ同じ人が続け、双方打てなければ終局。 */
function advance(g: GameState, board: Board, mover: Player, last: number | null, history: Snap[]): GameState {
  const opp = opponent(mover);
  if (legalMoves(board, opp).length) return { ...g, board, turn: opp, last, passed: null, history };
  if (legalMoves(board, mover).length) return { ...g, board, turn: mover, last, passed: opp, history };
  return { ...g, board, turn: opp, last, passed: null, history, over: true };
}

const snapOf = (g: GameState): Snap => ({ board: g.board, turn: g.turn, last: g.last, passed: g.passed });

export function play(g: GameState, idx: number): GameState {
  if (g.over) return g;
  if (!legalMoves(g.board, g.turn).includes(idx)) return g;
  const board = applyMove(g.board, idx, g.turn);
  return advance(g, board, g.turn, idx, [...g.history, snapOf(g)]);
}

/** 置ける場所がないときの手動パス */
export function pass(g: GameState): GameState {
  if (g.over || legalMoves(g.board, g.turn).length) return g;
  return advance(g, g.board, opponent(g.turn), g.last, [...g.history, snapOf(g)]);
}

export function canUndo(g: GameState): boolean {
  if (g.over || !g.history.length) return false;
  if (g.mode === 'two') return true;
  return g.history.some((s) => s.turn === g.human);
}

export function undo(g: GameState): GameState {
  if (!canUndo(g)) return g;
  const history = g.history.slice();
  let snap = history.pop()!;
  if (g.mode === 'cpu') {
    while (snap.turn !== g.human && history.length) snap = history.pop()!;
    if (snap.turn !== g.human) return g;
  }
  return { ...g, ...snap, history, over: false, resigned: null };
}

export function resign(g: GameState, who: Player): GameState {
  return { ...g, over: true, resigned: who };
}

export type Outcome = { winner: Player | null; black: number; white: number; diff: number };

export function outcome(g: GameState): Outcome {
  const { black, white } = countStones(g.board);
  if (g.resigned) {
    return { winner: opponent(g.resigned), black, white, diff: Math.abs(black - white) };
  }
  const winner = black === white ? null : black > white ? BLACK : WHITE;
  return { winner, black, white, diff: Math.abs(black - white) };
}

export const moveNo = (g: GameState) => countStones(g.board).black + countStones(g.board).white - 3;
export const totalMoves = (g: GameState) => countStones(g.board).black + countStones(g.board).white - 4;
export { WHITE };
