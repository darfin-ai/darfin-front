import { useEffect } from "react";
import { useLocation } from "react-router";
import { getSiteUrl } from "../lib/siteUrl";

function upsertMeta(attr, key, content) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.querySelector(selector);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  const selector = `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets document title, description, canonical, OG/Twitter tags, and robots per route.
 */
export function usePageMeta({ title, description, canonical, noindex = false } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    if (title) {
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }

    const siteUrl = getSiteUrl();
    const canonicalUrl = canonical ?? `${siteUrl}${pathname === "/" ? "" : pathname}`;
    upsertLink("canonical", canonicalUrl);
    upsertMeta("property", "og:url", canonicalUrl);

    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, canonical, noindex, pathname]);
}
