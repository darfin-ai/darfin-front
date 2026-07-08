import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { CompanyCard } from './CompanyCard';

/**
 * @param {{ rows: { company: import('../../../../mocks/companyAnalysis/types').Company, scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[] }[], sector: string }} props
 */
export function SimilarCompaniesPanel({ rows, sector }) {
  const { t } = useLocale();

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="similar-companies-heading">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <h2 id="similar-companies-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.panels.similar')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('company.panels.similarDesc', { sector })}
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(({ company, scores }, index) => (
          <CompanyCard key={company.id} company={company} scores={scores} index={index} />
        ))}
      </div>
    </section>
  );
}
