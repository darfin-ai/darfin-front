import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart as HeartIcon } from 'lucide-react';
import { useStore } from '../store/store.jsx';
import { useLocale } from '../../../shared/i18n';
import {
  CARD,
  PAGE_TITLE,
  PAGE_DESC,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_GHOST,
  TAB_ACTIVE,
  TAB_IDLE,
  TAB_INDICATOR,
  SEGMENT_TRACK,
  SEGMENT_ACTIVE,
  SEGMENT_IDLE,
  PRICE_UP,
  PRICE_DOWN,
  META,
  CONTAINER,
  INPUT,
  SUBNAV,
  SUBNAV_INNER,
  chartColor,
  priceToneClass,
  CHART_UP,
  CHART_DOWN,
  CHART_FLAT,
  avatarGradient,
  ROW_HOVER,
  BG_PRICE_UP,
  BG_PRICE_DOWN,
  BADGE_NEUTRAL,
  LABEL,
  BTN_BUY,
  BTN_SELL,
  BTN_DANGER_GHOST,
  ALERT_ERROR,
  ALERT_WARNING,
  AI_CALLOUT,
  AI_CALLOUT_BODY,
  SECTION_TITLE,
  ROW_DIVIDER,
  BADGE_INFO,
} from '../../../shared/lib/uiRecipes';

// Re-export design tokens for page-level use
export {
  CARD,
  PAGE_TITLE,
  PAGE_DESC,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_GHOST,
  BTN_BUY,
  BTN_SELL,
  BTN_DANGER_GHOST,
  PRICE_UP,
  PRICE_DOWN,
  priceToneClass,
  chartColor,
  CHART_UP,
  CHART_DOWN,
  CHART_FLAT,
  CONTAINER,
  INPUT,
  SUBNAV,
  SUBNAV_INNER,
  TAB_ACTIVE,
  TAB_IDLE,
  TAB_INDICATOR,
  SEGMENT_TRACK,
  SEGMENT_ACTIVE,
  SEGMENT_IDLE,
  ROW_HOVER,
  ROW_DIVIDER,
  BG_PRICE_UP,
  BG_PRICE_DOWN,
  BADGE_NEUTRAL,
  BADGE_INFO,
  META,
  LABEL,
  SECTION_TITLE,
  ALERT_ERROR,
  ALERT_WARNING,
  AI_CALLOUT,
  AI_CALLOUT_BODY,
};

/** @deprecated Use priceToneClass() for className or chartColor() for SVG — legacy hex aliases */
export const UP = CHART_UP;
export const DOWN = CHART_DOWN;
export const SUB = CHART_FLAT;
export const INK = '#0f172a';
export const BRAND = '#2563eb';
/** @deprecated Use priceToneClass() */
export const tone = chartColor;

// ===== Formatters =====
export function createTradingFormatters(locale, t) {
  const numLocale = locale === 'ko' ? 'ko-KR' : 'en-US';
  const won = (n) => {
    if (n == null) return '-';
    const formatted = Math.round(n).toLocaleString(numLocale);
    return locale === 'ko' ? `${formatted}원` : `₩${formatted}`;
  };
  const wonShort = (n) => Math.round(n).toLocaleString(numLocale);
  const signPct = (p) => (p > 0 ? '+' : '') + p.toFixed(2) + '%';
  const signNum = (n) => (n > 0 ? '+' : '') + Math.round(n).toLocaleString(numLocale);
  const eokKMan = (eok) => (eok >= 10000
    ? t('trading.format.revenueJo', { n: (eok / 10000).toFixed(1) })
    : t('trading.format.revenueEok', { n: eok.toLocaleString(numLocale) }));

  const timeAgo = (ts) => {
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 3600) return t('trading.time.minutesAgo', { n: Math.max(1, Math.floor(d / 60)) });
    if (d < 86400) return t('trading.time.hoursAgo', { n: Math.floor(d / 3600) });
    return t('trading.time.daysAgo', { n: Math.floor(d / 86400) });
  };

  const dateLabel = (ts) => {
    const d = new Date(ts);
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatMarketCap = (amount) => {
    const eok = Math.round(amount / 1e8);
    if (eok >= 10000) {
      const jo = Math.floor(eok / 10000);
      const rest = eok % 10000;
      return rest
        ? t('trading.format.marketCapJoEok', { jo, rest: rest.toLocaleString(numLocale) })
        : t('trading.format.marketCapJoEok', { jo, rest: '' }).replace(/\s+$/, '');
    }
    return t('trading.format.marketCapEok', { n: eok.toLocaleString(numLocale) });
  };

  const formatRankValue = (displayValue, rankTab) => {
    if (rankTab === 'volume') return t('trading.format.volumeShares', { n: displayValue.toLocaleString(numLocale) });
    if (rankTab === 'topGainers' || rankTab === 'topLosers') {
      return locale === 'ko'
        ? t('trading.format.dayChangeWon', { n: displayValue.toLocaleString(numLocale) })
        : won(displayValue);
    }
    return t('trading.format.tradeValueEok', { n: displayValue.toLocaleString(numLocale) });
  };

  const formatIndustryValue = (value) => t('trading.format.tradeValueEok', { n: value.toLocaleString(numLocale) });
  const qtyShares = (n) => t('trading.format.qtyShares', { n });
  const pnlWithRate = (pnl, rate) => t('trading.format.pnlWithRate', {
    pnl: locale === 'ko' ? `${signNum(pnl)}원` : signNum(pnl),
    rate: signPct(rate),
  });

  return {
    won, wonShort, signPct, signNum, eokKMan, timeAgo, dateLabel,
    formatMarketCap, formatRankValue, formatIndustryValue, qtyShares, pnlWithRate,
    numLocale,
  };
}

