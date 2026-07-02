import { motion } from 'motion/react';
import { getCompanyDetail } from '../../../../mocks/companyAnalysis';
import { CompanyCard } from './CompanyCard';

/**
 * @param {{ companies: import('../../../../mocks/companyAnalysis/types').Company[], sector: string }} props
 */
export function SimilarCompaniesPanel({ companies, sector }) {
  if (companies.length === 0) return null;

  return (
    <section aria-labelledby="similar-companies-heading">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <h2 id="similar-companies-heading" className="text-xl font-semibold text-slate-900">
          동일 업종 유사 기업
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{sector}</span> 업종의 다른 기업들이에요.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {companies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            scores={getCompanyDetail(company.id)?.scores ?? []}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
