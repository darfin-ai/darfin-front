import { useEffect } from "react";

/**
 * Injects JSON-LD structured data; removes on unmount.
 */
export function useJsonLd(data, id = "json-ld") {
  useEffect(() => {
    if (!data) return undefined;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data, id]);
}
