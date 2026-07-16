import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/store.jsx';
import { useLocale } from '../../../shared/i18n';
import { msUntilNextKstDay, resolveTradeHoldDays } from '../lib/holdingDays.js';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone, dateLabel,
  Avatar, Donut, Card, Modal, ghostBtn, primaryBtn, iconBtn, Heart,
  PageShell, Empty, Metric, Skeleton, SkeletonText, displayStockName, useTradingFormat,
} from '../components/ui.jsx';
// ===== 포트폴리오 · 관심종목 · 모의자금 · 체결내역 · AI분석 =====

// ---------- usePortfolio ----------
function usePortfolio() {
  const { state, getStock } = useStore();
  return useMemo(() => {
    const rows = state.holdings.map(h => {
      const s = getStock(h.code);
      const price = s ? s.price : h.currentPrice ?? h.avgPrice;
      const pct = s ? s.pct : 0;
      const stock = s ? { ...s, price, pct } : { code: h.code, name: displayStockName(h), short: displayStockName(h), price, pct };
      const cost = h.avgPrice * h.qty;
      const eval_ = price * h.qty;
      const pnl = eval_ - cost;
      const pnlPct = cost ? (pnl / cost) * 100 : 0;
      return { ...h, stock, cost, eval: eval_, pnl, pnlPct };
    });
    const totalCost = rows.reduce((a, r) => a + r.cost, 0);
    const totalEval = rows.reduce((a, r) => a + r.eval, 0);
    const cash = state.funds.cashBalance;
    const totalPnl = totalEval - totalCost;
    const totalPnlPct = totalCost ? (totalPnl / totalCost) * 100 : 0;
    const assets = totalEval + cash;
    return { rows, totalCost, totalEval, cash, totalPnl, totalPnlPct, assets };
  }, [state.holdings, state.funds.cashBalance, getStock]);
}

const DONUT_COLORS = ['#1B64DA', '#F04452', '#F5A623', '#7C3AED', '#1FA463', '#FF7A45', '#00B8D9', '#8B95A1'];

function useKstDayNow() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let timerId;
    const schedule = () => {
      timerId = window.setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, msUntilNextKstDay());
    };

    schedule();
    return () => window.clearTimeout(timerId);
  }, []);

  return now;
}

