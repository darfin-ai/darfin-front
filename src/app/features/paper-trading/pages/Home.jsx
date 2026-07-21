import { useState, useMemo, useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router';
import { useStore } from '../store/store.jsx';
import { useLocale } from '../../../shared/i18n';
import { getQuestions } from '../../community/api/communityApi.js';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone, timeAgo,
  Avatar, Sparkline, CandleChart, Card, Pill, Tab, Heart, Skeleton, SkeletonText, displayStockName, useTradingFormat,
} from '../components/ui.jsx';

// ===== Home dashboard (Toss layout, domestic only) =====
function MarketCard({ idx, big }) {
  const { locale, t } = useLocale();
  const { signNum, signPct } = useTradingFormat();
  const col = idx.up ? UP : DOWN;
  const label = idx.name || (idx.nameId ? t(`trading.market.indices.${idx.nameId}`) : '');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
      <div style={{ flexShrink: 0 }}><Sparkline pts={idx.spark} color={col} w={big ? 120 : 70} h={big ? 56 : 40} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{label}</span>
          {idx.tag && <span style={{ fontSize: 11, fontWeight: 700, color: SUB, background: '#F2F4F6', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}>{idx.tag}</span>}
        </div>
        <div style={{ fontSize: big ? 26 : 19, fontWeight: 800, color: INK, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          {idx.value.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: col, marginTop: 2 }}>
          {signNum(idx.amt)} ({signPct(idx.pct)})
        </div>
      </div>
    </div>
  );
}

// ---------- Darfin signature pieces ----------
function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 5, height: 20, borderRadius: 3, background: BRAND, display: 'inline-block' }} />
        <span style={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{children}</span>
      </div>
      {action && <button onClick={onAction} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: SUB }}>{action} ›</button>}
    </div>
  );
}

