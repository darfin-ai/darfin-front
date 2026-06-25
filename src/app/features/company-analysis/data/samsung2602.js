export const mockScoreData = {
  score: 92,
  tier: 'high',
  components: [
    {
      key: 'financial',
      label: 'Financial',
      barColor: '#E87C6A',
      weight: 35,
      rawScore: 88,
      formula: '부호전환 신호는 ×1.5 가중 적용',
      items: [
        { id: 'f1', label: '영업이익 부호 전환 (×1.5)',  points: 25, maxPoints: 25, status: 'triggered' },
        { id: 'f2', label: 'EPS 부호 전환 (×1.5)',      points: 25, maxPoints: 25, status: 'triggered' },
        { id: 'f3', label: '매출 증가율 >15% QoQ',      points: 18, maxPoints: 20, status: 'triggered' },
        { id: 'f4', label: '부채비율 변화 >5pp',          points:  0, maxPoints: 10, status: 'below_threshold' },
        { id: 'f5', label: 'FCF 마진 임계값',             points:  0, maxPoints:  8, status: 'below_threshold' },
      ],
    },
    {
      key: 'risk',
      label: 'Risk',
      barColor: '#A32D2D',
      weight: 30,
      rawScore: 95,
      formula: '신규 추가 리스크에 최고 가중치',
      items: [
        { id: 'r1', label: '신규 HIGH 리스크 신설',         points: 20, maxPoints: 20, status: 'triggered' },
        { id: 'r2', label: '리스크 언급 급증 (>200%)',       points: 15, maxPoints: 15, status: 'triggered' },
        { id: 'r3', label: '잠재 매출 노출 >20% 리스크',     points: 10, maxPoints: 10, status: 'triggered' },
        { id: 'r4', label: '신규 규제 리스크',                points:  0, maxPoints:  8, status: 'below_threshold' },
      ],
    },
    {
      key: 'management',
      label: 'Management',
      barColor: '#185FA5',
      weight: 20,
      rawScore: 80,
      formula: '신규 등장 키워드에 최고 가중치',
      items: [
        { id: 'm1', label: '신규 핵심 키워드 등장 (AGI, CXL)', points: 15, maxPoints: 15, status: 'triggered' },
        { id: 'm2', label: '주요 키워드 급증 >300% (AI)',       points: 12, maxPoints: 15, status: 'triggered' },
        { id: 'm3', label: '기존 테마 감소 (Foundry −33%)',     points:  6, maxPoints: 10, status: 'triggered' },
        { id: 'm4', label: '이사회 헤딩 변경',                   points:  0, maxPoints:  8, status: 'below_threshold' },
      ],
    },
    {
      key: 'governance',
      label: 'Governance',
      barColor: '#639922',
      weight: 15,
      rawScore: 45,
      formula: '구조적 거버넌스 변화에 최고 가중치',
      items: [
        { id: 'g1', label: 'ESG 섹션 신설',      points:  8, maxPoints:  8, status: 'triggered' },
        { id: 'g2', label: '이사회 구성 변경',     points:  0, maxPoints: 12, status: 'below_threshold' },
        { id: 'g3', label: '주요 위원회 변경',     points:  0, maxPoints:  8, status: 'below_threshold' },
        { id: 'g4', label: '대표이사 교체',        points:  0, maxPoints: 15, status: 'below_threshold' },
      ],
    },
  ],
};

