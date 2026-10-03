import { useEffect, useMemo, useState } from 'react';
import { Board } from '../ui/Board';
import { Button, Disc, StatusBar, TitleBar, Window } from '../ui/parts';
import { chooseMove, hintMove, Level } from '../game/ai';
import { GameState, canUndo, isCpuTurn, moveNo, outcome, pass, play, resign, totalMoves, undo } from '../game/game';
import { BLACK, WHITE, countStones, legalMoves, Player } from '../game/rules';
import type { Settings } from '../storage';

export const LEVEL_LABEL: Record<Level, string> = { easy: 'よわい', normal: 'ふつう', hard: 'つよい' };
const colorName = (p: Player) => (p === BLACK ? '黒' : '白');

export function Game({ game, setGame, settings, onHome, onSettings, onAgain, onHowto }: {
  game: GameState; setGame: (f: (g: GameState) => GameState) => void; settings: Settings;
  onHome: () => void; onSettings: () => void; onAgain: () => void; onHowto: () => void;
}) {
  const [best, setBest] = useState<number | null>(null);
  const [menu, setMenu] = useState<'game' | 'help' | null>(null);
  const [confirmResign, setConfirmResign] = useState(false);
  const cpuTurn = isCpuTurn(game);

  // CPU の手番
  useEffect(() => {
    if (!cpuTurn) return;
    const id = setTimeout(() => {
      const m = chooseMove(game.board, game.turn, game.level);
      setGame((p) => (p.id === game.id && p.history.length === game.history.length && isCpuTurn(p) ? play(p, m) : p));
    }, 600);
    return () => clearTimeout(id);
  }, [game, cpuTurn, setGame]);

  useEffect(() => setBest(null), [game.history.length, game.id]);

  const legal = useMemo(() => legalMoves(game.board, game.turn), [game.board, game.turn]);
  const { black, white } = countStones(game.board);
  const pad = (n: number) => String(n).padStart(2, '0');
  const mine = game.mode === 'two' || game.turn === game.human;
  const showLegal = !game.over && mine && settings.showHints ? new Set(legal) : new Set<number>();
  const label = (p: Player) => (game.mode === 'cpu' ? (p === game.human ? 'あなた' : 'CPU') : colorName(p));

  const turnName = game.mode === 'cpu' ? (mine ? 'あなた' : 'CPU') : colorName(game.turn);
  let message: string;
  if (game.over) message = '対局が終了しました。';
  else if (!mine) message = 'CPUが考えています…';
  else if (!legal.length) message = `${turnName === 'あなた' ? 'あなた' : turnName}は置ける場所がありません。パスしてください。`;
  else message = `${game.mode === 'cpu' ? 'あなたの番です' : `${colorName(game.turn)}の番です`}。置ける場所は ${legal.length} か所`;
  if (!game.over && game.passed) message = `${label(game.passed)}はパスしました。${message}`;

  const o = outcome(game);
  const canPass = !game.over && mine && !legal.length;

  const doHint = () => setBest(mine && legal.length ? hintMove(game.board, game.turn) : null);
  const doResign = () => {
    setConfirmResign(false);
    setGame((g) => resign(g, g.mode === 'cpu' ? g.human : g.turn));
  };
  const act = (fn: () => void) => () => { setMenu(null); fn(); };

  const title = game.mode === 'cpu' ? 'リバーシ - CPU対戦' : 'リバーシ - 2人対戦';

  return (
    <>
      <Window>
        <TitleBar title={title} inactive={game.over} onMinimize={onHome} onClose={onHome}
          minimizeLabel="ホームに戻る" closeLabel="対局を閉じる" />

        <nav aria-label="メニューバー" className="menubar">
          <button className={menu === 'game' ? 'open' : ''} onClick={() => setMenu(menu === 'game' ? null : 'game')}>ゲーム(<span className="u">G</span>)</button>
          <button onClick={() => { setMenu(null); onSettings(); }}>設定(<span className="u">S</span>)</button>
          <button className={menu === 'help' ? 'open' : ''} onClick={() => setMenu(menu === 'help' ? null : 'help')}>ヘルプ(<span className="u">H</span>)</button>
          {menu && <div className="overlay" style={{ position: 'fixed' }} onClick={() => setMenu(null)} />}
          {menu === 'game' && (
            <div className="dropdown" style={{ left: 0, zIndex: 6 }}>
              <button onClick={act(onAgain)}>新しいゲーム</button>
              <button disabled={!settings.allowUndo || !canUndo(game) || cpuTurn} onClick={act(() => setGame(undo))}>待った</button>
              <hr />
              <button onClick={act(onHome)}>ホームへ戻る</button>
            </div>
          )}
          {menu === 'help' && (
            <div className="dropdown" style={{ left: 120, zIndex: 6 }}>
              <button onClick={act(onHowto)}>あそびかた</button>
              <button disabled>バージョン情報 Ver 1.0</button>
            </div>
          )}
        </nav>

        <div style={{ display: 'flex', gap: 8, padding: '4px 6px 8px' }}>
          {([BLACK, WHITE] as Player[]).map((p) => (
            <div key={p} className={`scorecard${!game.over && game.turn === p ? ' turn' : ''}`}>
              <Disc color={p === BLACK ? 'black' : 'white'} size={28} />
              <span className="name">{label(p)}</span>
              <span className="counter" aria-label={`${colorName(p)}の石数`}>{pad(p === BLACK ? black : white)}</span>
            </div>
          ))}
        </div>

        <div className="field" style={{ margin: '0 6px 8px', height: 32, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          {!game.over && <svg width="10" height="12" viewBox="0 0 10 12" style={{ flex: 'none' }}><path d="M0 0l10 6-10 6z" fill="#000080" /></svg>}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message}</span>
        </div>

        <Board board={game.board} color={settings.boardColor} last={settings.showLast ? game.last : null}
          legal={showLegal} best={game.over ? null : best} disabled={game.over || !mine}
          onCell={(i) => mine && !game.over && legal.includes(i) && setGame((g) => play(g, i))} />

        <div style={{ margin: '8px 6px 0', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 6 }}>
          <Button disabled={!settings.allowUndo || !canUndo(game) || cpuTurn} onClick={() => setGame(undo)}>待った</Button>
          <Button disabled={!canPass} onClick={() => setGame(pass)}>パス</Button>
          <Button disabled={game.over || !mine || !legal.length} onClick={doHint}>ヒント</Button>
          <Button disabled={game.over} onClick={() => setConfirmResign(true)}>投了</Button>
        </div>

        <div style={{ marginTop: 8 }}>
          <StatusBar cells={[
            game.over ? 'ゲーム終了' : `${colorName(game.turn)}の番`,
            game.over ? `全${totalMoves(game)}手` : `${moveNo(game)}手目`,
            game.mode === 'cpu' ? `CPU: ${LEVEL_LABEL[game.level]}` : '2人対戦',
          ]} />
        </div>
      </Window>

      {confirmResign && (
        <section className="dialog center" role="dialog" aria-label="投了の確認" style={{ zIndex: 5 }}>
          <TitleBar title="投了の確認" icon={false} onClose={() => setConfirmResign(false)} />
          <div style={{ padding: '16px 12px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>投了しますか？</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
              <Button isDefault onClick={doResign}>はい</Button>
              <Button onClick={() => setConfirmResign(false)}>いいえ</Button>
            </div>
          </div>
        </section>
      )}

      {game.over && (
        <section className="dialog center" aria-label="対局結果" style={{ zIndex: 5 }}>
          <TitleBar title="対局結果" icon={false} onClose={onHome} />
          <ResultBody game={game} black={o.black} white={o.white} diff={o.diff} winner={o.winner} onAgain={onAgain} onHome={onHome} />
        </section>
      )}
    </>
  );
}

function ResultBody({ game, black, white, diff, winner, onAgain, onHome }: {
  game: GameState; black: number; white: number; diff: number; winner: Player | null; onAgain: () => void; onHome: () => void;
}) {
  const cpu = game.mode === 'cpu';
  const resigned = game.resigned !== null;
  let head: string, sub: string;
  if (winner === null) { head = '引き分け'; sub = '同じ石数です。'; }
  else if (cpu) {
    const won = winner === game.human;
    head = won ? 'あなたの勝ち！' : 'あなたの負け…';
    sub = resigned ? (won ? 'CPUが投了しました。' : '投了しました。') : won ? `${diff}石差で勝利しました。` : `${diff}石差で敗れました。`;
  } else {
    head = `${colorName(winner)}の勝ち！`;
    sub = resigned ? `${colorName(winner === BLACK ? WHITE : BLACK)}が投了しました。` : `${diff}石差で勝利しました。`;
  }
  const rowName = (p: Player) => (cpu
    ? p === game.human ? `${colorName(p)}（あなた）` : `${colorName(p)}（CPU・${LEVEL_LABEL[game.level]}）`
    : colorName(p));
  const rows: [Player, number][] = [[BLACK, black], [WHITE, white]];
  return (
    <div style={{ padding: '16px 12px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {winner === null ? (
          <svg width="48" height="48" viewBox="0 0 20 20"><circle cx="7" cy="10" r="5" fill="#000" /><circle cx="13" cy="10" r="5" fill="#fff" stroke="#000" /></svg>
        ) : (
          <svg width="48" height="48" viewBox="0 0 20 20"><path d="M5.5 4.5h-3v2a3 3 0 0 0 3 3M14.5 4.5h3v2a3 3 0 0 1-3 3" fill="none" stroke="#000" /><path d="M5.5 2.5h9v5a4.5 4.5 0 0 1-9 0z" fill="#ffd400" stroke="#000" /><path d="M8.5 12v3.5h3V12" fill="#ffd400" stroke="#000" /><rect x="5.5" y="15.5" width="9" height="2" fill="#ffd400" stroke="#000" /></svg>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.1, fontWeight: 'normal' }}>{head}</h2>
          <div style={{ fontSize: 14 }}>{sub}</div>
        </div>
      </div>
      <div className="field row-list" style={{ padding: 2 }}>
        {rows.map(([p, n]) => (
          <div key={p} className={winner === p ? 'sel' : ''}>
            <Disc color={p === BLACK ? 'black' : 'white'} size={20} onNavy={winner === p} />
            <span style={{ flex: 1 }}>{rowName(p)}</span>
            <span>{n}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        <Button isDefault onClick={onAgain}>もう一度</Button>
        <Button onClick={onHome}>ホームへ</Button>
      </div>
    </div>
  );
}