// 1. 코스피/코스닥 지수 (TR_ID: FHPUP02100000) 반영 컴포넌트
function MiniIndexCard({ idx }) {
  const { locale, t } = useLocale();
  const { signNum, signPct } = useTradingFormat();
  if (!idx) {
    return (
      <Card style={{ padding: '14px 18px', flex: 1, minWidth: 0 }}>
        <Skeleton width={72} height={14} style={{ marginBottom: 10 }} />
        <Skeleton width="68%" height={26} style={{ marginBottom: 8 }} />
        <Skeleton width={112} height={13} />
      </Card>
    );
  }
  const isUp = idx.pct >= 0;
  const col = isUp ? UP : DOWN;
  const label = idx.name || (idx.nameId ? t(`trading.market.indices.${idx.nameId}`) : '');
  return (
    <Card style={{ padding: '14px 18px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{label}</span>
        {idx.tag && <span style={{ fontSize: 11, fontWeight: 700, color: col, background: col + '14', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }}>{idx.tag}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: INK, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          {(idx.value || 0).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', { minimumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: col, whiteSpace: 'nowrap' }}>
          {signNum(idx.amt)} ({signPct(idx.pct)})
        </span>
      </div>
    </Card>
  );
}

export function InvestHero() {
  const { state, getStock, navigate, goToLogin } = useStore();
  const { t } = useLocale();
  const { won, signNum, signPct } = useTradingFormat();
  if (!state.isLoggedIn) {
    const guestTitle = t('trading.hero.guestTitle').split('\n');
    const guestDesc = t('trading.hero.guestDesc').split('\n');
    return (
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '36px 36px', marginBottom: 28,
        background: 'linear-gradient(120deg,#1B64DA 0%,#2E7DF0 55%,#3D8BFF 100%)', color: '#fff' }}>
        <HeroGlow />
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 999, marginBottom: 16 }}>{t('trading.hero.badge')}</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em' }}>{guestTitle.map((line, i) => <span key={line}>{line}{i < guestTitle.length - 1 && <br />}</span>)}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 12, lineHeight: 1.6 }}>{guestDesc.map((line, i) => <span key={line}>{line}{i < guestDesc.length - 1 && <br />}</span>)}</div>
          <button onClick={goToLogin} style={{ marginTop: 22, height: 52, padding: '0 28px', borderRadius: 14, border: 'none',
            background: '#fff', color: BRAND, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>{t('trading.hero.guestCta')}</button>
        </div>
      </div>
    );
  }

  const rows = state.holdings.map(h => {
    const s = getStock(h.code);
    const currentPrice = s ? s.price : h.currentPrice ?? h.avgPrice;
    return { eval: currentPrice * h.qty, cost: h.avgPrice * h.qty };
  });
  const totalEval = rows.reduce((a, r) => a + r.eval, 0);
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const cash = state.funds.cashBalance;
  const assets = totalEval + cash;
  const pnl = totalEval - totalCost;
  const pnlPct = totalCost ? (pnl / totalCost) * 100 : 0;
  const pnlUp = pnl >= 0;
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '28px 32px', marginBottom: 28,
      background: 'linear-gradient(120deg,#103E8C 0%,#1B64DA 60%,#2E7DF0 100%)', color: '#fff' }}>
      <HeroGlow />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)', marginBottom: 10, whiteSpace: 'nowrap' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{t('trading.hero.me')}</span>
            {t('trading.hero.myAssets')}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>{won(assets)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 800, background: 'rgba(255,255,255,0.16)', padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              {pnlUp ? '▲' : '▼'} {won(pnl)} ({signPct(pnlPct)})
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{t('trading.hero.unrealizedPnl')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 250, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.72)' }}>{t('trading.hero.availableCash')}</span>
            <span style={{ fontWeight: 800 }}>{won(cash)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.72)' }}>{t('trading.hero.holdingsCount')}</span>
            <span style={{ fontWeight: 800 }}>{t('trading.hero.holdingsUnit', { count: state.holdings.length })}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('portfolio')} style={heroBtn(true)}>{t('trading.hero.myStocks')}</button>
            <button onClick={() => navigate('ai')} style={heroBtn(false)}>{t('trading.hero.aiReport')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function HeroGlow() {
  return (
    <>
      <div style={{ position: 'absolute', top: -80, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ position: 'absolute', bottom: -120, right: 160, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
    </>
  );
}
const heroBtn = (solid) => ({ flex: 1, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap',
  background: solid ? '#fff' : 'rgba(255,255,255,0.16)', color: solid ? BRAND : '#fff' });

const RANK_COLS = '28px 28px 40px minmax(108px, 1fr) 100px 76px 100px 72px';
const HOME_LAYOUT = {
  maxWidth: 1480,
  marginLeft: 'max(0px, calc((100vw - 1200px) / 2 + clamp(1.25rem, 4vw, 2.5rem) - 28px))',
  marginRight: 'auto',
};

function StockRowSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: RANK_COLS, alignItems: 'center', gap: 8, padding: '10px 8px', borderRadius: 12 }}>
      <Skeleton width={20} height={20} radius={10} style={{ justifySelf: 'center' }} />
      <Skeleton width={16} height={14} style={{ justifySelf: 'center' }} />
      <Skeleton width={34} height={34} radius={17} style={{ justifySelf: 'center' }} />
      <Skeleton width="78%" height={16} />
      <Skeleton width={82} height={16} style={{ justifySelf: 'end' }} />
      <Skeleton width={58} height={24} radius={8} style={{ justifySelf: 'end' }} />
      <Skeleton width={76} height={14} style={{ justifySelf: 'end' }} />
      <Skeleton width={48} height={20} radius={6} style={{ justifySelf: 'end' }} />
    </div>
  );
}

function StockRowsSkeleton({ count = 10 }) {
  return Array.from({ length: count }).map((_, i) => <StockRowSkeleton key={i} />);
}