export function useTradingFormat() {
  const { locale, t } = useLocale();
  return useMemo(() => createTradingFormatters(locale, t), [locale, t]);
}

/** @deprecated Prefer useTradingFormat() — Korean defaults */
export const won = (n) => (n == null ? '-' : Math.round(n).toLocaleString('ko-KR') + '원');
export const wonShort = (n) => Math.round(n).toLocaleString('ko-KR');
export const signPct = (p) => (p > 0 ? '+' : '') + p.toFixed(2) + '%';
export const signNum = (n) => (n > 0 ? '+' : '') + Math.round(n).toLocaleString('ko-KR');
export const eokKMan = (eok) => eok >= 10000 ? (eok / 10000).toFixed(1) + '조원' : eok.toLocaleString() + '억원';
export const UNKNOWN_STOCK_NAME = '종목명 확인 중';

export function displayStockName(stock, fallback = UNKNOWN_STOCK_NAME) {
  const code = stock?.code || stock?.stockCode || '';
  const candidates = [stock?.short, stock?.name, stock?.stockName, stock?.companyName];
  const name = candidates.find(value => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed && trimmed !== code && !/^\d{6}$/.test(trimmed);
  });
  return name || fallback;
}

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
    <div onClick={onClick} className="flex items-center gap-2 cursor-pointer select-none">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="9" className="fill-blue-600" />
        <path d="M9 8h6.5c5 0 8.5 3.2 8.5 8s-3.5 8-8.5 8H9V8z" fill="#fff" />
        <path d="M14 13h2.2c1.8 0 3 1.2 3 3s-1.2 3-3 3H14v-6z" className="fill-blue-600" />
      </svg>
      <span className="font-bold text-blue-600 tracking-tight" style={{ fontSize: size * 0.82 }}>Darfin</span>
    </div>
  );
}

export function Avatar({ stock, size = 40 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const code = stock?.code || '0';
  const name = displayStockName(stock);
  const logoUrl = stock?.logoUrl || `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${code}.png`;
  const ch = name.replace(/^(KODEX|SOL|TIGER|KBSTAR)\s*/, '').charAt(0);
  const gradient = avatarGradient(code);

  if (!imgFailed) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src={logoUrl}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-semibold text-white bg-gradient-to-br ${gradient}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {ch}
    </div>
  );
}

