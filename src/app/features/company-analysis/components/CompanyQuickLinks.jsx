import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const AVATAR_PALETTE = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-teal-500 to-teal-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-cyan-500 to-cyan-600',
];

function avatarLabel(company) {
  const source = company.shortName ?? company.name;
  return source.length <= 2 ? source : source.slice(0, 2);
}

/**
 * Google-like "quick access" tiles — a browse entry point when the user
 * hasn't typed a query yet. Reused for both the KOSPI top-15 browse list and
 * the watchlist tab (same component, different `companies`/`title`).
 * @param {{ companies: import('../../../../mocks/companyAnalysis/types').Company[], title: string, emptyMessage?: string, isWatched?: (id: string) => boolean, onToggleWatch?: (id: string) => void }} props
 */
export function CompanyQuickLinks({ companies, title, emptyMessage, isWatched, onToggleWatch }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-slate-500">{title}</h2>
      {companies.length === 0 && emptyMessage ? (
        <p className="py-12 text-center text-sm text-slate-500">{emptyMessage}</p>
      ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {companies.map((company, index) => {
          const watched = isWatched?.(company.id) ?? false;
          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3, ease: 'easeOut' }}
            >
              <Link
                to={`/company/${company.id}`}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 pr-2 transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${AVATAR_PALETTE[index % AVATAR_PALETTE.length]}`}
                >
                  {avatarLabel(company)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 group-hover:text-blue-700">
                    {company.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">{company.ticker}</span>
                </span>
                {onToggleWatch && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleWatch(company.id);
                    }}
                    aria-pressed={watched}
                    aria-label={watched ? `${company.name} 관심기업에서 삭제` : `${company.name} 관심기업에 추가`}
                    className="shrink-0 rounded-full p-1.5 text-slate-300 transition-colors hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Star className={`h-4 w-4 ${watched ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
