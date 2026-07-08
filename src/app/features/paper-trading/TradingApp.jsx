import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useStore } from './store/store.jsx';
import {
  won,
  signPct,
  priceToneClass,
  Avatar,
  displayStockName,
  INPUT,
  SUBNAV,
  SUBNAV_INNER,
  TAB_ACTIVE,
  TAB_IDLE,
  TAB_INDICATOR,
} from './components/ui.jsx';
import { Home } from './pages/Home.jsx';
import { Detail } from './pages/Detail.jsx';
import { Portfolio, Watchlist, Funds, Trades } from './pages/Invest.jsx';
import { AIReports } from './pages/AIReports.jsx';

function SubNav() {
  const { state, navigate, setRankTab } = useStore();
  const route = state.route.name;
  const tabs = [
    { key: 'home', label: '홈' },
    { key: 'portfolio', label: '내 주식' },
    { key: 'watchlist', label: '관심' },
    { key: 'funds', label: '모의 자금' },
    { key: 'ai', label: 'AI 분석' },
  ];
  const cur = route === 'detail' ? 'home' : route === 'trades' ? 'portfolio' : route;

  const handleTabClick = (key) => {
    if (key === 'home') setRankTab('tradeValue');
    navigate(key);
  };

  return (
    <div className={SUBNAV}>
      <div className={SUBNAV_INNER}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => handleTabClick(t.key)}
            className={`${cur === t.key ? TAB_ACTIVE : TAB_IDLE} mr-7`}
          >
            {t.label}
            {cur === t.key && <span className={TAB_INDICATOR} />}
          </button>
        ))}
        <div className="ml-8 flex-1 max-w-md mr-4 hidden lg:block">
          <SubNavSearch />
        </div>
      </div>
    </div>
  );
}

function SubNavSearch() {
  const { stocks, navigate } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return stocks.filter((s) =>
      displayStockName(s, '').toLowerCase().includes(term) ||
      s.code.includes(term) ||
      (s.sector && s.sector.toLowerCase().includes(term))
    ).slice(0, 7);
  }, [q, stocks]);

  const go = (code) => {
    navigate('detail', { code });
    setQ('');
    setOpen(false);
  };

  const onKey = (e) => {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(results.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[hi].code); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="relative w-full">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onKeyDown={onKey}
        placeholder="종목명 또는 코드 검색"
        className={`${INPUT} h-9 pl-9 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700`}
      />
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      {open && q.trim() && results.length > 0 && (
        <div className="absolute top-11 left-0 right-0 z-50 max-h-80 overflow-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          {results.map((s, i) => {
            const currentPct = s.pct || 0;
            const currentPrice = s.price || 0;
            return (
              <div
                key={s.code}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => { e.preventDefault(); go(s.code); }}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
                  hi === i ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                }`}
              >
                <Avatar stock={s} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {displayStockName(s)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{s.code} · {s.sector}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100 tabular-nums">{won(currentPrice)}</div>
                  <div className={`text-xs font-medium tabular-nums ${priceToneClass(currentPct)}`}>{signPct(currentPct)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TradingApp() {
  const { state } = useStore();
  const r = state.route.name;

  return (
    <div className="min-h-0">
      <SubNav />
      {r === 'home' && <Home />}
      {r === 'detail' && <Detail />}
      {r === 'portfolio' && <Portfolio />}
      {r === 'watchlist' && <Watchlist />}
      {r === 'funds' && <Funds />}
      {r === 'trades' && <Trades />}
      {r === 'ai' && <AIReports />}
    </div>
  );
}

export { TradingApp };
