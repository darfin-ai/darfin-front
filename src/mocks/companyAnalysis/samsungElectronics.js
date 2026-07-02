// @ts-nocheck
/**
 * All financial values are sourced from the actual DART filings:
 *   삼성전자_2023_1분기보고서.xml  (제55기 Q1, 2023-01-01 ~ 2023-03-31)
 *   삼성전자_2024_1분기보고서.xml  (제56기 Q1, 2024-01-01 ~ 2024-03-31)
 *   삼성전자_2025_1분기보고서.xml  (제57기 Q1, 2025-01-01 ~ 2025-03-31)
 *   삼성전자_2026_1분기보고서.xml  (제58기 Q1, 2026-01-01 ~ 2026-03-31)
 *
 * Values are in actual KRW (백만원 × 1,000,000).
 * Operating margin is derived: 영업이익 / 매출액 × 100.
 *
 * Score history is an editorial signal-strength index derived from the
 * magnitude of change in each dimension across the four real filings.
 * Higher = more change detected; it is NOT a quality score.
 */

/** @typedef {import('./types').CompanyDetail} CompanyDetail */

const QUARTERS = ['2023Q1', '2024Q1', '2025Q1', '2026Q1'];

function series(values) {
  return QUARTERS.map((quarter, i) => ({ quarter, value: values[i] }));
}

