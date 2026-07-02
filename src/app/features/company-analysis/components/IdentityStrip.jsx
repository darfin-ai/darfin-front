import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../../../shared/components/ui/badge';
import { formatFilingDate } from '../lib/format';

/**
 * @param {{ company: import('../../../../mocks/companyAnalysis/types').Company }} props
 */
export function IdentityStrip({ company }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-16 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            to="/company"
            className="flex items-center gap-1 rounded-md text-sm text-slate-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={15} />
            목록
          </Link>
          <div className="h-4 w-px bg-slate-200" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
          <span className="text-sm text-slate-500">
            {company.ticker} · {company.sector}
          </span>
          <Badge variant="outline" className="text-slate-600">
            {company.latestFilingType} · {formatFilingDate(company.latestFilingDate)}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
