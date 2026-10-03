import { Button, GroupBox, TitleBar, Window } from '../ui/parts';
import type { Stats } from '../storage';

export function HowTo({ onClose }: { onClose: () => void }) {
  return (
    <Window style={{ margin: '0 8px' }}>
      <TitleBar title="あそびかた" onClose={onClose} />
      <div className="field doc scroll" style={{ margin: '8px 8px 0', padding: 12, height: 480 }}>
        <h2>ルール</h2>
        <p>8×8の盤で、黒と白が交互に石を置きます。黒が先手です。</p>
        <p>相手の石を自分の石ではさめる場所にだけ置けます。はさんだ石はすべて自分の色にひっくり返ります。</p>
        <p>置ける場所がないときは「パス」します。両者とも置けなくなったら終了で、石の多いほうの勝ちです。</p>
        <h2>ボタン</h2>
        <p>待った：ひとつ前の自分の手まで戻します。CPU対戦ではCPUの手も戻ります。</p>
        <p>パス：置ける場所がないときだけ押せます。</p>
        <p>ヒント：おすすめの1手を黄色い輪で示します。</p>
        <p>投了：その場で負けとして対局を終えます。</p>
        <h2>つづきから</h2>
        <p>対局は自動で保存されます。ホーム画面の「つづきから」で再開できます。</p>
      </div>
      <div style={{ margin: '10px 8px 6px', display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        <Button isDefault onClick={onClose}>OK</Button>
      </div>
    </Window>
  );
}

export function Records({ stats, onReset, onClose }: { stats: Stats; onReset: () => void; onClose: () => void }) {
  const total = stats.win + stats.lose + stats.draw;
  const rate = total ? Math.round((stats.win / total) * 100) : 0;
  return (
    <Window style={{ margin: '0 8px' }}>
      <TitleBar title="対戦成績" onClose={onClose} />
      <div style={{ padding: '20px 12px 8px' }}>
        <GroupBox legend="CPU対戦の通算成績" column>
          <div className="field row-list" style={{ padding: 2, margin: '4px 0 10px' }}>
            <div><span style={{ flex: 1 }}>勝ち</span><span>{stats.win}</span></div>
            <div><span style={{ flex: 1 }}>負け</span><span>{stats.lose}</span></div>
            <div><span style={{ flex: 1 }}>引き分け</span><span>{stats.draw}</span></div>
            <div className="sel"><span style={{ flex: 1 }}>勝率</span><span>{rate}%</span></div>
          </div>
        </GroupBox>
      </div>
      <div style={{ margin: '10px 8px 6px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
        <Button isDefault onClick={onClose}>OK</Button>
        <Button disabled={!total} onClick={() => { if (window.confirm('通算成績を消去しますか？')) onReset(); }}>消去</Button>
      </div>
    </Window>
  );
}
