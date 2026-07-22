import { useAuth } from '../auth';
import { useLocale } from '../../shared/i18n';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { StoreProvider } from './store/store.jsx';
import { TradingApp } from './TradingApp.jsx';

export function TradingRoot() {
  const { isLoggedIn, logout } = useAuth();
  const { t } = useLocale();

  usePageMeta({ title: `${t("nav.trading")} - Darfin`, noindex: true });
  return (
    <StoreProvider initialLoggedIn={isLoggedIn} onLogout={logout}>
      <TradingApp />
    </StoreProvider>
  );
}
