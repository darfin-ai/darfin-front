import { useLocale } from '../../../../shared/i18n';
import { BTN_GHOST } from '../../../../shared/lib/uiRecipes';

export function ExpandToggle({ hasMore, expanded, total, onToggle, labelKey, collapseKey = 'company.dart.labels.collapseList' }) {
  const { t } = useLocale();
  if (!hasMore) return null;
  return (
    <div className="mt-3 flex justify-center">
      <button type="button" className={BTN_GHOST} onClick={onToggle}>
        {expanded ? t(collapseKey) : t(labelKey, { n: total })}
      </button>
    </div>
  );
}