export const mockSignals = {
  positive: [
    {
      id: 's1',
      title: '영업이익 흑자 전환',
      subtitle: '−2.3조 → +8.9조',
      impact: 'high',
      sourceSection: '재무제표',
      pageRef: 24,
      measurement: {
        metric: '영업이익',
        previous: '−2.3조원',
        current: '+8.9조원',
        changeLabel: '+11.2조원',
        note: '반도체 사이클 저점 통과 이후 첫 흑자 분기. DS부문이 단독으로 +11.2조원 이익 개선을 견인하였으며, D램 고정가 +18% QoQ와 HBM3E 출하 확대가 주요 원인입니다.',
      },
    },
    {
      id: 's3',
      title: 'HBM 매출 비중 확대',
      subtitle: '18% → 22%',
      impact: 'medium',
      sourceSection: 'MD&A',
      pageRef: 12,
      measurement: {
        metric: 'HBM 매출 비중',
        previous: '18%',
        current: '22%',
        changeLabel: '+4pp',
        note: 'HBM3E 12-Hi 양산 가속화로 AI 서버향 매출이 전체 메모리의 22%에 달하였습니다.',
      },
    },
    {
      id: 's5',
      title: 'R&D 투자 23% 증가',
      subtitle: '1.7조 → 2.1조',
      impact: 'medium',
      sourceSection: 'MD&A',
      pageRef: 31,
      measurement: {
        metric: 'R&D 비용',
        previous: '1.7조원',
        current: '2.1조원',
        changeLabel: '+23.5%',
        note: 'GAA 3nm 및 HBM4 차세대 기술 개발 가속화에 따른 전략적 투자 확대입니다.',
      },
    },
  ],
  risk: [
    {
      id: 's2',
      title: '중국 수출 리스크 급증',
      subtitle: '언급 빈도 4 → 15회',
      impact: 'high',
      sourceSection: '리스크 요인',
      pageRef: 41,
      measurement: {
        metric: '리스크 언급 빈도',
        previous: '4회',
        current: '15회',
        changeLabel: '+275%',
        note: '미국 반도체 수출 규제 강화 우려로 중국 수출 리스크 섹션이 대폭 확대됨. 중국향 매출 잠재 노출은 전체의 약 26%입니다.',
      },
    },
  ],
  newDisclosure: [
    {
      id: 's4',
      title: 'ESG 공시 섹션 신설',
      subtitle: '탄소중립 2030 로드맵 포함',
      impact: 'medium',
      sourceSection: '공시 신설',
      pageRef: 67,
      measurement: {
        metric: '신설 섹션',
        previous: '없음',
        current: '6페이지 신설',
        changeLabel: '신규',
        note: 'ISSB S1/S2 기반 지속가능성 공시 의무화 대응. 탄소중립 2030 로드맵, Scope 1/2/3 배출량 최초 공시 포함.',
      },
    },
  ],
};

export const mockManagementSignals = {
  themes: [
    {
      term: 'AI', previousCount: 3, currentCount: 27, isNew: false,
      sectionDistribution: [
        { section: 'MD&A', count: 14, pct: 52 },
        { section: '리스크 요인', count: 8, pct: 30 },
        { section: '사업의 개요', count: 5, pct: 18 },
      ],
      excerpts: [
        { section: 'MD&A', page: 12, text: 'AI 서버 수요 급증에 따른 HBM 매출 비중이 전체 메모리의 22%로 확대되었습니다' },
        { section: '리스크 요인', page: 41, text: 'AI 인프라 투자 사이클 둔화 시 HBM 수요 불확실성이 높아질 수 있습니다' },
      ],
      appearsInHeading: true,
      headingNote: '"AI 메모리 전략" 섹션 헤딩 신설 (p.11)',
      deemphasizedNote: null,
    },
    {
      term: 'HBM', previousCount: 5, currentCount: 18, isNew: false,
      sectionDistribution: [
        { section: 'MD&A', count: 10, pct: 56 },
        { section: '사업의 개요', count: 5, pct: 28 },
        { section: '주요 계약', count: 3, pct: 16 },
      ],
      excerpts: [
        { section: 'MD&A', page: 12, text: 'HBM3E 12-Hi 양산 가속화로 AI 서버향 매출 비중이 확대되었습니다' },
      ],
      appearsInHeading: false, headingNote: null, deemphasizedNote: null,
    },
    {
      term: 'AGI', previousCount: 0, currentCount: 11, isNew: true,
      sectionDistribution: [
        { section: 'MD&A', count: 7, pct: 64 },
        { section: '전망', count: 4, pct: 36 },
      ],
      excerpts: [
        { section: 'MD&A', page: 15, text: 'AGI 전환기 도래에 따른 초거대 메모리 수요가 중장기 성장 동력으로 부상하고 있습니다' },
      ],
      appearsInHeading: false, headingNote: null, deemphasizedNote: null,
    },
    {
      term: 'NVIDIA', previousCount: 1, currentCount: 9, isNew: false,
      sectionDistribution: [
        { section: '주요 계약', count: 5, pct: 55 },
        { section: 'MD&A', count: 4, pct: 45 },
      ],
      excerpts: [
        { section: '주요 계약', page: 71, text: 'NVIDIA HBM3E 12-Hi 우선 공급 계약을 2027년까지 연장하였습니다' },
      ],
      appearsInHeading: false, headingNote: null, deemphasizedNote: null,
    },
    {
      term: 'China', previousCount: 4, currentCount: 15, isNew: false,
      sectionDistribution: [
        { section: '리스크 요인', count: 12, pct: 80 },
        { section: '전망', count: 3, pct: 20 },
      ],
      excerpts: [
        { section: '리스크 요인', page: 41, text: 'China향 반도체 수출 규제 강화 시 전체 매출의 26%에 달하는 중국 매출이 직접 영향을 받을 수 있습니다' },
      ],
      appearsInHeading: false, headingNote: null, deemphasizedNote: null,
    },
    {
      term: 'Foundry', previousCount: 12, currentCount: 8, isNew: false,
      sectionDistribution: [
        { section: 'MD&A', count: 5, pct: 63 },
        { section: '사업의 개요', count: 3, pct: 37 },
      ],
      excerpts: [
        { section: 'MD&A', page: 18, text: 'Foundry 부문은 3nm GAA 수율 개선에 집중하며 TSMC 대비 경쟁력 확보에 주력하고 있습니다' },
      ],
      appearsInHeading: false, headingNote: null,
      deemphasizedNote: '전분기 대비 −33% 감소 — 전략적 비중 축소 가능성',
    },
    {
      term: 'CXL', previousCount: 0, currentCount: 4, isNew: true,
      sectionDistribution: [
        { section: 'MD&A', count: 3, pct: 75 },
        { section: '주요 계약', count: 1, pct: 25 },
      ],
      excerpts: [
        { section: 'MD&A', page: 20, text: 'CXL 메모리 인터페이스 기반 고대역폭 솔루션 시장이 2027년부터 본격 개화할 것으로 전망됩니다' },
      ],
      appearsInHeading: false, headingNote: null, deemphasizedNote: null,
    },
  ],
};

