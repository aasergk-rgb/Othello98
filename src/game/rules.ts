export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export type Player = 1 | 2;
export type Board = number[];

export const opponent = (p: Player): Player => (p === BLACK ? WHITE : BLACK);

export function initialBoard(): Board {
  const b = new Array<number>(64).fill(EMPTY);
  b[3 * 8 + 3] = WHITE;
  b[3 * 8 + 4] = BLACK;
  b[4 * 8 + 3] = BLACK;
  b[4 * 8 + 4] = WHITE;
  return b;
}

const DIRS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];

/** idx に player が置いたとき裏返る石の位置。置けなければ空配列。 */
export function flipsFor(board: Board, idx: number, player: Player): number[] {
  if (board[idx] !== EMPTY) return [];
  const r0 = idx >> 3;
  const c0 = idx & 7;
  const opp = opponent(player);
  const out: number[] = [];
  for (const [dr, dc] of DIRS) {
    let r = r0 + dr;
    let c = c0 + dc;
    const line: number[] = [];
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === opp) {
      line.push(r * 8 + c);
      r += dr;
      c += dc;
    }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === player) {
      out.push(...line);
    }
  }
  return out;
}

export function legalMoves(board: Board, player: Player): number[] {
  const out: number[] = [];
  for (let i = 0; i < 64; i++) if (flipsFor(board, i, player).length) out.push(i);
  return out;
}

export function applyMove(board: Board, idx: number, player: Player): Board {
  const flips = flipsFor(board, idx, player);
  const next = board.slice();
  next[idx] = player;
  for (const f of flips) next[f] = player;
  return next;
}

export function countStones(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (const v of board) {
    if (v === BLACK) black++;
    else if (v === WHITE) white++;
  }
  return { black, white };
}

export const cellLabel = (idx: number) => 'abcdefgh'[idx & 7] + ((idx >> 3) + 1);
