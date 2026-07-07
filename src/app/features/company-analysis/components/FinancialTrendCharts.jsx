import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { TrendChartCard } from './TrendChartCard';
import { formatPercent, formatFinancialMetricValue } from '../lib/format';
import { buildFinancialRowStyles, rowStyleClasses } from '../lib/financialRowStyle';

// 투자자가 가장 먼저 찾는 계정 순서 — 상단 대시보드 차트로 항상 노출한다.
const KEY_METRIC_ORDER = [
  '매출액',
  '영업이익',
  '당기순이익',
  '자산총계',
  '부채총계',
  '자본총계',
  '영업활동현금흐름',
  '투자활동현금흐름',
  '재무활동현금흐름',
];

/** "당기순이익 (손익계산서)" → "당기순이익" — 동명 계정 구분용 접미를 뗀 기본 이름 */
function baseName(label) {
  return label.replace(/ \((재무상태표|손익계산서|현금흐름표)\)$/, '');
}

function keyMetricRank(label) {
  // 계정명 표기의 공백 변형('영업활동 현금흐름')도 같은 지표로 취급한다.
  return KEY_METRIC_ORDER.indexOf(baseName(label).replaceAll(' ', ''));
}

/**
 * 같은 분기에 값이 여러 개 오는 비정상 데이터를 방어적으로 정리한다
 * (마지막 값 우선). "YYYYQn" 라벨은 사전순 정렬이 곧 시간순이다.
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric} metric
 */
function sanitizeSeries(metric) {
  const byQuarter = new Map(metric.series.map((point) => [point.quarter, point]));
  return { ...metric, series: [...byQuarter.values()].sort((a, b) => a.quarter.localeCompare(b.quarter)) };
}

function qoqChange(series) {
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  if (!previous || previous.value === 0) return null;
  return ((latest.value - previous.value) / Math.abs(previous.value)) * 100;
}

