import { useAuth } from '../auth';
import { StoreProvider } from './store/store.jsx';
import { TradingApp } from './TradingApp.jsx';

export function TradingRoot() {
  const { isLoggedIn, logout } = useAuth();
  return (
    <StoreProvider initialLoggedIn={isLoggedIn} onLogout={logout}>
      <TradingApp />
    </StoreProvider>
  );
}
