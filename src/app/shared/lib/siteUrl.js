const DEFAULT_SITE_URL = "https://darfin-front.onrender.com";

export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_SITE_URL;
}
