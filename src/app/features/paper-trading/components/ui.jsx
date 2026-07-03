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

const AVATAR_COLORS = ['#1B3A7A', '#E8344E'];
function avatarColor(code) {
  let h = 0; for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function Avatar({ stock, size = 40 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const code = stock?.code || '0';
  const name = stock?.name || stock?.short || stock?.stockName || code;
  const logoUrl = stock?.logoUrl || `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${code}.png`;
  const ch = name.replace(/^(KODEX|SOL|TIGER|KBSTAR)\s*/, '').charAt(0);
  const bg = stock?.color || avatarColor(code);

  if (!imgFailed) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: '#F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={logoUrl}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff',
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

export function CandleChart({ candles, w = 620, h = 300, showMA5, showMA20, volH = 64, currentPrice, dates }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const PR = 66, PL = 8, PT = 12, DH = 22, SEP = 6;
  const chartH = h - PT - DH - SEP - volH;
  const volY = PT + chartH + DH + SEP;
  const n = candles.length;

  // useMemo는 early return 전에 항상 호출해야 함 (Rules of Hooks)
  const calcMA = (period) => candles.map((_, i) => {
    if (i < period - 1) return null;
    let s = 0; for (let k = 0; k < period; k++) s += candles[i - k].close;
    return s / period;
  });
  const ma5v = useMemo(() => calcMA(5), [candles]);
  const ma20v = useMemo(() => calcMA(20), [candles]);

  if (n === 0) {
    return <svg width={w} height={h}><text x={w / 2} y={h / 2} textAnchor="middle" fill={SUB} fontSize="14">데이터 없음</text></svg>;
  }

  const allPrices = candles.flatMap(c => [c.hi, c.lo]);
  const pMin = Math.min(...allPrices), pMax = Math.max(...allPrices);
  const rMin = currentPrice != null ? Math.min(pMin, currentPrice) : pMin;
  const rMax = currentPrice != null ? Math.max(pMax, currentPrice) : pMax;
  const rng = rMax - rMin || 1;
  const y = (v) => PT + (1 - (v - rMin) / rng) * chartH;

  const cw = (w - PR - PL) / n;
  const bw = Math.max(2, cw * 0.6);
  const maxVol = Math.max(...candles.map(c => c.volume || 0), 1);
  const maPath = (arr) => arr
    .map((v, i) => v == null ? null : `${(PL + i * cw + cw / 2).toFixed(1)},${y(v).toFixed(1)}`)
    .filter(Boolean).map((p, i) => (i === 0 ? 'M' : 'L') + p).join(' ');

  // Grid ticks (4개 균등)
  const ticks = [0, 1, 2, 3].map(i => rMin + rng * (3 - i) / 3);

  // X축 날짜 인덱스 (5개 균등)
  const dateIdxs = n > 1
    ? [0, Math.round(n * 0.25), Math.round(n * 0.5), Math.round(n * 0.75), n - 1]
    : [0];

  const formatChartDate = (d) => {
    if (!d) return '';
    if (d.includes('.') || d.includes('-')) return d;
    if (d.length === 8) return `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6,8)}`;
    if (d.length === 6) return `${d.slice(0,4)}.${d.slice(4,6)}`;
    if (d.length === 4) return d;
    if (d.length === 10) return `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6,8)} ${d.slice(8,10)}시`;
    return d;
  };

  const onMouseMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - rect.left - PL) / cw)));
    setHoverIdx(i);
  };

  const hc = hoverIdx != null ? candles[hoverIdx] : null;
  const hDate = (hoverIdx != null && dates) ? dates[hoverIdx] : null;
  const hCx = hoverIdx != null ? PL + hoverIdx * cw + cw / 2 : null;

  const lastCandle = candles[n - 1];
  const priceCol = currentPrice != null ? (currentPrice >= lastCandle.open ? UP : DOWN) : SUB;

  // 툴팁 위치 (오른쪽 경계 초과 시 왼쪽)
  const TW = 124, startOffset = hDate ? 33 : 17;
  const TH = startOffset + 5 * 17 + 12;
  const ttX = hCx != null
    ? (hCx + TW + 14 > w - PR ? Math.max(PL + 4, hCx - TW - 8) : hCx + 10)
    : 0;

  return (
    <svg ref={svgRef} width={w} height={h} style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={onMouseMove} onMouseLeave={() => setHoverIdx(null)}>

      {/* 수평 그리드 + Y축 레이블 */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} x2={w - PR} y1={y(t)} y2={y(t)} stroke="#F2F4F6" strokeWidth="1" />
          <text x={w - PR + 6} y={y(t) + 4} fontSize="11" fill={SUB}>{Math.round(t).toLocaleString()}</text>
        </g>
      ))}

      {/* 가격/거래량 구분선 */}
      <line x1={PL} x2={w - PR} y1={PT + chartH + SEP / 2} y2={PT + chartH + SEP / 2} stroke="#EEF1F4" />

      {/* 캔들 + 거래량 바 */}
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const col = up ? UP : DOWN;
        const cx = PL + i * cw + cw / 2;
        const isLast = i === n - 1;
        const isH = hoverIdx === i;
        const dim = hoverIdx != null && !isH ? 0.4 : 1;
        const bodyTop = Math.min(y(c.open), y(c.close));
        const bodyH = Math.max(1.5, Math.abs(y(c.close) - y(c.open)));
        const volH_ = (c.volume / maxVol) * volH;
        return (
          <g key={i} opacity={dim}>
            <line x1={cx} y1={y(c.hi)} x2={cx} y2={y(c.lo)} stroke={col} strokeWidth={isH ? 1.8 : isLast ? 1.4 : 1.1} />
            <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bodyH} fill={col} />
            <rect x={cx - bw / 2} y={volY + volH - volH_} width={bw} height={volH_} fill={col} opacity={isH ? 0.6 : 0.28} />
          </g>
        );
      })}

      {/* 현재가 점선 + 배지 */}
      {currentPrice != null && (
        <>
          <line x1={PL} x2={w - PR} y1={y(currentPrice)} y2={y(currentPrice)}
            stroke={priceCol} strokeWidth="1.1" strokeDasharray="5 3" opacity="0.9" />
          <rect x={w - PR + 2} y={y(currentPrice) - 11} width={PR - 4} height={22} rx={6} fill={priceCol} />
          <text x={w - PR / 2 - 1} y={y(currentPrice) + 4.5} fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle">
            {Math.round(currentPrice).toLocaleString()}
          </text>
        </>
      )}

      {/* MA 라인 */}
      {showMA5 && <path d={maPath(ma5v)} fill="none" stroke="#F5A623" strokeWidth="1.6" />}
      {showMA20 && <path d={maPath(ma20v)} fill="none" stroke="#7C3AED" strokeWidth="1.6" />}

      {/* 크로스헤어 */}
      {hc && hCx != null && (
        <>
          <line x1={hCx} x2={hCx} y1={PT} y2={PT + chartH} stroke="#ADB5BD" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx={hCx} cy={y(hc.close)} r="4" fill={hc.close >= hc.open ? UP : DOWN} stroke="#fff" strokeWidth="1.5" />
        </>
      )}

      {/* X축 날짜/시간 레이블 — 길이로 포맷 자동 감지 */}
      {dates && dateIdxs.map(idx => {
        if (idx >= n || !dates[idx]) return null;
        const d = formatChartDate(dates[idx]);
        const cx = PL + idx * cw + cw / 2;
        const anchor = idx === 0 ? 'start' : idx === n - 1 ? 'end' : 'middle';
        return (
          <text key={idx} x={Math.min(cx, w - PR - 2)} y={PT + chartH + DH - 2} fontSize="10" fill={SUB} textAnchor={anchor}>{d}</text>
        );
      })}

      {/* 호버 툴팁 (SVG 내부 — overflow:hidden 영향 없음) */}
      {hc && hCx != null && (
        <g>
          <rect x={ttX} y={PT + 4} width={TW} height={TH} rx={8} fill="#1B2335" opacity="0.94" />
          {hDate && (
            <text x={ttX + 10} y={PT + 18} fontSize="11" fill="#8B95A1">
              {formatChartDate(hDate)}
            </text>
          )}
          {[
            ['시가', Math.round(hc.open).toLocaleString(), '#CBD3DC'],
            ['고가', Math.round(hc.hi).toLocaleString(), UP],
            ['저가', Math.round(hc.lo).toLocaleString(), DOWN],
            ['종가', Math.round(hc.close).toLocaleString(), hc.close >= hc.open ? UP : DOWN],
          ].map(([label, val, col], idx) => {
            const by = PT + startOffset + idx * 17;
            return (
              <g key={label}>
                <text x={ttX + 10} y={by} fontSize="11.5" fill="#8B95A1">{label}</text>
                <text x={ttX + TW - 10} y={by} fontSize="11.5" fill={col} fontWeight="700" textAnchor="end">{val}</text>
              </g>
            );
          })}
          <line x1={ttX + 8} x2={ttX + TW - 8}
            y1={PT + startOffset + 4 * 17 + 2} y2={PT + startOffset + 4 * 17 + 2} stroke="#2E3A4F" />
          <text x={ttX + 10} y={PT + startOffset + 5 * 17} fontSize="11" fill="#8B95A1">거래량</text>
          <text x={ttX + TW - 10} y={PT + startOffset + 5 * 17} fontSize="11" fill="#9BAFBF" textAnchor="end">
            {hc.volume >= 1e6 ? (hc.volume / 1e6).toFixed(1) + 'M' : (hc.volume / 1e3).toFixed(0) + 'K'}
          </text>
        </g>
      )}
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
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" strokeLinecap="round" />
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
  const { goToLogin } = useStore();
  return <Empty text="로그인하면 내 모의투자 계좌를 볼 수 있어요." cta="로그인" onCta={goToLogin} />;
}

export function Stub({ name }) {
  return <div style={{ maxWidth: 1480, margin: '0 auto', padding: 60, textAlign: 'center', color: SUB }}>{name} 준비 중</div>;
}
