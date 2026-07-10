import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Check, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "../features/auth";
import { useLocale } from "../shared/i18n";
import { usePageMeta } from "../shared/hooks/usePageMeta";
import {
  STATIC_PLANS,
  PLAN_LABELS,
} from "../features/account/subscriptionPlans";
import {
  getPlanDescription,
  getPlanFeatures,
  formatPlanPrice,
  formatPlanTokenLine,
} from "../features/account/planI18n";

const CARD = "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";
const EYEBROW = "text-xs font-medium text-slate-400 dark:text-slate-500 mb-2";
const PAGE_TITLE = "text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
const PAGE_DESC = "text-base text-slate-500 dark:text-slate-400 leading-relaxed";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors";

const fadeUp = (reduceMotion, delay = 0) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay, ease: "easeOut" },
      };

const fadeUpInView = (reduceMotion, delay = 0) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.3, delay, ease: "easeOut" },
      };

export function Pricing() {
  const { isLoggedIn } = useAuth();
  const { t, locale } = useLocale();
  const reduceMotion = useReducedMotion();

  usePageMeta({
    title: t("seo.pricing.title"),
    description: t("seo.pricing.description"),
  });

  return (
    <div className="container py-10 sm:py-14">
      <motion.div
        className="max-w-2xl mx-auto text-center mb-10 sm:mb-12"
        {...fadeUp(reduceMotion)}
      >
        <div className={EYEBROW}>{t("pricingPage.eyebrow")}</div>
        <h1 className={PAGE_TITLE}>{t("pricingPage.title")}</h1>
        <p className={`${PAGE_DESC} mt-3`}>{t("pricingPage.subtitle")}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
        {STATIC_PLANS.map((plan, i) => {
          const isPro = plan.planName === "PRO";
          const features = getPlanFeatures(t, plan.planName);

          return (
            <motion.div
              key={plan.planName}
              className={`relative flex flex-col p-5 sm:p-6 ${
                isPro
                  ? "rounded-xl border-2 border-blue-600 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm"
                  : CARD
              }`}
              {...fadeUp(reduceMotion, 0.08 + i * 0.08)}
              whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
            >
              {isPro && (
                <motion.span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-medium text-white"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.25, ease: "easeOut" }}
                >
                  <Zap size={10} />
                  {t("pricingPage.recommended")}
                </motion.span>
              )}

              <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {PLAN_LABELS[plan.planName] || plan.planName}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {getPlanDescription(t, plan.planName)}
                </p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {formatPlanPrice(plan.price, t, locale)}
                  </span>
                  {plan.price !== 0 && (
                    <span className="text-sm text-slate-400 dark:text-slate-500">{t("pricingPage.perMonth")}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  {formatPlanTokenLine(plan, locale)}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {features.map((feature, fi) => (
                  <motion.li
                    key={`${plan.planName}-${fi}`}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 + fi * 0.04, duration: 0.25, ease: "easeOut" }}
                  >
                    <Check size={14} className={`shrink-0 mt-0.5 ${isPro ? "text-blue-500 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"}`} />
                    <span className="leading-snug">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {isLoggedIn ? (
                <Link to="/subscription" className={isPro ? BTN_PRIMARY : BTN_SECONDARY}>
                  {t("pricingPage.manageSubscription")}
                  <ArrowRight size={15} />
                </Link>
              ) : plan.price === 0 ? (
                <Link to="/signup" className={BTN_SECONDARY}>
                  {t("pricingPage.startFree")}
                </Link>
              ) : (
                <Link to="/signup" className={isPro ? BTN_PRIMARY : BTN_SECONDARY}>
                  {t("pricingPage.getStarted")}
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className={`${CARD} max-w-3xl mx-auto mt-10 sm:mt-12 p-5 sm:p-6`}
        {...fadeUpInView(reduceMotion, 0.05)}
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t("pricingPage.faqTitle")}</h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          <li>{t("pricingPage.faq1")}</li>
          <li>{t("pricingPage.faq2")}</li>
          <li>{t("pricingPage.faq3")}</li>
        </ul>
        {!isLoggedIn && (
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            {t("pricingPage.alreadyMember")}{" "}
            <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {t("nav.login")}
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
