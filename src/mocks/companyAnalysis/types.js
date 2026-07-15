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
 * @property {ShareholderSlice[]} [shareholders]   @deprecated 개요 탭은 DartOverview.majorShareholders 사용
 * @property {string} [shareholderInsight]
 * @property {FilingExcerptRef} [shareholderSourceRef]
 * @property {DividendInfo} [dividend]             @deprecated 개요 탭은 DartOverview.dividends 사용
 */

/* ------------------------------------------------------------------ *
 * DART 정기공시 구조화 데이터 (dartOverview)
 * 각 섹션은 DART OpenAPI 보고서 엔드포인트 1개와 1:1 대응한다.
 * 필드명은 DART 응답 필드의 camelCase, 수치 문자열은 number로 파싱,
 * "-"는 null. 섹션이 null이면 해당 엔드포인트에 데이터가 없다는 뜻.
 * ------------------------------------------------------------------ */

/**
 * @typedef {Object} DartSectionMeta
 * @property {string} bsnsYear   사업연도, 예: "2025"
 * @property {'11011'|'11012'|'11013'|'11014'} reprtCode  사업/반기/1분기/3분기보고서
 * @property {string} rceptNo    접수번호 (공시 원문 링크용)
 */

/**
 * alotMatter (배당에 관한 사항) row. se 예: "주당액면가액(원)",
 * "(연결)당기순이익(백만원)", "주당 현금배당금(원)", "(연결)현금배당성향(%)",
 * "현금배당수익률(%)". 금액류는 실제 원 단위로 스케일 완료된 값.
 * @typedef {Object} DartDividendRow
 * @property {string} se
 * @property {string|null} stockKnd   "보통주" | "우선주" | null
 * @property {number|null} thstrm    당기
 * @property {number|null} frmtrm    전기
 * @property {number|null} lwfr      전전기
 */

/**
 * hyslrSttus (최대주주 및 특수관계인 현황) row. 합계 row는 nm === "계".
 * @typedef {Object} DartMajorShareholderRow
 * @property {string} nm
 * @property {string} relate    "본인" | "친인척" | "계열회사" 등
 * @property {string} stockKnd
 * @property {number|null} bsisPosesnStockCo    기초 주식수
 * @property {number|null} bsisQotaRt           기초 지분율 %
 * @property {number|null} trmendPosesnStockCo  기말 주식수
 * @property {number|null} trmendQotaRt         기말 지분율 %
 */

/**
 * hyslrChgSttus (최대주주 변동현황) row
 * @typedef {Object} DartMajorShareholderChangeRow
 * @property {string} changeOn   변동일 ISO date
 * @property {string} mxmmShrholdrNm
 * @property {number|null} posesnStockCo
 * @property {number|null} qotaRt
 * @property {string} changeCause
 */

/**
 * mrhlSttus (소액주주 현황) row
 * @typedef {Object} DartMinorityShareholderRow
 * @property {number|null} shrholdrCo     소액주주수
 * @property {number|null} shrholdrTotCo  전체 주주수
 * @property {number|null} shrholdrRate   소액주주 비율 %
 * @property {number|null} holdStockCo    보유 주식수
 * @property {number|null} stockTotCo     총발행 주식수
 * @property {number|null} holdStockRate  보유주식 비율 %
 */

/**
 * empSttus (직원 현황) row — (사업부문 × 성별)당 1개
 * @typedef {Object} DartEmployeeRow
 * @property {string} foBbm            사업부문
 * @property {string} sexdstn          "남" | "여"
 * @property {number|null} rgllbrCo    정규직
 * @property {number|null} cnttkCo     계약직
 * @property {number|null} sm          합계
 * @property {string|null} avrgCnwkSdytrn   평균 근속연수 (예: "12.5")
 * @property {number|null} fyerSalaryTotamt 연간급여총액 (실제 원)
 * @property {number|null} janSalaryAm      1인평균급여액 (실제 원)
 */

/**
 * tesstkAcqsDspsSttus (자기주식 취득 및 처분 현황) row
 * @typedef {Object} DartTreasuryStockRow
 * @property {string} acqsMth1   대분류, 예: "배당가능이익 범위 내 취득"
 * @property {string} acqsMth2   중분류, 예: "직접취득"
 * @property {string} acqsMth3   소분류
 * @property {string} stockKnd
 * @property {number|null} bsisQy         기초
 * @property {number|null} changeQyAcqs   취득
 * @property {number|null} changeQyDsps   처분
 * @property {number|null} changeQyIncnr  소각
 * @property {number|null} trmendQy       기말
 */

