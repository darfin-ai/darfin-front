import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Search, PenSquare, MessageCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getQuestions } from "../api/communityApi";
import { CARD, PAGE_TITLE, PAGE_DESC, BTN_PRIMARY } from "../communityUi";
import { useLocale } from "../../../shared/i18n";
import { usePageMeta } from "../../../shared/hooks/usePageMeta";
import { getDateFnsLocale } from "../../../shared/i18n/localeFormat";

function Avatar({ src, alt, size = "sm" }) {
  const cls = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  return (
    <img
      src={src || "/profile.png"}
      alt={alt}
      className={`${cls} rounded-full object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0`}
    />
  );
}

export function CommunityList() {
  const { t, locale } = useLocale();

  usePageMeta({
    title: t("seo.community.title"),
    description: t("seo.community.description"),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async (search) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestions(search);
      setQuestions(data ?? []);
    } catch (err) {
      setError(err.message || t("community.list.loadFail"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    fetchQuestions(searchTerm);
  }, [searchTerm, fetchQuestions]);

  return (
    <div className="container py-10 sm:py-12 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={PAGE_TITLE}>{t("community.list.title")}</h1>
          <p className={`${PAGE_DESC} mt-2`}>{t("community.list.subtitle")}</p>
        </div>
        <Link to="/community/write" className={BTN_PRIMARY}>
          <PenSquare size={16} />
          {t("community.list.askQuestion")}
        </Link>
      </div>

      <div className={`${CARD} p-1 flex items-center gap-2`}>
        <Search className="text-slate-400 dark:text-slate-500 ml-2.5 flex-shrink-0" size={18} />
        <input
          type="text"
          placeholder={t("community.list.searchPlaceholder")}
          className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      <div className={`${CARD} overflow-hidden`}>
        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500">{t("common.loading")}</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 dark:text-red-400">{error}</div>
        ) : questions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {questions.map((q) => (
              <Link
                key={q.id}
                to={`/community/${q.id}`}
                className="block p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {q.stock && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md">
                      {q.stock.companyName}
                    </span>
                  )}
                  {q.isResolved ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                      <CheckCircle2 size={12} />
                      {t("community.list.resolved")}
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {t("community.list.awaiting")}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-1">{q.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Avatar src={q.authorProfileImage} alt={q.authorNickname} />
                    {q.authorNickname}
                  </span>
                  <span>{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: getDateFnsLocale(locale) })}</span>
                  <span>{t("common.views")} {q.views}</span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded-full ml-auto">
                    <MessageCircle size={14} />
                    {q.answerCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">
            {searchTerm ? t("community.list.noSearchResults") : t("community.list.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
