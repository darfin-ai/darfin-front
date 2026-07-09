import { useLocale } from '../../../shared/i18n';
import { Button } from '../../../shared/components/ui/button';

/**
 * @param {{
 *   isMonitored: boolean,
 *   canAddMore: boolean,
 *   onAdd: () => void,
 * }} props
 */
export function MonitoringActionBanner({ isMonitored, canAddMore, onAdd }) {
  const { t } = useLocale();

  if (isMonitored) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        <p className="text-sm text-emerald-800 dark:text-emerald-300">{t('company.detail.monitoringActive')}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-400">{t('company.detail.addToAnalysisHint')}</p>
      <Button type="button" size="sm" className="shrink-0" onClick={onAdd} disabled={!canAddMore}>
        {canAddMore ? t('company.detail.addToAnalysis') : t('company.monitoring.limitTitle')}
      </Button>
    </div>
  );
}
