import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SITE_URL = "https://darfin-front.onrender.com";

const STATIC_SITEMAP_PATHS = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/pricing", changefreq: "monthly", priority: "0.8" },
  { loc: "/company", changefreq: "daily", priority: "0.9" },
  { loc: "/disclosure", changefreq: "daily", priority: "0.9" },
  { loc: "/community", changefreq: "daily", priority: "0.7" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
];

function seoPlugin() {
  const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  const allowIndexing = process.env.VITE_ALLOW_INDEXING === "true";

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /forgot-id
Disallow: /reset-password
Disallow: /mypage
Disallow: /subscription
Disallow: /billing/
Disallow: /oauth/
Disallow: /community/write
Disallow: /trading

Sitemap: ${siteUrl}/sitemap.xml
`;

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_SITEMAP_PATHS.map(
  ({ loc, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
).join("\n")}
</urlset>
`;

  return {
    name: "darfin-seo",
    transformIndexHtml(html) {
      let result = html.replaceAll("__DARFIN_SITE_URL__", siteUrl);
      const robotsTag = allowIndexing
        ? '<meta name="robots" content="index, follow" />'
        : '<meta name="robots" content="noindex, nofollow" />';
      return result.replace("</head>", `      ${robotsTag}\n    </head>`);
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "robots.txt"), robotsTxt);
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml);
    },
  };
}

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    }
  };
}
export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    seoPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src")
    }
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173
  }
});
