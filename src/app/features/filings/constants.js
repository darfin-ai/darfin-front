// 공시 대분류(검색화면 상단 칩)와 1:1 대응.
// 코드값은 백엔드 disclosure_group.group_code 그대로 사용한다.
// (검색 API는 disclosure.type_code로 필터링하지만, 화면에서는 대분류 단위로 칩을 보여주고
//  실제 호출 시 그 대분류에 속한 type_code 목록으로 변환해 보낸다 — 변환표는 typeCodesByGroup 참고)
// AI 분석 카테고리 영문 코드 → 한국어 표시명
export const ANALYSIS_CATEGORY_LABELS = {
  // 지분공시 (EQUITY)
  Holding_Purpose:       "보유 목적",
  Governance_Impact:     "경영권 영향",
  Market_Signal:         "시장 신호",

  // 사업보고서 (BIZ_REPORT)
  Market_Competitiveness: "시장 경쟁력",
  Financial_Health:       "재무 건전성",
  Risk_Exposure:          "리스크 노출",
  Governance:             "지배구조",
  Growth_Potential:       "성장 잠재력",

  // 유상증자 (RIGHTS_OFFERING)
  Dilution_Risk:          "희석 위험",
  Funding_Purpose:        "자금 조달 목적",
  Pricing_Fairness:       "발행가 적정성",
  Major_Shareholder_Impact: "주요주주 영향",

  // 주요사항보고 (MAJOR_EVENT)
  Decision_Scale:         "결정 규모",
  Counterparty_Risk:      "거래상대방 위험",
  Financial_Impact:       "재무적 영향",
  Execution_Risk:         "이행 위험",

  // 발행공시 (ISSUANCE)
  Offering_Terms:         "발행 조건",
  Investment_Risk:        "투자 위험",
  Use_Of_Proceeds:        "자금 사용 계획",

  // 외부감사 (AUDIT)
  Audit_Opinion:          "감사 의견",
  Key_Audit_Risk:         "핵심 감사 위험",
  Internal_Control:       "내부통제",

  // 펀드공시 (FUND)
  Strategy_Risk:          "운용 전략 위험",
  Fee_Reasonableness:     "보수 적정성",
  Redemption_Protection:  "환매 안전성",

  // 자산유동화 (ABS)
  True_Sale_Risk:         "자산 양도 위험",
  Credit_Enhancement:     "신용 보강",
  Asset_Quality:          "기초자산 건전성",

  // 거래소공시 (EXCHANGE)
  Action_Severity:        "조치 심각도",
  Trading_Impact:         "거래 영향",
  Listing_Risk:           "상장 유지 위험",

  // 공정위공시 (FTC)
  Transaction_Fairness:   "거래 공정성",
  Approval_Process:       "승인 절차",
  Tunneling_Risk:         "터널링 위험",

  // 기타공시 (OTHER)
  Key_Fact:               "핵심 사실",
  Market_Impact:          "시장 영향",
  Uncertainty:            "불확실성",
};

export const DISCLOSURE_GROUPS = [
  { code: "PERIODIC", label: "정기공시" },
  { code: "MAJOR_EVENT", label: "주요사항보고" },
  { code: "ISSUANCE", label: "발행공시" },
  { code: "EQUITY", label: "지분공시" },
  { code: "OTHER", label: "기타공시" },
  { code: "AUDIT", label: "외부감사관련" },
  { code: "FUND", label: "펀드공시" },
  { code: "ABS", label: "자산유동화" },
  { code: "EXCHANGE", label: "거래소공시" },
  { code: "FTC", label: "공정위공시" }
];
