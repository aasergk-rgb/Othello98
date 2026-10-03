import { useState } from 'react';
import { Button, Checkbox, GroupBox, Radio, TitleBar, Window } from '../ui/parts';
import { BOARD_COLORS, Settings } from '../storage';

type Tab = 'game' | 'view' | 'sound';

export function SettingsScreen({ settings, onSave, onClose }: { settings: Settings; onSave: (s: Settings) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(settings);
  const [tab, setTab] = useState<Tab>('game');
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const tabs: [Tab, string][] = [['game', 'ゲーム'], ['view', '表示'], ['sound', 'サウンド']];

  return (
    <Window style={{ margin: '0 8px' }}>
      <TitleBar title="リバーシのプロパティ" icon={false} onClose={onClose} />
      <div className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} aria-pressed={tab === k} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      <div style={{ margin: '0 8px', padding: '20px 12px 14px', background: 'var(--face)', boxShadow: 'var(--raised)', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 440 }}>
        {tab === 'game' && (
          <>
            <GroupBox legend="CPUのつよさ">
              <Radio name="level" value="easy" current={draft.level} label="よわい" onChange={(v) => set('level', v)} />
              <Radio name="level" value="normal" current={draft.level} label="ふつう" onChange={(v) => set('level', v)} />
              <Radio name="level" value="hard" current={draft.level} label="つよい" onChange={(v) => set('level', v)} />
            </GroupBox>
            <GroupBox legend="あなたの石">
              <Radio name="side" value="black" current={draft.side} label="黒・先手" onChange={(v) => set('side', v)} />
              <Radio name="side" value="white" current={draft.side} label="白・後手" onChange={(v) => set('side', v)} />
              <Radio name="side" value="random" current={draft.side} label="おまかせ" onChange={(v) => set('side', v)} />
            </GroupBox>
            <GroupBox legend="アシスト" column>
              <Checkbox checked={draft.showHints} label="置ける場所を表示する" onChange={(v) => set('showHints', v)} />
              <Checkbox checked={draft.showLast} label="直前の手に印をつける" onChange={(v) => set('showLast', v)} />
              <Checkbox checked={draft.allowUndo} label="「待った」を使えるようにする" onChange={(v) => set('allowUndo', v)} />
            </GroupBox>
            <GroupBox legend="盤の色" style={{ padding: '14px 10px 10px', gap: 12 }}>
              {BOARD_COLORS.map((c) => (
                <button key={c.value} className={`swatch${draft.boardColor === c.value ? ' sel' : ''}`} style={{ background: c.value }}
                  aria-label={c.label + (draft.boardColor === c.value ? '（選択中）' : '')} aria-pressed={draft.boardColor === c.value}
                  onClick={() => set('boardColor', c.value)} />
              ))}
            </GroupBox>
          </>
        )}
        {tab !== 'game' && (
          <div style={{ fontSize: 14, color: '#808080', textShadow: '1px 1px 0 #fff' }}>
            {tab === 'view' ? '表示の設定項目はまだありません。' : 'サウンドの設定項目はまだありません。'}
          </div>
        )}
      </div>
      <div style={{ margin: '10px 8px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        <Button isDefault onClick={() => { onSave(draft); onClose(); }}>OK</Button>
        <Button onClick={onClose}>キャンセル</Button>
        <Button disabled={!dirty} onClick={() => onSave(draft)}>適用(<span className="u">A</span>)</Button>
      </div>
    </Window>
  );
}
