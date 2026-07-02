// @ts-nocheck
/** @typedef {import('./types').CompanyDetail} CompanyDetail */

const QUARTERS = ['2024Q4', '2025Q1', '2025Q2', '2025Q3', '2025Q4', '2026Q1'];

function series(values) {
  return QUARTERS.map((quarter, i) => ({ quarter, value: values[i] }));
}

/** @type {CompanyDetail} */
export const lgEnergySolution = {
  company: {
    id: 'lg-energy-solution',
    name: 'LG에너지솔루션',
    shortName: 'LG엔솔',
    ticker: '373220',
    sector: '2차전지',
    latestFilingType: '분기보고서',
    latestFilingDate: '2026-05-14',
    changeSummary: '실적은 완만한 개선세, 미국 세액공제 정책 리스크 언급이 확대됨',
    marketCapRank: 3,
    marketCap: '약 118조원',
  },

  scores: [
    { key: 'financialChange', maxPoints: 40, history: series([8, 7, 9, 8, 9, 9]) },
    { key: 'riskEscalation', maxPoints: 30, history: series([6, 7, 7, 8, 10, 17]) },
    { key: 'managementEmphasis', maxPoints: 20, history: series([4, 5, 4, 5, 6, 9]) },
    { key: 'governance', maxPoints: 10, history: series([2, 2, 3, 2, 3, 3]) },
  ],

  financials: [
    {
      concept: 'ifrs-full_Revenue',
      label: '매출액',
      unit: 'KRW',
      series: series([
        6_400_000_000_000,
        6_100_000_000_000,
        6_600_000_000_000,
        6_900_000_000_000,
        7_300_000_000_000,
        7_600_000_000_000,
      ]),
    },
    {
      concept: 'dart_OperatingMargin',
      label: '영업이익률',
      unit: '%',
      series: series([2.8, 1.5, 3.3, 4.5, 5.2, 5.4]),
    },
    {
      concept: 'ifrs-full_CurrentAssets',
      label: '유동자산',
      unit: 'KRW',
      series: series([
        12_100_000_000_000,
        12_400_000_000_000,
        12_900_000_000_000,
        13_300_000_000_000,
        13_800_000_000_000,
        14_200_000_000_000,
      ]),
    },
    {
      concept: 'ifrs-full_CashFlowsFromUsedInOperatingActivities',
      label: '영업활동현금흐름',
      unit: 'KRW',
      // Unlike Samsung, cash flow tracks operating profit growth normally —
      // no working-capital divergence this quarter.
      series: series([
        900_000_000_000,
        700_000_000_000,
        1_000_000_000_000,
        1_200_000_000_000,
        1_400_000_000_000,
        1_500_000_000_000,
      ]),
    },
  ],

  findings: [
    {
      id: 'lges-2026q1-us-policy-risk',
      severity: 'medium',
      scoreComponent: 'riskEscalation',
      summary: '미국 첨단제조생산세액공제(AMPC) 정책 변경 가능성에 대한 위험 언급이 확대됨',
      hops: [
        {
          type: 'financial_anomaly',
          sectionLabel: 'III. 재무에 관한 사항 > 3. 연결재무제표 주석 > 18. 정부보조금',
          excerpt:
            '당분기 AMPC(첨단제조생산세액공제) 인식액은 2,350억원으로 영업이익(4,100억원)의 57%를 차지함 — 정책 의존도가 높은 이익 구조.',
          sourceRef: 'DART-20260514-000512#note-18-ampc',
        },
        {
          type: 'note',
          sectionLabel: '연결재무제표 주석 18. 정부보조금',
          excerpt:
            '당분기 AMPC 세액공제 인식액은 2,350억원으로 전분기(1,980억원) 대비 증가하였으며, 관련 세액공제는 미국 인플레이션감축법(IRA)에 근거함.',
          sourceRef: 'DART-20260514-000512#note-18-ampc-detail',
        },
        {
          type: 'mdna',
          sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
          excerpt:
            '미국 정부의 IRA 관련 정책 기조 변화 가능성에 따라 AMPC 세액공제가 축소 또는 폐지될 경우 당사 수익성에 중대한 영향을 미칠 수 있음을 인지하고 있으며, 고객 다변화 및 원가 절감을 통해 대응할 계획임.',
          sourceRef: 'DART-20260514-000512#risk-ira-policy',
        },
      ],
    },
  ],

  // Grouped/rendered by DIFF_SECTION_CONFIG (lib/comparison.js) — every
  // (section, QoQ/YoY) row in that config has an entry here except 주주현황
  // QoQ, deliberately left with no matching entries to show what the "no
  // change detected" state looks like. QoQ/YoY numeric baselines reuse the
  // exact 2025Q4 / 2025Q1 points already in `financials` above (this
  // company's QUARTERS series happens to include 2025Q4 directly, unlike
  // Samsung's Q1-only series).
  diffs: [
    {
      sectionLabel: '회사의 개요',
      sourceLabel: 'I. 회사의 개요 > 2. 회사의 연혁 및 조직',
      comparisonType: 'QoQ',
      changeType: 'added',
      before: '2025년 사업보고서 기준 배터리 부문은 EV향 단일 사업부로 편제되어 있었습니다.',
      after: '2026년 1분기 보고서에서 ESS(에너지저장시스템) 전담 사업부가 신규 편제되었습니다.',
      sourceRef: 'DART-20260514-000512#company-overview-org',
    },
    {
      sectionLabel: '사업의 내용',
      sourceLabel: 'II. 사업의 내용 > 1. 사업의 개요 > 부문별 매출 비중',
      comparisonType: 'QoQ',
      changeType: 'modified',
      before: '2025년 사업보고서 기준 ESS 매출 비중은 약 18% 수준으로 기술되었습니다.',
      after: '2026년 1분기 ESS 매출 비중이 23%로 확대되었으며, EV 고객 집중도 완화 추세가 지속되고 있다고 기술하였습니다.',
      sourceRef: 'DART-20260514-000512#biz-segment-mix',
    },
    {
      sectionLabel: '사업의 내용',
      sourceLabel: 'II. 사업의 내용 > 1. 사업의 개요 > 부문별 매출 비중',
      comparisonType: 'YoY',
      changeType: 'modified',
      before: '2025년 1분기 ESS 부문 매출 비중은 12% 수준이었습니다.',
      after: '2026년 1분기 ESS 부문 매출 비중이 23%로 확대되며 신규 사업의 핵심 축으로 부상하였습니다.',
      sourceRef: 'DART-20260514-000512#biz-mix-yoy',
    },
    {
      sectionLabel: '위험요인',
      sourceLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
      comparisonType: 'QoQ',
      changeType: 'modified',
      before: '미국 IRA 관련 세액공제 정책은 안정적으로 유지되고 있는 것으로 판단된다. (2025년 사업보고서)',
      after: '미국 IRA 관련 세액공제 정책의 변경 가능성이 제기되고 있어 지속적인 모니터링이 필요하다. (2026년 1분기)',
      sourceRef: 'DART-20260514-000512#risk-ira-policy',
    },
    {
      sectionLabel: '위험요인',
      sourceLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
      comparisonType: 'YoY',
      changeType: 'modified',
      before: '2025년 1분기 보고서는 IRA 세액공제를 안정적 수익원으로 기술하였으며, 정책 리스크 언급은 없었습니다.',
      after: '2026년 1분기 보고서는 정책 변경 가능성을 명시적 위험 요인으로 신규 기술 — 영업이익의 57%를 차지하는 AMPC 의존도 리스크가 부각되었습니다.',
      sourceRef: 'DART-20260514-000512#risk-ira-yoy',
    },
    {
      sectionLabel: '재무상태표',
      sourceLabel: 'III. 재무에 관한 사항 > 1. 요약재무정보 > 연결 재무상태표',
      comparisonType: 'QoQ',
      metrics: [
        { label: '유동자산', current: 14_200_000_000_000, baseline: 13_800_000_000_000, unit: 'KRW' },
        { label: '부채비율', current: 118, baseline: 121, unit: '%' },
      ],
      sourceRef: 'DART-20260514-000512#bs-qoq',
    },
    {
      sectionLabel: '재무상태표',
      sourceLabel: 'III. 재무에 관한 사항 > 1. 요약재무정보 > 연결 재무상태표',
      comparisonType: 'YoY',
      metrics: [
        { label: '유동자산', current: 14_200_000_000_000, baseline: 12_400_000_000_000, unit: 'KRW' },
        { label: '부채비율', current: 118, baseline: 128, unit: '%' },
      ],
      sourceRef: 'DART-20260514-000512#bs-yoy',
    },
    {
      sectionLabel: '손익계산서',
      sourceLabel: 'III. 재무에 관한 사항 > 1. 요약재무정보 > 연결 손익계산서',
      comparisonType: 'YoY',
      metrics: [
        { label: '매출액', current: 7_600_000_000_000, baseline: 6_100_000_000_000, unit: 'KRW' },
        { label: '영업이익', current: 410_400_000_000, baseline: 91_500_000_000, unit: 'KRW' },
        { label: '영업이익률', current: 5.4, baseline: 1.5, unit: '%' },
      ],
      sourceRef: 'DART-20260514-000512#is-yoy',
    },
    {
      sectionLabel: '손익계산서',
      sourceLabel: 'III. 재무에 관한 사항 > 1. 요약재무정보 > 연결 손익계산서',
      comparisonType: 'QoQ',
      metrics: [
        { label: '매출액', current: 7_600_000_000_000, baseline: 7_300_000_000_000, unit: 'KRW' },
        { label: '영업이익', current: 410_400_000_000, baseline: 379_600_000_000, unit: 'KRW' },
        { label: '영업이익률', current: 5.4, baseline: 5.2, unit: '%' },
      ],
      sourceRef: 'DART-20260514-000512#is-qoq',
    },
    {
      sectionLabel: '현금흐름표',
      sourceLabel: 'III. 재무에 관한 사항 > 1. 요약재무정보 > 연결 현금흐름표',
      comparisonType: 'YoY',
      metrics: [
        { label: '영업활동현금흐름', current: 1_500_000_000_000, baseline: 700_000_000_000, unit: 'KRW' },
      ],
      sourceRef: 'DART-20260514-000512#cf-yoy',
    },
    {
      sectionLabel: '현금흐름표',
      sourceLabel: 'III. 재무에 관한 사항 > 1. 요약재무정보 > 연결 현금흐름표',
      comparisonType: 'QoQ',
      metrics: [
        { label: '영업활동현금흐름', current: 1_500_000_000_000, baseline: 1_400_000_000_000, unit: 'KRW' },
      ],
      sourceRef: 'DART-20260514-000512#cf-qoq',
    },
    {
      sectionLabel: '주석',
      sourceLabel: '연결재무제표 주석 18. 정부보조금',
      comparisonType: 'QoQ',
      changeType: 'modified',
      before: '2025년 사업보고서 기준 4분기 AMPC(첨단제조생산세액공제) 인식액은 1,980억원이었습니다.',
      after: '2026년 1분기 AMPC 세액공제 인식액이 2,350억원으로 증가하였습니다.',
      metrics: [
        { label: 'AMPC 세액공제 인식액', current: 235_000_000_000, baseline: 198_000_000_000, unit: 'KRW' },
      ],
      sourceRef: 'DART-20260514-000512#note-18-ampc',
    },
    {
      sectionLabel: '주석',
      sourceLabel: '연결재무제표 주석 18. 정부보조금',
      comparisonType: 'YoY',
      changeType: 'modified',
      before: '2025년 1분기 AMPC 세액공제 인식액은 1,020억원으로 영업이익 대비 비중이 크지 않았습니다.',
      after: '2026년 1분기 AMPC 세액공제 인식액이 2,350억원으로 급증하며 영업이익(4,100억원)의 57%를 차지 — 정책 의존적 이익구조로 전환되었습니다.',
      metrics: [
        { label: 'AMPC 세액공제 인식액', current: 235_000_000_000, baseline: 102_000_000_000, unit: 'KRW' },
        { label: '영업이익 대비 AMPC 비중', current: 57, baseline: 11, unit: '%' },
      ],
      sourceRef: 'DART-20260514-000512#note-18-ampc-yoy',
    },
    {
      sectionLabel: '계열회사 현황',
      sourceLabel: 'VIII. 계열회사 등에 관한 사항 > 1. 계열회사 현황',
      comparisonType: 'QoQ',
      changeType: 'added',
      after: '북미 ESS 전용 생산법인(미국 애리조나 소재)이 종속회사로 신규 편입되었습니다.',
      sourceRef: 'DART-20260514-000512#affiliates-new',
    },
    {
      sectionLabel: '중요한 계약',
      sourceLabel: 'X. 대주주 등과의 거래내용 > 중요한 계약 등',
      comparisonType: 'QoQ',
      changeType: 'added',
      after: '글로벌 ESS 통합업체와 대규모 ESS 공급계약을 신규 체결하였다고 공시하였습니다.',
      sourceRef: 'DART-20260514-000512#contracts-new',
    },
    {
      sectionLabel: '임원 및 직원',
      sourceLabel: 'VII. 임원 및 직원 등에 관한 사항 > 1. 임원 및 직원 현황',
      comparisonType: 'QoQ',
      metrics: [
        { label: '직원 수', current: 12_400, baseline: 12_050, unit: 'count', unitLabel: '명' },
      ],
      sourceRef: 'DART-20260514-000512#headcount-qoq',
    },
    {
      sectionLabel: '임원 및 직원',
      sourceLabel: 'VII. 임원 및 직원 등에 관한 사항 > 1. 임원 및 직원 현황',
      comparisonType: 'YoY',
      metrics: [
        { label: '직원 수', current: 12_400, baseline: 11_300, unit: 'count', unitLabel: '명' },
        { label: '평균 근속연수', current: 5.1, baseline: 4.6, unit: 'count', unitLabel: '년' },
      ],
      sourceRef: 'DART-20260514-000512#headcount-yoy',
    },
    // 주주현황 QoQ: intentionally no entries — the largest shareholder's
    // stake didn't move between the 2025 사업보고서 and this filing, and the
    // page should show that "no change detected" state honestly rather
    // than manufacturing one.
    {
      sectionLabel: '주주현황',
      sourceLabel: 'V. 주주에 관한 사항 > 1. 주주 현황',
      comparisonType: 'YoY',
      metrics: [
        { label: '최대주주(LG화학) 지분율', current: 81.8, baseline: 82.4, unit: '%' },
        { label: '국민연금공단 지분율', current: 6.1, baseline: 5.3, unit: '%' },
      ],
      sourceRef: 'DART-20260514-000512#shareholders-yoy',
    },
    {
      sectionLabel: '지배구조',
      sourceLabel: 'VI. 이사회 등 회사의 기관에 관한 사항',
      comparisonType: 'QoQ',
      changeType: 'added',
      after: 'ESG 및 배터리 안전 전문성을 보유한 사외이사 1인이 신규 선임되었습니다.',
      sourceRef: 'DART-20260514-000512#governance-new',
    },
  ],

  profile: {
    businessDescription:
      '전기차 및 ESS용 리튬이온 배터리를 생산하는 2차전지 전문기업. 파우치형·원통형 배터리를 주력으로 하며 북미·유럽 완성차업체에 공급.',
    shareStructure: '발행주식총수 234,000,000주. 최대주주 LG화학 지분율 약 81.8%.',
    governanceNotes: '이사회는 사내이사 3인, 사외이사 4인으로 구성. 감사위원회는 사외이사 전원으로 구성됨.',
  },

  recentFilings: [
    { id: 'f2026q1', type: '분기보고서', period: '2026 1분기', date: '2026-05-14', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260514000512' },
    { id: 'f2025',   type: '사업보고서', period: '2025 연간',  date: '2026-03-31', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260331000512' },
    { id: 'f2025q3', type: '분기보고서', period: '2025 3분기', date: '2025-11-14', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20251114000512' },
    { id: 'f2025h1', type: '반기보고서', period: '2025 반기',  date: '2025-08-14', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250814000512' },
    { id: 'f2025q1', type: '분기보고서', period: '2025 1분기', date: '2025-05-15', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250515000512' },
    { id: 'f2024',   type: '사업보고서', period: '2024 연간',  date: '2025-03-31', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250331000512' },
  ],

  strategyShifts: [
    {
      quarter: '2026Q1',
      from: '전기차(EV) 배터리 단일 의존 구조',
      to: 'ESS·에너지저장시스템으로 고객 다변화',
      metrics: [
        { label: 'ESS 매출 비중',   from: '12%', to: '23%' },
        { label: 'EV 고객 집중도',  from: '71%', to: '58%' },
        { label: 'AMPC 의존도',     from: null,  to: '57%' },
      ],
      rationale:
        '전기차 수요 둔화와 미국 IRA 정책 불확실성이 겹치면서, 경영진은 공시에서 "고객사 다변화를 통해 특정 정책 변화에 대한 민감도를 낮추는 전략"을 명시함. ESS 시장의 성장성을 새로운 수익 축으로 언급.',
      sourceRef: 'DART-20260514-000512#mdna-strategy',
    },
  ],
};
