import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';

/**
 * 화면 정중앙에 고정으로 뜨는 동그란 "Darfin AI가 분석 중입니다" 로딩 배지.
 * 스켈레톤/카드 뒤 배경 클릭은 막지 않도록 pointer-events-none.
 */
export function AiAnalyzingOverlay() {
  const { t } = useLocale();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 px-8 py-7 shadow-xl shadow-slate-900/10 dark:shadow-black/30 backdrop-blur-sm"
      >
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-950" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400" />
          <Sparkles size={26} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t('company.detail.analyzingTitle')}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {t('company.detail.analyzingSubtitle')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