export function Portfolio() {
  const { state, navigate, kisLoading } = useStore();
  const { t } = useLocale();
  const { won, signPct, signNum, qtyShares } = useTradingFormat();
  const p = usePortfolio();
  const [subtab, setSubtab] = useState('holdings');
  if (!state.isLoggedIn) return <PageShell title={t('trading.portfolio.title')}><LoginGate /></PageShell>;
  const loading = kisLoading.portfolio && state.holdings.length === 0 && state.trades.length === 0;

  const slices = [
    ...p.rows.map((r, i) => ({ label: displayStockName(r.stock), value: r.eval, color: DONUT_COLORS[i % DONUT_COLORS.length] })),
    { label: t('trading.portfolio.cash'), value: p.cash, color: '#C5CBD3' },
  ].sort((a, b) => b.value - a.value);
  const totalForPct = p.totalEval + p.cash || 1;

  return (
    <PageShell title={t('trading.portfolio.title')} sub={t('trading.portfolio.sub', { count: p.rows.length })}
      right={<button onClick={() => navigate('funds')} style={ghostBtn}>{t('trading.portfolio.manageFunds')}</button>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>
        {/* summary */}
        <Card>
          <div style={{ fontSize: 14, color: SUB, marginBottom: 6 }}>{t('trading.portfolio.totalAssets')}</div>
          {loading ? <Skeleton width={220} height={40} style={{ margin: '8px 0' }} /> : <div style={{ fontSize: 36, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{won(p.assets)}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            {loading ? (
              <Skeleton width={170} height={18} />
            ) : (
              <>
                <span style={{ fontSize: 17, fontWeight: 800, color: tone(p.totalPnl) }}>
                  {(p.totalPnl > 0 ? '+' : '') + won(p.totalPnl)} ({signPct(p.totalPnlPct)})
                </span>
                <span style={{ fontSize: 13, color: SUB }}>{t('trading.portfolio.unrealizedPnl')}</span>
              </>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid #F2F4F6' }}>
            {loading ? <MetricSkeleton count={3} /> : (
              <>
                <Metric label={t('trading.portfolio.buyAmount')} value={won(p.totalCost)} />
                <Metric label={t('trading.portfolio.evalAmount')} value={won(p.totalEval)} />
                <Metric label={t('trading.portfolio.availableCash')} value={won(p.cash)} />
              </>
            )}
          </div>
        </Card>
        {/* donut */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 14 }}>{t('trading.portfolio.allocation')}</div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Skeleton width={140} height={140} radius={70} />
              <div style={{ flex: 1 }}><SkeletonText lines={5} widths={['90%', '78%', '84%', '68%', '72%']} height={13} gap={11} /></div>
            </div>
          ) : slices.length > 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '0 0 140px' }}>
                <Donut slices={slices} size={140} thickness={26} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 11, color: SUB }}>{t('trading.format.stockCount')}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: INK }}>{p.rows.length}</div>
                </div>
              </div>
              <div style={{ flex: '1 1 150px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slices.slice(0, 5).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <span style={{ color: SUB, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: INK, flexShrink: 0 }}>{((s.value / totalForPct) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ fontSize: 14, color: SUB, padding: '20px 0' }}>{t('trading.format.cash100')}</div>}
        </Card>
      </div>

      {/* sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[['holdings', t('trading.portfolio.subtabHoldings')], ['trades', t('trading.portfolio.subtabTrades')]].map(([k, l]) => (
          <button key={k} onClick={() => setSubtab(k)} style={{ height: 40, padding: '0 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, background: subtab === k ? INK : 'var(--trading-muted-bg, #F2F4F6)', color: subtab === k ? 'var(--trading-bg, #fff)' : SUB }}>{l}</button>
        ))}
      </div>

      {loading ? <HoldingsTableSkeleton /> : subtab === 'trades' ? <TradesTable /> : (
      <>
      {/* holdings list */}
      {p.rows.length === 0 ? <Empty text={t('trading.portfolio.emptyHoldings')} cta={t('trading.portfolio.browseStocks')} onCta={() => navigate('home')} /> : (
        <Card style={{ padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 1.1fr', gap: 8, padding: '12px 16px', fontSize: 13, color: SUB, fontWeight: 600 }}>
            <span>{t('trading.portfolio.colStock')}</span><span style={{ textAlign: 'right' }}>{t('trading.portfolio.colQty')}</span><span style={{ textAlign: 'right' }}>{t('trading.portfolio.colAvgPrice')}</span>
            <span style={{ textAlign: 'right' }}>{t('trading.portfolio.colEval')}</span><span style={{ textAlign: 'right' }}>{t('trading.portfolio.colPnl')}</span>
          </div>
          {p.rows.map(r => (
            <div key={r.code} onClick={() => navigate('detail', { code: r.code })}
              style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 1.1fr', gap: 8, padding: '14px 16px', alignItems: 'center', borderRadius: 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--trading-row-hover, #F9FAFB)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar stock={r.stock} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayStockName(r.stock)}</div>
                  <div style={{ fontSize: 13, color: tone(r.stock.pct) }}>{won(r.stock.price)} {signPct(r.stock.pct)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 600, color: INK }}>{qtyShares(r.qty)}</div>
              <div style={{ textAlign: 'right', fontSize: 15, color: SUB }}>{won(r.avgPrice)}</div>
              <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: INK }}>{won(r.eval)}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: tone(r.pnl) }}>{signNum(r.pnl)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: tone(r.pnl) }}>{signPct(r.pnlPct)}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
      </>)}
    </PageShell>
  );
}
function LoginGate() {
  const { goToLogin } = useStore();
  const { t } = useLocale();
  return <Empty text={t('trading.portfolio.loginGate')} cta={t('trading.portfolio.login')} onCta={goToLogin} />;
}

