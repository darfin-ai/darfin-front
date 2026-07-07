import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { isAiReady } from '../lib/aiStatus';

function HistoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { fiscalYear, perShareKrw } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-slate-500">{fiscalYear}년</p>
      <p className="font-semibold text-slate-900">
        {perShareKrw != null ? `${perShareKrw.toLocaleString()}원` : '미확정'}
      </p>
    </div>
  );
}

function MetricCard({ label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </motion.div>
  );
}

function normalizeHistory(div) {
  const rows = div.history ?? [];
  const priorFullYear = rows.find((row) => row.year === '전기')?.perShareKrw;

  return rows.map((row) => {
    const fiscalYear = row.fiscalYear ?? row.year;
    let isPartial = row.isPartial;
    if (isPartial == null && row.year === '당기') {
      if (div.isInterimReport === true) {
        isPartial = true;
      } else if (
        div.isInterimReport == null &&
        priorFullYear != null &&
        row.perShareKrw != null &&
        row.perShareKrw < priorFullYear * 0.75
      ) {
        // 구버전 캐시: 당기가 전기 대비 현저히 작으면 분기 누계로 간주
        isPartial = true;
      }
    }

    return {
      fiscalYear,
      perShareKrw: row.perShareKrw,
      isPartial: Boolean(isPartial),
    };
  });
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function DividendPanel({ overview }) {
  const div = overview.dividend;
  if (!div) return null;

  const history = normalizeHistory(div).sort((a, b) => {
    const aNum = Number(a.fiscalYear);
    const bNum = Number(b.fiscalYear);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    const order = { 전전기: 0, 전기: 1, 당기: 2 };
    return (order[a.fiscalYear] ?? 99) - (order[b.fiscalYear] ?? 99);
  });
  const partialPoint = history.find((row) => row.isPartial && row.perShareKrw != null);
  const annualHistory = history.filter((row) => !row.isPartial && row.perShareKrw != null);
  const chartData = annualHistory.map((row) => ({
    ...row,
    displayValue: row.perShareKrw,
  }));
  const maxVal = Math.max(...chartData.map((d) => d.perShareKrw ?? 0), 1);
  const perShareLabel = partialPoint ? '주당 배당금 (당기 누계)' : '주당 배당금 (당기)';

  return (
    <section aria-labelledby="dividend-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="dividend-heading" className="text-xl font-semibold text-slate-900">
          배당 정보
        </h2>
        {div.sourceRef && (
          <SourceExcerptDialog
            sectionLabel={div.sourceRef.sectionLabel}
            excerpt={div.sourceRef.excerpt}
            sourceRef={div.sourceRef.sourceRef}
            label="공시 원문 보기"
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          />
        )}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label={perShareLabel}
            value={`${div.perShareKrw.toLocaleString()}원`}
            sub={partialPoint ? `${div.reportLabel ?? '최근 보고서'} 기준` : '보통주 기준'}
            delay={0}
          />
          <MetricCard
            label="배당수익률"
            value={`${div.yieldPct}%`}
            sub="최근 보고서 기준"
            delay={0.06}
          />
          <MetricCard
            label="배당성향"
            value={`${div.payoutRatioPct}%`}
            sub="순이익 대비 배당 비율"
            delay={0.12}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">연간 주당 배당금 추이 (원)</p>
          {chartData.length > 0 ? (
            <>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <YAxis domain={[0, maxVal * 1.3]} hide />
                    <Tooltip content={<HistoryTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="displayValue" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.fiscalYear} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around px-1">
                {chartData.map((d) => (
                  <span key={d.fiscalYear} className="text-xs tabular-nums text-slate-500">
                    {d.fiscalYear}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">완료된 회계연도 배당 데이터가 아직 없어요.</p>
          )}

          {partialPoint && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span className="font-medium">{partialPoint.fiscalYear}년 누계</span>
              {' '}
              {partialPoint.perShareKrw.toLocaleString()}원
              {div.reportLabel ? ` (${div.reportLabel})` : ''}
              {' '}
              — 분기·반기 보고서의 당기는 진행 중인 회계연도 누계라 연간 추이 차트와 따로 보여요.
            </p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            완료된 회계연도 기준으로만 비교합니다. 공시 원문 [주요 배당지표]의 전기·전전기 열을 사용해요.
          </p>
        </div>

        {!isAiReady(overview) ? (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-400" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ) : (
          div.insight && (
            <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-blue-700">So what? </span>
                {div.insight}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