/** 계정 행용 초소형 추이 그래프 — 축·툴팁 없이 모양만 보여준다. */
function Sparkline({ series }) {
  const w = 96;
  const h = 28;
  const pad = 2;
  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const step = (w - pad * 2) / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${(pad + i * step).toFixed(1)},${(h - pad - ((v - min) * (h - pad * 2)) / span).toFixed(1)}`)
    .join(' ');
  return (
    <svg width={w} height={h} aria-hidden="true" className="shrink-0">
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function AccountRow({ metric, rowStyle, expanded, onToggle }) {
  const latest = metric.series[metric.series.length - 1];
  const pct = qoqChange(metric.series);
  const classes = rowStyleClasses(rowStyle);
  const isSection = rowStyle.role === 'section';

  return (
    <li className={`border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${classes.row}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 py-2.5 pr-4 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
          isSection ? 'pt-3' : ''
        }`}
        style={{ paddingLeft: classes.pad }}
      >
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-300 dark:text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''} ${
            isSection ? 'opacity-60' : ''
          }`}
        />
        <span className={`min-w-0 flex-1 truncate ${classes.label}`}>{baseName(metric.label)}</span>
        <span className="hidden sm:block">
          <Sparkline series={metric.series} />
        </span>
        <span className={`w-24 shrink-0 text-right tabular-nums ${classes.value}`}>
          {formatFinancialMetricValue(metric, latest.value)}
        </span>
        <span
          className={`w-20 shrink-0 text-right text-xs font-medium tabular-nums ${
            pct == null ? 'text-slate-300 dark:text-slate-600' : pct > 0 ? 'text-blue-600 dark:text-blue-400' : pct < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {pct == null ? '-' : formatPercent(pct)}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4" style={{ paddingLeft: classes.pad }}>
          <TrendChartCard metric={metric} index={0} />
        </div>
      )}
    </li>
  );
}

function AccountList({ metrics, statementType, expandedLabel, onToggle }) {
  const rowStyles = useMemo(
    () => buildFinancialRowStyles(metrics, statementType),
    [metrics, statementType],
  );

  if (metrics.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
        조건에 맞는 계정이 없어요.
      </p>
    );
  }
  return (
    <ul className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {metrics.map((metric, index) => (
        <AccountRow
          key={metric.label}
          metric={metric}
          rowStyle={rowStyles[index]}
          expanded={expandedLabel === metric.label}
          onToggle={() => onToggle(metric.label)}
        />
      ))}
    </ul>
  );
}

/**
 * 재무 추이 탭: 주요 지표 차트 대시보드 + 공시 원문의 재무제표 구조를 그대로
 * 따르는 계정별 목록(재무상태표/손익계산서/현금흐름표, 원문 나열 순서).
 * 개별 계정 차트는 행을 눌렀을 때만 그린다.
 * @param {{ financials: import('../../../../mocks/companyAnalysis/types').FinancialMetric[], financialsSeparate?: import('../../../../mocks/companyAnalysis/types').FinancialMetric[] }} props
 */
export function FinancialTrendCharts({ financials, financialsSeparate }) {
  const [query, setQuery] = useState('');
  const [expandedLabel, setExpandedLabel] = useState(null);
  const [fsScope, setFsScope] = useState('consolidated');

  const activeFinancials = fsScope === 'separate' ? (financialsSeparate ?? []) : (financials ?? []);

  const { keyMetrics, statements } = useMemo(() => {
    const cleaned = activeFinancials.map(sanitizeSeries).filter((metric) => metric.series.length > 0);
    const key = cleaned
      .filter((metric) => keyMetricRank(metric.label) >= 0)
      .sort((a, b) => keyMetricRank(a.label) - keyMetricRank(b.label));
    // 백엔드가 (재무제표 장 순서, 원문 등장 순서)로 정렬해 주므로 순서를 보존하며 묶는다.
    const groups = new Map();
    for (const metric of cleaned) {
      const statement = metric.statementType ?? '기타';
      if (!groups.has(statement)) groups.set(statement, []);
      groups.get(statement).push(metric);
    }
    return { keyMetrics: key, statements: [...groups.entries()] };
  }, [activeFinancials]);

  const hasSeparate = (financialsSeparate ?? []).some((metric) => metric.series?.length > 0);

  const [activeStatement, setActiveStatement] = useState(null);
  const currentStatement = activeStatement ?? statements[0]?.[0];

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    return statements
      .map(([statement, metrics]) => [
        statement,
        metrics.filter((metric) => metric.label.toLowerCase().includes(trimmedQuery)),
      ])
      .filter(([, metrics]) => metrics.length > 0);
  }, [statements, trimmedQuery]);

  const toggleRow = (label) => setExpandedLabel((current) => (current === label ? null : label));

  if (keyMetrics.length === 0 && statements.length === 0) {
    return (
      <section aria-labelledby="financial-trends-heading">
        <h2 id="financial-trends-heading" className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          재무 추이
        </h2>
        <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          아직 수집된 재무 지표가 없어요.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="financial-trends-heading" className="space-y-8">
      {/* 주요 지표 대시보드 */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="financial-trends-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              재무 추이
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {fsScope === 'separate' ? '별도재무제표' : '연결재무제표'} 기준
            </p>
          </div>
          {hasSeparate && (
            <div className="flex w-fit gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 p-1" role="tablist" aria-label="연결·별도 선택">
              <button
                type="button"
                role="tab"
                aria-selected={fsScope === 'consolidated'}
                onClick={() => {
                  setFsScope('consolidated');
                  setExpandedLabel(null);
                  setActiveStatement(null);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  fsScope === 'consolidated' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                연결
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={fsScope === 'separate'}
                onClick={() => {
                  setFsScope('separate');
                  setExpandedLabel(null);
                  setActiveStatement(null);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  fsScope === 'separate' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                별도
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {keyMetrics.map((metric, index) => (
            <TrendChartCard key={metric.label} metric={metric} index={index} />
          ))}
        </div>
      </div>

      {/* 재무제표별 전체 계정 */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">계정별 상세</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              공시 원문의 재무제표 순서 그대로예요. 계정을 누르면 추이 차트가 열려요.
            </p>
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="계정명 검색 (예: 재고자산)"
              className="w-56 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-8 pr-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 dark:focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
          </div>
        </div>

        {searchResults ? (
          <div className="space-y-5">
            {searchResults.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                "{query.trim()}"에 해당하는 계정이 없어요.
              </p>
            ) : (
              searchResults.map(([statement, metrics]) => (
                <div key={statement}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{statement}</p>
                  <AccountList
                    metrics={metrics}
                    statementType={statement}
                    expandedLabel={expandedLabel}
                    onToggle={toggleRow}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 flex w-fit gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 p-1" role="tablist" aria-label="재무제표 선택">
              {statements.map(([statement, metrics]) => (
                <button
                  key={statement}
                  type="button"
                  role="tab"
                  aria-selected={statement === currentStatement}
                  onClick={() => {
                    setActiveStatement(statement);
                    setExpandedLabel(null);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    statement === currentStatement
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {statement} <span className="text-xs text-slate-400 dark:text-slate-500">{metrics.length}</span>
                </button>
              ))}
            </div>
            <AccountList
              metrics={statements.find(([statement]) => statement === currentStatement)?.[1] ?? []}
              statementType={currentStatement}
              expandedLabel={expandedLabel}
              onToggle={toggleRow}
            />
          </>
        )}
      </div>
    </section>
  );
}
