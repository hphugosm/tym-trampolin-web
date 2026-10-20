// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import paths from "./src/i18n/paths.json" with { type: "json" };
const pairs = Object.entries(paths)
  .filter(([key]) => key !== "missing")
  .map(([, pair]) => pair);
/** @type {Set<string>} */
let builtPaths = new Set();
/** @param {string} pathname @returns {Partial<Record<'en' | 'cs', string>> | null} */
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
  for (const base of [paths.blog.en, paths.blog.cs]) {
    if (!pathname.startsWith(base)) continue;
    const slug = pathname.slice(base.length);
    if (!slug || slug.slice(0, -1).includes("/")) continue;
    // Only advertise translations that were actually published.
    return Object.fromEntries(Object.entries(paths.blog)
      .map(([locale, prefix]) => [locale, prefix + slug])
      .filter(([, path]) => builtPaths.has(path)));
  }
  return null;
}
export default defineConfig({
  site: "https://tymtrampolin.cz",
  trailingSlash: "always",
  integrations: [
    {
      name: "published-language-routes",
      hooks: {
        "astro:build:done": ({ pages }) => {
          builtPaths = new Set(pages.map(({ pathname }) => `/${pathname.replace(/^\/|\/$/g, "")}/`));
        },
      },
    },
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
