import { useLocale } from "../shared/i18n";
import { usePageMeta } from "../shared/hooks/usePageMeta";

const PAGE_TITLE = "text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
const SECTION_HEADING = "text-base font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-2";
const BODY = "text-sm text-slate-600 dark:text-slate-400 leading-relaxed";

export function Terms() {
  const { t } = useLocale();
  const sections = t("legal.terms.sections");

  usePageMeta({
    title: t("seo.terms.title"),
    description: t("seo.terms.description"),
  });

  return (
    <div className="container max-w-3xl py-10 sm:py-14">
      <h1 className={PAGE_TITLE}>{t("legal.terms.title")}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("legal.terms.updated")}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className={SECTION_HEADING}>{section.heading}</h2>
          <p className={BODY}>{section.body}</p>
        </section>
      ))}
    </div>
  );
}

export function Privacy() {
  const { t } = useLocale();
  const sections = t("legal.privacy.sections");

  usePageMeta({
    title: t("seo.privacy.title"),
    description: t("seo.privacy.description"),
  });

  return (
    <div className="container max-w-3xl py-10 sm:py-14">
      <h1 className={PAGE_TITLE}>{t("legal.privacy.title")}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("legal.privacy.updated")}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className={SECTION_HEADING}>{section.heading}</h2>
          <p className={BODY}>{section.body}</p>
        </section>
      ))}
    </div>
  );
}
