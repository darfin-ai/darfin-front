export const DISCLOSURE_TYPES = [
  { code: "periodic", label: "정기공시" },
  { code: "major", label: "주요사항보고" },
  { code: "issuance", label: "발행공시" },
  { code: "equity", label: "지분공시" },
  { code: "other", label: "기타공시" },
  { code: "audit", label: "외부감사관련" },
  { code: "fund", label: "펀드공시" },
  { code: "asset", label: "자산유동화" },
  { code: "exchange", label: "거래소공시" },
  { code: "fair", label: "공정위공시" }
];

export const DISCLOSURES = [
  {
    id: "sample",
    company: "삼성전자",
    corpCode: "005930",
    typeCode: "periodic",
    typeLabel: "정기공시",
    title: "사업보고서 (2025.12)",
    date: "2026-03-31",
    submitter: "삼성전자",
    riskLabel: "Low",
    riskTier: 1,
    summary: [
      "AI 산업 성장에 따른 HBM 수요 증가로 반도체 부문 매출이 전년 대비 45% 증가했습니다.",
      "고부가가치 제품 중심의 판매 믹스 개선으로 영업이익 52조 원, 당기순이익 41조 원을 기록했습니다.",
      "생산 능력 확대를 위해 15조 원 규모의 유형자산 투자가 집행되었습니다."
    ],
    glossary: {
      영업이익: "기업의 주된 영업활동에서 발생한 이익으로, 매출액에서 매출원가와 판매비 및 관리비를 뺀 금액입니다.",
      당기순이익: "일정 기간 동안 발생한 모든 수익에서 모든 비용을 차감한 뒤 최종적으로 남은 이익입니다.",
      HBM: "High Bandwidth Memory의 약자로, AI 반도체 등에 쓰이는 고성능 메모리입니다.",
      유형자산: "토지, 건물, 기계장치처럼 기업이 영업활동에 장기간 사용하는 물리적 자산입니다."
    },
    analysisItems: [
      {
        key: "profitability",
        category: "Profitability_Trend",
        title: "수익성 개선 배경",
        content: "매출 증가와 영업이익 개선은 HBM 등 고마진 제품 비중 확대가 본격적으로 반영된 결과로 해석됩니다.",
        axisLabel: "위험도",
        riskLabel: "Low",
        riskTier: 1
      },
      {
        key: "capex",
        category: "Capex_Growth",
        title: "투자 확대 분석",
        content: "15조 원 규모의 유형자산 투자는 단기 현금흐름에는 부담을 줄 수 있으나, AI 반도체 시장 주도권 확보를 위한 전략적 투자로 볼 수 있습니다.",
        axisLabel: "위험도",
        riskLabel: "Neutral",
        riskTier: 2
      }
    ],
    document: {
      heading: "사업보고서",
      sections: [
        {
          title: "1. 회사의 개요",
          body: "본 보고서는 삼성전자의 2025 회계연도 사업 성과 및 재무 상태를 요약한 문서입니다."
        },
        {
          title: "2. 사업의 내용",
          body: "당사는 반도체, 스마트폰, 가전제품을 주력으로 생산하며 글로벌 시장에서 선도적 위치를 유지하고 있습니다.",
          highlightKey: "profitability",
          highlight:
            "특히 2025년에는 AI 산업의 성장과 함께 HBM 수요가 폭발적으로 증가하여 반도체 부문의 매출이 전년 대비 45% 성장했습니다."
        },
        {
          title: "3. 재무에 관한 사항",
          body: "영업이익은 52조 원을 기록했으며, 이는 원가 절감 노력과 고부가가치 제품 중심의 판매 믹스 개선에 기인합니다.",
          highlightKey: "capex",
          highlight:
            "또한 신규 공장 증설을 위해 15조 원 규모의 유형자산 투자가 진행되었으며, 이는 향후 생산 능력 확대를 위한 전략적 조치입니다.",
          closing: "최종적인 당기순이익은 41조 원으로 집계되었습니다."
        }
      ]
    }
  },
  {
    id: "d2",
    company: "삼성전자",
    corpCode: "005930",
    typeCode: "major",
    typeLabel: "주요사항보고",
    title: "유상증자결정",
    date: "2026-03-15",
    submitter: "삼성전자",
    riskLabel: "High",
    riskTier: 4
  },
  {
    id: "d3",
    company: "삼성전자",
    corpCode: "005930",
    typeCode: "equity",
    typeLabel: "지분공시",
    title: "임원ㆍ주요주주 특정증권 등 소유상황보고서",
    date: "2026-03-10",
    submitter: "홍길동",
    riskLabel: "Critical",
    riskTier: 5
  },
  {
    id: "d4",
    company: "삼성전자",
    corpCode: "005930",
    typeCode: "other",
    typeLabel: "기타공시",
    title: "단일판매ㆍ공급계약체결",
    date: "2026-02-28",
    submitter: "삼성전자",
    riskLabel: "Neutral",
    riskTier: 2
  },
  {
    id: "d5",
    company: "삼성전자",
    corpCode: "005930",
    typeCode: "periodic",
    typeLabel: "정기공시",
    title: "반기보고서 (2025.06)",
    date: "2025-08-14",
    submitter: "삼성전자",
    riskLabel: "Low",
    riskTier: 1
  },
  {
    id: "d6",
    company: "SK하이닉스",
    corpCode: "000660",
    typeCode: "audit",
    typeLabel: "외부감사관련",
    title: "감사보고서 (2025.12)",
    date: "2026-03-29",
    submitter: "SK하이닉스",
    riskLabel: "한정",
    riskTier: 5,
    extra: {
      auditOpinion: "한정"
    }
  },
  {
    id: "d7",
    company: "현대자동차",
    corpCode: "005380",
    typeCode: "exchange",
    typeLabel: "거래소공시",
    title: "현금ㆍ현물배당결정",
    date: "2026-03-20",
    submitter: "현대자동차",
    riskLabel: "Low",
    riskTier: 1
  },
  {
    id: "d8",
    company: "NAVER",
    corpCode: "035420",
    typeCode: "fair",
    typeLabel: "공정위공시",
    title: "대규모내부거래관련공시",
    date: "2026-03-05",
    submitter: "NAVER",
    riskLabel: "Warning",
    riskTier: 3
  },
  {
    id: "d9",
    company: "LG화학",
    corpCode: "051910",
    typeCode: "asset",
    typeLabel: "자산유동화",
    title: "자산유동화증권발행신고서",
    date: "2026-02-20",
    submitter: "LG화학",
    riskLabel: "High",
    riskTier: 4,
    extra: {
      isTrueSaleConfirmed: false
    }
  },
  {
    id: "d10",
    company: "미래에셋글로벌리츠",
    corpCode: "396690",
    typeCode: "fund",
    typeLabel: "펀드공시",
    title: "집합투자증권결산서",
    date: "2026-02-10",
    submitter: "미래에셋글로벌리츠",
    riskLabel: "Low",
    riskTier: 1
  },
  {
    id: "d11",
    company: "카카오",
    corpCode: "035720",
    typeCode: "issuance",
    typeLabel: "발행공시",
    title: "주권상장법인증권신고서",
    date: "2026-01-28",
    submitter: "카카오",
    riskLabel: "Neutral",
    riskTier: 2
  },
  {
    id: "d12",
    company: "삼성전자",
    corpCode: "005930",
    typeCode: "major",
    typeLabel: "주요사항보고",
    title: "타법인주식및출자증권양수결정",
    date: "2026-01-15",
    submitter: "삼성전자",
    riskLabel: "High",
    riskTier: 4
  }
];

