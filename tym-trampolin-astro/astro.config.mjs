// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import paths from "./src/i18n/paths.json" with { type: "json" };
const pairs = Object.entries(paths)
  .filter(([key]) => key !== "missing")
  .map(([, pair]) => pair);
/** @param {string} pathname @returns {{ en: string, cs: string } | null} */
function alternates(pathname) {
  for (const pair of pairs) {
    if (Object.values(pair).includes(pathname)) return pair;
  }
  for (const projectBase of [paths.projects.en, paths.projects.cs]) {
    if (pathname.startsWith(projectBase)) {
      const slug = pathname.slice(projectBase.length);
      if (slug && !slug.slice(0, -1).includes("/"))
        return { en: paths.projects.en + slug, cs: paths.projects.cs + slug };
    }
  }
  return null;
}
export default defineConfig({
  site: "https://tymtrampolin.cz",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => Boolean(alternates(new URL(page).pathname)),
      serialize: (item) => {
        const pair = alternates(new URL(item.url).pathname);
        return pair
          ? {
              ...item,
              links: Object.entries(pair).map(([lang, path]) => ({
                lang,
                url: new URL(path, "https://tymtrampolin.cz").href,
              })),
            }
          : undefined;
      },
    }),
    svelte(),
  ],
  vite: { plugins: [tailwindcss()] },
  build: { assets: "_assets" },
});
