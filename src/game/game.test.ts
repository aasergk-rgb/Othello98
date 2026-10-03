import { describe, expect, it } from 'vitest';
import { initialBoard, legalMoves, BLACK, WHITE, applyMove, countStones } from './rules';
import { newGame, play, pass, undo, canUndo, outcome } from './game';
import { chooseMove } from './ai';

describe('rules', () => {
  it('黒の初手は4通り', () => {
    expect(legalMoves(initialBoard(), BLACK).sort()).toEqual([19, 26, 37, 44]);
  });
  it('置くと石が裏返る', () => {
    const b = applyMove(initialBoard(), 19, BLACK);
    expect(countStones(b)).toEqual({ black: 4, white: 1 });
  });
});

describe('game', () => {
  it('2人対戦で undo できる', () => {
    let g = newGame('two', 'normal', BLACK);
    g = play(g, 19);
    expect(g.turn).toBe(WHITE);
    expect(canUndo(g)).toBe(true);
    g = undo(g);
    expect(g.turn).toBe(BLACK);
    expect(countStones(g.board)).toEqual({ black: 2, white: 2 });
  });
  it('パスは打てるときは無効', () => {
    const g = newGame('two', 'normal', BLACK);
    expect(pass(g)).toBe(g);
  });
  it.each(['easy', 'normal', 'hard'] as const)('%s のCPU同士で最後まで終局する', (lv) => {
    let g = newGame('two', lv, BLACK);
    for (let i = 0; i < 200 && !g.over; i++) g = play(g, chooseMove(g.board, g.turn, lv));
    expect(g.over).toBe(true);
    const o = outcome(g);
    expect(o.black + o.white).toBeLessThanOrEqual(64);
  });
});
