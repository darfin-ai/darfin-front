/**
 * Frozen snapshot of a real analysis record from darfin_dev (pipeline: RAW -> PARSED -> DIFFED -> SUMMARIZED -> FINDINGS).
 * Source: 삼성전자 (corp_code 00126380) 2026년 1분기보고서, DART rcept_no 20260515002181, filed 2026-05-15.
 * Snapshotted for the landing page hero so the demo doesn't take a runtime DB/API dependency on a public route.
 * Re-snapshot when refreshing the landing page with a newer quarter.
 */
export const heroDemo = {
  company: {
    name: "삼성전자",
    ticker: "005930",
    market: "KOSPI",
  },
  source: {
    label: "삼성전자 2026년 1분기보고서 (DART)",
    rceptNo: "20260515002181",
    filedDate: "2026-05-15",
  },
  before: {
    sectionLabel: "II. 사업의 내용 > 4. 매출 및 수주상황",
    highlight: "133조 8,734억원",
    text:
      "가. 매출실적 2026년(제58기) 1분기 매출은 133조 8,734억원으로 전년 동기 대비 69.2% 증가하였습니다. " +
      "부문별로는 전년 동기 대비 DX 부문이 1.8% 증가, DS 부문이 225.2% 증가, SDC는 14.1% 증가하였으며, " +
      "Harman은 11.9% 증가하였습니다. (1) 주요 제품별 매출실적 (2) 매출유형별 매출실적 (3) 주요 지역별 매출 현황 " +
      "나. 판매경로 등 (1) 국내 (2) 해외 (3) 판매경로별 매출액 비중 다. 판매방법 및 조건 " +
      "마. 주요 매출처 2026년 1분기 당사의 주요 매출처로는 Alphabet, Amazon, Apple 등(알파벳순) 입니다. " +
      "당사의 주요 5대 매출처에 대한 매출비중은 전체 매출액 대비 약 23% 수준입니다.",
  },
  finding: {
    severity: "high",
    scoreComponent: "financialChange",
    summary:
      "2026년 1분기 매출이 전년 동기 대비 69.2% 증가하며 133조 8,734억원을 기록했고, 유동자산 및 자산총계 등 주요 재무 지표가 " +
      "크게 개선되었습니다. DX 및 DS 부문 매출 비중, 스마트폰 및 메모리 가격, 원재료 가격, 시설투자액 등 사업 전반의 주요 " +
      "수치들이 변동했습니다.",
  },
  hops: [
    {
      sectionLabel: "II. 사업의 내용 > 2. 주요 제품 및 서비스",
      excerpt: "DX 부문 매출 비중은 39.3%, DS 부문은 61%로 변경, 메모리 가격은 약 146% 상승",
    },
    {
      sectionLabel: "III. 재무에 관한 사항 > 2-1. 연결 재무상태표",
      excerpt: "유동자산 247.7조원 → 306.2조원 (+23.6%), 자산총계 566.9조원 → 633.3조원 (+11.7%)",
    },
    {
      sectionLabel: "II. 사업의 내용 > 6. 주요계약 및 연구개발활동",
      excerpt: "연구개발비용 11조 3,374억원",
    },
  ],
};

/**
 * The other three findings generated from the same filing (findings.rcept_no = 20260515002181),
 * used to show that one filing yields multiple analysis lenses, not just a single headline number.
 * score_component values match the real enum used in the findings table.
 */
export const heroFindingsByLens = [
  {
    scoreComponent: "financialChange",
    label: "재무 변화",
    severity: "high",
    summary: heroDemo.finding.summary,
  },
  {
    scoreComponent: "managementEmphasis",
    label: "경영진 강조 사항",
    severity: "medium",
    summary:
      "2026년 1분기 기준 R&D 투자가 11.3조원으로 변경되었고, 세계 특허 288,770건 보유와 함께 TV 및 모바일 사업 전략 및 신제품 라인업이 업데이트되었습니다.",
  },
  {
    scoreComponent: "riskEscalation",
    label: "리스크 변화",
    severity: "medium",
    summary:
      "2026년 1분기말 기준 주가변동위험에 따른 기타포괄손익 및 당기손익 영향이 변경되었으며, 통화선도 거래 건수가 3,308건으로 감소했습니다.",
  },
  {
    scoreComponent: "governance",
    label: "지배구조",
    severity: "medium",
    summary:
      "주요 주주 및 계열회사의 보통주 지분율이 소폭 감소했으며, 발행주식총수는 동일하나 의결권 행사 가능 주식수가 변경되었습니다.",
  },
];