export const mockMetricChanges = {
  periodLabel: '26Q1 → 26Q2',
  anchor: [
    { id: 'm1', label: '영업이익률', previous: '−3.2%', current: '10.1%', delta: 13.3, deltaLabel: '+13.3pp', direction: 'sign_reversal' },
    { id: 'm2', label: 'EPS',        previous: '−113원', current: '+947원', delta: null, deltaLabel: '부호 전환', direction: 'sign_reversal' },
  ],
  conditional: [
    { id: 'm3', label: 'R&D / 매출', previous: '6.4%', current: '7.9%', delta: 1.5, deltaLabel: '+1.5pp', direction: 'up', thresholdLabel: '임계값 +1.0pp 초과' },
    { id: 'm4', label: '재고회전일', previous: '74일', current: '68일', delta: -6, deltaLabel: '−6일', direction: 'down', thresholdLabel: '임계값 −5일 초과' },
  ],
  suppressed: [
    { id: 'm5', label: '부채비율', previous: '38.2%', current: '41.7%', deltaLabel: '+3.5pp', reason: '+3.5pp < 기준 +5pp' },
  ],
};

export const mockFilingExplorer = {
  rcpNo: '20260615000123',
  dartUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260615000123',
  boundaryLabel: '이하는 공시 원문 기반 — AI 요약 아님',
  signalLinkedSections: [
    { id: 'explorer_financial', sectionKey: 'financial', label: '재무제표', linkedSignalId: 's1', linkedSignalTitle: '영업이익 흑자 전환', dotColor: '#A32D2D' },
    { id: 'explorer_mda', sectionKey: 'mda', label: 'MD&A', linkedSignalId: 's3', linkedSignalTitle: 'HBM 매출 비중 확대', dotColor: '#E87C6A' },
    { id: 'explorer_risks', sectionKey: 'risks', label: '리스크 요인', linkedSignalId: 's2', linkedSignalTitle: '중국 수출 리스크 급증', dotColor: '#A32D2D' },
  ],
  remainingSections: [
    { id: 'explorer_overview',  sectionKey: 'businessOverview', label: '사업의 개요' },
    { id: 'explorer_board',     sectionKey: 'board',            label: '이사회' },
    { id: 'explorer_dividend',  sectionKey: 'dividend',         label: '배당 정책' },
    { id: 'explorer_contracts', sectionKey: 'contracts',        label: '주요 계약' },
  ],
};
