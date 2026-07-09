/**
 * DART 정기공시 API 기반 dartOverview 개발용 목데이터.
 * 백엔드가 dartOverview를 내려주기 전까지 DEV 환경에서
 * companyAnalysisApi.fetchCompanyDetail이 병합해 사용한다.
 * 계약은 types.js의 DartOverview 참조.
 */

const ref = (sectionLabel, excerpt) => ({
  sectionLabel,
  excerpt,
  sourceRef: 'rcept_no 20260315000123',
});

/** 대형 상장사(사업보고서) 풀 픽스처 */
const fullOverview = {
  meta: { bsnsYear: '2025', reprtCode: '11011', rceptNo: '20260315000123' },

  dividends: {
    sourceRef: ref('배당에 관한 사항', '당사는 주주가치 제고를 위하여 배당정책을 유지하고 있으며, 당기 주당 현금배당금은 1,500원입니다.'),
    rows: [
      { se: '주당액면가액(원)', stockKnd: null, thstrm: 100, frmtrm: 100, lwfr: 100 },
      { se: '(연결)당기순이익(백만원)', stockKnd: null, thstrm: 32_450_000_000_000, frmtrm: 26_910_000_000_000, lwfr: 15_480_000_000_000 },
      { se: '(연결)주당순이익(원)', stockKnd: null, thstrm: 4780, frmtrm: 3960, lwfr: 2280 },
      { se: '현금배당금총액(백만원)', stockKnd: null, thstrm: 10_190_000_000_000, frmtrm: 9_810_000_000_000, lwfr: 9_810_000_000_000 },
      { se: '(연결)현금배당성향(%)', stockKnd: null, thstrm: 31.4, frmtrm: 36.5, lwfr: 63.4 },
      { se: '주당 현금배당금(원)', stockKnd: '보통주', thstrm: 1500, frmtrm: 1444, lwfr: 1444 },
      { se: '주당 현금배당금(원)', stockKnd: '우선주', thstrm: 1501, frmtrm: 1445, lwfr: 1445 },
      { se: '현금배당수익률(%)', stockKnd: '보통주', thstrm: 2.1, frmtrm: 1.9, lwfr: 2.5 },
      { se: '현금배당수익률(%)', stockKnd: '우선주', thstrm: 2.6, frmtrm: 2.3, lwfr: 3.1 },
    ],
  },

  majorShareholders: {
    sourceRef: ref('최대주주 및 특수관계인의 주식소유 현황', '보고서 작성기준일 현재 최대주주 및 특수관계인의 소유 주식은 다음과 같습니다.'),
    rows: [
      { nm: '김창업', relate: '본인', stockKnd: '보통주', bsisPosesnStockCo: 249_273_000, bsisQotaRt: 4.18, trmendPosesnStockCo: 249_273_000, trmendQotaRt: 4.18 },
      { nm: '(주)다핀홀딩스', relate: '계열회사', stockKnd: '보통주', bsisPosesnStockCo: 502_190_000, bsisQotaRt: 8.42, trmendPosesnStockCo: 508_120_000, trmendQotaRt: 8.51 },
      { nm: '다핀생명보험(주)', relate: '계열회사', stockKnd: '보통주', bsisPosesnStockCo: 508_157_000, bsisQotaRt: 8.51, trmendPosesnStockCo: 508_157_000, trmendQotaRt: 8.51 },
      { nm: '이경영', relate: '친인척', stockKnd: '보통주', bsisPosesnStockCo: 55_390_000, bsisQotaRt: 0.93, trmendPosesnStockCo: 51_120_000, trmendQotaRt: 0.86 },
      { nm: '박이사', relate: '임원', stockKnd: '보통주', bsisPosesnStockCo: 1_200_000, bsisQotaRt: 0.02, trmendPosesnStockCo: 1_450_000, trmendQotaRt: 0.02 },
      { nm: '계', relate: '-', stockKnd: '보통주', bsisPosesnStockCo: 1_316_210_000, bsisQotaRt: 22.06, trmendPosesnStockCo: 1_318_120_000, trmendQotaRt: 22.08 },
    ],
  },

  majorShareholderChanges: {
    sourceRef: ref('최대주주 변동현황', '최근 3사업연도 중 최대주주 변동 내역은 다음과 같습니다.'),
    rows: [
      { changeOn: '2025-09-12', mxmmShrholdrNm: '(주)다핀홀딩스 외 12인', posesnStockCo: 1_318_120_000, qotaRt: 22.08, changeCause: '계열회사의 장내 매수' },
      { changeOn: '2024-03-28', mxmmShrholdrNm: '(주)다핀홀딩스 외 13인', posesnStockCo: 1_316_210_000, qotaRt: 22.06, changeCause: '친인척 지분 일부 장내 매도' },
    ],
  },

  minorityShareholders: {
    sourceRef: ref('소액주주 현황', '보고서 작성기준일 현재 소액주주 현황은 다음과 같습니다.'),
    rows: [
      { shrholdrCo: 4_672_039, shrholdrTotCo: 4_672_154, shrholdrRate: 99.99, holdStockCo: 3_953_170_000, stockTotCo: 5_969_780_000, holdStockRate: 66.22 },
    ],
  },

  employees: {
    sourceRef: ref('직원 등의 현황', '당사의 사업부문별 직원 현황은 다음과 같습니다.'),
    rows: [
      { foBbm: '반도체', sexdstn: '남', rgllbrCo: 48_210, cnttkCo: 310, sm: 48_520, avrgCnwkSdytrn: '12.4', fyerSalaryTotamt: 6_890_000_000_000, janSalaryAm: 142_000_000 },
      { foBbm: '반도체', sexdstn: '여', rgllbrCo: 14_530, cnttkCo: 180, sm: 14_710, avrgCnwkSdytrn: '10.1', fyerSalaryTotamt: 1_720_000_000_000, janSalaryAm: 117_000_000 },
      { foBbm: '디스플레이', sexdstn: '남', rgllbrCo: 15_840, cnttkCo: 120, sm: 15_960, avrgCnwkSdytrn: '11.8', fyerSalaryTotamt: 1_960_000_000_000, janSalaryAm: 123_000_000 },
      { foBbm: '디스플레이', sexdstn: '여', rgllbrCo: 6_210, cnttkCo: 95, sm: 6_305, avrgCnwkSdytrn: '9.6', fyerSalaryTotamt: 650_000_000_000, janSalaryAm: 103_000_000 },
      { foBbm: '가전', sexdstn: '남', rgllbrCo: 12_430, cnttkCo: 240, sm: 12_670, avrgCnwkSdytrn: '13.2', fyerSalaryTotamt: 1_430_000_000_000, janSalaryAm: 113_000_000 },
      { foBbm: '가전', sexdstn: '여', rgllbrCo: 5_120, cnttkCo: 210, sm: 5_330, avrgCnwkSdytrn: '10.9', fyerSalaryTotamt: 520_000_000_000, janSalaryAm: 98_000_000 },
      { foBbm: '모바일', sexdstn: '남', rgllbrCo: 14_210, cnttkCo: 150, sm: 14_360, avrgCnwkSdytrn: '11.1', fyerSalaryTotamt: 1_820_000_000_000, janSalaryAm: 127_000_000 },
      { foBbm: '모바일', sexdstn: '여', rgllbrCo: 5_890, cnttkCo: 130, sm: 6_020, avrgCnwkSdytrn: '9.2', fyerSalaryTotamt: 640_000_000_000, janSalaryAm: 106_000_000 },
      { foBbm: '전사(스탭)', sexdstn: '남', rgllbrCo: 3_120, cnttkCo: 60, sm: 3_180, avrgCnwkSdytrn: '14.0', fyerSalaryTotamt: 460_000_000_000, janSalaryAm: 145_000_000 },
      { foBbm: '전사(스탭)', sexdstn: '여', rgllbrCo: 1_640, cnttkCo: 55, sm: 1_695, avrgCnwkSdytrn: '11.5', fyerSalaryTotamt: 200_000_000_000, janSalaryAm: 118_000_000 },
    ],
  },

  treasuryStock: {
    sourceRef: ref('자기주식 취득 및 처분 현황', '당기 중 자기주식 취득 및 처분 내역은 다음과 같습니다.'),
    rows: [
      { acqsMth1: '배당가능이익 범위 내 취득', acqsMth2: '직접취득', acqsMth3: '장내 직접 취득', stockKnd: '보통주', bsisQy: 24_500_000, changeQyAcqs: 30_000_000, changeQyDsps: 0, changeQyIncnr: 30_000_000, trmendQy: 24_500_000 },
      { acqsMth1: '배당가능이익 범위 내 취득', acqsMth2: '신탁계약에 의한 취득', acqsMth3: '수탁자 보유물량', stockKnd: '보통주', bsisQy: 5_200_000, changeQyAcqs: 2_800_000, changeQyDsps: 1_000_000, changeQyIncnr: 0, trmendQy: 7_000_000 },
      { acqsMth1: '기타취득', acqsMth2: '-', acqsMth3: '-', stockKnd: '우선주', bsisQy: 320_000, changeQyAcqs: 0, changeQyDsps: 0, changeQyIncnr: 0, trmendQy: 320_000 },
    ],
  },

  capitalChanges: {
    sourceRef: ref('증자(감자) 현황', '최근 5사업연도 중 증자·감자 내역은 다음과 같습니다.'),
    rows: [
      { isuDcrsDe: '2023-06-30', isuDcrsStle: '유상증자(제3자배정)', isuDcrsStockKnd: '보통주', isuDcrsQy: 12_000_000, isuDcrsMstvdivFvalAmount: 100, isuDcrsMstvdivAmount: 68_500 },
    ],
  },

  stockTotals: {
    sourceRef: ref('주식의 총수 등', '보고서 작성기준일 현재 주식의 총수는 다음과 같습니다.'),
    rows: [
      { se: '보통주', isuStockTotqy: 20_000_000_000, istcTotqy: 5_969_780_000, redc: 30_000_000, tesstkCo: 31_500_000, distbStockCo: 5_938_280_000 },
      { se: '우선주', isuStockTotqy: 2_000_000_000, istcTotqy: 822_890_000, redc: 0, tesstkCo: 320_000, distbStockCo: 822_570_000 },
      { se: '합계', isuStockTotqy: 22_000_000_000, istcTotqy: 6_792_670_000, redc: 30_000_000, tesstkCo: 31_820_000, distbStockCo: 6_760_850_000 },
    ],
  },

  executives: {
    sourceRef: ref('임원 현황', '보고서 작성기준일 현재 임원 현황은 다음과 같습니다.'),
    rows: [
      { nm: '김대표', sexdstn: '남', birthYm: '1965.02', ofcps: '대표이사 회장', rgistExctvAt: '등기임원', fteAt: '상근', chrgJob: '경영총괄', mainCareer: '서울대 전자공학 / 前 다핀반도체 사장', hffcPd: '12년 3개월', tenureEndOn: '2027-03-24' },
      { nm: '이사장', sexdstn: '여', birthYm: '1968.11', ofcps: '대표이사 사장', rgistExctvAt: '등기임원', fteAt: '상근', chrgJob: 'DX부문장', mainCareer: 'KAIST 전산학 박사 / 前 다핀리서치 소장', hffcPd: '9년 1개월', tenureEndOn: '2026-03-19' },
      { nm: '박재무', sexdstn: '남', birthYm: '1970.05', ofcps: '사장', rgistExctvAt: '등기임원', fteAt: '상근', chrgJob: '경영지원실장(CFO)', mainCareer: '연세대 경영학 / 前 다핀물산 CFO', hffcPd: '7년 8개월', tenureEndOn: '2026-03-19' },
      { nm: '최기술', sexdstn: '남', birthYm: '1969.09', ofcps: '사장', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: '반도체연구소장(CTO)', mainCareer: 'MIT 재료공학 박사 / 삼성전자 출신', hffcPd: '15년 2개월', tenureEndOn: null },
      { nm: '정사외', sexdstn: '여', birthYm: '1957.04', ofcps: '사외이사', rgistExctvAt: '등기임원', fteAt: '비상근', chrgJob: '감사위원회 위원장', mainCareer: '고려대 법학 / 前 금융감독원 부원장', hffcPd: '3년 0개월', tenureEndOn: '2026-03-19' },
      { nm: '한사외', sexdstn: '남', birthYm: '1960.12', ofcps: '사외이사', rgistExctvAt: '등기임원', fteAt: '비상근', chrgJob: '보수위원회 위원장', mainCareer: '서울대 경제학 / 前 한국은행 부총재보', hffcPd: '2년 0개월', tenureEndOn: '2027-03-24' },
      { nm: '오부사장', sexdstn: '남', birthYm: '1972.07', ofcps: '부사장', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: '메모리사업부장', mainCareer: '한양대 전자공학 / 사내 승진', hffcPd: '5년 4개월', tenureEndOn: null },
      { nm: '유부사장', sexdstn: '여', birthYm: '1974.01', ofcps: '부사장', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: '파운드리사업부장', mainCareer: '포항공대 화학공학 박사', hffcPd: '4년 6개월', tenureEndOn: null },
      { nm: '조전무', sexdstn: '남', birthYm: '1971.03', ofcps: '전무', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: '구매총괄', mainCareer: '성균관대 산업공학', hffcPd: '6년 0개월', tenureEndOn: null },
      { nm: '임전무', sexdstn: '남', birthYm: '1973.10', ofcps: '전무', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: '북미영업총괄', mainCareer: 'UCLA MBA / 前 다핀아메리카 법인장', hffcPd: '8년 2개월', tenureEndOn: null },
      { nm: '서상무', sexdstn: '여', birthYm: '1978.06', ofcps: '상무', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: 'IR그룹장', mainCareer: '이화여대 경영학 / CFA', hffcPd: '3년 9개월', tenureEndOn: null },
      { nm: '문상무', sexdstn: '남', birthYm: '1976.08', ofcps: '상무', rgistExctvAt: '미등기임원', fteAt: '상근', chrgJob: '법무팀장', mainCareer: '서울대 법학 / 변호사', hffcPd: '2년 5개월', tenureEndOn: null },
    ],
  },

  auditOpinions: {
    sourceRef: ref('회계감사인의 명칭 및 감사의견', '최근 3사업연도의 감사인과 감사의견은 다음과 같습니다.'),
    rows: [
      { bsnsYear: '2025', adtor: '한영회계법인', adtOpinion: '적정', emphsMatter: null, coreAdtMatter: '반도체 재고자산 평가 — 시장가격 하락에 따른 순실현가능가치 평가의 추정 불확실성' },
      { bsnsYear: '2024', adtor: '한영회계법인', adtOpinion: '적정', emphsMatter: null, coreAdtMatter: null },
      { bsnsYear: '2023', adtor: '삼일회계법인', adtOpinion: '적정', emphsMatter: '종속기업 투자주식 손상 검토 관련 강조사항', coreAdtMatter: null },
    ],
  },
};