// ---------- 관심 종목 ----------
export function Watchlist() {
  const { state, getStock, navigate, toggleWatch, kisLoading } = useStore();
  const { t } = useLocale();
  const { won, signPct, signNum } = useTradingFormat();
  const [sort, setSort] = useState('added'); // added | pct | name
  const rows = useMemo(() => {
    let arr = state.watchlist.map((code, i) => ({ stock: getStock(code), order: i })).filter(r => r.stock);
    if (sort === 'pct') arr.sort((a, b) => b.stock.pct - a.stock.pct);
    else if (sort === 'name') arr.sort((a, b) => displayStockName(a.stock).localeCompare(displayStockName(b.stock), 'ko'));
    else arr.sort((a, b) => a.order - b.order);
    return arr;
  }, [state.watchlist, sort, getStock]);

  if (!state.isLoggedIn) return <PageShell title={t('trading.watchlist.title')}><LoginGate /></PageShell>;
  const loading = (kisLoading.watchlist || kisLoading.summaries) && state.watchlist.length > 0 && rows.length === 0;

  return (
    <PageShell title={t('trading.watchlist.title')} sub={t('trading.watchlist.sub', { count: state.watchlist.length })}
      right={
        <div style={{ display: 'flex', gap: 6, background: 'var(--trading-muted-bg, #F2F4F6)', borderRadius: 10, padding: 4 }}>
          {[['added', t('trading.watchlist.sortAdded')], ['pct', t('trading.watchlist.sortPct')], ['name', t('trading.watchlist.sortName')]].map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: sort === k ? 'var(--trading-card, #fff)' : 'transparent', color: sort === k ? INK : SUB, boxShadow: sort === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>}>
      {loading ? <WatchlistSkeleton /> : rows.length === 0 ? <Empty text={t('trading.watchlist.empty')} cta={t('trading.watchlist.browse')} onCta={() => navigate('home')} /> : (
        <Card style={{ padding: 8 }}>
          {rows.map(({ stock: s }) => (
            <div key={s.code} onClick={() => navigate('detail', { code: s.code })}
              style={{ display: 'grid', gridTemplateColumns: '40px 1.6fr 1.2fr 1.4fr 44px', gap: 8, padding: '14px 12px', alignItems: 'center', borderRadius: 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--trading-row-hover, #F9FAFB)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Heart filled onClick={() => toggleWatch(s.code)} size={20} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar stock={s} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayStockName(s)}</div>
                  <div style={{ fontSize: 12, color: SUB }}>{s.sector}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, color: INK }}>{won(s.price)}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: tone(s.pct) }}>{signNum(s.changeAmt)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: tone(s.pct) }}>{signPct(s.pct)}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleWatch(s.code); }} style={{ ...iconBtn, width: 34, height: 34, color: SUB }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5CBD3" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          ))}
        </Card>
      )}
    </PageShell>
  );
}

function MetricSkeleton({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i}>
      <Skeleton width={70} height={13} style={{ marginBottom: 8 }} />
      <Skeleton width={104} height={18} />
    </div>
  ));
}

function HoldingsTableSkeleton({ count = 5 }) {
  return (
    <Card style={{ padding: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 1.1fr', gap: 8, padding: '12px 16px' }}>
        {['42%', '58%', '64%', '62%', '60%'].map((w, i) => <Skeleton key={i} width={w} height={13} style={{ justifySelf: i === 0 ? 'start' : 'end' }} />)}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 1.1fr', gap: 8, padding: '14px 16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton width={38} height={38} radius={19} />
            <div style={{ flex: 1 }}><SkeletonText lines={2} widths={['58%', '42%']} height={13} gap={7} /></div>
          </div>
          <Skeleton width={44} height={15} style={{ justifySelf: 'end' }} />
          <Skeleton width={72} height={15} style={{ justifySelf: 'end' }} />
          <Skeleton width={86} height={15} style={{ justifySelf: 'end' }} />
          <div style={{ justifySelf: 'end', width: 82 }}><SkeletonText lines={2} widths={['100%', '76%']} height={13} gap={6} /></div>
        </div>
      ))}
    </Card>
  );
}

