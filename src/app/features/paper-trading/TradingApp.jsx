import { useStore } from './store/store.jsx';
import { INK } from './components/ui.jsx';
import { Home } from './pages/Home.jsx';
import { Detail } from './pages/Detail.jsx';
import { Portfolio, Watchlist, Funds, Trades } from './pages/Invest.jsx';
import { AIReports } from './pages/AIReports.jsx';

function SubNav() {
  const { state, navigate } = useStore();
  const route = state.route.name;
  const tabs = [
    { key: 'home', label: '홈' },
    { key: 'portfolio', label: '내 주식' },
    { key: 'watchlist', label: '관심' },
    { key: 'funds', label: '모의 자금' },
    { key: 'ai', label: 'AI 분석' },
  ];
  const cur = route === 'detail' ? 'home' : route === 'trades' ? 'portfolio' : route;
  return (
    <div style={{ borderBottom: '1px solid #EEF1F4', background: '#fff' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => navigate(t.key)} style={{
            position: 'relative', padding: '16px 8px', marginRight: 28,
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap',
            color: cur === t.key ? INK : '#B0B8C1',
          }}>
            {t.label}
            {cur === t.key && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, background: INK, borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TradingApp() {
  const { state } = useStore();
  const r = state.route.name;
  let page;
  if (r === 'home') page = <Home />;
  else if (r === 'detail') page = <Detail />;
  else if (r === 'portfolio') page = <Portfolio />;
  else if (r === 'watchlist') page = <Watchlist />;
  else if (r === 'funds') page = <Funds />;
  else if (r === 'trades') page = <Trades />;
  else if (r === 'ai') page = <AIReports />;
  else page = <Home />;

  return (
    <div style={{ background: '#fff' }}>
      <SubNav />
      {page}
    </div>
  );
}
