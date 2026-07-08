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
 *   company: { corpCode: string, name: string, ticker: string } | null,
 *   loading?: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onConfirm: () => void,
 * }} props
 */
export function AddMonitoringDialog({ open, company, loading, onOpenChange, onConfirm }) {
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('company.monitoring.confirmTitle')}</DialogTitle>
          <DialogDescription>
            {company
              ? t('company.monitoring.confirmBody', { name: company.name })
              : t('company.monitoring.confirmBodyGeneric')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading || !company}>
            {loading ? t('common.loading') : t('company.monitoring.startMonitoring')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
