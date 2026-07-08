import { motion } from 'motion/react';
import { CompanyQuickLinkTile } from './CompanyQuickLinkTile';

/**
 * Google-like "quick access" tiles — a browse entry point when the user
 * hasn't typed a query yet.
 * @param {{ companies: import('../../../../mocks/companyAnalysis/types').Company[], title: string, emptyMessage?: string, isWatched?: (id: string) => boolean, onToggleWatch?: (id: string) => void }} props
 */
export function CompanyQuickLinks({ companies, title, emptyMessage, isWatched, onToggleWatch }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h2>
      {companies.length === 0 && emptyMessage ? (
        <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
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
                <CompanyQuickLinkTile
                  company={company}
                  isWatched={watched}
                  onToggleWatch={onToggleWatch}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
