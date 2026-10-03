import { Board as BoardT, BLACK, WHITE, cellLabel } from '../game/rules';
import { Disc } from './parts';

export function Board({ board, color, last, legal, best, onCell, disabled }: {
  board: BoardT; color: string; last: number | null; legal: Set<number>; best: number | null;
  onCell?: (idx: number) => void; disabled?: boolean;
}) {
  return (
    <div className="board-frame">
      <div className="board">
        {board.map((v, i) => {
          const state = v === BLACK ? '黒' : v === WHITE ? '白' : legal.has(i) ? '置けます' : '空き';
          return (
            <button key={i} className="cell" style={{ background: color }} aria-label={`${cellLabel(i)} ${state}`}
              disabled={disabled || !onCell} onClick={() => onCell?.(i)}>
              {v === BLACK && <Disc color="black">{last === i && <span className="last-mark" />}</Disc>}
              {v === WHITE && <Disc color="white">{last === i && <span className="last-mark" />}</Disc>}
              {v === 0 && legal.has(i) && <span className="hint-dot" />}
              {v === 0 && best === i && <span className="best-mark" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