export function Sparkline({ pts, color, w = 96, h = 40, fill = true }) {
  const min = Math.min(...pts), max = Math.max(...pts), rng = max - min || 1;
  const step = w / (pts.length - 1);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - ((p - min) / rng) * (h - 4) - 2).toFixed(1)}`).join(' ');
  const area = d + ` L${w},${h} L0,${h} Z`;
  const gid = useMemo(() => 'sg' + Math.random().toString(36).slice(2), []);
  return (
    <svg width={w} height={h} className="block">
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
  const { t } = useLocale();
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const PR = 66, PL = 8, PT = 12, DH = 22, SEP = 6;
  const chartH = h - PT - DH - SEP - volH;
  const volY = PT + chartH + DH + SEP;
  const n = candles.length;

  const calcMA = (period) => candles.map((_, i) => {
    if (i < period - 1) return null;
    let s = 0; for (let k = 0; k < period; k++) s += candles[i - k].close;
    return s / period;
  });
  const ma5v = useMemo(() => calcMA(5), [candles]);
  const ma20v = useMemo(() => calcMA(20), [candles]);

  if (n === 0) {
    return (
      <svg width={w} height={h}>
        <text x={w / 2} y={h / 2} textAnchor="middle" fill={CHART_FLAT} fontSize="14">{t('trading.format.noData')}</text>
      </svg>
    );
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

  const ticks = [0, 1, 2, 3].map(i => rMin + rng * (3 - i) / 3);
  const dateIdxs = n > 1
    ? [0, Math.round(n * 0.25), Math.round(n * 0.5), Math.round(n * 0.75), n - 1]
    : [0];

  const formatChartDate = (d) => {
    if (!d) return '';
    if (d.includes('.') || d.includes('-')) return d;
    if (d.length === 8) return `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6,8)}`;
    if (d.length === 6) return `${d.slice(0,4)}.${d.slice(4,6)}`;
    if (d.length === 4) return d;
    if (d.length === 10) return `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6,8)} ${d.slice(8,10)}${t('trading.format.hourSuffix')}`;
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
  const priceCol = currentPrice != null ? (currentPrice >= lastCandle.open ? CHART_UP : CHART_DOWN) : CHART_FLAT;

  const TW = 124, startOffset = hDate ? 33 : 17;
  const TH = startOffset + 5 * 17 + 12;
  const ttX = hCx != null
    ? (hCx + TW + 14 > w - PR ? Math.max(PL + 4, hCx - TW - 8) : hCx + 10)
    : 0;

  return (
    <svg ref={svgRef} width={w} height={h} className="block cursor-crosshair"
      onMouseMove={onMouseMove} onMouseLeave={() => setHoverIdx(null)}>

      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} x2={w - PR} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700" />
          <text x={w - PR + 6} y={y(t) + 4} fontSize="11" fill={CHART_FLAT}>{Math.round(t).toLocaleString()}</text>
        </g>
      ))}

      <line x1={PL} x2={w - PR} y1={PT + chartH + SEP / 2} y2={PT + chartH + SEP / 2} stroke="#e2e8f0" className="dark:stroke-slate-700" />

      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const col = up ? CHART_UP : CHART_DOWN;
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

      {showMA5 && <path d={maPath(ma5v)} fill="none" stroke="#f59e0b" strokeWidth="1.6" />}
      {showMA20 && <path d={maPath(ma20v)} fill="none" stroke="#7c3aed" strokeWidth="1.6" />}

      {hc && hCx != null && (
        <>
          <line x1={hCx} x2={hCx} y1={PT} y2={PT + chartH} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx={hCx} cy={y(hc.close)} r="4" fill={hc.close >= hc.open ? CHART_UP : CHART_DOWN} stroke="#fff" strokeWidth="1.5" />
        </>
      )}

      {dates && dateIdxs.map(idx => {
        if (idx >= n || !dates[idx]) return null;
        const d = formatChartDate(dates[idx]);
        const cx = PL + idx * cw + cw / 2;
        const anchor = idx === 0 ? 'start' : idx === n - 1 ? 'end' : 'middle';
        return (
          <text key={idx} x={Math.min(cx, w - PR - 2)} y={PT + chartH + DH - 2} fontSize="10" fill={CHART_FLAT} textAnchor={anchor}>{d}</text>
        );
      })}

      {hc && hCx != null && (
        <g>
          <rect x={ttX} y={PT + 4} width={TW} height={TH} rx={8} fill="#1e293b" opacity="0.94" />
          {hDate && (
            <text x={ttX + 10} y={PT + 18} fontSize="11" fill="#94a3b8">
              {formatChartDate(hDate)}
            </text>
          )}
          {[
            [t('trading.format.candleOpen'), Math.round(hc.open).toLocaleString(), '#cbd5e1'],
            [t('trading.format.candleHigh'), Math.round(hc.hi).toLocaleString(), CHART_UP],
            [t('trading.format.candleLow'), Math.round(hc.lo).toLocaleString(), CHART_DOWN],
            [t('trading.format.candleClose'), Math.round(hc.close).toLocaleString(), hc.close >= hc.open ? CHART_UP : CHART_DOWN],
          ].map(([label, val, col], idx) => {
            const by = PT + startOffset + idx * 17;
            return (
              <g key={label}>
                <text x={ttX + 10} y={by} fontSize="11.5" fill="#94a3b8">{label}</text>
                <text x={ttX + TW - 10} y={by} fontSize="11.5" fill={col} fontWeight="700" textAnchor="end">{val}</text>
              </g>
            );
          })}
          <line x1={ttX + 8} x2={ttX + TW - 8}
            y1={PT + startOffset + 4 * 17 + 2} y2={PT + startOffset + 4 * 17 + 2} stroke="#334155" />
          <text x={ttX + 10} y={PT + startOffset + 5 * 17} fontSize="11" fill="#94a3b8">{t('trading.format.candleVolume')}</text>
          <text x={ttX + TW - 10} y={PT + startOffset + 5 * 17} fontSize="11" fill="#94a3b8" textAnchor="end">
            {hc.volume >= 1e6 ? t('trading.format.volumeM', { n: (hc.volume / 1e6).toFixed(1) }) : t('trading.format.volumeK', { n: (hc.volume / 1e3).toFixed(0) })}
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

/** @deprecated Use BTN_GHOST className */
export const ghostBtn = BTN_SECONDARY;
/** @deprecated Use BTN_PRIMARY className */
export const primaryBtn = BTN_PRIMARY;
/** @deprecated Use BTN_GHOST with size overrides */
export const iconBtn = 'relative w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';

export function Pill({ active, children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-4 rounded-full border-none cursor-pointer text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? color ? '' : 'bg-blue-600 text-white'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
      }`}
      style={active && color ? { background: color, color: '#fff' } : undefined}
    >
      {children}
    </button>
  );
}

