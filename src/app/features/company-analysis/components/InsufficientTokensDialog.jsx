import { Link } from 'react-router';
import { useLocale } from '../../../shared/i18n';
import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';

/**
 * 잠금 해제 402(토큰 부족) 안내 — 플랜 업그레이드 유도.
 * @param {{
 *   open: boolean,
 *   cost: number,
 *   onOpenChange: (open: boolean) => void,
 * }} props
 */
export function InsufficientTokensDialog({ open, cost, onOpenChange }) {
  const { t, locale } = useLocale();
  const costLabel = cost.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('company.unlock.insufficientTitle')}</DialogTitle>
          <DialogDescription>
            {t('company.unlock.insufficientBody', { cost: costLabel })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" asChild>
            <Link to="/pricing">{t('company.unlock.goPricing')}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