export function getDisclosureById(id) {
  return DISCLOSURES.find((disclosure) => disclosure.id === id) ?? DISCLOSURES[0];
}

export function searchDisclosures({ query, selectedTypeCodes, dateRange }) {
  const normalizedQuery = query.trim().toLowerCase();
  const from = dateRange?.from ? toDateOnly(dateRange.from) : null;
  const to = dateRange?.to ? toDateOnly(dateRange.to) : null;

  return DISCLOSURES.filter((disclosure) => {
    const matchesQuery =
      !normalizedQuery ||
      disclosure.company.toLowerCase().includes(normalizedQuery) ||
      disclosure.corpCode.includes(normalizedQuery) ||
      disclosure.title.toLowerCase().includes(normalizedQuery);
    const matchesType = selectedTypeCodes.length === 0 || selectedTypeCodes.includes(disclosure.typeCode);
    const matchesFrom = !from || disclosure.date >= from;
    const matchesTo = !to || disclosure.date <= to;

    return matchesQuery && matchesType && matchesFrom && matchesTo;
  });
}

export function sortDisclosures(disclosures, sortKey, sortDirection) {
  const sorted = [...disclosures];
  const dir = sortDirection === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    if (sortKey === "date") return dir * a.date.localeCompare(b.date);
    if (sortKey === "risk") return dir * (a.riskTier - b.riskTier);
    if (sortKey === "type") return dir * a.typeLabel.localeCompare(b.typeLabel, "ko");
    if (sortKey === "title") return dir * a.title.localeCompare(b.title, "ko");
    return 0;
  });

  return sorted;
}

function toDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