function WatchlistSkeleton({ count = 6 }) {
  return (
    <Card style={{ padding: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1.6fr 1.2fr 1.4fr 44px', gap: 8, padding: '14px 12px', alignItems: 'center' }}>
          <Skeleton width={20} height={20} radius={10} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton width={38} height={38} radius={19} />
            <div style={{ flex: 1 }}><SkeletonText lines={2} widths={['62%', '42%']} height={13} gap={7} /></div>
          </div>
          <Skeleton width={82} height={16} style={{ justifySelf: 'end' }} />
          <div style={{ justifySelf: 'end', width: 86 }}><SkeletonText lines={2} widths={['100%', '68%']} height={13} gap={6} /></div>
          <Skeleton width={34} height={34} radius={10} />
        </div>
      ))}
    </Card>
  );
}

// ---------- 모의 자금 관리 ----------
export function Funds() {
  const { state, chargeFunds, resetFunds, navigate } = useStore();
  const { t } = useLocale();
  const { won } = useTradingFormat();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const f = state.funds;
  const p = usePortfolio();
  const remainCharge = 3 - f.chargeCountToday;
  if (!state.isLoggedIn) return <PageShell title={t('trading.funds.title')}><LoginGate /></PageShell>;

  return (
    <PageShell title={t('trading.funds.manageTitle')} sub={t('trading.funds.sub')}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ fontSize: 14, color: SUB, marginBottom: 6 }}>{t('trading.funds.availableCash')}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{won(f.cashBalance)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid #F2F4F6' }}>
              <Metric label={t('trading.funds.initialAmount')} value={won(f.initialAmount)} />
              <Metric label={t('trading.funds.totalAssets')} value={won(p.assets)} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setChargeOpen(true)} disabled={remainCharge <= 0}
                style={{ flex: 1, height: 52, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 800, cursor: remainCharge > 0 ? 'pointer' : 'not-allowed',
                  background: remainCharge > 0 ? BRAND : '#E5E8EB', color: remainCharge > 0 ? '#fff' : '#B0B8C1' }}>
                {t('trading.format.chargeRemain', { remain: remainCharge > 0 ? t('trading.format.chargeRemainToday', { n: remainCharge }) : t('trading.format.chargeExhausted') })}
              </button>
              <button onClick={() => setResetOpen(true)} style={{ flex: '0 0 auto', height: 52, padding: '0 22px', borderRadius: 14, border: '1px solid #FFD9DC', background: '#FFF5F6', color: UP, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>{t('trading.funds.reset')}</button>
            </div>
            <div style={{ fontSize: 12, color: SUB, marginTop: 12, lineHeight: 1.5 }}>{t('trading.funds.footnote')}</div>
          </Card>

          <Card style={{ padding: 8 }}>
            <div style={{ padding: '14px 16px', fontSize: 16, fontWeight: 800, color: INK }}>{t('trading.funds.history')}</div>
            {state.fundHistory.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid #F6F8FA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
                    background: h.type === 'CHARGE' ? '#EFF5FF' : h.type === 'RESET' ? '#FFF5F6' : '#F2F4F6', color: h.type === 'CHARGE' ? DOWN : h.type === 'RESET' ? UP : SUB }}>
                    {h.type === 'CHARGE' ? t('trading.funds.chargeType') : h.type === 'RESET' ? t('trading.funds.resetType') : t('trading.funds.setupType')}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{h.type === 'CHARGE' ? t('trading.funds.chargeLabel') : h.type === 'RESET' ? t('trading.funds.resetLabel') : t('trading.funds.setupLabel')}</div>
                    <div style={{ fontSize: 12, color: SUB }}>{dateLabel(h.ts)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: h.type === 'RESET' ? SUB : DOWN }}>{h.type === 'RESET' ? '' : '+'}{won(h.amount)}</div>
              </div>
            ))}
          </Card>
        </div>

        <Card style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--trading-brand, #1B64DA) 10%, var(--trading-card, #fff)), var(--trading-card, #fff))', alignSelf: 'start' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 14 }}>{t('trading.funds.guideTitle')}</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              t('trading.funds.guideInitial'),
              t('trading.funds.guideCharge'),
              t('trading.funds.guideReset'),
              t('trading.funds.guideExecution'),
            ].map(([t, d], i) => (
              <li key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: BRAND, fontWeight: 800 }}>✦</span>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{t}</div><div style={{ fontSize: 13, color: SUB, marginTop: 2, lineHeight: 1.5 }}>{d}</div></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {chargeOpen && <ChargeModal onClose={() => setChargeOpen(false)} onCharge={chargeFunds} />}
      {resetOpen && <ResetModal onClose={() => setResetOpen(false)} onReset={() => { resetFunds(); setResetOpen(false); }} />}
    </PageShell>
  );
}

