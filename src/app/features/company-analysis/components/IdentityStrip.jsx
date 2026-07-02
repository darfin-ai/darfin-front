import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

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
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/company"
          className="flex items-center gap-1 justify-self-start rounded-md text-sm text-slate-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={15} />
          목록
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
          <span className="text-sm text-slate-500">
            {company.ticker} · {company.sector}
          </span>
        </div>

        <div aria-hidden="true" />
      </div>
    </motion.div>
  );
}
