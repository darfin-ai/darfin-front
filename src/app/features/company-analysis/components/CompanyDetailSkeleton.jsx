import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';
import { DartSectionNav } from './dart/DartSectionNav';
import { DartGroupEyebrow } from './dart/DartSectionHeader';

/** 개요/AI분석/재무추이 스켈레톤 위에 뜨는 동그란 "Darfin AI 분석 중" 로딩 배지. */
function AiAnalyzingOverlay() {
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

function PanelSkeleton({ lines = 3 }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <Skeleton className="h-5 w-32" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3.5" style={{ width: `${100 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

function HeroStripSkeleton() {
  return (
    <section>
      <div className="mb-2 flex justify-end">
        <Skeleton className="h-6 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-900 px-5 py-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewGroupSkeleton({ eyebrow }) {
  return (
    <div>
      <DartGroupEyebrow>{eyebrow}</DartGroupEyebrow>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <PanelSkeleton lines={4} />
        <PanelSkeleton lines={4} />
      </div>
    </div>
  );
}

/**
 * Loading placeholder for CompanyDetailPage — renders the real interactive
 * shell (identity strip frame, banner, tabs, section nav) with skeleton
 * blocks in place of data, so tab switching works while loading.
 * @param {{ tab: string, onTabChange: (value: string) => void }} props
 */
export function CompanyDetailSkeleton({ tab, onTabChange }) {
  const { t } = useLocale();

  return (
    <div className="w-full">
      <AiAnalyzingOverlay />

      <div className="sticky top-16 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="container flex items-center gap-3 py-3">
          <Link
            to="/company"
            className="flex shrink-0 items-center gap-1 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">{t('company.identity.back')}</span>
          </Link>

          <div className="h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-2.5">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('company.watchlist.starHint')}</p>
          <Skeleton className="h-8 w-28 shrink-0" />
        </div>

        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList className="mb-6 w-auto gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            <TabsTrigger value="overview">{t('company.detail.tabOverview')}</TabsTrigger>
            <TabsTrigger value="ai">{t('company.detail.tabAiAnalysis')}</TabsTrigger>
            <TabsTrigger value="financials">{t('company.detail.tabFinancials')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-8">
              <DartSectionNav />
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
                <HeroStripSkeleton />
                <PanelSkeleton lines={4} />
              </div>
              <OverviewGroupSkeleton eyebrow={t('company.dart.groups.governance')} />
              <OverviewGroupSkeleton eyebrow={t('company.dart.groups.capital')} />
              <OverviewGroupSkeleton eyebrow={t('company.dart.groups.returns')} />
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-6">
              <PanelSkeleton lines={4} />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PanelSkeleton />
                <PanelSkeleton />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financials">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PanelSkeleton lines={5} />
              <PanelSkeleton lines={5} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
