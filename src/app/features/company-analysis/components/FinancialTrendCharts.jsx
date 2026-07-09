import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { TrendChartCard } from './TrendChartCard';
import { formatPercent, formatFinancialMetricValue } from '../lib/format';
import { buildFinancialRowStyles, rowStyleClasses } from '../lib/financialRowStyle';
import { useExpandableRows } from '../lib/useExpandableRows';
import { ExpandToggle } from './dart/ExpandToggle';

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

function baseName(label) {
  return label.replace(/ \((재무상태표|손익계산서|현금흐름표)\)$/, '');
}

function keyMetricRank(label) {
  return KEY_METRIC_ORDER.indexOf(baseName(label).replaceAll(' ', ''));
}

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

function AccountRow({ metric, rowStyle, expanded, onToggle, locale }) {
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
        <span className={`min-w-0 flex-1 truncate ${classes.label}`} title={baseName(metric.label)}>
          {baseName(metric.label)}
        </span>
        <span className="hidden sm:block">
          <Sparkline series={metric.series} />
        </span>
        <span className={`w-24 shrink-0 text-right tabular-nums ${classes.value}`}>
          {formatFinancialMetricValue(metric, latest.value, locale)}
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

const SEARCH_VISIBLE_ACCOUNTS = 8;

function AccountList({ metrics, statementType, expandedLabel, onToggle, locale, t }) {
  const rowStyles = useMemo(
    () => buildFinancialRowStyles(metrics, statementType),
    [metrics, statementType],
  );

  if (metrics.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
        {t('company.panels.noMatchingAccounts')}
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
          locale={locale}
        />
      ))}
    </ul>
  );
}

function SearchResultAccountList({ metrics, statementType, expandedLabel, onToggle, locale, t }) {
  const { visible, hasMore, expanded, toggle, total } = useExpandableRows(metrics, SEARCH_VISIBLE_ACCOUNTS);

  return (
    <>
      <AccountList
        metrics={visible}
        statementType={statementType}
        expandedLabel={expandedLabel}
        onToggle={onToggle}
        locale={locale}
        t={t}
      />
      <ExpandToggle
        hasMore={hasMore}
        expanded={expanded}
        total={total}
        onToggle={toggle}
        labelKey="company.panels.showAllAccounts"
      />
    </>
  );
}

/**
 * @param {{ financials: import('../../../../mocks/companyAnalysis/types').FinancialMetric[], financialsSeparate?: import('../../../../mocks/companyAnalysis/types').FinancialMetric[] }} props
 */
export function FinancialTrendCharts({ financials, financialsSeparate }) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState('');
  const [expandedLabel, setExpandedLabel] = useState(null);
  const [fsScope, setFsScope] = useState('consolidated');

  const activeFinancials = fsScope === 'separate' ? (financialsSeparate ?? []) : (financials ?? []);

  const { keyMetrics, statements } = useMemo(() => {
    const cleaned = activeFinancials.map(sanitizeSeries).filter((metric) => metric.series.length > 0);
    const key = cleaned
      .filter((metric) => keyMetricRank(metric.label) >= 0)
      .sort((a, b) => keyMetricRank(a.label) - keyMetricRank(b.label));
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

  const basisLabel = fsScope === 'separate' ? t('company.panels.separateBasis') : t('company.panels.consolidatedBasis');

  if (keyMetrics.length === 0 && statements.length === 0) {
    return (
      <section aria-labelledby="financial-trends-heading">
        <h2 id="financial-trends-heading" className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('company.detail.tabFinancials')}
        </h2>
        <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('company.panels.noFinancialMetrics')}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="financial-trends-heading" className="space-y-8">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="financial-trends-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('company.detail.tabFinancials')}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {basisLabel}
            </p>
          </div>
          {hasSeparate && (
            <div className="flex w-fit gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 p-1" role="tablist" aria-label={t('company.panels.selectScope')}>
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
                {t('company.panels.consolidated')}
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
                {t('company.panels.separate')}
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

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('company.panels.accountDetail')}</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t('company.panels.accountListDesc')}
            </p>
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('company.panels.accountSearch')}
              className="w-56 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-8 pr-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 dark:focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
          </div>
        </div>

        {searchResults ? (
          <div className="space-y-5">
            {searchResults.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                {t('company.panels.noAccountSearch', { query: query.trim() })}
              </p>
            ) : (
              searchResults.map(([statement, metrics]) => (
                <div key={statement}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{statement}</p>
                  <SearchResultAccountList
                    metrics={metrics}
                    statementType={statement}
                    expandedLabel={expandedLabel}
                    onToggle={toggleRow}
                    locale={locale}
                    t={t}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 flex w-fit gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 p-1" role="tablist" aria-label={t('company.panels.selectStatement')}>
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
              locale={locale}
              t={t}
            />
          </>
        )}
      </div>
    </section>
  );
}
