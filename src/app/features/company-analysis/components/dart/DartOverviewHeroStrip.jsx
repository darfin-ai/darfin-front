import { useLocale } from '../../../../shared/i18n';
import {
  majorHolderTotalStake,
  minorityRow,
  floatRatio,
  dividendValue,
  employeeTotals,
  latestAuditOpinion,
  isCleanOpinion,
} from './dartDerive';

function pct(value) {
  return value == null || Number.isNaN(value) ? '-' : `${value.toFixed(1)}%`;
}

function StatCell({ label, value, valueClass = '' }) {
  return (
    <div className="bg-white dark:bg-slate-900 px-5 py-4 text-center">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100 ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * 개요 탭 최상단 6칸 스탯 밴드 + 보고서 기준 배지.
 * @param {{ dartOverview: import('../../../../../mocks/companyAnalysis/types').DartOverview }} props
 */
export function DartOverviewHeroStrip({ dartOverview }) {
  const { t, locale } = useLocale();
  const { meta } = dartOverview;

  const majorStake = majorHolderTotalStake(dartOverview.majorShareholders);
  const minority = minorityRow(dartOverview.minorityShareholders);
  const float = floatRatio(dartOverview.stockTotals);
  const divYield = dividendValue(dartOverview.dividends, '현금배당수익률', '보통주');
  const emp = employeeTotals(dartOverview.employees);
  const audit = latestAuditOpinion(dartOverview.auditOpinions);

  const numberLocale = locale === 'en' ? 'en-US' : 'ko-KR';

  return (
    <section aria-label={t('company.detail.tabOverview')}>
      <div className="mb-2 flex justify-end">
        <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {t('company.dart.basisBadge', {
            year: meta.bsnsYear,
            report: t(`company.dart.reportCode.${meta.reprtCode}`),
          })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 sm:grid-cols-3 lg:grid-cols-6">
        <StatCell label={t('company.dart.hero.majorHolderStake')} value={pct(majorStake)} />
        <StatCell label={t('company.dart.hero.minorityStake')} value={pct(minority?.holdStockRate)} />
        <StatCell label={t('company.dart.hero.floatRatio')} value={pct(float)} />
        <StatCell label={t('company.dart.hero.dividendYield')} value={pct(divYield)} />
        <StatCell
          label={t('company.dart.hero.employees')}
          value={
            emp
              ? `${emp.total.toLocaleString(numberLocale)}${t('company.dart.labels.peopleUnit')}`
              : '-'
          }
        />
        <StatCell
          label={t('company.dart.hero.auditOpinion')}
          value={audit?.adtOpinion ?? '-'}
          valueClass={
            audit && !isCleanOpinion(audit.adtOpinion)
              ? 'text-amber-600 dark:text-amber-400'
              : ''
          }
        />
      </div>
    </section>
  );
}