function StockRow({ rank, stock, onClick, watched, onWatch, onHover, rankTab }) {
  const { formatRankValue, won, signPct } = useTradingFormat();
  const col = tone(stock.pct);
  const displayValue = (rankTab === 'volume' ? stock.volume : stock.value) || 0;
  const valText = formatRankValue(displayValue, rankTab);

  return (
    <div onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: RANK_COLS, alignItems: 'center',
        gap: 8, padding: '10px 8px', borderRadius: 12, cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--trading-row-hover, #F9FAFB)'; onHover && onHover(); }}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      {/* 찜 */}
      <div style={{ display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
        <Heart filled={watched} onClick={onWatch} size={18} />
      </div>

      {/* 순위 */}
      <span style={{ fontSize: 14, fontWeight: 700, color: '#8B95A1', textAlign: 'center' }}>{rank}</span>

      {/* 아이콘 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar stock={stock} size={34} />
      </div>

      {/* 종목명 */}
      <span title={displayStockName(stock)} style={{ fontSize: 15, fontWeight: 700, color: INK, minWidth: 108, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {displayStockName(stock)}
      </span>

      {/* 현재가 */}
      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: INK }}>{won(stock.price)}</div>

      {/* 등락률 */}
      <div style={{ textAlign: 'right' }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          color: col, background: stock.pct > 0 ? '#FEF0F1' : stock.pct < 0 ? '#EFF5FF' : '#F2F4F6' }}>
          {signPct(stock.pct)}
        </span>
      </div>

      {/* 거래대금/거래량 */}
      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#4E5968' }}>{valText}</div>

      {/* 업종 태그 (stock_info DB 기반 — 없으면 미표시) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {stock.sector ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4E5968', background: '#F2F4F6',
            padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {stock.sector}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: '#C5CBD3' }}>-</span>
        )}
      </div>
    </div>
  );
}

function HomeMain() {
  const { state, market, marketError, stocks, industries, navigate, toggleWatch, rankTab, setRankTab, kisLoading } = useStore();
  const { t } = useLocale();
  const { formatIndustryValue, signPct } = useTradingFormat();
  const [tab, setTab] = useState('chart');

  const [hoveredCode, setHoveredCode] = useState('');

  const displayStocks = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];
    return [...stocks];
  }, [stocks]);

  const activeHovered = useMemo(() => {
    if (!displayStocks.length) return null;
    const found = displayStocks.find(s => s.code === hoveredCode);
    return found || displayStocks[0];
  }, [hoveredCode, displayStocks]);

  // 탭 변경 시에만 hover 초기화 — stocks가 300ms마다 바뀌어도 리셋하지 않음
  useEffect(() => {
    setHoveredCode('');
  }, [rankTab]);

  return (
    <div>
      <InvestHero />

      {/* market status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1FA463' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{market?.status?.label || t('trading.market.status.regularSession')}</span>
          <span style={{ fontSize: 14, color: SUB }}>{market?.status?.hours || t('trading.market.status.defaultHours')}</span>
          <span style={{ fontSize: 13, color: marketError ? DOWN : SUB, marginLeft: 4 }}>
            · {marketError ? t('trading.market.kisError') : t('trading.market.liveUpdating')}
          </span>
        </div>
      </div>

      {/* 1. 코스피/코스닥 지수 연동 섹션 (TR_ID: FHPUP02100000) */}
      <div className="darfin-trading-index-grid" style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <MiniIndexCard idx={market?.kospi} />
        <MiniIndexCard idx={market?.kosdaq} />
        <MiniIndexCard idx={market?.usd} />
      </div>

      {/* tabs */}
      <div style={{ borderBottom: '1px solid #EEF1F4', marginBottom: 18 }}>
        <Tab active={tab === 'chart'} onClick={() => setTab('chart')}>{t('trading.home.tabChart')}</Tab>
        <Tab active={tab === 'industry'} onClick={() => setTab('industry')}>{t('trading.home.tabIndustry')}</Tab>
      </div>

      {tab === 'chart' && (
        <div className="darfin-trading-chart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 392px', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <Pill active={rankTab === 'tradeValue'} onClick={() => setRankTab('tradeValue')}>{t('trading.home.rankTradeValue')}</Pill>
              <Pill active={rankTab === 'volume'} onClick={() => setRankTab('volume')}>{t('trading.home.rankVolume')}</Pill>
              <Pill active={rankTab === 'topGainers'} onClick={() => setRankTab('topGainers')}>{t('trading.home.rankTopGainers')}</Pill>
              <Pill active={rankTab === 'topLosers'} onClick={() => setRankTab('topLosers')}>{t('trading.home.rankTopLosers')}</Pill>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: BRAND }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t('trading.home.hideRisky')}
              </div>
            </div>
            
            <div className="darfin-trading-rank-scroller">
              <div className="darfin-trading-rank-table">
                <div style={{ display: 'grid', gridTemplateColumns: RANK_COLS, gap: 8, padding: '0 8px 10px', fontSize: 12, color: SUB, fontWeight: 600 }}>
                  <span />
                  <span style={{ textAlign: 'center' }}>{t('trading.home.colRank')}</span>
                  <span />
                  <span>{t('trading.home.colStock')}</span>
                  <span style={{ textAlign: 'right' }}>{t('trading.home.colPrice')}</span>
                  <span style={{ textAlign: 'right' }}>{t('trading.home.colChange')}</span>
                  <span style={{ textAlign: 'right' }}>
                    {rankTab === 'tradeValue' ? t('trading.home.colTradeValue') : rankTab === 'volume' ? t('trading.home.colVolume') : t('trading.home.colDayChange')}
                  </span>
                  <span style={{ textAlign: 'right' }}>{t('trading.home.colSector')}</span>
                </div>

                {displayStocks.length > 0 ? (
                  displayStocks.map((s, i) => (
                    <StockRow key={s.code} rank={i + 1} stock={s} rankTab={rankTab}
                      watched={state.watchlist.includes(s.code)} onWatch={() => toggleWatch(s.code)}
                      onHover={() => setHoveredCode(s.code)}
                      onClick={() => navigate('detail', { code: s.code })} />
                  ))
                ) : kisLoading.ranks ? (
                  <StockRowsSkeleton />
                ) : (
                  <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: SUB }}>{t('trading.home.loading')}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="darfin-trading-side-stack" style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 3. 당일 투자자 동향 연동 섹션 (TR_ID: HHPPG046600C1) */}
            <InvestorTrendCard market={market} loading={kisLoading.sentiment} />
            {activeHovered && <StockPreviewCard stock={activeHovered} />}
          </div>
        </div>
      )}

      {/* 2. 지금 뜨는 산업 연동 섹션 (TR_ID: FHPUP02140000) */}
      {tab === 'industry' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{t('trading.home.industrySub')}</span>
            <span style={{ fontSize: 12, color: SUB }}>{t('trading.home.industryNote')}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, background: 'var(--trading-muted-bg, #EFF5FF)', padding: '3px 8px', borderRadius: 6, marginLeft: 'auto', whiteSpace: 'nowrap' }}>{t('trading.home.industryLive')}</span>
          </div>
          <Card style={{ padding: 8 }}>
            {kisLoading.industries ? (
              <IndustrySkeleton />
            ) : industries && industries.length > 0 ? (
              industries.map((ind, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: i < industries.length - 1 ? '1px solid #F6F8FA' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#8B95A1', width: 18 }}>{i + 1}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{ind.name}</span>
                    {ind.code && <span style={{ fontSize: 12, color: SUB }}>({ind.code})</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {ind.value && <span style={{ fontSize: 14, color: SUB, fontWeight: 500 }}>{formatIndustryValue(ind.value)}</span>}
                    <span style={{ fontSize: 16, fontWeight: 800, color: tone(ind.pct), minWidth: 64, textAlign: 'right' }}>{signPct(ind.pct)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: SUB }}>{t('trading.home.industryLoading')}</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function IndustrySkeleton({ count = 5 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: i < count - 1 ? '1px solid #F6F8FA' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton width={18} height={16} />
        <Skeleton width={130 + i * 10} height={18} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Skeleton width={72} height={14} />
        <Skeleton width={54} height={18} />
      </div>
    </div>
  ));
}

// 일봉 → 주봉 집계 (월요일 기준)
function toWeekly(daily) {
  const weeks = {};
  for (const d of daily) {
    const s = String(d.date);
    const dt = new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8));
    const dow = dt.getDay();
    dt.setDate(dt.getDate() - (dow === 0 ? 6 : dow - 1));
    const key = `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}`;
    if (!weeks[key]) {
      weeks[key] = { date: key, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume };
    } else {
      weeks[key].high   = Math.max(weeks[key].high, d.high);
      weeks[key].low    = Math.min(weeks[key].low,  d.low);
      weeks[key].close  = d.close;
      weeks[key].volume += d.volume;
    }
  }
  return Object.values(weeks).sort((a, b) => a.date.localeCompare(b.date));
}

const weeklyCache = {};

function StockPreviewCard({ stock: rawStock }) {
  const { navigate, getStock } = useStore();
  const { t } = useLocale();
  const { won, signNum, signPct, timeAgo } = useTradingFormat();
  const routerNavigate = useRouterNavigate();
  // 모든 훅을 조건 분기 전에 선언 (Rules of Hooks)
  const [candles, setCandles] = useState([]);
  const [dates,   setDates]   = useState([]);
  const [status,  setStatus]  = useState('idle'); // idle | loading | ok | error
  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityStatus, setCommunityStatus] = useState('idle'); // idle | loading | ok | error

  const stock     = rawStock ? (getStock(rawStock.code) || rawStock) : null;
  const stockCode = stock?.code ?? null;
  const stockName = stock ? displayStockName(stock, '') : '';

  useEffect(() => {
    if (!stockCode) return;

    // 캐시 히트
    if (weeklyCache[stockCode]) {
      const { c, d } = weeklyCache[stockCode];
      setCandles(c); setDates(d); setStatus('ok');
      return;
    }

    const ctrl = new AbortController();
    setStatus('loading'); setCandles([]); setDates([]);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    fetch(`${API_BASE_URL}/funds/stocks/${stockCode}/candles`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) { setStatus('error'); return; }
        const weekly = toWeekly(data);
        const c = weekly.map((w, i) => ({ i, open: w.open, close: w.close, hi: w.high, lo: w.low, volume: w.volume }));
        const d = weekly.map(w => w.date);
        weeklyCache[stockCode] = { c, d };
        setCandles(c); setDates(d); setStatus('ok');
      })
      .catch(err => { if (err.name !== 'AbortError') setStatus('error'); })
      .finally(() => { /* loading 종료는 위에서 처리 */ });

    return () => ctrl.abort();
  }, [stockCode]);

  useEffect(() => {
    if (!stockCode) return;
    let cancelled = false;
    const terms = [...new Set([stockName, stock?.short, stockCode].filter(Boolean))];

    async function loadCommunity() {
      setCommunityStatus('loading');
      setCommunityPosts([]);
      try {
        let questions = [];
        for (const term of terms) {
          const data = await getQuestions(term);
          const list = Array.isArray(data) ? data : [];
          questions = list.filter(q => {
            const qCode = q.stock?.stockCode || q.stockCode;
            const qName = q.stock?.companyName || q.stockName || '';
            return qCode === stockCode || (qName && (qName.includes(stockName) || stockName.includes(qName) || qName.includes(term)));
          });
          if (questions.length) break;
        }
        if (!cancelled) {
          setCommunityPosts(questions.slice(0, 2));
          setCommunityStatus('ok');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('종목 커뮤니티 조회 실패', error);
          setCommunityStatus('error');
        }
      }
    }

    loadCommunity();
    return () => { cancelled = true; };
  }, [stockCode, stockName, stock?.short]);

  // 훅 이후 조건부 렌더링
  if (!stock) return null;

  const col       = tone(stock.pct);
  const changeAmt = stock.changeAmt || 0;

  return (
    <Card className="darfin-trading-preview-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}
        onClick={() => navigate('detail', { code: stock.code })}>
        <Avatar stock={stock} size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayStockName(stock)}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: INK }}>{won(stock.price)}</span>
            <span style={{ color: col, marginLeft: 6 }}>{signNum(changeAmt)} ({signPct(stock.pct)})</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: SUB, marginBottom: 4 }}>{t('trading.home.weeklyChart')}</div>
      {status === 'loading' && (
        <ChartSkeleton height={170} />
      )}
      {status === 'error' && (
        <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: SUB }}>{t('trading.home.chartError')}</div>
      )}
      {status === 'ok' && (
        <CandleChart candles={candles} dates={dates} w={356} h={170} volH={36} currentPrice={stock.price} />
      )}
      <div style={{ borderTop: '1px solid var(--trading-divider, #F2F4F6)', marginTop: 14, paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{t('trading.home.community')}</span>
          <span onClick={() => routerNavigate('/community')} style={{ fontSize: 12, color: SUB, cursor: 'pointer' }}>{t('trading.home.seeMore')}</span>
        </div>
        {communityStatus === 'loading' ? (
          <SkeletonText lines={2} widths={['76%', '58%']} height={13} />
        ) : communityStatus === 'error' ? (
          <div style={{ fontSize: 13, color: SUB, padding: '8px 0' }}>{t('trading.home.communityError')}</div>
        ) : communityPosts.length === 0 ? (
          <div style={{ fontSize: 13, color: SUB, padding: '8px 0' }}>{t('trading.home.communityEmpty')}</div>
        ) : communityPosts.map(p => (
          <div key={p.id} onClick={() => routerNavigate(`/community/${p.id}`)} style={{ display: 'flex', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{(p.authorNickname || t('trading.home.anonymous')).charAt(0)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.authorNickname || t('trading.home.anonymous')}</span>
                <span style={{ fontSize: 11, color: SUB }}>{timeAgo(new Date(p.createdAt).getTime())}</span>
              </div>
              <div style={{ fontSize: 13, color: '#4E5968', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.title || p.content}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 3. 투자자 동향 (TR_ID: HHPPG046600C1) 반영 컴포넌트
function InvestorTrendCard({ market, loading }) {
  const { t } = useLocale();
  const { numLocale } = useTradingFormat();
  if (loading || !market || !market.invSentiment) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <Skeleton width={132} height={18} />
          <Skeleton width={58} height={12} />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 18 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Skeleton width={44} height={15} />
              <Skeleton width={96} height={15} />
            </div>
            <Skeleton height={8} radius={4} />
          </div>
        ))}
      </Card>
    );
  }
  const maxAbs = Math.max(...market.invSentiment.map(s => Math.abs(s.val || 0)), 1);
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{t('trading.market.investorTrend')}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: SUB, whiteSpace: 'nowrap' }}>{t('trading.market.investorTrendSub')}</span>
      </div>
      {market.invSentiment.map((s, i) => {
        const col = s.buy ? UP : DOWN;
        const pct = Math.min(100, (Math.abs(s.val || 0) / maxAbs) * 100);
        return (
          <div key={i} style={{ marginBottom: i < market.invSentiment.length - 1 ? 18 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{s.who || t(`trading.market.investors.${s.invType}`)}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: col, whiteSpace: 'nowrap' }}>
                {s.buy ? t('trading.market.netBuy') : t('trading.market.netSell')} {Math.abs(s.val || 0).toLocaleString(numLocale)}
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--trading-muted-bg, #F2F4F6)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: pct + '%', height: '100%', background: col }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function WatchRail() {
  const { state, getStock, navigate, toggleWatch, kisLoading } = useStore();
  const { t } = useLocale();
  const { wonShort, signNum, signPct } = useTradingFormat();
  const top = state.watchlist.map(getStock).filter(Boolean).slice(0, 10);
  const loading = state.isLoggedIn && (kisLoading.watchlist || kisLoading.summaries) && state.watchlist.length > 0 && top.length === 0;
  return (
    <aside className="darfin-trading-watch-rail" style={{ width: 320, flexShrink: 0 }}>
      <div className="darfin-trading-watch-sticky" style={{ position: 'sticky', top: 84 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 18px 8px' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>{t('trading.home.watchTop10')}</div>
            <div style={{ fontSize: 13, color: SUB, marginTop: 4 }}>{t('trading.home.watchDesc')}</div>
          </div>
          {loading ? (
            <WatchRailSkeleton />
          ) : top.map((s) => {
            const changeAmt = s.changeAmt || 0;
            return (
              <div key={s.code} onClick={() => navigate('detail', { code: s.code })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--trading-row-hover, #F9FAFB)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar stock={s} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayStockName(s)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{wonShort(s.price)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tone(s.pct) }}>{signNum(changeAmt)} ({signPct(s.pct)})</div>
                </div>
                <Heart filled onClick={() => toggleWatch(s.code)} size={18} />
              </div>
            );
          })}
          <button onClick={() => navigate('watchlist')} style={{ width: '100%', padding: 14, border: 'none', borderTop: '1px solid var(--trading-divider, #F2F4F6)', background: 'none', color: BRAND, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{t('trading.home.watchViewAll')}</button>
        </Card>
      </div>
    </aside>
  );
}

function WatchRailSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px' }}>
      <Skeleton width={34} height={34} radius={17} />
      <div style={{ flex: 1 }}>
        <Skeleton width="70%" height={14} />
      </div>
      <div style={{ width: 82, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <Skeleton width={64} height={14} />
        <Skeleton width={74} height={12} />
      </div>
      <Skeleton width={18} height={18} radius={9} />
    </div>
  ));
}

function ChartSkeleton({ height = 170 }) {
  return (
    <div style={{ height, position: 'relative', padding: '12px 8px 28px' }}>
      <div style={{ position: 'absolute', inset: '12px 8px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={1} radius={1} />)}
      </div>
      <div style={{ position: 'absolute', left: 12, right: 78, bottom: 42, height: height - 72, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={Math.min(height - 78, 28 + ((i * 17) % 92))} radius={3} style={{ flex: 1 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 12, right: 78, bottom: 12, display: 'flex', gap: 6 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={8 + ((i * 7) % 18)} radius={2} style={{ flex: 1 }} />
        ))}
      </div>
    </div>
  );
}

function MarketTicker() {
  const { market } = useStore();
  const { locale, t } = useLocale();
  const { signNum, signPct } = useTradingFormat();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  if (!market) return null;
  
  const items = [
    market.kospi,
    market.kosdaq,
    market.usd,
  ].filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 45,
      background: 'color-mix(in srgb, var(--trading-card, #fff) 96%, transparent)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--trading-divider, #EEF1F4)',
      transform: show ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s cubic-bezier(0.2,0.8,0.2,1)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ ...HOME_LAYOUT, padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', gap: 8 }}>
        {items.map((it, i) => {
          const col = tone(it.pct);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 7, padding: '0 14px', borderLeft: i === 0 ? 'none' : '1px solid #F2F4F6', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: SUB }}>{it.name || (it.nameId ? t(`trading.market.indices.${it.nameId}`) : '')}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{(it.value || 0).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', { minimumFractionDigits: 2 })}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{signNum(it.amt)} ({signPct(it.pct)})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      <div className="darfin-trading-home-shell" style={{ ...HOME_LAYOUT, padding: '28px 28px 100px', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}><HomeMain /></div>
        <WatchRail />
      </div>
      <MarketTicker />
    </>
  );
}

if (typeof window !== 'undefined') {
  Object.assign(window, { Home });
}
