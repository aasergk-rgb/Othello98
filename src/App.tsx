import { useCallback, useEffect, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Home } from './screens/Home';
import { Game, LEVEL_LABEL } from './screens/Game';
import { SettingsScreen } from './screens/Settings';
import { HowTo, Records } from './screens/Info';
import { Taskbar } from './ui/parts';
import { GameState, Mode, newGame, outcome } from './game/game';
import { BLACK, WHITE, Player } from './game/rules';
import {
  Settings, Stats, clearSavedGame, loadSavedGame, loadSettings, loadStats, saveGame, saveSettings, saveStats,
} from './storage';

type Screen = 'home' | 'game' | 'settings' | 'howto' | 'records';

const BASE_W = 390;
const MIN_H = 740;

function useScale() {
  const calc = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = Math.min(w / BASE_W, h / MIN_H);
    return { s, h: h / s };
  };
  const [v, setV] = useState(calc);
  useEffect(() => {
    const f = () => setV(calc());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return v;
}

function pickSide(s: Settings): Player {
  return s.side === 'black' ? BLACK : s.side === 'white' ? WHITE : Math.random() < 0.5 ? BLACK : WHITE;
}

export function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [saved, setSaved] = useState<GameState | null>(loadSavedGame);
  const [game, setGameRaw] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [back, setBack] = useState<Screen>('home');
  const recorded = useRef<number | null>(null);
  const { s, h } = useScale();

  const setGame = useCallback((f: (g: GameState) => GameState) => setGameRaw((g) => (g ? f(g) : g)), []);

  const go = (to: Screen) => { setBack(screen); setScreen(to); };
  const goBack = () => setScreen(back === 'game' && !game ? 'home' : back);

  const updateSettings = (next: Settings) => { setSettings(next); saveSettings(next); };

  const start = (mode: Mode) => {
    setGameRaw(newGame(mode, settings.level, pickSide(settings)));
    setScreen('game');
  };
  const again = () => game && start(game.mode);

  // 自動保存／終局時の成績記録
  useEffect(() => {
    if (!game) return;
    if (game.over) {
      clearSavedGame();
      setSaved(null);
      if (game.mode === 'cpu' && recorded.current !== game.id) {
        recorded.current = game.id;
        const w = outcome(game).winner;
        setStats((st) => {
          const next = w === null ? { ...st, draw: st.draw + 1 } : w === game.human ? { ...st, win: st.win + 1 } : { ...st, lose: st.lose + 1 };
          saveStats(next);
          return next;
        });
      }
    } else {
      saveGame(game);
      setSaved(game);
    }
  }, [game]);

  // Android の戻るボタン
  const stateRef = useRef({ screen, back });
  stateRef.current = { screen, back };
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#008080' }).catch(() => {});
    const sub = CapApp.addListener('backButton', () => {
      const { screen: sc, back: bk } = stateRef.current;
      if (sc === 'home') CapApp.exitApp();
      else setScreen(sc === 'game' ? 'home' : bk);
    });
    return () => { sub.then((x) => x.remove()); };
  }, []);

  const continueGame = () => { if (saved) { setGameRaw(saved); setScreen('game'); } };

  const titles: Record<Screen, string> = {
    home: 'リバーシへようこそ',
    game: game ? (game.over ? '対局結果' : game.mode === 'cpu' ? `リバーシ - CPU対戦` : 'リバーシ - 2人対戦') : '',
    settings: 'リバーシのプロパティ',
    howto: 'あそびかた',
    records: '対戦成績',
  };

  return (
    <div className="stage" style={{ zoom: s, height: h }}>
      {screen === 'home' && (
        <Home level={settings.level} setLevel={(level) => updateSettings({ ...settings, level })} stats={stats} saved={saved}
          onSolo={() => start('cpu')} onTwo={() => start('two')} onContinue={continueGame}
          onRecords={() => go('records')} onHowto={() => go('howto')} onSettings={() => go('settings')} />
      )}
      {screen === 'game' && game && (
        <Game game={game} setGame={setGame} settings={settings} onHome={() => setScreen('home')}
          onSettings={() => go('settings')} onAgain={again} onHowto={() => go('howto')} />
      )}
      {screen === 'settings' && <SettingsScreen settings={settings} onSave={updateSettings} onClose={goBack} />}
      {screen === 'howto' && <HowTo onClose={goBack} />}
      {screen === 'records' && (
        <Records stats={stats} onClose={goBack} onReset={() => { const z = { win: 0, lose: 0, draw: 0 }; setStats(z); saveStats(z); }} />
      )}
      <Taskbar title={titles[screen]} onMenu={() => setScreen('home')} />
    </div>
  );
}
export { LEVEL_LABEL };
