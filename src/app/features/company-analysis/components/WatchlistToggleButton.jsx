import { Star } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { Button } from '../../../shared/components/ui/button';

/**
 * 기업 상세 상단의 별표 토글 — 무료 북마크라 확인 다이얼로그 없이 즉시 반영.
 * @param {{
 *   starred: boolean,
 *   loading?: boolean,
 *   onToggle: () => void,
 * }} props
 */
export function WatchlistToggleButton({ starred, loading, onToggle }) {
  const { t } = useLocale();

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-2.5">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {starred ? t('company.watchlist.starredHint') : t('company.watchlist.starHint')}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={onToggle}
        disabled={loading}
        aria-pressed={starred}
      >
        <Star className={`h-4 w-4 ${starred ? 'fill-amber-400 text-amber-400' : ''}`} />
        {starred ? t('company.watchlist.unstarLabel') : t('company.watchlist.starLabel')}
      </Button>
    </div>
  );
}