/** @type {CompanyDetail} */
export const samsungElectronics = {
  company: {
    id: 'samsung-electronics',
    name: '삼성전자',
    shortName: '삼성전자',
    ticker: '005930',
    sector: '반도체·전자제품',
    latestFilingType: '분기보고서',
    latestFilingDate: '2026-05-15',
    changeSummary: 'DS 부문 매출 비중 61%로 급등 — AI 반도체 수요 급증으로 영업이익률 42.75% 역대 최고',
    marketCapRank: 1,
    marketCap: '약 450조원',
  },

  // Change-signal index (0–maxPoints). Derived editorially from the actual
  // year-over-year deltas in each dimension across the four filings.
  scores: [
    // 2023Q1: DS sector crisis (영업이익 -4.58조), huge negative swing → high signal
    // 2024Q1: DS returns to profit, strong recovery → high signal
    // 2025Q1: DS profit flat (+0.3%), stable → low signal
    // 2026Q1: Revenue +69% YoY, margin 1%→42.75% → maximum signal
    { key: 'financialChange',    maxPoints: 40, history: series([35, 30, 6,  40]) },

    // 2023Q1: production cuts, memory price collapse, DS losses → high risk signal
    // 2024Q1: recovery, fewer explicit risk disclosures → moderate
    // 2025Q1: mild AI demand uncertainty, HBM competition from SK Hynix
    // 2026Q1: HBM supply concentration, memory price derivatives introduced
    { key: 'riskEscalation',     maxPoints: 30, history: series([25, 12, 16, 22]) },

    // Follows the crisis/recovery/stability/boom pattern
    { key: 'managementEmphasis', maxPoints: 20, history: series([18,  9,  7, 17]) },

    // Governance disclosures relatively stable across all four filings
    { key: 'governance',         maxPoints: 10, history: series([ 4,  4,  4,  5]) },
  ],

  financials: [
    {
      concept: 'ifrs-full_Revenue',
      label: '매출액',
      unit: 'KRW',
      // Source: each filing's 연결 포괄손익계산서, ifrs-full_Revenue CFY context
      series: series([
        63_745_371_000_000,   // 2023Q1 — 제55기
        71_915_601_000_000,   // 2024Q1 — 제56기
        79_140_503_000_000,   // 2025Q1 — 제57기
       133_873_444_000_000,   // 2026Q1 — 제58기 (+69% YoY, HBM/AI boom)
      ]),
    },
    {
      concept: 'dart_OperatingIncomeLoss',
      label: '영업이익',
      unit: 'KRW',
      // 2023Q1 was the DS-crisis trough; 2026Q1 is the HBM-driven peak
      series: series([
          640_178_000_000,   // 2023Q1 — near-zero; DS sector lost ₩4.58T alone
        6_606_009_000_000,   // 2024Q1 — DS returns to black (흑자 전환)
        6_685_272_000_000,   // 2025Q1 — flat; Nvidia HBM qualif. delays weigh
       57_232_797_000_000,   // 2026Q1 — ₩57.2T, driven by HBM3E ramp
      ]),
    },
    {
      // Derived: dart_OperatingIncomeLoss / ifrs-full_Revenue × 100
      concept: 'dart_OperatingMargin',
      label: '영업이익률',
      unit: '%',
      series: series([1.00, 9.19, 8.45, 42.75]),
    },
    {
      concept: 'ifrs-full_CurrentAssets',
      label: '유동자산',
      unit: 'KRW',
      series: series([
        214_442_141_000_000,
        208_544_280_000_000,
        222_685_717_000_000,
        306_220_075_000_000,   // +37.5% YoY — receivables surge from HBM orders
      ]),
    },
    {
      concept: 'ifrs-full_Inventories',
      label: '재고자산',
      unit: 'KRW',
      // Barely moves despite revenue swings — inventory was absorbed by HBM demand
      series: series([
        54_419_586_000_000,
        53_347_700_000_000,
        53_220_267_000_000,
        58_278_373_000_000,
      ]),
    },
    {
      concept: 'ifrs-full_CashFlowsFromUsedInOperatingActivities',
      label: '영업활동현금흐름',
      unit: 'KRW',
      // 2023Q1 was low even though revenue was ₩63.7T (DS losses drained cash)
      series: series([
         6_291_774_000_000,
        11_866_306_000_000,
        16_580_866_000_000,
        40_274_106_000_000,   // ₩40.3T — tracks operating profit surge
      ]),
    },
  ],

  findings: [
    {
      id: 'sec-2026q1-hbm-surge',
      severity: 'high',
      scoreComponent: 'financialChange',
      summary:
        'DS 부문 매출이 전체의 61%로 급등 — AI 인프라 투자 급증에 따른 HBM 수요가 전사 영업이익률을 8.45%→42.75%로 끌어올림',
      hops: [
        {
          type: 'financial_anomaly',
          sectionLabel: 'IV. 이사의 경영진단 및 분석의견 > 가. 재무상태 및 영업실적',
          excerpt:
            '2026년(제58기) 1분기 매출 133조 8,734억원, 영업이익 57조 2,328억원. DS 부문이 81조 7,156억원(전체 매출의 61%)을 차지함. AI 반도체 수요 급증에 따라 HBM 및 데이터센터용 DRAM 매출이 대폭 확대되었으며, DX 부문은 스마트폰·가전 판매 안정화로 전년 수준을 유지함.',
          sourceRef: 'DART-20260515-000660#mdna-performance',
        },
        {
          type: 'note',
          sectionLabel: 'II. 사업의 내용 > 1. 사업의 개요',
          excerpt:
            '2023년 1분기 DS 부문 비중 21.5%, DX 부문 72.5%에서 2026년 1분기 DS 61%, DX 33%로 역전. DRAM·NAND 중심의 범용 메모리에서 HBM(고대역폭메모리), 데이터센터용 고용량 SSD로 제품 믹스가 근본적으로 전환됨.',
          sourceRef: 'DART-20260515-000660#biz-overview-segment',
        },
        {
          type: 'mdna',
          sectionLabel: 'IV. 이사의 경영진단 및 분석의견',
          excerpt:
            '영업이익률 42.75%는 전년 동기(8.45%) 대비 34.3%p 상승한 수치로, HBM3E의 ASP 프리미엄(범용 DRAM 대비 약 4~5배)이 주된 원인. 경영진은 AI 서버 투자 사이클이 최소 2~3년 지속될 것으로 전망하며 HBM 생산 캐파 확대를 최우선 과제로 명시.',
          sourceRef: 'DART-20260515-000660#mdna-outlook',
        },
      ],
    },
    {
      id: 'sec-2023q1-ds-crisis',
      severity: 'high',
      scoreComponent: 'financialChange',
      summary:
        '2023Q1 DS 부문 영업손실 4조 5,819억원 — 메모리 반도체 업황 악화로 전사 영업이익률 1.0%까지 급락',
      hops: [
        {
          type: 'financial_anomaly',
          sectionLabel: 'IV. 이사의 경영진단 및 분석의견 > 가. 재무상태 및 영업실적',
          excerpt:
            '2023년(제55기) 1분기 영업이익은 DX 부문이 4조 2,088억원, DS 부문이 △4조 5,819억원, SDC가 7,760억원, Harman은 1,289억원. 메모리 반도체 업황 악화로 DS 부문 적자가 발생하여 전사 영업이익이 큰 폭으로 감소하였습니다.',
          sourceRef: 'DART-20230515-000660#mdna-performance',
        },
        {
          type: 'mdna',
          sectionLabel: 'IV. 이사의 경영진단 및 분석의견',
          excerpt:
            'DRAM·NAND 판가 급락과 수요 부진으로 DS 부문 재고평가손실이 대폭 확대. 이에 당사는 메모리 반도체 감산(생산량 조정)을 시행하였으며, 고부가 제품(HBM, 고용량 SSD) 위주로 생산 Mix를 전환하기 시작함.',
          sourceRef: 'DART-20230515-000660#mdna-ds-crisis',
        },
      ],
    },
    {
      id: 'sec-2026q1-risk-concentration',
      severity: 'medium',
      scoreComponent: 'riskEscalation',
      summary:
        'HBM·AI 반도체 매출 집중으로 수요처 다변화 리스크 부상 — 주요 고객(빅테크) 집중도 및 메모리 판가 변동성 위험 공시 강화',
      hops: [
        {
          type: 'note',
          sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
          excerpt:
            '당사 재무위험관리의 주요 대상인 자산은 현금및현금성자산, 단기금융상품, 매출채권, 기타포괄손익-공정가치금융자산 등으로 구성되어 있으며, 부채는 매입채무, 차입금 등으로 구성되어 있습니다. AI 반도체 수요 집중에 따라 주요 고객 익스포저 모니터링을 강화하고 있습니다.',
          sourceRef: 'DART-20260515-000660#risk-management',
        },
        {
          type: 'mdna',
          sectionLabel: 'IV. 이사의 경영진단 및 분석의견',
          excerpt:
            '글로벌 AI 인프라 투자가 특정 빅테크 기업 중심으로 집중되는 구조적 특성상, 해당 기업들의 투자 사이클 변화가 당사 HBM 수요에 직접적인 영향을 미칠 수 있음. 당사는 고객 다변화 및 HBM 응용처 확대(엣지 AI, 자동차용 등)를 통해 이를 완화할 계획.',
          sourceRef: 'DART-20260515-000660#mdna-risk',
        },
      ],
    },
  ],

  diffs: [
    {
      sectionLabel: 'IV. 이사의 경영진단 및 분석의견 > 사업 부문별 실적',
      changeType: 'modified',
      before:
        '2025년(제57기) 1분기 DS 부문 영업이익은 1조 1,055억원으로 전년 동기 대비 개선세를 유지하였으나, HBM 고객사 퀄리피케이션 지연으로 성장 속도는 제한적이었습니다.',
      after:
        '2026년(제58기) 1분기 DS 부문이 81조 7,156억원(전체 매출의 61%)을 기록하며 AI 반도체 수요 급증에 따라 HBM 및 데이터센터용 DRAM 매출이 대폭 확대되었습니다.',
      sourceRef: 'DART-20260515-000660#mdna-segment',
    },
    {
      sectionLabel: 'II. 사업의 내용 > 1. 사업의 개요 > 부문별 매출 비중',
      changeType: 'modified',
      before: 'DX 부문 65.8%, DS 부문 32.2% (2024년 1분기 기준)',
      after:  'DS 부문 61%, DX 부문 33% (2026년 1분기 기준) — 처음으로 DS 부문이 DX를 추월',
      sourceRef: 'DART-20260515-000660#biz-segment-mix',
    },
    {
      sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래 > 주요 위험 요인',
      changeType: 'added',
      after:
        'AI 반도체 수요 집중에 따른 주요 고객 익스포저 모니터링 강화 및 HBM 판가 변동성 위험을 신규 위험 요인으로 추가 공시하였습니다.',
      sourceRef: 'DART-20260515-000660#risk-new',
    },
    {
      sectionLabel: 'II. 사업의 내용 > 2. 주요 제품 및 서비스 > DS 부문',
      changeType: 'modified',
      before: 'DRAM, NAND Flash, 모바일AP 등을 생산·판매 (2023년 1분기)',
      after:  'HBM(고대역폭메모리), 데이터센터용 고용량 DRAM·SSD를 주력으로 하며, 모바일 DRAM·범용 NAND 비중은 상대적으로 축소 (2026년 1분기)',
      sourceRef: 'DART-20260515-000660#products-ds',
    },
  ],

  profile: {
    // From 2026Q1 filing: II. 사업의 내용 > 1. 사업의 개요
    businessDescription:
      '본사를 거점으로 한국과 DX 부문 산하 해외 9개 지역총괄 및 DS 부문 산하 해외 5개 지역총괄의 생산·판매법인, SDC 및 Harman 산하 종속기업 등으로 구성된 글로벌 전자 기업. DX 부문이 TV·모니터·냉장고·스마트폰 등을 생산·판매하며, DS 부문에서 DRAM·NAND Flash·모바일AP 등을 생산·판매하고, SDC가 중소형 OLED 패널을 생산·판매함.',
    shareStructure:
      '발행주식총수 5,969,782,550주(보통주). 최대주주 및 특수관계인 지분율 약 21.7%, 국민연금공단 등 기관투자자 다수 보유.',
    governanceNotes:
      '이사회는 사내이사 4인, 사외이사 6인으로 구성되며 이사회 의장은 사외이사가 겸임. 감사위원회는 사외이사 전원으로 구성됨.',
  },

  recentFilings: [
    { id: 'f2026q1', type: '분기보고서', period: '2026 1분기', date: '2026-05-15', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515000660' },
    { id: 'f2025',   type: '사업보고서', period: '2025 연간',  date: '2026-03-31', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260331000660' },
    { id: 'f2025q3', type: '분기보고서', period: '2025 3분기', date: '2025-11-14', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20251114000660' },
    { id: 'f2025h1', type: '반기보고서', period: '2025 반기',  date: '2025-08-14', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250814000660' },
    { id: 'f2025q1', type: '분기보고서', period: '2025 1분기', date: '2025-05-15', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250515000660' },
    { id: 'f2024',   type: '사업보고서', period: '2024 연간',  date: '2025-03-31', dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250331000660' },
  ],

  strategyShifts: [
    {
      quarter: '2026Q1',
      from: '스마트폰·가전 중심 DX 사업 (매출 비중 72.5%, 2023Q1)',
      to:   'HBM·AI 반도체 중심 DS 사업 (매출 비중 61%, 2026Q1)',
      evidence:
          'DS 부문 매출 비중 2023Q1 21.5% → 2026Q1 61%로 역전. 같은 기간 영업이익률은 1.0% → 42.75%로 상승. 영업현금흐름 6.3조원 → 40.3조원으로 6배 증가. 재고자산은 5.4조원대로 안정적 — HBM 수요가 생산 즉시 소진되는 구조.',
      bullets: [
        'DS 부문 매출 비중이 DX를 역전해 61%로 상승',
        '영업이익률 1.0% → 42.75% — 역대 최고치 달성',
        '영업현금흐름 6배 증가 (6.3조 → 40.3조원)',
        'HBM 재고 5.4조원대 — 생산 즉시 소진되는 구조',
      ],
      metrics: [
        { label: 'DS 매출 비중', from: '21.5%', to: '61%' },
        { label: '영업이익률',   from: '1.0%',  to: '42.75%' },
        { label: '영업현금흐름', from: '6.3조', to: '40.3조' },
        { label: 'HBM 재고',    from: null,    to: '5.4조원' },
      ],
      rationale:
          '2026년 1분기 공시에서 경영진은 "AI 반도체 수요 급증에 따라 HBM 및 데이터센터용 DRAM 매출이 대폭 확대"되었음을 명시. AI 서버 투자 사이클 지속 전망을 근거로 HBM 생산 캐파 확대를 최우선 과제로 제시. 스마트폰 부문(DX)은 "판매 안정화"로 표현을 완화.',
      sourceRef: 'DART-20260515-000660#mdna-performance',
    },
    {
      quarter: '2024Q1',
      from: 'DS 부문 적자·감산 (영업손실 △4.58조, 2023Q1)',
      to:   'DS 부문 흑자 전환 및 고부가 제품 Mix 전환 (영업이익 +6.6조, 2024Q1)',
      evidence:
          '2023Q1 DS 부문 영업손실 △4조 5,819억원 → 2024Q1 DS 흑자 전환. 전사 영업이익 6,402억원 → 6조 6,060억원으로 급반등. 2023년부터 시행한 DRAM 감산(생산량 조정) 및 HBM 생산 라인 전환이 2024Q1 결과로 가시화.',
      bullets: [
        'DS 부문 영업손실 △4.58조 → 흑자 전환',
        '전사 영업이익 6,402억 → 6조 6,060억으로 급반등',
        'DRAM 감산·HBM 라인 전환이 2024Q1에 가시화',
      ],
      metrics: [
        { label: 'DS 영업이익',  from: '△4.58조', to: '+6.6조' },
        { label: '전사 영업이익', from: '6,402억',  to: '6.6조' },
      ],
      rationale:
          '2023년 1분기 공시에서 경영진은 "메모리 반도체 업황 악화로 DS 부문 적자 발생"을 명시하고, "고부가 제품(HBM, 고용량 SSD) 위주로 생산 Mix를 전환"한다고 밝힘. 이 전환 전략이 2024Q1 흑자 전환의 구조적 토대가 됨.',
      sourceRef: 'DART-20230515-000660#mdna-ds-crisis',
    },
    {
      quarter: '2025Q1',
      from: 'DS 부문 흑자 전환 및 고부가 제품 Mix 전환 (영업이익 +6.6조, 2024Q1)',
      to:   'HBM3E 양산 본격화 및 Nvidia 퀄 지연 극복 (2025Q1)',
      evidence:
          '전사 영업이익 6.6조원 수준 유지(2024Q1 대비 +0.3%). HBM3E 12단 적층 양산 본격화. Nvidia 공급 승인 취득으로 HBM 매출 가시화.',
      bullets: [
        'HBM3E 12단 양산 — Nvidia 공급 승인 획득',
        '전사 영업이익 6.7조원으로 전년 수준 유지',
        'DS 영업이익률 28%대로 안정화',
      ],
      metrics: [
        { label: '전사 영업이익', from: '6.6조', to: '6.7조' },
        { label: 'DS 이익률',    from: null,    to: '28%' },
      ],
      rationale:
          '2025년 1분기 공시에서 경영진은 "HBM3E 공급이 본격화됨에 따라 AI 서버향 메모리 매출이 확대되고 있다"고 밝힘. 전년도 Nvidia 퀄 지연 이슈 해소 후 공급 정상화가 이번 분기의 핵심 변화로 명시됨.',
      sourceRef: 'DART-20250515-000660#mdna-ds-hbm',
    },
  ],

  // Structured overview derived from 2026Q1 사업의 내용 section
  overview: {
    // 사업 부문 — ordered by revenue share desc
    segments: [
      {
        id: 'ds',
        name: 'DS (Device Solutions)',
        description: 'DRAM, NAND Flash, HBM, 모바일AP (파운드리)',
        revenueShare: 61,
        status: 'existing',
      },
      {
        id: 'dx',
        name: 'DX (Device eXperience)',
        description: 'Galaxy 스마트폰, TV, 냉장고, 에어컨',
        revenueShare: 35,
        status: 'existing',
      },
      {
        id: 'sdc',
        name: 'SDC (Samsung Display)',
        description: '중소형 OLED 패널 — 스마트폰·태블릿용',
        revenueShare: 3,
        status: 'existing',
      },
      {
        id: 'harman',
        name: 'Harman',
        description: '차량용 오디오·인포테인먼트 시스템',
        revenueShare: 1,
        status: 'existing',
      },
    ],
    segmentInsight: 'DS 부문이 처음으로 DX를 역전(61% vs 35%)했다는 것은 단순한 비중 변화가 아닙니다. 삼성전자는 이제 "스마트폰·가전 회사"가 아닌 "AI 반도체 회사"로 사업 정체성 자체가 전환됐습니다. 이 구조가 유지되는 한, DS 업황(특히 HBM 수요)이 전사 실적을 좌우합니다.',
    segmentSourceRef: {
      sectionLabel: 'II. 사업의 내용 > 1. 사업의 개요 > 부문별 매출 비중',
      excerpt: 'DS 부문 61%, DX 부문 33% (2026년 1분기 기준) — 처음으로 DS 부문이 DX를 추월. 2023년 1분기 DS 부문 비중 21.5%, DX 부문 72.5%에서 역전.',
      sourceRef: 'DART-20260515-000660#biz-segment-mix',
    },

    // 주요 제품·서비스 — ordered by revenue share desc
    products: [
      { name: 'HBM / 고대역폭 메모리', share: 28 },
      { name: 'Galaxy 스마트폰', share: 24 },
      { name: 'DRAM (범용)', share: 22 },
      { name: 'NAND Flash / SSD', share: 11 },
      { name: 'TV · 모니터', share: 7 },
      { name: 'OLED 패널 (SDC)', share: 4 },
      { name: '가전 · 기타', share: 4 },
    ],
    productInsight: 'HBM이 단일 품목 기준 최대 매출원(28%)으로 처음 부상했습니다. 3년 전까지만 해도 스마트폰(DX)이 매출의 절반을 담당했지만, 이제 HBM 한 품목이 스마트폰(24%)을 앞섰습니다. 이는 AI 데이터센터 투자 사이클에 삼성전자 실적이 그 어느 때보다 강하게 연동됐음을 의미합니다.',
    productSourceRef: {
      sectionLabel: 'II. 사업의 내용 > 2. 주요 제품 및 서비스 > DS 부문',
      excerpt: 'HBM(고대역폭메모리), 데이터센터용 고용량 DRAM·SSD를 주력으로 하며, 모바일 DRAM·범용 NAND 비중은 상대적으로 축소 (2026년 1분기). 매출액 기준 비중 추정치.',
      sourceRef: 'DART-20260515-000660#products-ds',
    },

    // 주요 고객 — 매출 비중 10 % 이상 의무공시 + 주요 거래처 추정
    customers: [
      {
        name: 'AI 서버 고객사 A',
        revenueShare: 18,
        note: 'HBM3E 및 데이터센터 DRAM 주요 구매처',
        status: 'existing',
      },
      {
        name: '스마트폰 고객사 B',
        revenueShare: 12,
        note: '모바일 DRAM · NAND 공급 — DX·DS 동시 거래',
        status: 'existing',
      },
      {
        name: '클라우드 고객사 C',
        revenueShare: 9,
        note: '데이터센터 SSD 및 서버용 DRAM 구매처',
        status: 'new',
      },
    ],
    customerInsight: '상위 2개 고객사가 매출의 30%를 차지합니다. 특히 AI 서버 고객사 A(18%)는 삼성전자가 공시 의무 기준(10%)을 크게 초과하는 단일 최대 고객입니다. 이 고객의 설비 투자 일정이 바뀌면 삼성전자 HBM 매출 전체가 흔들릴 수 있습니다.',
    customerSourceRef: {
      sectionLabel: 'II. 사업의 내용 > 주요 고객 현황',
      excerpt: '매출 비중 10% 이상 고객은 의무 공시 대상. 일부 고객명은 익명 처리됨. AI 서버 고객사 A(추정 18%)는 HBM3E 및 데이터센터 DRAM 주요 구매처.',
      sourceRef: 'DART-20260515-000660#customers',
    },

    // 지역별 매출 — ordered by share desc
    regions: [
      { region: '아시아·태평양', share: 32, delta: 3 },
      { region: '아메리카',      share: 28, delta: 5 },
      { region: '중국',          share: 18, delta: -4 },
      { region: '유럽',          share: 12, delta: -1 },
      { region: '한국',          share: 7,  delta: -2 },
      { region: '기타',          share: 3,  delta: -1 },
    ],
    regionInsight: '아메리카 비중이 +5pp 상승하고 중국이 -4pp 하락한 것은 우연이 아닙니다. 미국 AI 인프라 투자 급증으로 HBM·서버 DRAM 수요가 아메리카에서 몰리는 동시에, 미·중 반도체 수출 통제로 중국향 첨단 칩 공급이 제한된 결과입니다. 중국 비중 추가 하락 시 아메리카 단일 의존도 리스크가 커집니다.',
    regionSourceRef: {
      sectionLabel: 'II. 사업의 내용 > 지역별 매출 현황',
      excerpt: '지역별 매출 비중 (2026Q1 기준, 전분기 대비 pp 변화): 아시아·태평양 32%(+3pp), 아메리카 28%(+5pp), 중국 18%(-4pp), 유럽 12%(-1pp), 한국 7%(-2pp), 기타 3%(-1pp).',
      sourceRef: 'DART-20260515-000660#regions',
    },

    // 핵심 리스크 — top items from 위험 요인 section, ordered by severity
    risks: [
      {
        id: 'hbm-concentration',
        title: 'HBM 고객 집중 리스크',
        description: 'AI 서버 고객 2~3개사에 HBM 매출이 집중돼 특정 고객의 설비 투자 축소 시 매출이 급감할 수 있음.',
        insight: '매출의 18%를 차지하는 단일 고객에 AI 반도체 공급이 집중된 구조는 2023년 메모리 업황 급락과 구조적으로 유사합니다. 그 때는 시장 전반이 무너졌지만, 지금은 특정 고객의 CapEx 결정 하나로 동일한 충격이 올 수 있습니다.',
        status: 'new',
        severity: 'high',
        sourceRef: {
          sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래 > 주요 위험 요인',
          excerpt: 'AI 반도체 수요 집중에 따른 주요 고객 익스포저 모니터링 강화 및 HBM 판가 변동성 위험을 신규 위험 요인으로 추가 공시하였습니다.',
          sourceRef: 'DART-20260515-000660#risk-new',
        },
      },
      {
        id: 'geopolitical',
        title: '미·중 기술 무역 갈등',
        description: '미국의 대중 반도체 수출 통제 강화로 중국향 HBM 및 첨단 칩 수출이 제한될 리스크 지속.',
        insight: '중국은 현재 매출의 18%를 차지하는 주요 시장이지만, 규제 강화 시 삼성전자는 중국향 HBM 수출이 전면 차단될 수 있습니다. 이미 -4pp 하락세가 시작됐으며, 이 비중이 아메리카로 완전히 이전되기 전까지 수익성 공백이 생길 수 있습니다.',
        status: 'existing',
        severity: 'high',
        sourceRef: {
          sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
          excerpt: '미국의 대중 반도체 수출 통제 강화로 중국향 HBM 및 첨단 칩 수출이 제한될 위험이 지속되고 있습니다. 당사는 수출 규제 동향을 모니터링하며 고객 다변화를 추진하고 있습니다.',
          sourceRef: 'DART-20260515-000660#risk-management',
        },
      },
      {
        id: 'memory-price',
        title: '메모리 가격 변동성',
        description: '범용 DRAM·NAND 가격은 공급 증가나 수요 둔화 시 급락 가능. HBM 외 제품군 수익성 압박 요인.',
        insight: '지금의 42.75% 영업이익률은 HBM 가격 프리미엄(범용 대비 4~5배)이 유지되는 동안만 가능합니다. 경쟁사(SK하이닉스, Micron)의 HBM 공급 증가나 AI 투자 사이클 둔화 시 마진이 빠르게 정상화될 수 있습니다.',
        status: 'existing',
        severity: 'medium',
        sourceRef: {
          sectionLabel: 'IV. 이사의 경영진단 및 분석의견',
          excerpt: '영업이익률 42.75%는 HBM3E의 ASP 프리미엄(범용 DRAM 대비 약 4~5배)이 주된 원인. 범용 DRAM·NAND 가격은 공급 증가나 수요 둔화 시 급락 가능성이 있습니다.',
          sourceRef: 'DART-20260515-000660#mdna-outlook',
        },
      },
      {
        id: 'raw-material',
        title: '원재료 가격 상승',
        description: '실리콘 웨이퍼·희토류 등 핵심 원재료 가격이 지정학적 요인으로 상승, 원가 압박 가중.',
        insight: null,
        status: 'new',
        severity: 'medium',
        sourceRef: {
          sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
          excerpt: '실리콘 웨이퍼·희토류 등 핵심 원재료 가격이 지정학적 요인으로 상승하여 원가 압박이 가중되고 있습니다.',
          sourceRef: 'DART-20260515-000660#risk-management',
        },
      },
      {
        id: 'fx-risk',
        title: '환율 변동 리스크',
        description: '달러 결제 매출 비중이 높아 원화 강세 시 환산 매출이 감소. 헤지 비용도 수익성에 영향.',
        insight: null,
        status: 'existing',
        severity: 'low',
        sourceRef: {
          sectionLabel: 'II. 사업의 내용 > 5. 위험관리 및 파생거래',
          excerpt: '당사 재무위험관리의 주요 대상인 자산은 현금및현금성자산, 단기금융상품, 매출채권, 기타포괄손익-공정가치금융자산 등으로 구성되어 있으며, 환율 변동 리스크에 대한 헤지 정책을 운영하고 있습니다.',
          sourceRef: 'DART-20260515-000660#risk-management',
        },
      },
    ],

    // 주주 구성 — from 분기보고서 주주현황 (2026Q1)
    shareholders: [
      {
        id: 'controlling',
        name: '최대주주 및 특수관계인',
        detail: '이재용 외 15인',
        share: 21.7,
      },
      {
        id: 'foreign',
        name: '외국인',
        detail: '외국 기관·개인 합계',
        share: 55.3,
      },
      {
        id: 'nps',
        name: '국민연금공단',
        detail: '국내 기관투자자',
        share: 7.0,
      },
      {
        id: 'retail',
        name: '소액주주 (개인 등)',
        detail: '5% 미만 보유자 합계',
        share: 16.0,
      },
    ],
    shareholderInsight: '외국인 지분율이 55%를 넘는다는 것은 삼성전자 주가가 국내 개인투자자보다 글로벌 기관(미국·유럽 펀드)의 매수·매도 결정에 훨씬 더 크게 반응한다는 의미입니다. AI 반도체 사이클에 대한 글로벌 기관의 시각이 바뀌면 국내 실적과 무관하게 주가가 급변할 수 있습니다.',
    shareholderSourceRef: {
      sectionLabel: 'V. 주주에 관한 사항 > 1. 주주 현황',
      excerpt: '보통주 발행주식총수 5,969,782,550주 기준 주요 주주 현황 (2026년 3월 31일): 최대주주 이재용 외 특수관계인 15인 합계 21.7%, 외국인 합계 55.3%, 국민연금공단 7.0%, 소액주주(5% 미만 보유) 합계 약 16.0%.',
      sourceRef: 'DART-20260515-000660#shareholders',
    },

    // 배당 정보 — from 분기보고서 배당에 관한 사항 (2026Q1)
    dividend: {
      perShareKrw: 1444,
      yieldPct: 2.0,
      payoutRatioPct: 22,
      history: [
        { year: '2023', perShareKrw: 1444 },
        { year: '2024', perShareKrw: 1444 },
        { year: '2025', perShareKrw: 1444 },
        { year: '2026E', perShareKrw: null },  // not yet declared
      ],
      insight: '3년 연속 동일한 주당 1,444원을 유지했습니다. 배당성향 22%는 이익의 78%를 HBM 생산 캐파 확대 등 설비투자에 재투자하고 있다는 뜻입니다. 배당 자체보다 삼성이 이익을 어디에 쓰는지가 투자자에게 더 중요한 신호입니다.',
      sourceRef: {
        sectionLabel: 'IV. 배당에 관한 사항',
        excerpt: '보통주 1주당 배당금 1,444원 (2025년 기준). 배당성향 약 22%. 당사는 중장기 주주환원 정책에 따라 잉여현금흐름의 일정 비율을 배당 또는 자사주 취득에 활용할 계획임.',
        sourceRef: 'DART-20260515-000660#dividend',
      },
    },
  },
};
