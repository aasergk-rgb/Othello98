import { applyMove, countStones, flipsFor, legalMoves, opponent, Board, Player } from './rules';

export type Level = 'easy' | 'normal' | 'hard';

// 位置評価（角が高く、角の隣が低い）
const W = [
  100, -20, 10, 5, 5, 10, -20, 100,
  -20, -50, -2, -2, -2, -2, -50, -20,
  10, -2, 1, 1, 1, 1, -2, 10,
  5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5,
  10, -2, 1, 1, 1, 1, -2, 10,
  -20, -50, -2, -2, -2, -2, -50, -20,
  100, -20, 10, 5, 5, 10, -20, 100,
];

const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];

function bestBy(moves: number[], score: (m: number) => number): number {
  let best = -Infinity;
  let ties: number[] = [];
  for (const m of moves) {
    const s = score(m);
    if (s > best) { best = s; ties = [m]; }
    else if (s === best) ties.push(m);
  }
  return pick(ties);
}

function evaluate(board: Board, me: Player): number {
  const opp = opponent(me);
  let pos = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i] === me) pos += W[i];
    else if (board[i] === opp) pos -= W[i];
  }
  const mob = legalMoves(board, me).length - legalMoves(board, opp).length;
  return pos + mob * 6;
}

function search(board: Board, turn: Player, me: Player, depth: number, alpha: number, beta: number, exact: boolean): number {
  const moves = legalMoves(board, turn);
  if (!moves.length) {
    const other = legalMoves(board, opponent(turn));
    if (!other.length) {
      const { black, white } = countStones(board);
      const diff = me === 1 ? black - white : white - black;
      return diff * 1000;
    }
    return search(board, opponent(turn), me, depth, alpha, beta, exact);
  }
  if (!exact && depth === 0) return evaluate(board, me);
  const maximizing = turn === me;
  let best = maximizing ? -Infinity : Infinity;
  for (const m of moves) {
    const v = search(applyMove(board, m, turn), opponent(turn), me, depth - 1, alpha, beta, exact);
    if (maximizing) { if (v > best) best = v; if (best > alpha) alpha = best; }
    else { if (v < best) best = v; if (best < beta) beta = best; }
    if (alpha >= beta) break;
  }
  return best;
}

export function chooseMove(board: Board, player: Player, level: Level): number {
  const moves = legalMoves(board, player);
  if (!moves.length) return -1;
  if (level === 'easy') return pick(moves);
  if (level === 'normal') {
    return bestBy(moves, (m) => flipsFor(board, m, player).length + W[m] * 2);
  }
  return strongMove(board, player, moves);
}

function strongMove(board: Board, player: Player, moves: number[]): number {
  const empties = board.filter((v) => v === 0).length;
  const exact = empties <= 8;
  const depth = 4;
  return bestBy(moves, (m) =>
    search(applyMove(board, m, player), opponent(player), player, depth - 1, -Infinity, Infinity, exact));
}

/** ヒント用：常に強い読みでおすすめの1手を返す */
export function hintMove(board: Board, player: Player): number {
  const moves = legalMoves(board, player);
  return moves.length ? strongMove(board, player, moves) : -1;
}
