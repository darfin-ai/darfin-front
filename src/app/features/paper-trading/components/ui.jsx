import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store/store.jsx';

// ===== Darfin shared UI: formatters, icons, charts, header =====
export const won = (n) => (n == null ? '-' : Math.round(n).toLocaleString('ko-KR') + '원');
export const wonShort = (n) => Math.round(n).toLocaleString('ko-KR');
export const signPct = (p) => (p > 0 ? '+' : '') + p.toFixed(2) + '%';
export const signNum = (n) => (n > 0 ? '+' : '') + Math.round(n).toLocaleString('ko-KR');
export const UP = '#F04452';
export const DOWN = '#3182F6';
export const SUB = '#8B95A1';
export const INK = '#191F28';
export const BRAND = '#1B64DA';
export const tone = (p) => (p > 0 ? UP : p < 0 ? DOWN : SUB);
export const eokKMan = (eok) => eok >= 10000 ? (eok / 10000).toFixed(1) + '조원' : eok.toLocaleString() + '억원';

export function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 3600) return Math.max(1, Math.floor(d / 60)) + '분 전';
  if (d < 86400) return Math.floor(d / 3600) + '시간 전';
  return Math.floor(d / 86400) + '일 전';
}
export function dateLabel(ts) {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function Logo({ size = 26, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="9" fill={BRAND} />
        <path d="M9 8h6.5c5 0 8.5 3.2 8.5 8s-3.5 8-8.5 8H9V8z" fill="#fff" />
        <path d="M14 13h2.2c1.8 0 3 1.2 3 3s-1.2 3-3 3H14v-6z" fill={BRAND} />
      </svg>
      <span style={{ fontSize: size * 0.82, fontWeight: 800, color: BRAND, letterSpacing: '-0.03em' }}>Darfin</span>
    </div>
  );
}

export function Avatar({ stock, size = 40 }) {
  const ch = stock.name.replace(/^(KODEX|SOL|TIGER|KBSTAR)\s*/, '').charAt(0);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: stock.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.42,
      flexShrink: 0, letterSpacing: '-0.02em' }}>{ch}</div>
  );
}