export function Tab({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={active ? TAB_ACTIVE : TAB_IDLE}>
      {children}
      {active && <span className={TAB_INDICATOR} />}
    </button>
  );
}

export function Card({ children, className = '', style }) {
  return (
    <div className={`${CARD} p-6 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  return (
    <span
      className="darfin-skeleton"
      aria-hidden="true"
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 2, widths = ['100%', '72%'], height = 12, gap = 8 }) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={widths[i] || widths[widths.length - 1] || '100%'} height={height} />
      ))}
    </div>
  );
}

export function Heart({ filled, onClick, size = 22 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`${iconBtn} shrink-0`}
      style={{ width: size + 12, height: size + 12 }}
    >
      <HeartIcon
        size={size}
        className={filled ? 'fill-red-500 text-red-500' : 'text-slate-300 dark:text-slate-600'}
      />
    </button>
  );
}

export function Modal({ children, onClose, width = 460 }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/45 dark:bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${CARD} rounded-2xl max-h-[90vh] overflow-auto shadow-2xl`}
        style={{ width, maxWidth: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}

export function PageShell({ title, sub, right, children }) {
  return (
    <div className={`${CONTAINER} py-7 pb-20`}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className={PAGE_TITLE}>{title}</h1>
          {sub && <p className={`${PAGE_DESC} mt-1.5`}>{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Empty({ text, cta, onCta }) {
  return (
    <Card className="text-center py-14">
      <p className={`text-sm ${META} ${cta ? 'mb-5' : ''}`}>{text}</p>
      {cta && <button onClick={onCta} className={`${BTN_PRIMARY} h-11`}>{cta}</button>}
    </Card>
  );
}

export function Metric({ label, value }) {
  return (
    <div>
      <div className={`text-xs ${META} mb-1`}>{label}</div>
      <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value}</div>
    </div>
  );
}

export function LoginGate() {
  const { goToLogin } = useStore();
  const { t } = useLocale();
  return <Empty text={t('trading.portfolio.loginGate')} cta={t('trading.portfolio.login')} onCta={goToLogin} />;
}

export function Stub({ name }) {
  const { t } = useLocale();
  return (
    <div className={`${CONTAINER} py-16 text-center ${META}`}>
      {t('trading.stub.comingSoon', { name })}
    </div>
  );
}

/** Segmented control — shared pattern from DESIGN_SYSTEM.md §5.7 */
export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`${SEGMENT_TRACK} ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={value === opt.value ? SEGMENT_ACTIVE : SEGMENT_IDLE}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Section title with brand accent bar */
export function SectionTitle({ children, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="w-1 h-5 rounded-sm bg-blue-600 shrink-0" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{children}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          {action} ›
        </button>
      )}
    </div>
  );
}
