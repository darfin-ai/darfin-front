import { useState, useMemo } from 'react';
import { useStore } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone, dateLabel,
  Avatar, Donut, Card, Modal, ghostBtn, primaryBtn, iconBtn, Heart,
  PageShell, Empty, Metric,
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
      const stock = s ? { ...s, price, pct } : { code: h.code, name: h.name || h.code, short: h.short || h.name || h.code, price, pct };
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

export function Portfolio() {
  const { state, navigate } = useStore();
  const p = usePortfolio();
  const [subtab, setSubtab] = useState('holdings');
  if (!state.isLoggedIn) return <PageShell title="내 주식"><LoginGate /></PageShell>;

  const slices = [
    ...p.rows.map((r, i) => ({ label: r.stock.short || r.stock.name, value: r.eval, color: DONUT_COLORS[i % DONUT_COLORS.length] })),
    { label: '현금', value: p.cash, color: '#C5CBD3' },
  ].sort((a, b) => b.value - a.value);
  const totalForPct = p.totalEval + p.cash || 1;

  return (
    <PageShell title="내 주식" sub={`보유 ${p.rows.length}종목 · 모의투자 계좌`}
      right={<button onClick={() => navigate('funds')} style={ghostBtn}>자금 관리</button>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>
        {/* summary */}
        <Card>
          <div style={{ fontSize: 14, color: SUB, marginBottom: 6 }}>총 자산</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{won(p.assets)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: tone(p.totalPnl) }}>
              {signNum(p.totalPnl)}원 ({signPct(p.totalPnlPct)})
            </span>
            <span style={{ fontSize: 13, color: SUB }}>평가손익</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid #F2F4F6' }}>
            <Metric label="매수 금액" value={won(p.totalCost)} />
            <Metric label="평가 금액" value={won(p.totalEval)} />
            <Metric label="주문 가능 현금" value={won(p.cash)} />
          </div>
        </Card>
        {/* donut */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 14 }}>종목별 비중</div>
          {slices.length > 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ position: 'relative' }}>
                <Donut slices={slices} size={140} thickness={26} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 11, color: SUB }}>종목수</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: INK }}>{p.rows.length}</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slices.slice(0, 5).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <span style={{ color: '#4E5968', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: INK }}>{((s.value / totalForPct) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ fontSize: 14, color: SUB, padding: '20px 0' }}>현금 100%</div>}
        </Card>
      </div>

      {/* sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[['holdings', '보유 주식'], ['trades', '체결 내역']].map(([k, l]) => (
          <button key={k} onClick={() => setSubtab(k)} style={{ height: 40, padding: '0 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, background: subtab === k ? INK : '#F2F4F6', color: subtab === k ? '#fff' : '#4E5968' }}>{l}</button>
        ))}
      </div>

      {subtab === 'trades' ? <TradesTable /> : (
      <>
      {/* holdings list */}
      {p.rows.length === 0 ? <Empty text="보유 중인 주식이 없어요. 종목을 매수해보세요." cta="종목 둘러보기" onCta={() => navigate('home')} /> : (
        <Card style={{ padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 1.1fr', gap: 8, padding: '12px 16px', fontSize: 13, color: SUB, fontWeight: 600 }}>
            <span>종목</span><span style={{ textAlign: 'right' }}>보유수량</span><span style={{ textAlign: 'right' }}>평균매수가</span>
            <span style={{ textAlign: 'right' }}>평가금액</span><span style={{ textAlign: 'right' }}>평가손익</span>
          </div>
          {p.rows.map(r => (
            <div key={r.code} onClick={() => navigate('detail', { code: r.code })}
              style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 1.1fr', gap: 8, padding: '14px 16px', alignItems: 'center', borderRadius: 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar stock={r.stock} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.stock.short || r.stock.name}</div>
                  <div style={{ fontSize: 13, color: tone(r.stock.pct) }}>{won(r.stock.price)} {signPct(r.stock.pct)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 600, color: INK }}>{r.qty}주</div>
              <div style={{ textAlign: 'right', fontSize: 15, color: '#4E5968' }}>{won(r.avgPrice)}</div>
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
  return <Empty text="로그인하면 내 모의투자 계좌를 볼 수 있어요." cta="로그인" onCta={goToLogin} />;
}

// ---------- 관심 종목 ----------
export function Watchlist() {
  const { state, getStock, navigate, toggleWatch } = useStore();
  const [sort, setSort] = useState('added'); // added | pct | name
  const rows = useMemo(() => {
    let arr = state.watchlist.map((code, i) => ({ stock: getStock(code), order: i })).filter(r => r.stock);
    if (sort === 'pct') arr.sort((a, b) => b.stock.pct - a.stock.pct);
    else if (sort === 'name') arr.sort((a, b) => a.stock.name.localeCompare(b.stock.name, 'ko'));
    else arr.sort((a, b) => a.order - b.order);
    return arr;
  }, [state.watchlist, sort, getStock]);

  if (!state.isLoggedIn) return <PageShell title="관심 종목"><LoginGate /></PageShell>;

  return (
    <PageShell title="관심 종목" sub={`${state.watchlist.length} / 30 종목 · 현재가·등락률은 오늘 14:09 기준`}
      right={
        <div style={{ display: 'flex', gap: 6, background: '#F2F4F6', borderRadius: 10, padding: 4 }}>
          {[['added', '추가일순'], ['pct', '등락률순'], ['name', '종목명순']].map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: sort === k ? '#fff' : 'transparent', color: sort === k ? INK : '#8B95A1', boxShadow: sort === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>}>
      {rows.length === 0 ? <Empty text="관심 종목이 없어요. 종목 옆 하트를 눌러 담아보세요." cta="종목 둘러보기" onCta={() => navigate('home')} /> : (
        <Card style={{ padding: 8 }}>
          {rows.map(({ stock: s }) => (
            <div key={s.code} onClick={() => navigate('detail', { code: s.code })}
              style={{ display: 'grid', gridTemplateColumns: '40px 1.6fr 1.2fr 1.4fr 44px', gap: 8, padding: '14px 12px', alignItems: 'center', borderRadius: 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Heart filled onClick={() => toggleWatch(s.code)} size={20} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar stock={s} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.short || s.name}</div>
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

// ---------- 모의 자금 관리 ----------
export function Funds() {
  const { state, chargeFunds, resetFunds, navigate } = useStore();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const f = state.funds;
  const p = usePortfolio();
  const remainCharge = 3 - f.chargeCountToday;
  if (!state.isLoggedIn) return <PageShell title="모의 자금"><LoginGate /></PageShell>;

  return (
    <PageShell title="모의 자금 관리" sub="모의투자 계좌의 자금을 설정하고 관리해요">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ fontSize: 14, color: SUB, marginBottom: 6 }}>주문 가능 현금</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{won(f.cashBalance)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid #F2F4F6' }}>
              <Metric label="초기 설정 자금" value={won(f.initialAmount)} />
              <Metric label="총 평가 자산" value={won(p.assets)} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setChargeOpen(true)} disabled={remainCharge <= 0}
                style={{ flex: 1, height: 52, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 800, cursor: remainCharge > 0 ? 'pointer' : 'not-allowed',
                  background: remainCharge > 0 ? BRAND : '#E5E8EB', color: remainCharge > 0 ? '#fff' : '#B0B8C1' }}>
                자금 충전 {remainCharge > 0 ? `(오늘 ${remainCharge}회 남음)` : '(오늘 소진)'}
              </button>
              <button onClick={() => setResetOpen(true)} style={{ flex: '0 0 auto', height: 52, padding: '0 22px', borderRadius: 14, border: '1px solid #FFD9DC', background: '#FFF5F6', color: UP, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>자금 초기화</button>
            </div>
            <div style={{ fontSize: 12, color: SUB, marginTop: 12, lineHeight: 1.5 }}>· 자금 충전은 1일 3회까지 가능해요. · 초기화 시 보유 주식과 체결 내역이 모두 삭제되며 복구할 수 없어요. (AI 분석 이력은 보존)</div>
          </Card>

          <Card style={{ padding: 8 }}>
            <div style={{ padding: '14px 16px', fontSize: 16, fontWeight: 800, color: INK }}>자금 이력</div>
            {state.fundHistory.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid #F6F8FA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
                    background: h.type === 'CHARGE' ? '#EFF5FF' : h.type === 'RESET' ? '#FFF5F6' : '#F2F4F6', color: h.type === 'CHARGE' ? DOWN : h.type === 'RESET' ? UP : SUB }}>
                    {h.type === 'CHARGE' ? '충전' : h.type === 'RESET' ? '초기' : '설정'}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{h.type === 'CHARGE' ? '자금 충전' : h.type === 'RESET' ? '자금 초기화' : '초기 자금 설정'}</div>
                    <div style={{ fontSize: 12, color: SUB }}>{dateLabel(h.ts)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: h.type === 'RESET' ? SUB : DOWN }}>{h.type === 'RESET' ? '' : '+'}{won(h.amount)}</div>
              </div>
            ))}
          </Card>
        </div>

        <Card style={{ background: 'linear-gradient(135deg,#F4F8FF,#fff)', alignSelf: 'start' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 14 }}>모의투자 안내</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['초기 자금', '최초 1회만 설정 가능하며, 이후 변경할 수 없어요.'],
              ['자금 충전', '1일 3회, 충전 한도 내에서 현금을 추가할 수 있어요.'],
              ['자금 초기화', '이중 확인 후 진행되며 복구가 불가능해요.'],
              ['체결 방식', '모든 주문은 KIS 현재가 기준으로 즉시 체결돼요.'],
            ].map(([t, d], i) => (
              <li key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: BRAND, fontWeight: 800 }}>✦</span>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{t}</div><div style={{ fontSize: 13, color: '#4E5968', marginTop: 2, lineHeight: 1.5 }}>{d}</div></div>
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
      <div style={{ padding: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 6 }}>자금 충전</div>
        <div style={{ fontSize: 14, color: SUB, marginBottom: 22 }}>충전할 금액을 선택하세요. (1일 3회 제한)</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: BRAND, textAlign: 'center', marginBottom: 20 }}>{won(amt)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmt(p)} style={{ height: 48, borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700,
              border: '1px solid ' + (amt === p ? BRAND : '#E5E8EB'), background: amt === p ? '#EFF5FF' : '#fff', color: amt === p ? BRAND : '#4E5968' }}>
              +{(p / 10000).toLocaleString()}만원
            </button>
          ))}
        </div>
        <button onClick={() => { onCharge(amt); onClose(); }} style={{ ...primaryBtn, width: '100%', height: 52 }}>{won(amt)} 충전하기</button>
      </div>
    </Modal>
  );
}
function ResetModal({ onClose, onReset }) {
  const [step, setStep] = useState(1);
  const [confirm, setConfirm] = useState('');
  return (
    <Modal onClose={onClose} width={420}>
      <div style={{ padding: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF5F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={UP} strokeWidth="2.2"><path d="M12 9v4M12 17h.01M10.3 4.3L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: INK, textAlign: 'center', marginBottom: 10 }}>정말 초기화할까요?</div>
        {step === 1 ? (
          <>
            <div style={{ fontSize: 14, color: '#4E5968', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              보유 주식, 체결 내역, 현금이 모두 초기 상태로 돌아가요.<br /><b style={{ color: UP }}>복구할 수 없어요.</b> (AI 분석 이력은 보존)
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ ...ghostBtn, flex: 1, height: 52 }}>취소</button>
              <button onClick={() => setStep(2)} style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', background: UP, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>계속</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: '#4E5968', textAlign: 'center', marginBottom: 14 }}>확인을 위해 <b style={{ color: INK }}>초기화</b>를 입력하세요.</div>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="초기화"
              style={{ width: '100%', height: 50, border: '1px solid #E5E8EB', borderRadius: 12, padding: '0 16px', fontSize: 16, textAlign: 'center', marginBottom: 20, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ ...ghostBtn, flex: 1, height: 52 }}>취소</button>
              <button onClick={onReset} disabled={confirm !== '초기화'} style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', cursor: confirm === '초기화' ? 'pointer' : 'not-allowed',
                background: confirm === '초기화' ? UP : '#E5E8EB', color: confirm === '초기화' ? '#fff' : '#B0B8C1', fontSize: 16, fontWeight: 800 }}>초기화</button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 15, color: SUB }}>총 {state.trades.length}건</span>
        <div style={{ display: 'flex', gap: 6, background: '#F2F4F6', borderRadius: 10, padding: 4 }}>
          {[['ALL', '전체'], ['BUY', '매수'], ['SELL', '매도']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: filter === k ? '#fff' : 'transparent', color: filter === k ? INK : '#8B95A1', boxShadow: filter === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? <Empty text="체결 내역이 없어요." cta="종목 둘러보기" onCta={() => navigate('home')} /> : (
        <Card style={{ padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1.6fr 1fr 1fr 1.1fr 1fr', gap: 8, padding: '12px 16px', fontSize: 13, color: SUB, fontWeight: 600 }}>
            <span>날짜</span><span>종목</span><span style={{ textAlign: 'right' }}>구분</span><span style={{ textAlign: 'right' }}>체결가</span>
            <span style={{ textAlign: 'right' }}>수량</span><span style={{ textAlign: 'right' }}>실현손익</span>
          </div>
          {rows.map(t => {
            const s = getStock(t.code);
            const isBuy = t.type === 'BUY';
            return (
              <div key={t.id} onClick={() => navigate('detail', { code: t.code })}
                style={{ display: 'grid', gridTemplateColumns: '100px 1.6fr 1fr 1fr 1.1fr 1fr', gap: 8, padding: '14px 16px', alignItems: 'center', borderRadius: 12, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 14, color: '#4E5968' }}>{dateLabel(t.ts)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar stock={s} size={32} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.short || s.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 8, color: isBuy ? UP : DOWN, background: isBuy ? '#FEF0F1' : '#EFF5FF' }}>{isBuy ? '매수' : '매도'}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 15, color: INK }}>{won(t.price)}</div>
                <div style={{ textAlign: 'right', fontSize: 15, color: '#4E5968' }}>{t.qty}주</div>
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
  if (!state.isLoggedIn) return <PageShell title="체결 내역"><LoginGate /></PageShell>;
  return <PageShell title="체결 내역"><TradesTable /></PageShell>;
}

Object.assign(window, { Portfolio, Watchlist, Funds, Trades, PageShell, Empty, LoginGate, Metric, usePortfolio });
