/**
 * Shape reference for the company-analysis mock data layer.
 *
 * This project has no TypeScript anywhere (no tsconfig, no .ts/.tsx files) —
 * these are JSDoc typedefs, not a build-time contract. They exist so the
 * shapes below can be swapped for a real DART XML parser later without
 * touching any component that consumes them.
 *
 * Field semantics are derived from DART_XML_Structure.md:
 *   - Quantitative values in the source XML live on <TE ACODE="..."> cells,
 *     scaled by ADECIMAL (e.g. -6 = value is in millions KRW in the raw
 *     text, multiply by 1,000,000 to get actual KRW). Every numeric value
 *     in this mock layer is stored ALREADY SCALED to actual KRW — a real
 *     parser would do `Number(rawText.replace(/,/g, '')) * 10 ** Math.abs(ADECIMAL)`
 *     before handing data to these shapes.
 *   - `concept` mirrors <TE ACODE> (e.g. "ifrs-full_Revenue").
 *   - Section labels mirror the SECTION-1/SECTION-2 TITLE hierarchy
 *     (see DART_XML_Structure.md §2); a real integration would carry the
 *     stable `AASSOCNOTE` code alongside the human label for cross-filing
 *     matching, which is why `sourceRef` below is free-form rather than a
 *     literal filing URL — there is no real filing viewer wired up yet.
 */

/**
 * @typedef {Object} Company
 * @property {string} id
 * @property {string} name
 * @property {string} [shortName]        short label for avatar chips, e.g. "삼성전자" -> "삼성전자", "SK하이닉스" -> "SK"
 * @property {string} ticker
 * @property {string} sector
 * @property {string} latestFilingType   e.g. "분기보고서"
 * @property {string} latestFilingDate   ISO date string
 * @property {string} changeSummary      one-line, e.g. "영업이익 급감, 위험 요인 추가"
 * @property {'KOSPI'|'KOSDAQ'} [market] listing market from stock.market_type
 * @property {number} [marketCapRank]    illustrative KOSPI market-cap rank, used for the search hero's quicklinks
 * @property {number} [kosdaqRank]       illustrative KOSDAQ market-cap rank, used for the search hero's quicklinks
 * @property {string} [marketCap]        display label, e.g. "약 450조원"
 */

/**
 * @typedef {'financialChange'|'riskEscalation'|'managementEmphasis'|'governance'} ScoreComponentKey
 */

/**
 * @typedef {Object} ScoreComponentHistoryPoint
 * @property {string} quarter  e.g. "2026Q1"
 * @property {number} value
 */

/**
 * @typedef {Object} ScoreComponent
 * @property {ScoreComponentKey} key
 * @property {number} maxPoints
 * @property {ScoreComponentHistoryPoint[]} history
 */

/**
 * @typedef {Object} FinancialSeriesPoint
 * @property {string} quarter
 * @property {number} value  already scaled (actual KRW, or already a %)
 */

/**
 * @typedef {Object} FinancialMetric
 * @property {string} concept  e.g. "ifrs-full_Revenue"
 * @property {string} label    e.g. "매출액"
 * @property {'재무상태표'|'손익계산서'|'현금흐름표'} statementType  공시 원문의 재무제표 구분.
 *   배열은 (재무제표 장 순서, 원문 내 계정 등장 순서)로 이미 정렬되어 온다.
 * @property {string} unit     "KRW" | "%"
 * @property {FinancialSeriesPoint[]} series
 */

/**
 * @typedef {'financial_anomaly'|'note'|'mdna'} ReasoningHopType
 */

/**
 * @typedef {Object} ReasoningHop
 * @property {ReasoningHopType} type
 * @property {string} sectionLabel
 * @property {string} excerpt
 * @property {string} sourceRef  filing id / section anchor for the "원문 보기" link
 */

/**
 * @typedef {'high'|'medium'|'low'} FindingSeverity
 */

/**
 * @typedef {Object} ReasoningChainFinding
 * @property {string} id
 * @property {FindingSeverity} severity
 * @property {ScoreComponentKey} scoreComponent
 * @property {string} summary
 * @property {ReasoningHop[]} hops
 */

/**
 * @typedef {'added'|'modified'|'removed'} SectionDiffChangeType
 */

/**
 * Which baseline filing a diff entry is measured against.
 *   QoQ — immediately preceding filing (for a Q1 report, that's the prior
 *         year's 사업보고서, since quarterly reports don't exist for Q4)
 *   YoY — same-quarter filing one year earlier
 * @typedef {'QoQ'|'YoY'} DiffComparisonType
 */

