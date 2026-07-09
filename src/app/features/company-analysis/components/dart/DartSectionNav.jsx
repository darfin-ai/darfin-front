import { useLocale } from '../../../../shared/i18n';

const GROUPS = [
  { id: 'dart-group-governance', key: 'governance' },
  { id: 'dart-group-capital', key: 'capital' },
  { id: 'dart-group-returns', key: 'returns' },
  { id: 'dart-group-snapshot', key: 'snapshot' },
];

export function DartSectionNav({ activeGroups }) {
  const { t } = useLocale();
  const items = activeGroups ? GROUPS.filter((g) => activeGroups.includes(g.id)) : GROUPS;
  if (items.length < 2) return null;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <nav className="sticky top-0 z-10 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 px-4 py-2 backdrop-blur">
      {items.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => scrollTo(g.id)}
          className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
        >
          {t(`company.dart.groups.${g.key}`).replace(/^\d+\s*·\s*/, '')}
        </button>
      ))}
    </nav>
  );
}
