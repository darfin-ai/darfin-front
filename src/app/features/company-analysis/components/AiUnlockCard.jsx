import { useEffect, useState } from 'react';
import { Lock, Star } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { Button } from '../../../shared/components/ui/button';
import { getMyTokenStatus } from '../../../shared/api/tokenApi';

/**
 * AI 분석 잠금 카드 — 토큰으로 열람권을 구매하는 명시적 CTA.
 * 잠금 해제 시 관심 기업에 자동 등록됨을 안내한다.
 * @param {{
 *   cost: number,
 *   loading?: boolean,
 *   error?: string | null,
 *   onUnlock: () => void,
 * }} props
 */
export function AiUnlockCard({ cost, loading, error, onUnlock }) {
  const { t, locale } = useLocale();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyTokenStatus()
      .then((status) => {
        if (!cancelled) setBalance(status?.tokenBalance ?? null);
      })
      .catch(() => {
        /* 잔액 표시는 부가 정보 — 실패해도 잠금 카드는 동작 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US';
  const costLabel = cost.toLocaleString(numberLocale);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 px-6 py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
        <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {t('company.unlock.title')}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {t('company.unlock.body')}
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
        {t('company.unlock.autoStarNote')}
      </p>

      <Button type="button" className="mt-5" onClick={onUnlock} disabled={loading}>
        {loading ? t('company.unlock.loading') : t('company.unlock.action', { cost: costLabel })}
      </Button>

      {balance != null && (
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          {t('company.unlock.balance', { balance: balance.toLocaleString(numberLocale) })}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