/** 소형 코스닥사 픽스처 — 빈/엣지 상태 확인용 (우선주 없음, 무배당, 한정의견) */
const sparseOverview = {
  meta: { bsnsYear: '2025', reprtCode: '11011', rceptNo: '20260330000456' },

  dividends: {
    sourceRef: ref('배당에 관한 사항', '당사는 당기 중 배당을 실시하지 아니하였습니다.'),
    rows: [
      { se: '주당액면가액(원)', stockKnd: null, thstrm: 500, frmtrm: 500, lwfr: 500 },
      { se: '(연결)당기순이익(백만원)', stockKnd: null, thstrm: -12_400_000_000, frmtrm: 3_100_000_000, lwfr: 5_800_000_000 },
      { se: '주당 현금배당금(원)', stockKnd: '보통주', thstrm: null, frmtrm: null, lwfr: 50 },
      { se: '현금배당수익률(%)', stockKnd: '보통주', thstrm: null, frmtrm: null, lwfr: 0.4 },
      { se: '(연결)현금배당성향(%)', stockKnd: null, thstrm: null, frmtrm: null, lwfr: 8.2 },
    ],
  },

  majorShareholders: {
    sourceRef: ref('최대주주 및 특수관계인의 주식소유 현황', '최대주주 및 특수관계인의 소유 주식은 다음과 같습니다.'),
    rows: [
      { nm: '정창업', relate: '본인', stockKnd: '보통주', bsisPosesnStockCo: 6_120_000, bsisQotaRt: 34.2, trmendPosesnStockCo: 5_580_000, trmendQotaRt: 31.2 },
      { nm: '정형제', relate: '친인척', stockKnd: '보통주', bsisPosesnStockCo: 890_000, bsisQotaRt: 5.0, trmendPosesnStockCo: 890_000, trmendQotaRt: 5.0 },
      { nm: '계', relate: '-', stockKnd: '보통주', bsisPosesnStockCo: 7_010_000, bsisQotaRt: 39.2, trmendPosesnStockCo: 6_470_000, trmendQotaRt: 36.2 },
    ],
  },

  majorShareholderChanges: { rows: [] },

  minorityShareholders: {
    sourceRef: ref('소액주주 현황', '소액주주 현황은 다음과 같습니다.'),
    rows: [
      { shrholdrCo: 18_240, shrholdrTotCo: 18_265, shrholdrRate: 99.86, holdStockCo: 10_450_000, stockTotCo: 17_890_000, holdStockRate: 58.4 },
    ],
  },

  employees: {
    sourceRef: ref('직원 등의 현황', '직원 현황은 다음과 같습니다.'),
    rows: [
      { foBbm: '바이오사업', sexdstn: '남', rgllbrCo: 84, cnttkCo: 12, sm: 96, avrgCnwkSdytrn: '4.2', fyerSalaryTotamt: 6_200_000_000, janSalaryAm: 64_000_000 },
      { foBbm: '바이오사업', sexdstn: '여', rgllbrCo: 66, cnttkCo: 18, sm: 84, avrgCnwkSdytrn: '3.8', fyerSalaryTotamt: 4_700_000_000, janSalaryAm: 56_000_000 },
    ],
  },

  treasuryStock: { rows: [] },
  capitalChanges: null,

  stockTotals: {
    sourceRef: ref('주식의 총수 등', '주식의 총수는 다음과 같습니다.'),
    rows: [
      { se: '보통주', isuStockTotqy: 50_000_000, istcTotqy: 17_890_000, redc: 0, tesstkCo: 120_000, distbStockCo: 17_770_000 },
      { se: '합계', isuStockTotqy: 50_000_000, istcTotqy: 17_890_000, redc: 0, tesstkCo: 120_000, distbStockCo: 17_770_000 },
    ],
  },

  executives: {
    sourceRef: ref('임원 현황', '임원 현황은 다음과 같습니다.'),
    rows: [
      { nm: '정창업', sexdstn: '남', birthYm: '1971.06', ofcps: '대표이사', rgistExctvAt: '등기임원', fteAt: '상근', chrgJob: '경영총괄', mainCareer: '서울대 생명과학 박사 / 창업자', hffcPd: '11년 0개월', tenureEndOn: '2027-03-26' },
      { nm: '홍사외', sexdstn: '여', birthYm: '1963.09', ofcps: '사외이사', rgistExctvAt: '등기임원', fteAt: '비상근', chrgJob: '감사', mainCareer: '공인회계사 / 前 회계법인 파트너', hffcPd: '2년 0개월', tenureEndOn: '2026-03-26' },
    ],
  },

  auditOpinions: {
    sourceRef: ref('회계감사인의 명칭 및 감사의견', '최근 3사업연도의 감사인과 감사의견은 다음과 같습니다.'),
    rows: [
      { bsnsYear: '2025', adtor: '대성회계법인', adtOpinion: '한정', emphsMatter: '계속기업 가정의 불확실성 — 누적 결손 및 유동성 부족', coreAdtMatter: null },
      { bsnsYear: '2024', adtor: '대성회계법인', adtOpinion: '적정', emphsMatter: null, coreAdtMatter: null },
      { bsnsYear: '2023', adtor: '대성회계법인', adtOpinion: '적정', emphsMatter: null, coreAdtMatter: null },
    ],
  },
};

