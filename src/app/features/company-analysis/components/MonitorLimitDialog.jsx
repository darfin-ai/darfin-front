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
 * @param {{
 *   open: boolean,
 *   limit: number,
 *   onOpenChange: (open: boolean) => void,
 *   onFocusSearch: () => void,
 * }} props
 */
export function MonitorLimitDialog({ open, limit, onOpenChange, onFocusSearch }) {
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('company.monitoring.limitTitle')}</DialogTitle>
          <DialogDescription>
            {t('company.monitoring.limitBody', { limit })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="secondary" onClick={onFocusSearch}>
            {t('company.monitoring.removeHint')}
          </Button>
          <Button type="button" asChild>
            <Link to="/pricing">{t('company.monitoring.upgrade')}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
