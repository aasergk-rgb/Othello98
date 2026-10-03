import { AppIcon, Button, GroupBox, Radio, StatusBar, TitleBar, Window, Disc } from '../ui/parts';
import type { Level } from '../game/ai';
import type { Stats } from '../storage';
import { GameState, moveNo } from '../game/game';

const Icon = ({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) => (
  <button className="home-icon" onClick={onClick}>{children}<span>{label}</span></button>
);

export function Home({ level, setLevel, stats, saved, onSolo, onTwo, onContinue, onRecords, onHowto, onSettings }: {
  level: Level; setLevel: (l: Level) => void; stats: Stats; saved: GameState | null;
  onSolo: () => void; onTwo: () => void; onContinue: () => void;
  onRecords: () => void; onHowto: () => void; onSettings: () => void;
}) {
  const savedText = saved
    ? `${moveNo(saved)}手目・${saved.mode === 'two' ? (saved.turn === 1 ? '黒' : '白') + 'の番' : saved.turn === saved.human ? 'あなたの番' : 'CPUの番'}`
    : '';
  return (
    <>
      <nav aria-label="デスクトップ" className="home-icons">
        <Icon label="対戦成績" onClick={onRecords}>
          <svg width="40" height="40" viewBox="0 0 20 20"><path d="M3.5 1.5h10l3 3v14h-13z" fill="#fff" stroke="#000" /><rect x="6" y="11" width="2" height="5" fill="#000080" /><rect x="9" y="8" width="2" height="8" fill="#008000" /><rect x="12" y="13" width="2" height="3" fill="#800000" /></svg>
        </Icon>
        <Icon label="あそびかた" onClick={onHowto}>
          <svg width="40" height="40" viewBox="0 0 20 20"><rect x="3.5" y="2.5" width="13" height="15" fill="#ffd400" stroke="#000" /><rect x="3.5" y="2.5" width="3" height="15" fill="#808000" stroke="#000" /><rect x="9" y="6" width="5" height="1" fill="#000" /><rect x="13" y="7" width="1" height="3" fill="#000" /><rect x="11" y="10" width="2" height="1" fill="#000" /><rect x="11" y="11" width="1" height="2" fill="#000" /><rect x="11" y="14" width="1" height="1" fill="#000" /><rect x="9" y="7" width="1" height="1" fill="#000" /></svg>
        </Icon>
        <Icon label="設定" onClick={onSettings}>
          <svg width="40" height="40" viewBox="0 0 20 20"><rect x="2.5" y="3.5" width="15" height="13" fill="#c0c0c0" stroke="#000" /><rect x="6" y="6" width="1" height="8" fill="#000" /><rect x="5" y="7" width="3" height="2" fill="#000080" /><rect x="10" y="6" width="1" height="8" fill="#000" /><rect x="9" y="11" width="3" height="2" fill="#000080" /><rect x="14" y="6" width="1" height="8" fill="#000" /><rect x="13" y="9" width="3" height="2" fill="#000080" /></svg>
        </Icon>
      </nav>

      <Window style={{ margin: '16px 12px 0' }}>
        <TitleBar title="リバーシへようこそ" onClose={undefined}
          extra={<button className="btn" aria-label="ヘルプ" onClick={onHowto} style={{ fontSize: 18 }}>?</button>} />

        <div className="sunken" style={{ margin: '8px 8px 0', padding: 2 }}>
          <div style={{ height: 140, background: '#008000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <div style={{ width: 81, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 1, background: '#000', border: '1px solid #000' }}>
              {(['white', 'black', 'black', 'white'] as const).map((c, i) => (
                <div key={i} style={{ height: 40, background: '#008000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Disc color={c} size={30} /></div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 className="logo-title">リバーシ</h2>
              <div style={{ fontSize: 14, color: '#fff' }}>REVERSI for Mobile</div>
            </div>
          </div>
        </div>

        <div style={{ margin: '8px 8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button className="big-btn" isDefault onClick={onSolo}>
            <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#000" /><path d="M6 10a6.5 6.5 0 0 1 4-4" fill="none" stroke="#808080" strokeWidth="2" /></svg>
            <span>ひとりで遊ぶ</span><small>CPUと対戦</small>
          </Button>
          <Button className="big-btn" onClick={onTwo}>
            <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="8.5" cy="12" r="7" fill="#000" /><circle cx="15.5" cy="12" r="7" fill="#fff" stroke="#000" /></svg>
            <span>ふたりで遊ぶ</span><small>1台で交代</small>
          </Button>
          <Button className="big-btn" disabled={!saved} onClick={onContinue}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2.5 6.5h7l2 2h10v11h-19z" fill="#ffd400" stroke="#000" /></svg>
            <span>つづきから</span><small>{savedText}</small>
          </Button>
        </div>

        <GroupBox legend="CPUのつよさ" style={{ margin: '18px 8px 0', paddingBottom: 4 }}>
          <Radio name="level" value="easy" current={level} label="よわい" onChange={setLevel} />
          <Radio name="level" value="normal" current={level} label="ふつう" onChange={setLevel} />
          <Radio name="level" value="hard" current={level} label="つよい" onChange={setLevel} />
        </GroupBox>

        <div style={{ marginTop: 10 }}>
          <StatusBar cells={[`通算 ${stats.win}勝 ${stats.lose}敗 ${stats.draw}分`, 'Ver 1.0']} />
        </div>
      </Window>
    </>
  );
}
export { AppIcon };
