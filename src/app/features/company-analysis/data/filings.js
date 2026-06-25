const d = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_COMPANIES = [
  { id: '005930', name: '삼성전자',  corpCode: '005930', initials: 'SE', colorKey: 'blue',   latestFiling: { type: '분기보고서', filedAt: d(2),  status: 'analyzed', findingCount: 6 } },
  { id: '000660', name: 'SK하이닉스', corpCode: '000660', initials: 'SK', colorKey: 'teal',   latestFiling: { type: '반기보고서', filedAt: d(15), status: 'analyzed', findingCount: 2 } },
  { id: '005380', name: '현대자동차', corpCode: '005380', initials: 'HM', colorKey: 'amber',  latestFiling: { type: '사업보고서', filedAt: d(1),  status: 'pending',  findingCount: null } },
  { id: '035420', name: 'NAVER',    corpCode: '035420', initials: 'NV', colorKey: 'purple', latestFiling: { type: '분기보고서', filedAt: d(45), status: 'analyzed', findingCount: 1 } },
  { id: '051910', name: 'LG화학',   corpCode: '051910', initials: 'LG', colorKey: 'coral',  latestFiling: null },
];

/** @type {import('../types/darfin').FilingInfo} */
const SAMSUNG_FILING = {
  company: MOCK_COMPANIES[0],
  reportType: '2026 Q2 분기보고서',
  filedDate: d(2),
  rcpNo: '20260615000123',
  aiComplete: true,
  aiSummary: '삼성전자의 2026 Q2 실적은 반도체 사이클 회복을 기점으로 전분기 적자에서 흑자로 급전환하였습니다.',
  stockPrice: { price: 82300, changePercent: -1.2 },
  financialTable: {
    quarters: ['25Q3', '25Q4', '26Q1', '26Q2'],
    rows: [
      { label: '매출액 (조원)',    values: [67.4, 75.8, 71.9, 88.6], deltas: [null,  12.5,  -5.1, 23.2] },
      { label: '영업이익 (조원)',  values: [-0.2, -2.3, -2.3,  8.9], deltas: [null,  null,   0.0, null] },
      { label: '당기순이익 (조원)',values: [ 0.8, -1.0, -0.8,  6.7], deltas: [null,  null,  20.0, null] },
      { label: '부채비율 (%)',    values: [37.5, 39.1, 38.2, 41.7], deltas: [null,   4.3,  -2.3,  9.2] },
      { label: 'EPS (원)',       values: [ 112, -141, -113,  947], deltas: [null,  null,  19.9, null] },
    ],
  },
  intelligence: {
    signalScore: { score: 92, tier: 'high', signalCount: 5 },
    recentSignals: [
      { id: 's1', category: 'earnings',   direction: 'up',   title: '영업이익 흑자 전환',      subtitle: '−2.3조 → +8.9조',       impact: 'high',   sourceSection: '재무제표',   pageRef: 24 },
      { id: 's2', category: 'risk',       direction: 'down', title: '중국 수출 리스크 급증',    subtitle: '언급 빈도 4 → 15회',      impact: 'high',   sourceSection: '리스크 요인', pageRef: 41 },
      { id: 's3', category: 'earnings',   direction: 'up',   title: 'HBM 매출 비중 확대',      subtitle: '18% → 22%',             impact: 'medium', sourceSection: 'MD&A',      pageRef: 12 },
      { id: 's4', category: 'disclosure', direction: 'new',  title: 'ESG 공시 섹션 신설',      subtitle: '탄소중립 2030 로드맵 포함', impact: 'medium', sourceSection: '공시 신설',  pageRef: 67 },
      { id: 's5', category: 'earnings',   direction: 'up',   title: 'R&D 투자 23% 증가',      subtitle: '1.7조 → 2.1조',         impact: 'medium', sourceSection: 'MD&A',      pageRef: 31 },
    ],
    metricChanges: [
      { label: '영업이익률',   previous: '−3.2%', current: '10.1%', delta: 13.3, deltaLabel: '+13.3pp', direction: 'sign_reversal' },
      { label: 'R&D / 매출', previous: '6.4%',  current: '7.9%',  delta: 1.5,  deltaLabel: '+1.5pp',  direction: 'up' },
      { label: '재고회전일',  previous: '74일',  current: '68일',  delta: -6,   deltaLabel: '−6일',     direction: 'down' },
      { label: '부채비율',   previous: '38.2%', current: '41.7%', delta: 3.5,  deltaLabel: '+3.5pp',  direction: 'up' },
      { label: 'EPS',       previous: '−113원', current: '+947원', delta: null, deltaLabel: '부호 전환', direction: 'sign_reversal' },
    ],
    managementKeywords: [
      { term: 'AI',           previousCount:  3, currentCount: 27 },
      { term: 'HBM',          previousCount:  5, currentCount: 18 },
      { term: 'Foundry',      previousCount: 12, currentCount:  8 },
      { term: 'AGI',          previousCount:  0, currentCount: 11 },
      { term: 'NVIDIA',       previousCount:  1, currentCount:  9 },
      { term: 'China',        previousCount:  4, currentCount: 15 },
      { term: 'Supply Chain', previousCount: 18, currentCount: 11 },
      { term: 'CXL',          previousCount:  0, currentCount:  4 },
    ],
    escalatedRisks: [
      { id: 'er1', title: '중국 수출 규제',    severity: 'high',   changeType: 'new',       previousMentions: 4, currentMentions: 15, revenueExposure: '26%' },
      { id: 'er2', title: 'HBM4 수율 리스크', severity: 'medium', changeType: 'escalated', previousMentions: 2, currentMentions:  8, revenueExposure: null },
    ],
    governanceChanges: [],
  },
  sections: {
    businessOverview: {
      description: '삼성전자는 반도체·디스플레이·스마트폰·가전 등을 영위하는 글로벌 종합전자기업으로, 2025년 기준 포춘 글로벌 500 18위에 위치합니다.',
      segments: [
        { segment: 'DS (반도체)',   revenue: 36.3, share: 41, yoy:  28.4 },
        { segment: 'MX (스마트폰)', revenue: 33.6, share: 38, yoy:  -3.1 },
        { segment: 'VD/DA (가전)', revenue: 14.2, share: 16, yoy:   2.1 },
        { segment: '하만',          revenue:  4.5, share:  5, yoy:   7.8 },
      ],
      employeeCount: 267937,
      subsidiaryCount: 238,
    },
    mda: {
      kpis: [
        { label: '영업이익률', value: '10.1%', direction: 'up' },
        { label: 'ROE',       value: '8.2%',  direction: 'up' },
        { label: 'R&D 비율',  value: '7.9%',  direction: 'up' },
        { label: '재고회전일', value: '68일',  direction: 'neutral' },
      ],
      paragraphs: [
        { title: '실적 개요',   body: '2026 Q2는 반도체 사이클 저점 통과 이후 첫 본격 흑자 분기입니다. DS부문이 전분기 대비 영업이익 +11.2조 원 개선을 이끌었으며, MX부문은 플래그십 교체 수요 둔화에도 불구하고 견조한 이익률을 유지하였습니다.' },
        { title: '부문별 분석', body: 'DS부문은 D램 고정가 상승(+18% QoQ)과 낸드 공급 조정 효과로 흑자 전환하였습니다. HBM3E 12-Hi 양산 가속화로 AI 서버향 매출 비중이 전체 메모리의 22%에 달하였습니다.' },
        { title: '하반기 전망', body: '하반기는 HBM4 본격 양산 및 GAA 3nm 파운드리 수율 개선을 기점으로 DS부문 추가 이익 개선이 예상됩니다. 다만 미·중 무역 갈등 심화 시 중국향 매출(약 26%)에 대한 불확실성이 상존합니다.' },
      ],
    },
    board: {
      members: [
        { name: '이재용', title: '회장',           type: '사내이사', termEnd: '2027-03-15', committee: null },
        { name: '한종희', title: '대표이사 부회장', type: '사내이사', termEnd: '2027-03-15', committee: '경영위원회' },
        { name: '경계현', title: '사장 (DS부문)',   type: '사내이사', termEnd: '2026-03-15', committee: null },
        { name: '박재완', title: '독립이사',         type: '사외이사', termEnd: '2027-03-15', committee: '감사위원회' },
        { name: '김선욱', title: '독립이사',         type: '사외이사', termEnd: '2026-03-15', committee: '감사위원회' },
        { name: '황성우', title: '독립이사',         type: '독립이사', termEnd: '2028-03-15', committee: '내부거래위원회' },
      ],
    },
    risks: {
      risks: [
        { id: 'r1', category: '시장',     title: 'D램 가격 변동성',   description: 'D램 현물가 변동 및 중국 경쟁사 증설에 따른 공급 과잉 재현 가능성이 존재합니다.', severity: 'high' },
        { id: 'r2', category: '기술',     title: 'HBM4 수율 리스크', description: 'HBM4 적층 공정 초기 수율 저하가 2026 H2 출하 일정에 영향을 미칠 수 있습니다.', severity: 'medium' },
        { id: 'r3', category: '지정학적', title: '미·중 무역 갈등',   description: '미국 대중 반도체 수출 규제 강화 시 중국향 매출(약 26%)이 직접적 타격을 받을 수 있습니다.', severity: 'high' },
        { id: 'r4', category: '운영',     title: '핵심 인력 유출',    description: 'TSMC·인텔 등 글로벌 경쟁사의 인재 영입 공세로 파운드리 핵심 엔지니어 이탈 리스크가 높아지고 있습니다.', severity: 'medium' },
        { id: 'r5', category: '규제',     title: 'ESG 공시 의무화',  description: '2026년부터 ISSB S1/S2 기반 지속가능성 공시 의무화 적용으로 보고 비용 증가가 수반됩니다.', severity: 'low' },
      ],
    },
    dividend: {
      policyStatement: '삼성전자는 3개년 주주환원 정책(2024–2026)에 따라 연간 배당금 9.8조 원 이상 지급을 유지하며, 잉여 현금흐름의 50% 이상을 배당 및 자사주 매입·소각에 활용합니다.',
      currentDps: 361, currentYield: 1.75, currentPayout: 38.2,
      history: [
        { year: '2023',     dps: 1444, yield: 2.1,  payoutRatio: 62.3 },
        { year: '2024',     dps: 1444, yield: 2.4,  payoutRatio: null },
        { year: '2025',     dps: 1444, yield: 1.8,  payoutRatio: null },
        { year: '2026 YTD', dps:  722, yield: 1.75, payoutRatio: 38.2 },
      ],
    },
    contracts: {
      contracts: [
        { id: 'c1', counterparty: 'NVIDIA',    contractType: '공급계약', description: 'HBM3E 12-Hi 제품 우선 공급 계약 (2026–2027)', amount: '약 4.8조원', termStart: '2026-01-01', termEnd: '2027-12-31' },
        { id: 'c2', counterparty: 'Apple',     contractType: '공급계약', description: 'A20 시리즈 AP용 3nm GAA 파운드리 위탁생산', amount: null, termStart: '2026-04-01', termEnd: '2027-03-31' },
        { id: 'c3', counterparty: 'Microsoft', contractType: '기술제휴', description: 'Azure AI 서버용 CXL 메모리 모듈 공동 개발 MOU', amount: '약 1.2조원', termStart: '2025-11-01', termEnd: null },
        { id: 'c4', counterparty: 'Arm Ltd.',  contractType: '라이선스', description: 'Cortex/Neoverse IP 장기 라이선스 갱신 계약', amount: null, termStart: '2026-01-01', termEnd: '2030-12-31' },
      ],
    },
  },
  findings: [],
};