/**
 * The kind of comparison a filing section supports — drives which parts of
 * a SectionDiffEntry are populated and how SectionDiffGroup renders it.
 * @typedef {'structural'|'text'|'numeric'|'text_numeric'|'headcount'|'ownership'|'event'} DiffAnalysisType
 */

/**
 * One line item inside a numeric-flavored diff entry (재무상태표/손익계산서/
 * 현금흐름표/주석/임원 및 직원/주주현황). `unit` drives formatting:
 * 'KRW' and '%' reuse the same formatters as the financial trend charts;
 * 'count' is a plain integer with an optional Korean suffix (명/주/건/개).
 * @typedef {Object} NumericDeltaMetric
 * @property {string} label
 * @property {number} current
 * @property {number} baseline
 * @property {'KRW'|'%'|'count'} unit
 * @property {string} [unitLabel]  suffix for 'count', e.g. "명"
 */

/**
 * A single detected change for one filing section, measured against one
 * baseline. Which fields are populated depends on the section's
 * DiffAnalysisType — text/structural/event sections use before/after,
 * numeric/headcount/ownership sections use metrics, and 주석 (text_numeric)
 * can use both at once.
 * @typedef {Object} SectionDiffEntry
 * @property {string} sectionLabel     must match a DIFF_SECTION_CONFIG entry, see lib/comparison.js
 * @property {string} [sourceLabel]    granular DART breadcrumb (e.g. "II. 사업의 내용 > 2. 주요 제품 및 서비스 > DS 부문")
 *   shown in the "원문 보기" dialog in place of sectionLabel — the canonical
 *   sectionLabel is what groups entries into DIFF_SECTION_CONFIG's rows, but
 *   that label is often coarser than where the change actually lives in the filing.
 * @property {DiffComparisonType} comparisonType
 * @property {SectionDiffChangeType} [changeType]  omitted for pure numeric entries with no single narrative framing
 * @property {string} [before]
 * @property {string} [after]
 * @property {NumericDeltaMetric[]} [metrics]
 * @property {string} sourceRef  filing id / section anchor for the "원문 보기" link —
 *   added beyond the original spec shape because "every claim needs a visible
 *   path to its source" is a hard requirement that the base interface didn't
 *   actually give diffs a field for.
 */

/**
 * @typedef {Object} CompanyProfile
 * @property {string} businessDescription
 * @property {string} shareStructure
 * @property {string} governanceNotes
 */

/**
 * A single DART filing entry for the recent filings list.
 * @typedef {Object} RecentFiling
 * @property {string} id         Unique key
 * @property {string} type       e.g. "분기보고서", "사업보고서", "반기보고서"
 * @property {string} period     e.g. "2026 Q1", "2025 연간"
 * @property {string} date       ISO date string of submission
 * @property {string} dartUrl    DART URL for the filing
 */

/**
 * One filing that has a real MD&A (이사의 경영진단 및 분석의견) narrative —
 * quarterly/half-year filings aren't legally required to include this section
 * and are excluded upstream (they only ever contain boilerplate). No LLM
 * judgment is involved: this is a plain, deterministic list of filings for
 * the user to browse and read verbatim, not a "detected shift."
 * @typedef {Object} MdnaHistoryEntry
 * @property {string} rceptNo      Filing this excerpt came from
 * @property {string} quarter      e.g. "2025Q4"
 * @property {string} reportLabel  e.g. "2025년 사업보고서"
 * @property {string} excerpt      Raw MD&A text, verbatim from the filing (not LLM-summarized)
 * @property {string} sourceRef    Filing anchor for "원문 보기"
 */

/**
 * One business segment (사업 부문) disclosed in the filing.
 * @typedef {Object} BusinessSegment
 * @property {string} id
 * @property {string} name          e.g. "DS (Device Solutions)"
 * @property {string} description   One-line description of what this segment sells
 * @property {number} revenueShare  % of consolidated revenue
 * @property {'existing'|'added'|'removed'} status  Change vs prior filing
 */

/**
 * Revenue contribution of a specific product or service line.
 * @typedef {Object} ProductRevenue
 * @property {string} name    e.g. "HBM / 고대역폭 메모리"
 * @property {number} share   % of total revenue
 */

/**
 * A key customer disclosed (or inferred) from the filing.
 * Korean regulations require disclosure of customers >10 % of revenue.
 * @typedef {Object} KeyCustomer
 * @property {string} name              May be anonymised per filing norms
 * @property {number} revenueShare      % of total revenue
 * @property {string} note              e.g. "HBM 주요 구매처"
 * @property {'existing'|'new'|'removed'} status
 */

