import { ko, enUS } from "date-fns/locale";

export function getDateFnsLocale(locale) {
  return locale === "ko" ? ko : enUS;
}

export function formatLocaleDate(value, locale, options = {}) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", options);
}

export function formatLocaleDateTime(value, locale) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
}