export function Sparkline({ pts, color, w = 96, h = 40, fill = true }) {
  const min = Math.min(...pts), max = Math.max(...pts), rng = max - min || 1;
  const step = w / (pts.length - 1);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - ((p - min) / rng) * (h - 4) - 2).toFixed(1)}`).join(' ');
  const area = d + ` L${w},${h} L0,${h} Z`;
  const gid = useMemo(() => 'sg' + Math.random().toString(36).slice(2), []);
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function CandleChart({ candles, w = 620, h = 300, showMA5, showMA20, volH = 64 }) {
  const padR = 56, padL = 8, top = 8;
  const chartH = h - volH - 24 - top;
  const prices = candles.flatMap(c => [c.hi, c.lo]);
  const min = Math.min(...prices), max = Math.max(...prices), rng = max - min || 1;
  const plotW = w - padR - padL;
  const cw = plotW / candles.length;
  const bodyW = Math.max(2, cw * 0.62);
  const y = (v) => top + (1 - (v - min) / rng) * chartH;
  const maxVol = Math.max(...candles.map(c => c.volume));
  const volY = top + chartH + 24;

  const ma = (period) => candles.map((c, i) => {
    if (i < period - 1) return null;
    let s = 0;
    for (let k = 0; k < period; k++) s += candles[i - k].close;
    return s / period;
  });
  const ma5 = useMemo(() => ma(5), [candles]);
  const ma20 = useMemo(() => ma(20), [candles]);
  const maPath = (arr) => arr.map((v, i) => v == null ? null : `${(padL + i * cw + cw / 2).toFixed(1)},${y(v).toFixed(1)}`)
    .filter(Boolean).map((p, i) => (i === 0 ? 'M' : 'L') + p).join(' ');

  const ticks = [max, min + rng * 0.66, min + rng * 0.33, min];
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={y(t)} x2={w - padR} y2={y(t)} stroke="#F2F4F6" />
          <text x={w - padR + 6} y={y(t) + 4} fontSize="11" fill={SUB}>{Math.round(t).toLocaleString()}</text>
        </g>
      ))}
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const col = up ? UP : DOWN;
        const cx = padL + i * cw + cw / 2;
        const oY = y(c.open), clY = y(c.close);
        return (
          <g key={i}>
            <line x1={cx} y1={y(c.hi)} x2={cx} y2={y(c.lo)} stroke={col} strokeWidth="1" />
            <rect x={cx - bodyW / 2} y={Math.min(oY, clY)} width={bodyW} height={Math.max(1.2, Math.abs(clY - oY))} fill={col} />
            <rect x={cx - bodyW / 2} y={volY + (volH - (c.volume / maxVol) * volH)} width={bodyW}
              height={(c.volume / maxVol) * volH} fill={col} opacity="0.45" />
          </g>
        );
      })}
      {showMA5 && <path d={maPath(ma5)} fill="none" stroke="#F5A623" strokeWidth="1.5" />}
      {showMA20 && <path d={maPath(ma20)} fill="none" stroke="#7C3AED" strokeWidth="1.5" />}
    </svg>
  );
}

export function Donut({ slices, size = 180, thickness = 30 }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {slices.map((s, i) => {
          const frac = s.value / total;
          const dash = `${(frac * c).toFixed(2)} ${(c - frac * c).toFixed(2)}`;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
              strokeWidth={thickness} strokeDasharray={dash} strokeDashoffset={(-acc * c).toFixed(2)} />
          );
          acc += frac;
          return el;
        })}
      </g>
    </svg>
  );
}

export const iconBtn = { position: 'relative', width: 40, height: 40, borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
export const ghostBtn = { height: 40, padding: '0 16px', borderRadius: 12, border: '1px solid #E5E8EB', background: '#fff', color: '#4E5968', fontSize: 14, fontWeight: 700, cursor: 'pointer' };
export const primaryBtn = { height: 40, padding: '0 20px', borderRadius: 12, border: 'none', background: BRAND, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' };

export function Pill({ active, children, onClick, color }) {
  return (
    <button onClick={onClick} style={{ height: 36, padding: '0 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontSize: 14, fontWeight: 700, background: active ? (color || BRAND) : '#F2F4F6', color: active ? '#fff' : '#4E5968', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

export function Tab({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{ position: 'relative', padding: '14px 4px', marginRight: 28, border: 'none', background: 'none',
      cursor: 'pointer', fontSize: 19, fontWeight: 800, color: active ? INK : '#B0B8C1', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
      {children}
      {active && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, background: BRAND, borderRadius: 2 }} />}
    </button>
  );
}

export function Card({ children, style }) {
  return <div style={{ background: '#fff', border: '1px solid #EEF1F4', borderRadius: 20, padding: 24, ...style }}>{children}</div>;
}

export function Heart({ filled, onClick, size = 22 }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} style={{ ...iconBtn, width: size + 12, height: size + 12, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? UP : 'none'} stroke={filled ? UP : '#C5CBD3'} strokeWidth="2">
        <path d="M12 21s-7-4.6-9.3-8.4C1 9.5 2.4 6 5.6 6c2 0 3.2 1.2 4.4 2.6C11.2 7.2 12.4 6 14.4 6c3.2 0 4.6 3.5 2.9 6.6C19 16.4 12 21 12 21z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function Modal({ children, onClose, width = 460 }) {
  useEffect(() => { const f = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, []);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,25,35,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, width, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        {children}
      </div>
    </div>
  );
}

export function PageShell({ title, sub, right, children }) {
  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: '28px 28px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{title}</div>
          {sub && <div style={{ fontSize: 15, color: SUB, marginTop: 6 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Empty({ text, cta, onCta }) {
  return (
    <Card style={{ textAlign: 'center', padding: 56 }}>
      <div style={{ fontSize: 15, color: SUB, marginBottom: cta ? 20 : 0 }}>{text}</div>
      {cta && <button onClick={onCta} style={{ ...primaryBtn, height: 46 }}>{cta}</button>}
    </Card>
  );
}

export function Metric({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: SUB, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: INK }}>{value}</div>
    </div>
  );
}

export function LoginGate() {
  const { setLoggedIn } = useStore();
  return <Empty text="로그인하면 내 모의투자 계좌를 볼 수 있어요." cta="로그인" onCta={() => setLoggedIn(true)} />;
}

export function Stub({ name }) {
  return <div style={{ maxWidth: 1480, margin: '0 auto', padding: 60, textAlign: 'center', color: SUB }}>{name} 준비 중</div>;
}
