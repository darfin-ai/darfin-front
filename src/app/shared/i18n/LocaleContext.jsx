import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, LOCALES } from "./constants";
import { en } from "./locales/en";
import { ko } from "./locales/ko";

const catalogs = { ko, en };

const LocaleContext = createContext(null);

function readStoredLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
}

function resolvePath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = useCallback((next) => {
    setLocaleState(LOCALES.includes(next) ? next : DEFAULT_LOCALE);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (path, vars) => {
      let value = resolvePath(catalogs[locale], path) ?? resolvePath(catalogs.ko, path);
      if (value == null) return path;
      if (typeof value === "function") return value(vars);
      if (vars && typeof value === "string") {
        return Object.entries(vars).reduce(
          (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
          value,
        );
      }
      return value;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
