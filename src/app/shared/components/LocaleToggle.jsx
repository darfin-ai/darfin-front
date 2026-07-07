import { Languages } from "lucide-react";
import { useLocale } from "../i18n";

export function LocaleToggle({ className = "" }) {
  const { locale, setLocale, t } = useLocale();
  const next = locale === "ko" ? "en" : "ko";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${className}`}
      aria-label={next === "en" ? t("prefs.languageEn") : t("prefs.languageKo")}
    >
      <Languages size={15} />
      {locale === "ko" ? "EN" : "KO"}
    </button>
  );
}
