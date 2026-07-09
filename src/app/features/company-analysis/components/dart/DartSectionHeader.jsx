import { useLocale } from '../../../../shared/i18n';
import { SourceExcerptDialog } from '../SourceExcerptDialog';

const SOURCE_PILL_CLASS =
  'rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300';

const AS_OF_PILL_CLASS =
  'rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400';

/**
 * 패널 공통 헤더: 제목 + (있으면) 과거 공시 출처 pill + 공시 원문 보기 pill.
 * @param {{
 *   id: string,
 *   title: string,
 *   sourceRef?: import('../../../../../mocks/companyAnalysis/types').FilingExcerptRef,
 *   asOf?: import('../../../../../mocks/companyAnalysis/types').DartSectionAsOf,
 * }} props
 */
export function DartSectionHeader({ id, title, sourceRef, asOf }) {
  const { t } = useLocale();
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {asOf && (
          <span className={AS_OF_PILL_CLASS} title={t('company.dart.asOf.tooltip')}>
            {asOf.bsnsYear}{t('company.dart.asOf.yearSuffix')} {t(`company.dart.reportCode.${asOf.reprtCode}`)} {t('company.dart.asOf.suffix')}
          </span>
        )}
        {sourceRef && (
          <SourceExcerptDialog
            sectionLabel={sourceRef.sectionLabel}
            excerpt={sourceRef.excerpt}
            sourceRef={sourceRef.sourceRef}
            label={t('company.panels.viewSourceFull')}
            className={SOURCE_PILL_CLASS}
          />
        )}
      </div>
    </div>
  );
}

/** 테마 그룹 아이브로 헤더, 예: "01 · 지배구조와 주주" */
export function DartGroupEyebrow({ children }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

/** 패널 카드 본문 래퍼 */
export function DartCard({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${className}`}>
      {children}
    </div>
  );
}

/** 대시 보더 빈 상태 */
export function DartEmptyState({ children }) {
  return (
    <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

/** section 데이터 유무 판단: null 또는 rows 비어있으면 빈 것으로 취급 */
export function isEmptySection(section) {
  return !section || !section.rows || section.rows.length === 0;
}

export const TABLE_HEAD_CLASS =
  'px-2 py-1.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400';
export const TABLE_HEAD_NUM_CLASS =
  'px-2 py-1.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400';
export const TABLE_CELL_CLASS =
  'px-2 py-2 text-sm text-slate-700 dark:text-slate-300';
export const TABLE_CELL_NUM_CLASS =
  'px-2 py-2 text-right text-sm tabular-nums text-slate-700 dark:text-slate-300';
