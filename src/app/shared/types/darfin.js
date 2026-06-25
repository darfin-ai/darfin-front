/**
 * @typedef {'new' | 'analyzed' | 'pending'} FilingStatus
 * @typedef {'blue' | 'teal' | 'amber' | 'purple' | 'coral'} ColorKey
 * @typedef {'sign_reversal' | 'material' | 'changed' | 'minor' | 'new_section'} ChangeSeverity
 * @typedef {'up' | 'down' | 'new' | 'neutral'} FindingDirection
 */

/**
 * @typedef {Object} TrackedCompany
 * @property {string} id
 * @property {string} name
 * @property {string} corpCode
 * @property {string} initials
 * @property {ColorKey} colorKey
 * @property {{ type: string, filedAt: string, status: FilingStatus, findingCount: number|null } | null} latestFiling
 */

/**
 * @typedef {{ label: string, unit: string, points: { quarter: string, value: number }[] }} ChartData
 *
 * @typedef {Object} FilingFinding
 * @property {string} id
 * @property {string} title
 * @property {FindingDirection} direction
 * @property {ChangeSeverity | null} severity
 * @property {number | null} pageRef
 * @property {string} summary
 * @property {ChartData | null} chartData
 */

/**
 * @typedef {Object} FinancialRow
 * @property {string} label
 * @property {(number|null)[]} values
 * @property {(number|null)[]} deltas
 */

/**
 * @typedef {Object} FinancialTableData
 * @property {string[]} quarters
 * @property {FinancialRow[]} rows
 */

/**
 * @typedef {Object} BusinessSegmentRow
 * @property {string} segment
 * @property {number} revenue
 * @property {number} share
 * @property {number | null} yoy
 */

/**
 * @typedef {Object} BusinessOverviewSection
 * @property {string} description
 * @property {BusinessSegmentRow[]} segments
 * @property {number} employeeCount
 * @property {number} subsidiaryCount
 */

/**
 * @typedef {Object} MdaKpi
 * @property {string} label
 * @property {string} value
 * @property {'up' | 'down' | 'neutral'} direction
 */

/**
 * @typedef {Object} MdaParagraph
 * @property {string} title
 * @property {string} body
 */

/**
 * @typedef {Object} MdaSection
 * @property {MdaKpi[]} kpis
 * @property {MdaParagraph[]} paragraphs
 */

/**
 * @typedef {'사내이사' | '사외이사' | '독립이사'} DirectorType
 *
 * @typedef {Object} BoardMember
 * @property {string} name
 * @property {string} title
 * @property {DirectorType} type
 * @property {string} termEnd
 * @property {string | null} committee
 */

/**
 * @typedef {Object} BoardSection
 * @property {BoardMember[]} members
 */

/**
 * @typedef {'시장' | '운영' | '지정학적' | '규제' | '기술'} RiskCategory
 * @typedef {'high' | 'medium' | 'low'} RiskSeverity
 *
 * @typedef {Object} RiskFactor
 * @property {string} id
 * @property {RiskCategory} category
 * @property {string} title
 * @property {string} description
 * @property {RiskSeverity} severity
 */

/**
 * @typedef {Object} RiskSection
 * @property {RiskFactor[]} risks
 */

/**
 * @typedef {Object} DividendHistoryRow
 * @property {string} year
 * @property {number | null} dps
 * @property {number | null} yield
 * @property {number | null} payoutRatio
 */

/**
 * @typedef {Object} DividendSection
 * @property {string} policyStatement
 * @property {number} currentDps
 * @property {number} currentYield
 * @property {number} currentPayout
 * @property {DividendHistoryRow[]} history
 */

/**
 * @typedef {Object} KeyContract
 * @property {string} id
 * @property {string} counterparty
 * @property {string} contractType
 * @property {string} description
 * @property {string | null} amount
 * @property {string} termStart
 * @property {string | null} termEnd
 */

/**
 * @typedef {Object} ContractsSection
 * @property {KeyContract[]} contracts
 */

/**
 * @typedef {Object} FilingSections
 * @property {BusinessOverviewSection | null} businessOverview
 * @property {MdaSection | null} mda
 * @property {BoardSection | null} board
 * @property {RiskSection | null} risks
 * @property {DividendSection | null} dividend
 * @property {ContractsSection | null} contracts
 */

/**
 * @typedef {'earnings' | 'risk' | 'governance' | 'disclosure' | 'guidance'} SignalCategory
 * @typedef {'high' | 'medium' | 'low'} ImpactLevel
 *
 * @typedef {Object} CompanySignalScore
 * @property {number} score
 * @property {'high' | 'moderate' | 'low' | 'none'} tier
 * @property {number} signalCount
 */

/**
 * @typedef {Object} RecentSignal
 * @property {string} id
 * @property {SignalCategory} category
 * @property {FindingDirection} direction
 * @property {string} title
 * @property {string} subtitle
 * @property {ImpactLevel} impact
 * @property {string} sourceSection
 * @property {number | null} pageRef
 */

/**
 * @typedef {Object} MetricChange
 * @property {string} label
 * @property {string} previous
 * @property {string} current
 * @property {number | null} delta
 * @property {string} deltaLabel
 * @property {'up' | 'down' | 'sign_reversal'} direction
 */

/**
 * @typedef {Object} ManagementKeyword
 * @property {string} term
 * @property {number} previousCount
 * @property {number} currentCount
 */

/**
 * @typedef {Object} EscalatedRisk
 * @property {string} id
 * @property {string} title
 * @property {RiskSeverity} severity
 * @property {'new' | 'escalated' | 'deescalated'} changeType
 * @property {number | null} previousMentions
 * @property {number} currentMentions
 * @property {string | null} revenueExposure
 */

/**
 * @typedef {Object} GovernanceChange
 * @property {string} id
 * @property {string} type
 * @property {string} description
 */

/**
 * @typedef {Object} FilingIntelligence
 * @property {CompanySignalScore} signalScore
 * @property {RecentSignal[]} recentSignals
 * @property {MetricChange[]} metricChanges
 * @property {ManagementKeyword[]} managementKeywords
 * @property {EscalatedRisk[]} escalatedRisks
 * @property {GovernanceChange[]} governanceChanges
 */

/**
 * @typedef {Object} FilingInfo
 * @property {TrackedCompany} company
 * @property {string | null} reportType
 * @property {string | null} filedDate
 * @property {string | null} rcpNo
 * @property {boolean} aiComplete
 * @property {string | null} aiSummary
 * @property {{ price: number, changePercent: number } | null} stockPrice
 * @property {FinancialTableData | null} financialTable
 * @property {FilingSections | null} sections
 * @property {FilingFinding[]} findings
 * @property {FilingIntelligence | null} intelligence
 */