export const DART_OVERVIEW_FIXTURES = {
  default: fullOverview,
  sparse: sparseOverview,
};

/** 이 corpCode는 sparse 픽스처를 받아 빈/엣지 상태를 확인할 수 있다. */
export const SPARSE_FIXTURE_CORP_CODE = '99999999';

/**
 * @param {string} corpCode
 * @returns {import('./types').DartOverview}
 */
export function mockDartOverviewFor(corpCode) {
  return corpCode === SPARSE_FIXTURE_CORP_CODE
    ? DART_OVERVIEW_FIXTURES.sparse
    : DART_OVERVIEW_FIXTURES.default;
}

/**
 * DEV 전용: 백엔드에 없는 corpCode로도 sparse 픽스처 UI를 확인할 수 있게
 * 최소 CompanyDetail 껍데기를 반환한다. SPARSE_FIXTURE_CORP_CODE만 지원.
 * @param {string} corpCode
 * @returns {import('./types').CompanyDetail|null}
 */
export function mockDevCompanyDetailFor(corpCode) {
  if (corpCode !== SPARSE_FIXTURE_CORP_CODE) return null;
  return {
    company: {
      id: SPARSE_FIXTURE_CORP_CODE,
      name: '다핀바이오(목)',
      ticker: '999999',
      sector: '바이오·헬스케어',
      latestFilingType: '사업보고서',
      latestFilingDate: '2026-03-30',
      changeSummary: '',
    },
    scores: [],
    financials: [],
    findings: [],
    profile: { businessSummary: '' },
    mdnaHistory: [],
    recentFilings: [],
    dartOverview: DART_OVERVIEW_FIXTURES.sparse,
  };
}