/**
 * Revenue breakdown by geography.
 * @typedef {Object} RegionalRevenue
 * @property {string} region    e.g. "아메리카"
 * @property {number} share     % of total revenue this quarter
 * @property {number} delta     Change in percentage points vs prior quarter
 */

/**
 * The excerpt shown in a panel's "공시 원문 보기" dialog (see SourceExcerptDialog) —
 * shared shape for every `*SourceRef` field below.
 * @typedef {Object} FilingExcerptRef
 * @property {string} sectionLabel
 * @property {string} excerpt
 * @property {string} sourceRef
 */

/**
 * A risk factor from the filing's 위험 요인 section.
 * @typedef {Object} KeyRisk
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string|null} insight       "So what?" callout; null when there's nothing beyond the description
 * @property {'existing'|'new'|'removed'} status   Change vs prior filing
 * @property {'high'|'medium'|'low'} severity
 * @property {FilingExcerptRef} sourceRef
 */

/**
 * One slice of the 주주 현황 donut (controlling holder, foreign, NPS, retail, ...).
 * @typedef {Object} ShareholderSlice
 * @property {string} id      also used as the color-lookup key, see lib HOLDER_COLORS in ShareholderPanel
 * @property {string} name
 * @property {string} detail  one-line clarification, e.g. "이재용 외 15인"
 * @property {number} share   % of total shares
 */

/**
 * 배당에 관한 사항, from the filing's dividend section.
 * @typedef {Object} DividendHistoryPoint
 * @property {string} [fiscalYear]  회계연도 (예: "2025")
 * @property {string} [year]        구버전 호환 — 당기/전기/전전기
 * @property {number|null} perShareKrw
 * @property {boolean} [isPartial]  분기·반기 보고서 당기 누계 여부
 */

/**
 * @typedef {Object} DividendInfo
 * @property {number} perShareKrw
 * @property {number} yieldPct
 * @property {number} payoutRatioPct
 * @property {boolean} [isInterimReport]  분기·반기 보고서 여부
 * @property {string} [reportLabel]       예: "2026년 1분기보고서"
 * @property {DividendHistoryPoint[]} history
 * @property {string} insight
 * @property {FilingExcerptRef} sourceRef
 */

/**
 * Structured overview data derived from 사업의 내용 in the filing.
 * All arrays are ordered by descending importance/share. The `*Insight`
 * strings are each panel's "So what?" callout; the `*SourceRef` fields back
 * their "공시 원문 보기" dialogs.
 * @typedef {Object} CompanyOverview
 * @property {BusinessSegment[]} segments
 * @property {string} [segmentInsight]
 * @property {FilingExcerptRef} [segmentSourceRef]
 * @property {ProductRevenue[]} products
 * @property {string} [productInsight]
 * @property {FilingExcerptRef} [productSourceRef]
 * @property {KeyCustomer[]} customers
 * @property {string} [customerInsight]
 * @property {FilingExcerptRef} [customerSourceRef]
 * @property {RegionalRevenue[]} regions
 * @property {string} [regionInsight]
 * @property {FilingExcerptRef} [regionSourceRef]
 * @property {KeyRisk[]} risks
 * @property {ShareholderSlice[]} [shareholders]
 * @property {string} [shareholderInsight]
 * @property {FilingExcerptRef} [shareholderSourceRef]
 * @property {DividendInfo} [dividend]
 */

/**
 * @typedef {Object} MonitoredCompany
 * @property {string} corpCode
 * @property {string} name
 * @property {string} ticker
 * @property {string} addedAt ISO local date-time
 */

/**
 * @typedef {Object} MonitoredCompanyList
 * @property {MonitoredCompany[]} items
 * @property {number} count
 * @property {number} limit
 */

/**
 * @typedef {Object} CompanyDetail
 * @property {Company} company
 * @property {ScoreComponent[]} scores
 * @property {FinancialMetric[]} financials              연결재무제표 기준
 * @property {FinancialMetric[]} [financialsSeparate]    별도재무제표 기준
 * @property {ReasoningChainFinding[]} findings
 * @property {SectionDiffEntry[]} diffs
 * @property {CompanyProfile} profile
 * @property {MdnaHistoryEntry[]} mdnaHistory
 * @property {RecentFiling[]} [recentFilings]
 * @property {CompanyOverview} [overview]
 * @property {boolean} [preview] stock-only preview before onboard
 */

export const SCORE_COMPONENT_LABELS = {
  financialChange: '재무 변동',
  riskEscalation: '위험 확대',
  managementEmphasis: '경영진 강조',
  governance: '지배구조·공시',
};
