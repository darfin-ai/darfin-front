import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { CalendarClock, FileText, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/app/shared/i18n";
import { getDateFnsLocale } from "@/app/shared/i18n/localeFormat";
import { getTodayDisclosures } from "../api/disclosureApi";
import { CARD, BADGE_NEUTRAL, ROW_HOVER, ROW_DIVIDER } from "@/app/shared/lib/uiRecipes";

const POLL_INTERVAL_MS = 30_000;

/**
 * 검색창 바로 아래, 검색을 실행하기 전에 보여주는 "오늘 올라온 공시" 피드.
 * DART Open API는 접수 시:분을 주지 않으므로, 표시되는 시간은 실제 접수시각이
 * 아니라 서버가 이 공시를 처음 감지(UPSERT)한 시각(detectedAt)이다.
 */
export function TodayDisclosures() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const dateFnsLocale = getDateFnsLocale(locale);
  const reduceMotion = useReducedMotion();

  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getTodayDisclosures(6);
        if (mounted) {
          setItems(data);
          setError(null);
        }
      } catch (e) {
        // 이미 표시 중인 목록이 있으면(백그라운드 폴링 실패) 조용히 무시하고 기존 목록을
        // 그대로 유지한다 — 여기서 에러를 세팅하면 최초 로딩 이후에도 배너가 계속 남는다.
        if (mounted && !hasLoadedOnce.current) {
          setError(e.message ?? t("disclosure.search.todayError"));
        }
      } finally {
        hasLoadedOnce.current = true;
      }
    };

    load();
    const intervalId = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showInitialLoading = items === null && !error;

  return (
    <div className="space-y-4 mx-auto w-full max-w-4xl">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {t("disclosure.search.todayTitle")}
      </h2>

      <AnimatePresence mode="wait" initial={false}>
      {showInitialLoading && (
        <motion.div
          key="loading"
          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center gap-2 py-10 text-slate-400 dark:text-slate-500"
        >
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">{t("disclosure.search.todayLoading")}</span>
        </motion.div>
      )}

      {error && !showInitialLoading && (
        <motion.p
          key="error"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      {items && items.length === 0 && (
        <motion.div
          key="empty"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${CARD} shadow-sm p-8 text-center text-sm text-slate-500 dark:text-slate-400`}
        >
          {t("disclosure.search.todayEmpty")}
        </motion.div>
      )}

      {items && items.length > 0 && (
        <motion.div
          key="items"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${CARD} shadow-sm overflow-hidden`}
        >
          <div className={ROW_DIVIDER}>
            {items.map((item) => (
              <div
                key={item.rceptNo}
                onClick={() =>
                  navigate(`/disclosure/${item.rceptNo}?company=${encodeURIComponent(item.companyName)}`)
                }
                className={`flex items-center gap-4 px-5 py-3.5 ${ROW_HOVER}`}
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 w-20 shrink-0">
                  <CalendarClock size={13} />
                  <span className="whitespace-nowrap">
                    {formatDistanceToNowStrict(new Date(item.detectedAt), {
                      addSuffix: true,
                      locale: dateFnsLocale,
                    })}
                  </span>
                </div>
                <div className="w-32 shrink-0">
                  <span className={`${BADGE_NEUTRAL} max-w-full truncate`}>{item.typeName}</span>
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 w-32 shrink-0 truncate">
                  {item.companyName}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  <FileText size={14} className="shrink-0 text-slate-300 dark:text-slate-600" />
                  <span className="truncate">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