/** @type {import('../types/darfin').FilingInfo} */
const SKHYNIX_FILING = {
  company: MOCK_COMPANIES[1],
  reportType: '2026 반기보고서',
  filedDate: d(15),
  rcpNo: '20260610000456',
  aiComplete: true,
  aiSummary: 'SK하이닉스는 HBM3E 양산 확대를 기반으로 AI 메모리 시장 선점에 성공하고 있습니다.',
  stockPrice: { price: 201500, changePercent: 2.4 },
  financialTable: {
    quarters: ['24H2', '25H1', '25H2', '26H1'],
    rows: [
      { label: '매출액 (조원)',    values: [14.2, 17.6, 18.2, 22.1], deltas: [null, 23.9,  3.4, 21.4] },
      { label: '영업이익 (조원)',  values: [ 3.4,  6.7,  7.8, 11.2], deltas: [null, 97.1, 16.4, 43.6] },
      { label: '당기순이익 (조원)',values: [ 2.8,  5.2,  6.1,  9.4], deltas: [null, 85.7, 17.3, 54.1] },
      { label: '부채비율 (%)',    values: [89.2, 74.3, 68.1, 61.5], deltas: [null,-16.7, -8.3, -9.7] },
      { label: 'EPS (원)',       values: [2140, 3765, 4421, 6814], deltas: [null, 75.9, 17.4, 54.1] },
    ],
  },
  intelligence: {
    signalScore: { score: 89, tier: 'high', signalCount: 4 },
    recentSignals: [
      { id: 'sh1', category: 'earnings', direction: 'up',   title: 'HBM3E 매출 +180% YoY',  subtitle: 'D램 매출의 38% 달성',  impact: 'high',   sourceSection: 'MD&A',      pageRef: 8 },
      { id: 'sh2', category: 'earnings', direction: 'up',   title: '영업이익률 역대 최고치',   subtitle: '42.9% → 50.7%',      impact: 'high',   sourceSection: '재무제표',   pageRef: null },
      { id: 'sh3', category: 'earnings', direction: 'down', title: '재고자산 정상화 확인',     subtitle: '전분기 대비 −12%',     impact: 'medium', sourceSection: '재무제표',   pageRef: 22 },
      { id: 'sh4', category: 'risk',     direction: 'down', title: 'HBM 경쟁 심화 리스크',    subtitle: '삼성 HBM4 인증 근접',  impact: 'medium', sourceSection: '리스크 요인', pageRef: null },
    ],
    metricChanges: [
      { label: '영업이익률', previous: '42.9%',   current: '50.7%',   delta: 7.8,  deltaLabel: '+7.8pp',  direction: 'up' },
      { label: 'HBM 비중',  previous: '33%',      current: '38%',     delta: 5,    deltaLabel: '+5pp',    direction: 'up' },
      { label: '부채비율',  previous: '68.1%',    current: '61.5%',   delta: -6.6, deltaLabel: '−6.6pp', direction: 'down' },
      { label: 'EPS',       previous: '4,421원',  current: '6,814원', delta: 54.1, deltaLabel: '+54.1%', direction: 'up' },
    ],
    managementKeywords: [
      { term: 'HBM',    previousCount: 22, currentCount: 41 },
      { term: 'AI',     previousCount:  8, currentCount: 31 },
      { term: 'NVIDIA', previousCount:  3, currentCount: 12 },
      { term: 'Yield',  previousCount:  6, currentCount: 14 },
      { term: 'China',  previousCount:  1, currentCount:  5 },
      { term: 'Samsung',previousCount:  4, currentCount:  9 },
    ],
    escalatedRisks: [
      { id: 'er1', title: 'HBM 경쟁 심화 (삼성 HBM4)',  severity: 'high',   changeType: 'new',       previousMentions: 0, currentMentions: 7, revenueExposure: null },
      { id: 'er2', title: '중국 HBM 수출 제한 리스크',   severity: 'medium', changeType: 'escalated', previousMentions: 1, currentMentions: 5, revenueExposure: null },
    ],
    governanceChanges: [],
  },
  sections: {
    businessOverview: {
      description: 'SK하이닉스는 D램·낸드플래시 등 메모리 반도체를 주력으로 하는 글로벌 2위 메모리 전문기업으로, AI 서버용 HBM 시장에서 독보적인 점유율을 확보하고 있습니다.',
      segments: [
        { segment: 'D램',  revenue: 15.5, share: 70, yoy:  52.3 },
        { segment: '낸드', revenue:  5.5, share: 25, yoy:  18.7 },
        { segment: '기타', revenue:  1.1, share:  5, yoy:   4.1 },
      ],
      employeeCount: 38904,
      subsidiaryCount: 47,
    },
    mda: {
      kpis: [
        { label: '영업이익률', value: '50.7%', direction: 'up' },
        { label: 'HBM 비중',  value: '38%',   direction: 'up' },
        { label: '부채비율',   value: '61.5%', direction: 'down' },
      ],
      paragraphs: [
        { title: '실적 개요', body: 'AI 서버 투자 사이클 가속화에 따른 HBM3E 수요 폭증이 실적을 견인하였습니다. 영업이익률이 역대 최고 수준인 50.7%를 달성하며 수익성 구조가 한층 개선되었습니다.' },
        { title: '전망',      body: '하반기에는 HBM4 초도 양산 개시와 함께 고부가가치 제품 믹스 추가 개선이 기대됩니다. 낸드 부문은 엔터프라이즈 SSD 수요 회복으로 완만한 수익성 개선이 예상됩니다.' },
      ],
    },
    board: {
      members: [
        { name: '곽노정', title: '대표이사 사장', type: '사내이사', termEnd: '2027-03-20', committee: null },
        { name: '김우현', title: '부사장',         type: '사내이사', termEnd: '2026-03-20', committee: '경영위원회' },
        { name: '이종완', title: '독립이사',        type: '사외이사', termEnd: '2027-03-20', committee: '감사위원회' },
        { name: '정혜순', title: '독립이사',        type: '독립이사', termEnd: '2028-03-20', committee: '보상위원회' },
      ],
    },
    risks: {
      risks: [
        { id: 'r1', category: '시장',     title: 'HBM 경쟁 심화',        description: 'NVIDIA의 공급선 다변화 기조 속에 삼성전자의 HBM4 인증 통과 시 점유율 하락 압박이 발생할 수 있습니다.', severity: 'high' },
        { id: 'r2', category: '지정학적', title: '중국 수출 규제',        description: '미국의 중국향 HBM 수출 제한 확대 시 잠재적 신규 고객군 접근이 제한될 수 있습니다.', severity: 'medium' },
        { id: 'r3', category: '기술',     title: 'HBM4 적층 수율 리스크', description: '16-Hi 이상 적층 시 열 관리 및 본딩 수율이 원가 구조에 직접적 영향을 미칩니다.', severity: 'medium' },
      ],
    },
    dividend: {
      policyStatement: 'SK하이닉스는 연간 잉여 현금흐름의 일정 비율을 배당으로 환원하는 정책을 유지하며, 반기 배당을 통해 주주 가치를 제고합니다.',
      currentDps: 1500, currentYield: 1.49, currentPayout: 22.1,
      history: [
        { year: '2023 H2', dps: 1200, yield: 0.9,  payoutRatio: null },
        { year: '2024 H1', dps: 1200, yield: 0.85, payoutRatio: null },
        { year: '2024 H2', dps: 1300, yield: 0.94, payoutRatio: null },
        { year: '2025 H1', dps: 1400, yield: 1.12, payoutRatio: 18.6 },
        { year: '2026 H1', dps: 1500, yield: 1.49, payoutRatio: 22.1 },
      ],
    },
    contracts: {
      contracts: [
        { id: 'h1', counterparty: 'NVIDIA', contractType: '공급계약',      description: 'H200·GB200용 HBM3E 독점 우선 공급 (2026 연간)', amount: null, termStart: '2026-01-01', termEnd: '2026-12-31' },
        { id: 'h2', counterparty: 'Micron', contractType: '크로스라이선스', description: 'DRAM 특허 크로스라이선스 갱신 계약', amount: null, termStart: '2025-07-01', termEnd: '2030-06-30' },
      ],
    },
  },
  findings: [],
};

