// AI 분석 — 포트폴리오 AI 분석 기준 구현
// 핵심 원칙: 모든 수치 계산은 '서버(클라이언트)'에서 완료 후 Gemini에 전달, Gemini는 해석/Advice만.

export function analyzePortfolio(state, getStock) {
  const seed = state.funds.initialAmount;
  const holdings = state.holdings.map(h => {
    const s = getStock(h.code);
    const ev = s.price * h.qty, cost = h.avgPrice * h.qty;
    return { ...h, stock: s, sector: s.sector, eval: ev, cost, pnl: ev - cost, pnlPct: cost ? (ev - cost) / cost * 100 : 0 };
  });
  const totalEval = holdings.reduce((a, h) => a + h.eval, 0);
  const cash = state.funds.cashBalance;
  const sells = state.trades.filter(t => t.type === 'SELL');
  const buys = state.trades.filter(t => t.type === 'BUY');
  const realized = sells.reduce((a, t) => a + (t.pnl || 0), 0);

  const firstTs = state.trades.length ? Math.min(...state.trades.map(t => t.ts)) : Date.now();
  const months = Math.max(1, (Date.now() - firstTs) / (86400000 * 30));

  // ① 행동 패턴
  const tradesPerMonth = state.trades.length / months;
  const firstBuyByCode = {};
  buys.forEach(t => { if (firstBuyByCode[t.code] == null || t.ts < firstBuyByCode[t.code]) firstBuyByCode[t.code] = t.ts; });
  const durs = [];
  sells.forEach(t => { const fb = firstBuyByCode[t.code]; if (fb) durs.push((t.ts - fb) / 86400000); });
  holdings.forEach(h => { const fb = firstBuyByCode[h.code]; if (fb) durs.push((Date.now() - fb) / 86400000); });
  const avgHoldDays = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : 0;
  const stopLossRatio = sells.length ? sells.filter(t => (t.pnl || 0) < 0).length / sells.length * 100 : 0;
  const takeProfitRatio = sells.length ? sells.filter(t => (t.pnl || 0) > 0).length / sells.length * 100 : 0;
  const chaseBuyCount = buys.filter(t => { const s = getStock(t.code); return t.price >= Math.round(s.price * 1.34) * 0.95; }).length;

  // ② 리스크
  const sectorEval = {};
  holdings.forEach(h => { sectorEval[h.sector] = (sectorEval[h.sector] || 0) + h.eval; });
  const sectorCount = Object.keys(sectorEval).length;
  const topSectorEntry = Object.entries(sectorEval).sort((a, b) => b[1] - a[1])[0];
  const topSectorName = topSectorEntry ? topSectorEntry[0] : '-';
  const sectorConcentration = totalEval ? (topSectorEntry ? topSectorEntry[1] : 0) / totalEval * 100 : 0;
  const topStockEval = holdings.length ? Math.max(...holdings.map(h => h.eval)) : 0;
  const topStock = holdings.find(h => h.eval === topStockEval);
  const topStockConcentration = totalEval ? topStockEval / totalEval * 100 : 0;
  const lossCount = holdings.filter(h => h.pnl < 0).length;
  const lossStockRatio = holdings.length ? lossCount / holdings.length * 100 : 0;
  const riskScore = Math.round(0.4 * Math.min(100, sectorConcentration) + 0.4 * Math.min(100, topStockConcentration) + 0.2 * Math.min(100, lossStockRatio));
  const riskGrade = riskScore <= 40 ? '낮음' : riskScore <= 60 ? '보통' : riskScore <= 80 ? '높음' : '매우 높음';

  // ③ 수익률
  const totalReturnPct = seed ? (totalEval + cash - seed) / seed * 100 : 0;
  const contrib = {};
  holdings.forEach(h => { contrib[h.code] = (contrib[h.code] || 0) + h.pnl; });
  sells.forEach(t => { contrib[t.code] = (contrib[t.code] || 0) + (t.pnl || 0); });
  const contribArr = Object.entries(contrib).map(([code, v]) => ({ code, name: getStock(code).name, sector: getStock(code).sector, v: Math.round(v) }));
  const top3 = contribArr.filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 3);
  const bottom3 = contribArr.filter(x => x.v < 0).sort((a, b) => a.v - b.v).slice(0, 3);
  const sectorContribMap = {};
  contribArr.forEach(x => { sectorContribMap[x.sector] = (sectorContribMap[x.sector] || 0) + x.v; });
  const sectorContrib = Object.entries(sectorContribMap).map(([sector, v]) => ({ sector, v: Math.round(v) })).sort((a, b) => b.v - a.v);

  // ④ 투자 성향 레이블 (8유형)
  const dispersed = topStockConcentration < 30 && sectorConcentration <= 40 && sectorCount >= 2;
  let label;
  if (stopLossRatio < 10 && lossCount >= 2) label = '손실 회피형';
  else if (state.watchlist.length >= 8 && holdings.length <= 1) label = '기회 손실형';
  else if (avgHoldDays < 30) {
    if (topStockConcentration > 30 && (riskGrade === '높음' || riskGrade === '매우 높음')) label = '단기 집중 공격형';
    else if (dispersed && riskGrade === '보통') label = '단기 분산형';
    else label = topStockConcentration > 30 ? '단기 집중 공격형' : '단기 분산형';
  } else if (avgHoldDays <= 90) {
    label = topStockConcentration > 30 ? '중기 집중형' : '중기 분산형';
  } else {
    if (topStockConcentration > 30) label = '장기 집중형';
    else if (dispersed && riskGrade === '낮음') label = '장기 분산 안정형';
    else label = '장기 집중형';
  }

  // 건강도 점수 (4×25 = 100)
  const sDiv = (topStockConcentration < 20 ? 12.5 : topStockConcentration < 30 ? 7 : 3) + (sectorCount >= 3 ? 12.5 : sectorCount >= 2 ? 7 : 3);
  const sRisk = riskGrade === '낮음' ? 25 : riskGrade === '보통' ? 16 : riskGrade === '높음' ? 8 : 2;
  const sRet = totalReturnPct > 10 ? 25 : totalReturnPct > 0 ? 18 : totalReturnPct > -10 ? 10 : 3;
  const sHab = (stopLossRatio >= 10 && stopLossRatio <= 30 ? 12.5 : sells.length === 0 ? 8 : 5) + (chaseBuyCount === 0 ? 12.5 : 6);
  const healthBreakdown = { 분산도: Math.round(sDiv), 리스크관리: sRisk, 수익률: sRet, 매매습관: Math.round(sHab) };
  const healthTotal = Object.values(healthBreakdown).reduce((a, b) => a + b, 0);
  const healthGrade = healthTotal >= 70 ? '우수' : healthTotal >= 50 ? '보통' : '개선 필요';

  return {
    seed, totalEval, cash, realized, totalReturnPct, months,
    holdingsCount: holdings.length, tradeCount: state.trades.length, sellCount: sells.length, watchCount: state.watchlist.length,
    behavior: { tradesPerMonth, avgHoldDays, stopLossRatio, takeProfitRatio, chaseBuyCount },
    risk: { sectorConcentration, topSectorName, topStockConcentration, topStockName: topStock ? topStock.stock.name : '-', lossStockRatio, lossCount, riskScore, riskGrade, sectorCount },
    returns: { totalReturnPct, top3, bottom3, sectorContrib },
    label, healthBreakdown, healthTotal, healthGrade,
    dataLimited: state.trades.length === 0, behaviorLimited: sells.length === 0,
  };
}