function ChargeModal({ onClose, onCharge }) {
  const { t } = useLocale();
  const { won } = useTradingFormat();
  const [amt, setAmt] = useState(1000000);
  const presets = [500000, 1000000, 3000000, 5000000];
  return (
    <Modal onClose={onClose} width={420}>
      <div style={{ padding: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 6 }}>{t('trading.funds.chargeModalTitle')}</div>
        <div style={{ fontSize: 14, color: SUB, marginBottom: 22 }}>{t('trading.funds.chargeModalSub')}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: BRAND, textAlign: 'center', marginBottom: 20 }}>{won(amt)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmt(p)} style={{ height: 48, borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700,
              border: '1px solid ' + (amt === p ? BRAND : '#E5E8EB'), background: amt === p ? '#EFF5FF' : '#fff', color: amt === p ? BRAND : '#4E5968' }}>
              {t('trading.format.chargePresetMan', { n: (p / 10000).toLocaleString() })}
            </button>
          ))}
        </div>
        <button onClick={() => { onCharge(amt); onClose(); }} style={{ ...primaryBtn, width: '100%', height: 52 }}>{t('trading.funds.chargeSubmit', { amount: won(amt) })}</button>
      </div>
    </Modal>
  );
}
function ResetModal({ onClose, onReset }) {
  const { t } = useLocale();
  const [step, setStep] = useState(1);
  const [confirm, setConfirm] = useState('');
  const confirmWord = t('trading.funds.resetConfirmWord');
  return (
    <Modal onClose={onClose} width={420}>
      <div style={{ padding: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF5F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={UP} strokeWidth="2.2"><path d="M12 9v4M12 17h.01M10.3 4.3L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: INK, textAlign: 'center', marginBottom: 10 }}>{t('trading.funds.resetModalTitle')}</div>
        {step === 1 ? (
          <>
            <div style={{ fontSize: 14, color: '#4E5968', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              <span dangerouslySetInnerHTML={{ __html: t('trading.funds.resetModalBody') }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ ...ghostBtn, flex: 1, height: 52 }}>{t('trading.funds.cancel')}</button>
              <button onClick={() => setStep(2)} style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', background: UP, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>{t('trading.funds.continue')}</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: SUB, textAlign: 'center', marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: t('trading.funds.resetModalConfirm', { word: confirmWord }) }} />
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('trading.funds.resetModalPlaceholder')}
              style={{ width: '100%', height: 50, border: '1px solid #E5E8EB', borderRadius: 12, padding: '0 16px', fontSize: 16, textAlign: 'center', marginBottom: 20, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ ...ghostBtn, flex: 1, height: 52 }}>{t('trading.funds.cancel')}</button>
              <button onClick={onReset} disabled={confirm !== confirmWord} style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', cursor: confirm === confirmWord ? 'pointer' : 'not-allowed',
                background: confirm === confirmWord ? UP : '#E5E8EB', color: confirm === confirmWord ? '#fff' : '#B0B8C1', fontSize: 16, fontWeight: 800 }}>{t('trading.funds.resetSubmit')}</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ---------- 체결 내역 ----------
function TradesTable() {
  const { state, getStock, navigate } = useStore();
  const { t: tr } = useLocale();
  const { won, signNum, qtyShares } = useTradingFormat();
  const [filter, setFilter] = useState('ALL');
  const holdDayNow = useKstDayNow();
  const rows = state.trades.filter(t => filter === 'ALL' || t.type === filter);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 15, color: SUB }}>{tr('trading.trades.total', { n: state.trades.length })}</span>
        <div style={{ display: 'flex', gap: 6, background: 'var(--trading-muted-bg, #F2F4F6)', borderRadius: 10, padding: 4 }}>
          {[['ALL', tr('trading.trades.filterAll')], ['BUY', tr('trading.trades.filterBuy')], ['SELL', tr('trading.trades.filterSell')]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: filter === k ? 'var(--trading-card, #fff)' : 'transparent', color: filter === k ? INK : SUB, boxShadow: filter === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? <Empty text={tr('trading.trades.empty')} cta={tr('trading.trades.browse')} onCta={() => navigate('home')} /> : (
        <Card style={{ padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1.6fr 1fr 1fr 1.1fr 0.8fr 1fr', gap: 8, padding: '12px 16px', fontSize: 13, color: SUB, fontWeight: 600 }}>
            <span>{tr('trading.trades.colDate')}</span><span>{tr('trading.trades.colStock')}</span><span style={{ textAlign: 'right' }}>{tr('trading.trades.colSide')}</span><span style={{ textAlign: 'right' }}>{tr('trading.trades.colPrice')}</span>
            <span style={{ textAlign: 'right' }}>{tr('trading.trades.colQty')}</span><span style={{ textAlign: 'right' }}>{tr('trading.trades.colHoldDays')}</span><span style={{ textAlign: 'right' }}>{tr('trading.trades.colRealizedPnl')}</span>
          </div>
          {rows.map(t => {
            const s = getStock(t.code);
            const isBuy = t.type === 'BUY';
            const holdDays = resolveTradeHoldDays(t, holdDayNow);
            return (
              <div key={t.id} onClick={() => navigate('detail', { code: t.code })}
                style={{ display: 'grid', gridTemplateColumns: '100px 1.6fr 1fr 1fr 1.1fr 0.8fr 1fr', gap: 8, padding: '14px 16px', alignItems: 'center', borderRadius: 12, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--trading-row-hover, #F9FAFB)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 14, color: SUB }}>{dateLabel(t.ts)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar stock={s} size={32} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayStockName(s)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 8, color: isBuy ? UP : DOWN, background: isBuy ? '#FEF0F1' : '#EFF5FF' }}>{isBuy ? tr('trading.trades.buy') : tr('trading.trades.sell')}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 15, color: INK }}>{won(t.price)}</div>
                <div style={{ textAlign: 'right', fontSize: 15, color: SUB }}>{qtyShares(t.qty)}</div>
                <div style={{ textAlign: 'right', fontSize: 15, color: SUB }}>{holdDays == null ? '-' : tr('trading.format.holdDays', { n: holdDays })}</div>
                <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: t.pnl == null ? SUB : tone(t.pnl) }}>{t.pnl == null ? '-' : signNum(t.pnl)}</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

export function Trades() {
  const { state } = useStore();
  const { t } = useLocale();
  if (!state.isLoggedIn) return <PageShell title={t('trading.trades.title')}><LoginGate /></PageShell>;
  return <PageShell title={t('trading.trades.title')}><TradesTable /></PageShell>;
}

Object.assign(window, { Portfolio, Watchlist, Funds, Trades, PageShell, Empty, LoginGate, Metric, usePortfolio });