/** @type {import('../types/darfin').FilingInfo} */
const HYUNDAI_FILING = {
  company: MOCK_COMPANIES[2],
  reportType: '2026 사업보고서',
  filedDate: d(1),
  rcpNo: '20260624000789',
  aiComplete: false,
  aiSummary: null,
  stockPrice: { price: 234000, changePercent: 0.8 },
  financialTable: null,
  intelligence: null,
  sections: null,
  findings: [],
};

/** @type {import('../types/darfin').FilingInfo} */
const NAVER_FILING = {
  company: MOCK_COMPANIES[3],
  reportType: '2026 Q1 분기보고서',
  filedDate: d(45),
  rcpNo: '20260510000789',
  aiComplete: true,
  aiSummary: 'NAVER의 2026 Q1 실적은 광고 수익 회복과 웹툰 글로벌 성장에 힘입어 안정적인 성장세를 이어갔습니다.',
  stockPrice: { price: 198500, changePercent: 0.4 },
  financialTable: {
    quarters: ['25Q1', '25Q2', '25Q3', '26Q1'],
    rows: [
      { label: '매출액 (조원)',   values: [2.5, 2.6, 2.7, 2.8], deltas: [null, 4.0, 3.8, 3.7] },
      { label: '영업이익 (조원)', values: [0.38, 0.40, 0.43, 0.45], deltas: [null, 5.3, 7.5, 4.7] },
    ],
  },
  intelligence: {
    signalScore: { score: 22, tier: 'low', signalCount: 1 },
    recentSignals: [
      { id: 'n1', category: 'earnings', direction: 'up', title: '광고 매출 소폭 회복', subtitle: '영업이익률 16.1%', impact: 'low', sourceSection: '재무제표', pageRef: null },
    ],
    metricChanges: [
      { label: '영업이익률', previous: '15.4%', current: '16.1%', delta: 0.7, deltaLabel: '+0.7pp', direction: 'up' },
    ],
    managementKeywords: [
      { term: 'AI',      previousCount: 11, currentCount: 14 },
      { term: 'Webtoon', previousCount:  8, currentCount:  9 },
    ],
    escalatedRisks: [],
    governanceChanges: [],
  },
  sections: null,
  findings: [],
};

export const FILING_BY_ID = {
  '005930': SAMSUNG_FILING,
  '000660': SKHYNIX_FILING,
  '005380': HYUNDAI_FILING,
  '035420': NAVER_FILING,
};

const FILING_BY_NAME = {
  '삼성전자':  SAMSUNG_FILING,
  'SK하이닉스': SKHYNIX_FILING,
  '현대자동차': HYUNDAI_FILING,
  'NAVER':    NAVER_FILING,
};

export function getFilingByParam(param) {
  return FILING_BY_ID[param] ?? FILING_BY_NAME[param] ?? null;
}
