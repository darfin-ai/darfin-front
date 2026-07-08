import { useState, useMemo } from 'react';
import { useStore } from '../store/store.jsx';
import {
  won, wonShort, signPct, signNum, dateLabel,
  Avatar, Donut, Card, Modal, Heart,
  PageShell, Empty, Metric, Skeleton, SkeletonText, displayStockName,
  LoginGate, SegmentedControl,
  BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST,
  PRICE_UP, PRICE_DOWN, priceToneClass, INPUT,
  META, ROW_HOVER, BG_PRICE_UP, BG_PRICE_DOWN,
} from '../components/ui.jsx';
import { SECTION_TITLE, ROW_DIVIDER, BTN_DANGER_GHOST } from '../../../shared/lib/uiRecipes';

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

const PORTFOLIO_SUBTABS = [
  { value: 'holdings', label: '보유 주식' },
  { value: 'trades', label: '체결 내역' },
];

const WATCHLIST_SORT_OPTIONS = [
  { value: 'added', label: '추가일순' },
  { value: 'pct', label: '등락률순' },
  { value: 'name', label: '종목명순' },
];

const TRADE_FILTER_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'BUY', label: '매수' },
  { value: 'SELL', label: '매도' },
];

export function Portfolio() {
  const { state, navigate, kisLoading } = useStore();
  const p = usePortfolio();
  const [subtab, setSubtab] = useState('holdings');
  if (!state.isLoggedIn) return <PageShell title="내 주식"><LoginGate /></PageShell>;
  const loading = kisLoading.portfolio && state.holdings.length === 0 && state.trades.length === 0;

  const slices = [
    ...p.rows.map((r, i) => ({ label: displayStockName(r.stock), value: r.eval, color: DONUT_COLORS[i % DONUT_COLORS.length] })),
    { label: '현금', value: p.cash, color: '#C5CBD3' },
  ].sort((a, b) => b.value - a.value);
  const totalForPct = p.totalEval + p.cash || 1;

  return (
    <PageShell title="내 주식" sub={`보유 ${p.rows.length}종목 · 모의투자 계좌`}
      right={<button type="button" onClick={() => navigate('funds')} className={BTN_SECONDARY}>자금 관리</button>}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 mb-5">
        {/* summary */}
        <Card>
          <div className={`text-sm ${META} mb-1.5`}>총 자산</div>
          {loading ? <Skeleton width={220} height={40} style={{ margin: '8px 0' }} /> : (
            <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">{won(p.assets)}</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {loading ? (
              <Skeleton width={170} height={18} />
            ) : (
              <>
                <span className={`text-lg font-extrabold tabular-nums ${priceToneClass(p.totalPnl)}`}>
                  {signNum(p.totalPnl)}원 ({signPct(p.totalPnlPct)})
                </span>
                <span className={`text-sm ${META}`}>평가손익</span>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            {loading ? <MetricSkeleton count={3} /> : (
              <>
                <Metric label="매수 금액" value={won(p.totalCost)} />
                <Metric label="평가 금액" value={won(p.totalEval)} />
                <Metric label="주문 가능 현금" value={won(p.cash)} />
              </>
            )}
          </div>
        </Card>
        {/* donut */}
        <Card>
          <div className={`${SECTION_TITLE} mb-3.5`}>종목별 비중</div>
          {loading ? (
            <div className="flex items-center gap-[18px]">
              <Skeleton width={140} height={140} radius={70} />
              <div className="flex-1"><SkeletonText lines={5} widths={['90%', '78%', '84%', '68%', '72%']} height={13} gap={11} /></div>
            </div>
          ) : slices.length > 1 ? (
            <div className="flex items-center gap-[18px]">
              <div className="relative">
                <Donut slices={slices} size={140} thickness={26} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-[11px] ${META}`}>종목수</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">{p.rows.length}</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {slices.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600 dark:text-slate-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{s.label}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{((s.value / totalForPct) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className={`text-sm ${META} py-5`}>현금 100%</div>}
        </Card>
      </div>

      {/* sub-tabs */}
      <SegmentedControl
        options={PORTFOLIO_SUBTABS}
        value={subtab}
        onChange={setSubtab}
        className="mb-[18px] max-w-xs text-sm"
      />

      {loading ? <HoldingsTableSkeleton /> : subtab === 'trades' ? <TradesTable /> : (
      <>
      {/* holdings list */}
      {p.rows.length === 0 ? <Empty text="보유 중인 주식이 없어요. 종목을 매수해보세요." cta="종목 둘러보기" onCta={() => navigate('home')} /> : (
        <Card className="!p-2">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1.1fr] gap-2 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            <span>종목</span><span className="text-right">보유수량</span><span className="text-right">평균매수가</span>
            <span className="text-right">평가금액</span><span className="text-right">평가손익</span>
          </div>
          {p.rows.map(r => (
            <div key={r.code} onClick={() => navigate('detail', { code: r.code })}
              className={`grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1.1fr] gap-2 px-4 py-3.5 items-center rounded-xl ${ROW_HOVER}`}>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar stock={r.stock} size={38} />
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">{displayStockName(r.stock)}</div>
                  <div className={`text-sm tabular-nums ${priceToneClass(r.stock.pct)}`}>{won(r.stock.price)} {signPct(r.stock.pct)}</div>
                </div>
              </div>
              <div className="text-right text-[15px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{r.qty}주</div>
              <div className="text-right text-[15px] text-slate-600 dark:text-slate-400 tabular-nums">{won(r.avgPrice)}</div>
              <div className="text-right text-[15px] font-bold text-slate-900 dark:text-slate-100 tabular-nums">{won(r.eval)}</div>
              <div className="text-right tabular-nums">
                <div className={`text-[15px] font-bold ${priceToneClass(r.pnl)}`}>{signNum(r.pnl)}</div>
                <div className={`text-sm font-bold ${priceToneClass(r.pnl)}`}>{signPct(r.pnlPct)}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
      </>)}
    </PageShell>
  );
}

// ---------- 관심 종목 ----------
export function Watchlist() {
  const { state, getStock, navigate, toggleWatch, kisLoading } = useStore();
  const [sort, setSort] = useState('added'); // added | pct | name
  const rows = useMemo(() => {
    let arr = state.watchlist.map((code, i) => ({ stock: getStock(code), order: i })).filter(r => r.stock);
    if (sort === 'pct') arr.sort((a, b) => b.stock.pct - a.stock.pct);
    else if (sort === 'name') arr.sort((a, b) => displayStockName(a.stock).localeCompare(displayStockName(b.stock), 'ko'));
    else arr.sort((a, b) => a.order - b.order);
    return arr;
  }, [state.watchlist, sort, getStock]);

  if (!state.isLoggedIn) return <PageShell title="관심 종목"><LoginGate /></PageShell>;
  const loading = (kisLoading.watchlist || kisLoading.summaries) && state.watchlist.length > 0 && rows.length === 0;

  return (
    <PageShell title="관심 종목" sub={`${state.watchlist.length} / 30 종목 · 현재가·등락률은 오늘 14:09 기준`}
      right={
        <SegmentedControl
          options={WATCHLIST_SORT_OPTIONS}
          value={sort}
          onChange={setSort}
        />
      }>
      {loading ? <WatchlistSkeleton /> : rows.length === 0 ? <Empty text="관심 종목이 없어요. 종목 옆 하트를 눌러 담아보세요." cta="종목 둘러보기" onCta={() => navigate('home')} /> : (
        <Card className="!p-2">
          {rows.map(({ stock: s }) => (
            <div key={s.code} onClick={() => navigate('detail', { code: s.code })}
              className={`grid grid-cols-[40px_1.6fr_1.2fr_1.4fr_44px] gap-2 px-3 py-3.5 items-center rounded-xl ${ROW_HOVER}`}>
              <Heart filled onClick={() => toggleWatch(s.code)} size={20} />
              <div className="flex items-center gap-3 min-w-0">
                <Avatar stock={s} size={38} />
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">{displayStockName(s)}</div>
                  <div className={`text-xs ${META}`}>{s.sector}</div>
                </div>
              </div>
              <div className="text-right text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{won(s.price)}</div>
              <div className="text-right tabular-nums">
                <div className={`text-[15px] font-bold ${priceToneClass(s.pct)}`}>{signNum(s.changeAmt)}</div>
                <div className={`text-sm font-bold ${priceToneClass(s.pct)}`}>{signPct(s.pct)}</div>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleWatch(s.code); }}
                className={`${BTN_GHOST} w-[34px] h-[34px] p-0`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-300 dark:text-slate-600"><path d="M6 6l12 12M18 6L6 18" /></svg>
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
    <Card className="!p-2">
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1.1fr] gap-2 px-4 py-3">
        {['42%', '58%', '64%', '62%', '60%'].map((w, i) => <Skeleton key={i} width={w} height={13} style={{ justifySelf: i === 0 ? 'start' : 'end' }} />)}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1.1fr] gap-2 px-4 py-3.5 items-center">
          <div className="flex items-center gap-3">
            <Skeleton width={38} height={38} radius={19} />
            <div className="flex-1"><SkeletonText lines={2} widths={['58%', '42%']} height={13} gap={7} /></div>
          </div>
          <Skeleton width={44} height={15} style={{ justifySelf: 'end' }} />
          <Skeleton width={72} height={15} style={{ justifySelf: 'end' }} />
          <Skeleton width={86} height={15} style={{ justifySelf: 'end' }} />
          <div className="justify-self-end w-[82px]"><SkeletonText lines={2} widths={['100%', '76%']} height={13} gap={6} /></div>
        </div>
      ))}
    </Card>
  );
}

function WatchlistSkeleton({ count = 6 }) {
  return (
    <Card className="!p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid grid-cols-[40px_1.6fr_1.2fr_1.4fr_44px] gap-2 px-3 py-3.5 items-center">
          <Skeleton width={20} height={20} radius={10} />
          <div className="flex items-center gap-3">
            <Skeleton width={38} height={38} radius={19} />
            <div className="flex-1"><SkeletonText lines={2} widths={['62%', '42%']} height={13} gap={7} /></div>
          </div>
          <Skeleton width={82} height={16} style={{ justifySelf: 'end' }} />
          <div className="justify-self-end w-[86px]"><SkeletonText lines={2} widths={['100%', '68%']} height={13} gap={6} /></div>
          <Skeleton width={34} height={34} radius={10} />
        </div>
      ))}
    </Card>
  );
}

// ---------- 모의 자금 관리 ----------
export function Funds() {
  const { state, chargeFunds, resetFunds } = useStore();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const f = state.funds;
  const p = usePortfolio();
  const remainCharge = 3 - f.chargeCountToday;
  if (!state.isLoggedIn) return <PageShell title="모의 자금"><LoginGate /></PageShell>;

  return (
    <PageShell title="모의 자금 관리" sub="모의투자 계좌의 자금을 설정하고 관리해요">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        <div className="flex flex-col gap-5">
          <Card>
            <div className={`text-sm ${META} mb-1.5`}>주문 가능 현금</div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">{won(f.cashBalance)}</div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Metric label="초기 설정 자금" value={won(f.initialAmount)} />
              <Metric label="총 평가 자산" value={won(p.assets)} />
            </div>
            <div className="flex gap-2.5 mt-6">
              <button type="button" onClick={() => setChargeOpen(true)} disabled={remainCharge <= 0}
                className={`${BTN_PRIMARY} flex-1 h-[52px] text-base font-extrabold`}>
                자금 충전 {remainCharge > 0 ? `(오늘 ${remainCharge}회 남음)` : '(오늘 소진)'}
              </button>
              <button type="button" onClick={() => setResetOpen(true)}
                className={`${BTN_DANGER_GHOST} shrink-0 h-[52px] px-5 text-base font-extrabold border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 ${PRICE_UP}`}>
                자금 초기화
              </button>
            </div>
            <div className={`text-xs ${META} mt-3 leading-relaxed`}>· 자금 충전은 1일 3회까지 가능해요. · 초기화 시 보유 주식과 체결 내역이 모두 삭제되며 복구할 수 없어요. (AI 분석 이력은 보존)</div>
          </Card>

          <Card className="!p-2">
            <div className={`px-4 py-3.5 ${SECTION_TITLE}`}>자금 이력</div>
            <div className={ROW_DIVIDER}>
              {state.fundHistory.map(h => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-[13px] font-extrabold ${
                      h.type === 'CHARGE' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400'
                        : h.type === 'RESET' ? `${BG_PRICE_UP} ${PRICE_UP}`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {h.type === 'CHARGE' ? '충전' : h.type === 'RESET' ? '초기' : '설정'}
                    </span>
                    <div>
                      <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{h.type === 'CHARGE' ? '자금 충전' : h.type === 'RESET' ? '자금 초기화' : '초기 자금 설정'}</div>
                      <div className={`text-xs ${META}`}>{dateLabel(h.ts)}</div>
                    </div>
                  </div>
                  <div className={`text-base font-bold tabular-nums ${h.type === 'RESET' ? 'text-slate-500 dark:text-slate-400' : PRICE_DOWN}`}>
                    {h.type === 'RESET' ? '' : '+'}{won(h.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 self-start">
          <div className={`${SECTION_TITLE} mb-3.5`}>모의투자 안내</div>
          <ul className="list-none flex flex-col gap-3.5">
            {[
              ['초기 자금', '최초 1회만 설정 가능하며, 이후 변경할 수 없어요.'],
              ['자금 충전', '1일 3회, 충전 한도 내에서 현금을 추가할 수 있어요.'],
              ['자금 초기화', '이중 확인 후 진행되며 복구가 불가능해요.'],
              ['체결 방식', '모든 주문은 KIS 현재가 기준으로 즉시 체결돼요.'],
            ].map(([t, d], i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">✦</span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{t}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</div>
                </div>
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
  const [amt, setAmt] = useState(1000000);
  const presets = [500000, 1000000, 3000000, 5000000];
  return (
    <Modal onClose={onClose} width={420}>
      <div className="p-7">
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">자금 충전</div>
        <div className={`text-sm ${META} mb-5`}>충전할 금액을 선택하세요. (1일 3회 제한)</div>
        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 text-center mb-5 tabular-nums">{won(amt)}</div>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {presets.map(p => (
            <button key={p} type="button" onClick={() => setAmt(p)}
              className={`h-12 rounded-xl cursor-pointer text-[15px] font-bold transition-colors ${
                amt === p
                  ? 'border border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              +{(p / 10000).toLocaleString()}만원
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { onCharge(amt); onClose(); }} className={`${BTN_PRIMARY} w-full h-[52px] text-base`}>
          {won(amt)} 충전하기
        </button>
      </div>
    </Modal>
  );
}

function ResetModal({ onClose, onReset }) {
  const [step, setStep] = useState(1);
  const [confirm, setConfirm] = useState('');
  return (
    <Modal onClose={onClose} width={420}>
      <div className="p-7">
        <div className={`w-14 h-14 rounded-full ${BG_PRICE_UP} flex items-center justify-center mx-auto mb-4`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={PRICE_UP} stroke="currentColor" strokeWidth="2.2"><path d="M12 9v4M12 17h.01M10.3 4.3L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-2.5">정말 초기화할까요?</div>
        {step === 1 ? (
          <>
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-6">
              보유 주식, 체결 내역, 현금이 모두 초기 상태로 돌아가요.<br /><b className={PRICE_UP}>복구할 수 없어요.</b> (AI 분석 이력은 보존)
            </div>
            <div className="flex gap-2.5">
              <button type="button" onClick={onClose} className={`${BTN_SECONDARY} flex-1 h-[52px] text-base`}>취소</button>
              <button type="button" onClick={() => setStep(2)}
                className={`flex-1 h-[52px] rounded-xl border-none bg-red-500 hover:bg-red-600 text-white text-base font-extrabold cursor-pointer transition-colors`}>
                계속
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center mb-3.5">
              확인을 위해 <b className="text-slate-900 dark:text-slate-100">초기화</b>를 입력하세요.
            </div>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="초기화"
              className={`${INPUT} h-[50px] text-base text-center mb-5`} />
            <div className="flex gap-2.5">
              <button type="button" onClick={onClose} className={`${BTN_SECONDARY} flex-1 h-[52px] text-base`}>취소</button>
              <button type="button" onClick={onReset} disabled={confirm !== '초기화'}
                className={`flex-1 h-[52px] rounded-xl border-none text-base font-extrabold transition-colors ${
                  confirm === '초기화'
                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}>
                초기화
              </button>
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
  const [filter, setFilter] = useState('ALL');
  const rows = state.trades.filter(t => filter === 'ALL' || t.type === filter);
  return (
    <div>
      <div className="flex justify-between items-center mb-3.5">
        <span className={`text-[15px] ${META}`}>총 {state.trades.length}건</span>
        <SegmentedControl
          options={TRADE_FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
      </div>
      {rows.length === 0 ? <Empty text="체결 내역이 없어요." cta="종목 둘러보기" onCta={() => navigate('home')} /> : (
        <Card className="!p-2">
          <div className="grid grid-cols-[100px_1.6fr_1fr_1fr_1.1fr_0.8fr_1fr] gap-2 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            <span>날짜</span><span>종목</span><span className="text-right">구분</span><span className="text-right">체결가</span>
            <span className="text-right">수량</span><span className="text-right">보유일</span><span className="text-right">실현손익</span>
          </div>
          {rows.map(t => {
            const s = getStock(t.code);
            const isBuy = t.type === 'BUY';
            return (
              <div key={t.id} onClick={() => navigate('detail', { code: t.code })}
                className={`grid grid-cols-[100px_1.6fr_1fr_1fr_1.1fr_0.8fr_1fr] gap-2 px-4 py-3.5 items-center rounded-xl ${ROW_HOVER}`}>
                <span className="text-sm text-slate-600 dark:text-slate-400">{dateLabel(t.ts)}</span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar stock={s} size={32} />
                  <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">{displayStockName(s)}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[13px] font-extrabold px-2.5 py-1 rounded-lg ${isBuy ? `${PRICE_UP} ${BG_PRICE_UP}` : `${PRICE_DOWN} ${BG_PRICE_DOWN}`}`}>
                    {isBuy ? '매수' : '매도'}
                  </span>
                </div>
                <div className="text-right text-[15px] text-slate-900 dark:text-slate-100 tabular-nums">{won(t.price)}</div>
                <div className="text-right text-[15px] text-slate-600 dark:text-slate-400 tabular-nums">{t.qty}주</div>
                <div className="text-right text-[15px] text-slate-600 dark:text-slate-400 tabular-nums">{isBuy || t.holdDays == null ? '-' : `${t.holdDays}일`}</div>
                <div className={`text-right text-[15px] font-bold tabular-nums ${t.pnl == null ? 'text-slate-500 dark:text-slate-400' : priceToneClass(t.pnl)}`}>
                  {t.pnl == null ? '-' : signNum(t.pnl)}
                </div>
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
  if (!state.isLoggedIn) return <PageShell title="체결 내역"><LoginGate /></PageShell>;
  return <PageShell title="체결 내역"><TradesTable /></PageShell>;
}

Object.assign(window, { Portfolio, Watchlist, Funds, Trades, PageShell, Empty, LoginGate, Metric, usePortfolio });
