import { useState, useMemo } from 'react';
import { useStore } from './store/store.jsx';
import { useLocale } from '../../shared/i18n';
import { INK, SUB, BRAND, tone, Avatar, displayStockName, useTradingFormat } from './components/ui.jsx';
import { Home } from './pages/Home.jsx';
import { Detail } from './pages/Detail.jsx';
import { Portfolio, Watchlist, Funds, Trades } from './pages/Invest.jsx';
import { AIReports } from './pages/AIReports.jsx';

function SubNav() {
  const { state, navigate, setRankTab, goToLogin } = useStore(); // setRankTab 추가
  const { t } = useLocale();
  const route = state.route.name;
  const tabs = [
    { key: 'home', label: t('trading.nav.home') },
    { key: 'portfolio', label: t('trading.nav.portfolio') },
    { key: 'watchlist', label: t('trading.nav.watchlist') },
    { key: 'funds', label: t('trading.nav.funds') },
    { key: 'ai', label: t('trading.nav.ai') },
  ];
  const cur = route === 'detail' ? 'home' : route === 'trades' ? 'portfolio' : route;

  const handleTabClick = (key) => {
    if (key === 'home') {
      // 홈 탭을 새로 누르면 백엔드 순위 API도 기본 '거래대금' 탭 데이터로 초기화 시킴
      setRankTab('tradeValue');
    }
    if (!state.isLoggedIn && ['portfolio', 'watchlist', 'funds', 'ai'].includes(key)) {
      goToLogin();
      return;
    }
    navigate(key);
  };

  return (
    <div style={{ borderBottom: '1px solid var(--trading-divider, #EEF1F4)', background: 'var(--trading-card, #fff)' }}>
      <div className="container darfin-trading-subnav-inner" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => handleTabClick(t.key)} className="darfin-trading-subnav-tab" style={{ position: 'relative', padding: '16px 8px', marginRight: 28,
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap',
            color: cur === t.key ? INK : SUB }}>
            {t.label}
            {cur === t.key && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, background: INK, borderRadius: 2 }} />}
          </button>
        ))}
        <div className="darfin-trading-subnav-search" style={{ marginLeft: 60, flex: 1, marginRight: 360 }}>
          <SubNavSearch />
        </div>
      </div>
    </div>
  );
}

function SubNavSearch() {
  const { stocks, navigate } = useStore();
  const { t } = useLocale();
  const { won, signPct } = useTradingFormat();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return stocks.filter(s => 
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(results.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[hi].code); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); setHi(0); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} onKeyDown={onKey}
        placeholder={t('trading.nav.searchPlaceholder')} style={{
        width: '100%', height: 38, border: '1px solid transparent', background: 'var(--trading-muted-bg, #F2F4F6)', borderRadius: 10, padding: '0 14px 0 36px',
        fontSize: 13, color: INK, outline: 'none' }} />
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 12, top: 11.5 }}>
        <circle cx="11" cy="11" r="7" stroke={SUB} strokeWidth="2" /><path d="M20 20l-3-3" stroke={SUB} strokeWidth="2" strokeLinecap="round" />
      </svg>
      {open && q.trim() && results.length > 0 && (
        <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: 'var(--trading-card, #fff)', border: '1px solid var(--trading-card-border, #EEF1F4)', borderRadius: 14,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)', padding: 6, zIndex: 50, maxHeight: 320, overflow: 'auto' }}>
          {results.map((s, i) => {
            const currentPct = s.pct || 0; // 시세 레이트 로딩 대비 안전장치
            const currentPrice = s.price || 0;
            return (
              <div key={s.code} onMouseEnter={() => setHi(i)} onMouseDown={(e) => { e.preventDefault(); go(s.code); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', background: hi === i ? 'var(--trading-muted-bg-strong, #F4F8FF)' : 'transparent' }}>
                <Avatar stock={s} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayStockName(s)}</div>
                  <div style={{ fontSize: 11, color: SUB }}>{s.code} · {s.sector}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{won(currentPrice)}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: tone(currentPct) }}>{signPct(currentPct)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stub({ name }) {
  const { t } = useLocale();
  return <div style={{ maxWidth: 1480, margin: '0 auto', padding: 60, textAlign: 'center', color: SUB }}>{t('trading.stub.comingSoon', { name })}</div>;
}

function TradingApp() {
  const { state } = useStore();
  const r = state.route.name;
  let page = <Home />;
  if (r === 'detail') page = <Detail />;
  else if (r === 'portfolio') page = <Portfolio />;
  else if (r === 'watchlist') page = <Watchlist />;
  else if (r === 'funds') page = <Funds />;
  else if (r === 'trades') page = <Trades />;
  else if (r === 'ai') page = <AIReports />;

  return (
    <div className="darfin-trading-surface" style={{ minHeight: '100vh', background: 'var(--trading-bg, #fff)' }}>
      <SubNav />
      {page}
    </div>
  );
}

export { TradingApp };