/**
 * irdsSttus (증자·감자 현황) row
 * @typedef {Object} DartCapitalChangeRow
 * @property {string} isuDcrsDe     일자 ISO date
 * @property {string} isuDcrsStle   "유상증자(제3자배정)" | "무상증자" | "감자" 등
 * @property {string} isuDcrsStockKnd
 * @property {number|null} isuDcrsQy
 * @property {number|null} isuDcrsMstvdivFvalAmount  주당 액면가액 (원)
 * @property {number|null} isuDcrsMstvdivAmount      주당 발행(감자)가액 (원)
 */

/**
 * stockTotqySttus (주식 총수 현황) row — se당 1개
 * @typedef {Object} DartStockTotalRow
 * @property {string} se   "보통주" | "우선주" | "합계"
 * @property {number|null} isuStockTotqy  발행할 주식총수
 * @property {number|null} istcTotqy      발행주식총수 (현재)
 * @property {number|null} redc           감자 등 감소 주식수
 * @property {number|null} tesstkCo       자기주식수
 * @property {number|null} distbStockCo   유통주식수
 */

/**
 * exctvSttus (임원 현황) row
 * @typedef {Object} DartExecutiveRow
 * @property {string} nm
 * @property {string} sexdstn
 * @property {string} birthYm       "1968.03"
 * @property {string} ofcps         직위
 * @property {string} rgistExctvAt  "등기임원" | "미등기임원"
 * @property {string} fteAt         "상근" | "비상근"
 * @property {string} chrgJob       담당업무
 * @property {string} mainCareer    주요경력
 * @property {string|null} hffcPd   재직기간
 * @property {string|null} tenureEndOn  임기만료일
 */

/**
 * accnutAdtorNmNdAdtOpinion (회계감사인의 명칭 및 감사의견) row
 * @typedef {Object} DartAuditOpinionRow
 * @property {string} bsnsYear
 * @property {string} adtor
 * @property {string|null} adtOpinion   "적정" | "한정" | "부적정" | "의견거절"
 * @property {string|null} emphsMatter    강조사항
 * @property {string|null} coreAdtMatter  핵심감사사항
 */

/**
 * 과거 정기공시에서 가져온 section의 출처 기간 — 분기보고서엔 기재의무가
 * 없는 항목(직원현황 등)을 최근 반기/사업보고서로 보정했을 때만 붙는다.
 * @typedef {Object} DartSectionAsOf
 * @property {string} bsnsYear
 * @property {string} reprtCode
 * @property {string} rceptNo
 */

/**
 * DART 엔드포인트 1개분의 응답. sourceRef가 있으면 해당 패널의
 * "공시 원문 보기" 다이얼로그를 연다. asOf가 있으면 현재 조회 기간이 아닌
 * 더 과거의 정기공시에서 채운 데이터라는 뜻 — meta.reprtCode와 다르다.
 * @template T
 * @typedef {Object} DartSection
 * @property {T[]} rows
 * @property {FilingExcerptRef} [sourceRef]
 * @property {DartSectionAsOf} [asOf]
 */

/**
 * 10개 DART 정기공시 엔드포인트로 구성한 구조화 개요.
 * 섹션 null = 해당 엔드포인트 무자료 (status 013).
 * @typedef {Object} DartOverview
 * @property {DartSectionMeta} meta
 * @property {DartSection<DartDividendRow>|null} dividends                  alotMatter
 * @property {DartSection<DartMajorShareholderRow>|null} majorShareholders  hyslrSttus
 * @property {DartSection<DartMajorShareholderChangeRow>|null} majorShareholderChanges  hyslrChgSttus
 * @property {DartSection<DartMinorityShareholderRow>|null} minorityShareholders        mrhlSttus
 * @property {DartSection<DartEmployeeRow>|null} employees                  empSttus
 * @property {DartSection<DartTreasuryStockRow>|null} treasuryStock         tesstkAcqsDspsSttus
 * @property {DartSection<DartCapitalChangeRow>|null} capitalChanges        irdsSttus
 * @property {DartSection<DartStockTotalRow>|null} stockTotals              stockTotqySttus
 * @property {DartSection<DartExecutiveRow>|null} executives                exctvSttus
 * @property {DartSection<DartAuditOpinionRow>|null} auditOpinions          accnutAdtorNmNdAdtOpinion
 */

/**
 * 관심 기업(watchlist) — 무료·무제한 별표 북마크.
 * GET/POST/DELETE /api/v1/companies/starred[/{corpCode}]
 * @typedef {Object} StarredCompany
 * @property {string} corpCode
 * @property {string} name
 * @property {string} ticker
 * @property {string} addedAt ISO local date-time
 */

/**
 * @typedef {Object} StarredCompanyList
 * @property {StarredCompany[]} items
 * @property {number} count
 */