export const DISCLAIMER = '이 리포트는 모의투자 학습을 목적으로 제공되며, 특정 종목의 매수·매도를 권유하지 않아요.';

export function buildReport(m) {
  const pct = (v) => (v > 0 ? '+' : '') + v.toFixed(1) + '%';
  const b = m.behavior, r = m.risk, rt = m.returns;
  const freqWord = b.tradesPerMonth >= 6 ? '빈번한(충동) 매매' : b.tradesPerMonth >= 2 ? '중단기 매매' : '장기 보유 중심';
  const holdWord = b.avgHoldDays < 30 ? '단기' : b.avgHoldDays <= 90 ? '중기' : '장기';

  const labelReason = `평균 보유 ${b.avgHoldDays.toFixed(0)}일(${holdWord}형), 최대 종목 비중 ${r.topStockConcentration.toFixed(0)}%, 리스크 등급 '${r.riskGrade}'을 종합해 '${m.label}'으로 분류했어요.`;

  const healthComment = m.healthGrade === '우수'
    ? '분산·리스크·수익·매매습관이 균형 잡혀 있어요. 현 전략을 유지하며 미세 조정만 권장해요.'
    : m.healthGrade === '보통'
    ? '전반적으로 무난하나 한두 축에서 개선 여지가 있어요. 아래 진단을 확인해보세요.'
    : '여러 축에서 개선이 필요해요. 분산과 리스크 관리부터 점검하는 것을 권장해요.';

  const behaviorText = m.behaviorLimited
    ? '매도 이력이 없어 손절·익절 습관은 분석이 제한돼요. 현재까지는 매수 후 보유 위주의 패턴이에요.'
    : `월 평균 ${b.tradesPerMonth.toFixed(1)}회 거래로 ${freqWord} 성향이에요. 평균 보유 기간은 ${b.avgHoldDays.toFixed(0)}일(${holdWord})이고, 손절 비율 ${b.stopLossRatio.toFixed(0)}% · 익절 비율 ${b.takeProfitRatio.toFixed(0)}%예요.`
      + (b.stopLossRatio <= 10 ? ' 손절을 거의 하지 않아 손실을 방치하는 경향이 보여요.' : b.stopLossRatio >= 30 ? ' 손절이 잦아 매매 비용이 누적될 수 있어요.' : ' 손절·익절 균형은 양호해요.')
      + (b.chaseBuyCount >= 2 ? ` 52주 고가 부근 추격 매수가 ${b.chaseBuyCount}건 감지돼 진입 단가 관리가 필요해요.` : '');
  const behaviorAdvice = b.chaseBuyCount >= 2 ? '고가 추격 매수를 줄이고 분할 매수로 평균 단가를 낮춰보세요.'
    : b.stopLossRatio <= 10 ? '미리 손절 라인을 정해 손실 종목을 점검하는 습관을 들여보세요.'
    : '현재 매매 습관은 안정적이에요. 규칙을 일관되게 유지하세요.';

  const riskText = `리스크 점수 ${r.riskScore}점으로 '${r.riskGrade}' 등급이에요. 업종 집중도는 ${r.topSectorName} ${r.sectorConcentration.toFixed(0)}%`
    + (r.sectorConcentration > 60 ? '(매우 위험)' : r.sectorConcentration > 40 ? '(위험)' : '(양호)')
    + `, 단일 종목 최대 비중은 ${r.topStockName} ${r.topStockConcentration.toFixed(0)}%`
    + (r.topStockConcentration > 50 ? '(매우 위험)' : r.topStockConcentration > 30 ? '(집중 위험)' : '(양호)') + '예요.'
    + (r.lossStockRatio > 50 ? ` 보유 종목의 ${r.lossStockRatio.toFixed(0)}%가 평가손실 상태라 포트 점검이 필요해요.` : '');
  const riskAdvice = r.sectorConcentration > 40 ? `${r.topSectorName} 외 업종으로 분산해 섹터 쏠림을 완화하세요.`
    : r.topStockConcentration > 30 ? `${r.topStockName} 비중을 30% 이하로 조절해 종목 리스크를 낮추세요.`
    : '현재 분산 수준은 적정해요. 비중을 유지하세요.';

  const topNames = rt.top3.length ? rt.top3.map(x => x.name).join(', ') : '없음';
  const botNames = rt.bottom3.length ? rt.bottom3.map(x => x.name).join(', ') : '없음';
  const returnText = `시드머니 대비 총 수익률은 ${pct(rt.totalReturnPct)}예요. 수익을 이끈 종목은 ${topNames}이고, 손실 요인은 ${botNames}이에요.`
    + (rt.sectorContrib.length ? ` 업종별로는 ${rt.sectorContrib[0].sector} 업종이 손익을 ${rt.sectorContrib[0].v >= 0 ? '주도' : '훼손'}했어요.` : '');

  const adviceTop3 = [];
  if (r.topStockConcentration > 30) adviceTop3.push({ t: '종목 집중도 완화', d: `${r.topStockName} 비중이 ${r.topStockConcentration.toFixed(0)}%로 높아요. 비중을 30% 이하로 줄여 단일 종목 리스크를 낮추세요.` });
  if (r.sectorConcentration > 40) adviceTop3.push({ t: '업종 분산', d: `${r.topSectorName}에 ${r.sectorConcentration.toFixed(0)}%가 몰려 있어요. 다른 업종을 편입해 변동성을 분산하세요.` });
  if (b.chaseBuyCount >= 2) adviceTop3.push({ t: '추격 매수 자제', d: `고가 부근 추격 매수가 ${b.chaseBuyCount}건이에요. 분할 매수로 진입 단가를 관리하세요.` });
  if (b.stopLossRatio <= 10 && !m.behaviorLimited) adviceTop3.push({ t: '손절 규칙 수립', d: '손절 비율이 낮아 손실이 누적될 수 있어요. 명확한 손절 기준을 세워보세요.' });
  if (m.cash / (m.totalEval + m.cash || 1) < 0.15) adviceTop3.push({ t: '현금 비중 확보', d: '현금 비중이 15% 미만이에요. 추가 매수 여력을 위해 현금을 일부 확보하세요.' });
  while (adviceTop3.length < 3) adviceTop3.push({ t: '현 전략 유지', d: '해당 축은 양호해요. 지금의 규칙을 일관되게 유지하세요.' });
  const advice3 = adviceTop3.slice(0, 3);

  const strategy = `단기적으로는 ${r.topStockConcentration > 30 ? `${r.topStockName} 비중 축소로 종목 리스크를 줄이고` : '현 비중을 유지하면서'}, `
    + `${r.sectorConcentration > 40 ? `${r.topSectorName} 쏠림을 다른 업종으로 분산하는` : '업종 균형을 점검하는'} 방향이 적절해요. `
    + `중기적으로는 '${m.label}' 성향에 맞춰 ${holdWord === '단기' ? '보유 기간을 늘려 매매 비용을 줄이고' : '꾸준한 적립·리밸런싱으로'} 변동성에 대응하세요. `
    + `현금 비중 15% 이상을 유지하면 조정장에서 추가 매수 여력을 확보할 수 있어요.`;

  return {
    label: m.label, labelReason, disclaimer: DISCLAIMER,
    health: { breakdown: m.healthBreakdown, total: m.healthTotal, grade: m.healthGrade, comment: healthComment },
    behavior: { metrics: m.behavior, text: behaviorText, advice: behaviorAdvice, limited: m.behaviorLimited },
    risk: { ...m.risk, text: riskText, advice: riskAdvice },
    returns: { ...m.returns, text: returnText },
    adviceTop3: advice3, strategy,
    input: { holdings: m.holdingsCount, trades: m.tradeCount, watch: m.watchCount, return: m.totalReturnPct },
  };
}
