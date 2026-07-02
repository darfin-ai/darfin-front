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

  diffs: [
    {
      sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
      changeType: 'modified',
      before: '미국 IRA 관련 세액공제 정책은 안정적으로 유지되고 있는 것으로 판단된다.',
      after: '미국 IRA 관련 세액공제 정책의 변경 가능성이 제기되고 있어 지속적인 모니터링이 필요하다.',
      sourceRef: 'DART-20260514-000512#risk-ira-policy',
    },
    {
      sectionLabel: 'IV. 이사의 경영진단 및 분석의견',
      changeType: 'added',
      after: '고객사 다변화를 통해 특정 정책 변화에 대한 민감도를 낮추기 위한 전략을 추진하고 있다.',
      sourceRef: 'DART-20260514-000512#note-18-ampc-detail',
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
      evidence:
        'ESS 부문 매출 비중이 2024Q4 12% → 2026Q1 23%로 확대. EV 고객사 집중도(상위 3사 비중)는 71% → 58%로 감소. IRA 세액공제(AMPC)가 영업이익의 57%를 차지해 정책 의존도가 구조적 위험 요인으로 부상.',
      bullets: [
        'ESS 매출 비중 12% → 23%로 2배 가까이 확대',
        'EV 고객 집중도 완화 — 상위 3사 비중 71% → 58%',
        'IRA AMPC 세액공제가 영업이익의 57% 차지',
      ],
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