/**
 * AI 분석 열람권 구매 — POST /api/v1/companies/{corpCode}/ai-analysis/unlock
 * 2000토큰 차감(1회) + 관심 기업 자동 등록. 별표를 해제해도 열람권은 유지된다.
 * 잔액 부족 시 402.
 * @typedef {Object} AiUnlockResult
 * @property {boolean} unlocked
 * @property {boolean} alreadyUnlocked true면 이미 열람권 보유 — 토큰 차감 없음
 * @property {number} tokenBalance 차감 후 잔액
 */

/**
 * @typedef {Object} CompanyDetail
 * @property {Company} company
 * @property {ScoreComponent[]} scores
 * @property {FinancialMetric[]} financials              연결재무제표 기준
 * @property {FinancialMetric[]} [financialsSeparate]    별도재무제표 기준
 * @property {ReasoningChainFinding[]} findings
 * @property {CompanyProfile} profile
 * @property {MdnaHistoryEntry[]} mdnaHistory
 * @property {RecentFiling[]} [recentFilings]
 * @property {CompanyOverview} [overview]
 * @property {DartOverview} [dartOverview]  DART 정기공시 API 기반 구조화 개요 (개요 탭)
 * @property {boolean} [preview] stock-only preview before onboard
 * @property {boolean} [aiUnlocked] 요청 사용자의 AI 분석 열람권 보유 여부
 */

/**
 * AI분석 탭 — GET /api/v1/companies/{corpCode}/ai-analysis
 * 백엔드 계약 사본: darfin-main dto/analysis/AiAnalysisResponse.java —
 * 한쪽을 바꾸면 반드시 같이 바꿀 것 (AGENTS.md 규칙).
 *
 * @typedef {'liquidity'|'leverage'|'earnings_quality'|'going_concern'|'governance'|'operational'} RiskCategory
 * @typedef {'신규발생'|'악화'|'지속'|'개선'|'해소'|'정상'|'데이터부족'} RiskState
 */

/**
 * @typedef {Object} RiskCategoryState
 * @property {RiskCategory} category
 * @property {RiskState} state
 * @property {number} consecutiveQtrs 같은 상태 연속 분기 수 ("악화 3분기 연속")
 * @property {string|null} narrativeKo LLM 생성 서사 — null이면 quant-only(폴링 대상)
 * @property {string|null} watchNextKo "차기 분기 확인 사항" (prescriptive 출력)
 * @property {Object|null} signals 판정에 쓰인 정량 신호 스냅샷
 */

/**
 * @typedef {Object} RiskTrajectoryPoint
 * @property {string} quarter 예: 2024Q1
 * @property {RiskState} state
 * @property {number} consecutiveQtrs
 */

/**
 * @typedef {Object} RiskCategoryTrajectory
 * @property {RiskCategory} category
 * @property {RiskTrajectoryPoint[]} points
 */

/**
 * @typedef {Object} AiAnalysisQuarterMetrics
 * @property {string} quarter
 * @property {Object} metrics ratios/altmanZ/piotroskiF/dupont/zscores12q 등 (결정론적 산출)
 */

/**
 * @typedef {Object} DossierEvent
 * @property {string} rceptNo
 * @property {'item_appeared'|'item_disappeared'|'correction_material'|'restatement_gap'} eventType
 * @property {string} category
 * @property {string|null} itemKey
 * @property {Object|null} detail
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AiAnalysis
 * @property {'locked'|'preparing_filings'|'quant_only'|'quant_ready'|'generating_narrative'|'complete'|'failed'|'insufficient_data'|'preview'} status locked = 열람권 미보유 게이트, quant_only = quant_ready 구버전 호환
 * @property {number} [unlockCost] status=locked일 때만 — 열람권 가격(토큰)
 * @property {boolean} [retryable] status=failed일 때 사용자가 다시 확인할 수 있는지 여부
 * @property {string} [errorCode] status=failed일 때 사용자 노출 문구 선택용 안전한 오류 코드
 * @property {'CFS'|'OFS'|null} fsDiv 상태머신이 사용한 재무제표 구분 (연결 우선, 별도 폴백)
 * @property {boolean} preview 미온보딩 종목 — 계산 없이 게이트만 알림
 * @property {string[]} quarters
 * @property {RiskCategoryState[]} currentStates 최신 분기의 카테고리별 상태
 * @property {RiskCategoryTrajectory[]} trajectories
 * @property {AiAnalysisQuarterMetrics[]} metricsSeries
 * @property {DossierEvent[]} dossierEvents
 */

export const SCORE_COMPONENT_LABELS = {
  financialChange: '재무 변동',
  riskEscalation: '위험 확대',
  managementEmphasis: '경영진 강조',
  governance: '지배구조·공시',
};
