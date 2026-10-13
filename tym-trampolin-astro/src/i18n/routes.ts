import paths from "./paths.json";
export type Locale = "en" | "cs";
export const pagePaths = paths;
export type PageKey = keyof typeof pagePaths;
export const locales: Locale[] = ["en", "cs"];
export const localeForPath = (path: string): Locale =>
  path.startsWith("/cs/") || path.startsWith("/admin/") ? "cs" : "en";
export const pagePath = (locale: Locale, page: PageKey) =>
  pagePaths[page][locale];
export const projectPath = (locale: Locale, id: string) =>
  `${pagePaths.projects[locale]}${id}/`;

export function routeForPath(path: string): {
  page: PageKey;
  projectId?: string;
} {
  const normalized =
    path === "/404.html" ? path : `${path.replace(/\/$/, "")}/`;
  for (const page of Object.keys(pagePaths) as PageKey[]) {
    if (locales.some((locale) => pagePaths[page][locale] === normalized))
      return { page };
  }
  for (const locale of locales) {
    if (normalized.startsWith(pagePaths.projects[locale])) {
      const projectId = normalized
        .slice(pagePaths.projects[locale].length)
        .replace(/\/$/, "");
      if (projectId && !projectId.includes("/"))
        return { page: "projects", projectId };
    }
  }
  return { page: "home" };
}

export function alternatePath(path: string, locale: Locale) {
  const route = routeForPath(path);
  return route.projectId
    ? projectPath(locale, route.projectId)
    : pagePath(locale, route.page);
}

// Old Czech entry points keep their language; the old English radio and
// ClearMessage pages now lead to the same templates as all other projects.
export const legacyPages: Record<string, string> = {
  "o-tymu": pagePath("cs", "about"),
  uspechy: pagePath("cs", "journey"),
  kontakt: pagePath("cs", "collaborate"),
  partnerstvi: pagePath("cs", "collaborate"),
  podpora: pagePath("cs", "collaborate"),
  "psali-o-nas": `${pagePath("cs", "journey")}#media`,
  "pro-media": `${pagePath("cs", "journey")}#media`,
  galerie: pagePath("cs", "gallery"),
  pristupnost: pagePath("cs", "accessibility"),
  radio: projectPath("en", "ai-radio"),
  clearmessage: projectPath("en", "clearmessage"),
  projekty: pagePath("cs", "projects"),
};
export const legacyProjects: Record<string, string> = {
  "ai-videa": projectPath("cs", "real-estate-video"),
  "ukazkove-weby": projectPath("cs", "website-studies"),
  "digitalizace-skolstvi": projectPath("cs", "education-tools"),
  "doom-bounce": projectPath("cs", "doom-bounce"),
  hry: projectPath("cs", "doom-bounce"),
  democraticon: `${pagePath("cs", "journey")}#competitions`,
  "elbot-microlearning": `${pagePath("cs", "journey")}#competitions`,
  "digitalni-album": pagePath("cs", "music"),
  "kilometry-jdes": `${pagePath("cs", "journey")}#archive`,
  eshop: pagePath("cs", "projects"),
  "analyticky-system": pagePath("cs", "projects"),
  klicenka: `${pagePath("cs", "journey")}#archive`,
  socha: `${pagePath("cs", "journey")}#archive`,
};
