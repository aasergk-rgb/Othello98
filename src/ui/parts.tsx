import { ReactNode, useEffect, useState } from 'react';

export const AppIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
    <rect x="0.5" y="0.5" width="21" height="21" fill="#008000" stroke="#000" />
    <circle cx="6.5" cy="6.5" r="3.5" fill="#fff" />
    <circle cx="15.5" cy="6.5" r="3.5" fill="#000" />
    <circle cx="6.5" cy="15.5" r="3.5" fill="#000" />
    <circle cx="15.5" cy="15.5" r="3.5" fill="#fff" />
  </svg>
);

export const MinimizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="10" width="8" height="2" fill="#000" /></svg>
);
export const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="#000" strokeWidth="2" /></svg>
);

export function Disc({ color, size = 34, onNavy, children }: { color: 'black' | 'white'; size?: number; onNavy?: boolean; children?: ReactNode }) {
  return (
    <span className={`disc ${color}${onNavy ? ' on-navy' : ''}`} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </span>
  );
}

export function Window({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <main className="window" style={style}>{children}</main>;
}

export function TitleBar({ title, icon = true, inactive, onMinimize, onClose, minimizeLabel = '最小化', closeLabel = '閉じる', extra }: {
  title: ReactNode; icon?: boolean; inactive?: boolean; onMinimize?: () => void; onClose?: () => void;
  minimizeLabel?: string; closeLabel?: string; extra?: ReactNode;
}) {
  return (
    <div className={`titlebar${inactive ? ' inactive' : ''}`}>
      {icon && <AppIcon />}
      <h1 className="title">{title}</h1>
      {extra}
      {onMinimize && <button className="btn" aria-label={minimizeLabel} onClick={onMinimize}><MinimizeIcon /></button>}
      {onClose && <button className="btn" aria-label={closeLabel} onClick={onClose}><CloseIcon /></button>}
    </div>
  );
}

export function Button({ children, onClick, disabled, isDefault, className = '', ...rest }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; isDefault?: boolean; className?: string;
} & React.AriaAttributes) {
  return (
    <button className={`btn${isDefault ? ' default' : ''} ${className}`} onClick={onClick} disabled={disabled} {...rest}>{children}</button>
  );
}

export function GroupBox({ legend, children, column, style }: { legend: string; children: ReactNode; column?: boolean; style?: React.CSSProperties }) {
  return (
    <fieldset className={`group${column ? ' col' : ''}`} style={style}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

export function Radio<T extends string>({ name, value, current, label, onChange }: { name: string; value: T; current: T; label: string; onChange: (v: T) => void }) {
  return (
    <label className="opt">
      <input type="radio" className="radio" name={name} checked={current === value} onChange={() => onChange(value)} />
      {label}
    </label>
  );
}

export function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <label className="opt check">
      <span className="check-wrap">
        <input type="checkbox" className="check-box" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {checked && (
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10l3.5 3.5L15 6" fill="none" stroke="#000" strokeWidth="2.5" /></svg>
        )}
      </span>
      {label}
    </label>
  );
}

export function StatusBar({ cells }: { cells: ReactNode[] }) {
  return <div className="statusbar">{cells.map((c, i) => <div key={i}>{c}</div>)}</div>;
}

function useClock() {
  const fmt = () => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function Taskbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const clock = useClock();
  return (
    <footer className="taskbar">
      <button className="btn" onClick={onMenu}><AppIcon /><span>メニュー</span></button>
      <div className="task"><span>{title}</span></div>
      <div className="clock">{clock}</div>
    </footer>
  );
}
