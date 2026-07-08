import { Link, useRouteError } from 'react-router';
import { useLocale } from '../../../shared/i18n';

export function CompanyRouteError() {
  const { t } = useLocale();
  const error = useRouteError();

  return (
    <div className="container py-16 text-center">
      <p className="text-base font-semibold text-slate-900">{t('company.error.title')}</p>
      <p className="mt-2 text-sm text-slate-500">
        {t('company.error.body')}
      </p>
      {import.meta.env.DEV && error != null && (
        <pre className="mx-auto mt-4 max-w-2xl overflow-x-auto rounded-md bg-slate-100 p-3 text-left text-xs text-slate-600">
          {error.stack || error.message || String(error)}
        </pre>
      )}
      <Link
        to="/company"
        className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        {t('company.error.back')}
      </Link>
    </div>
  );
}
