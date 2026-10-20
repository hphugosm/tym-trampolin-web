import { getCollection, render, type CollectionEntry } from "astro:content";
import { blogPath, type Locale } from "../i18n/routes";

export type BlogEntry = CollectionEntry<"blog">;

// The article and its extra are separate Markdown files. Give each heading
// namespace its own IDs so repeated headings cannot break the table of contents.
export async function renderBlogPart(
  entry: BlogEntry | CollectionEntry<"blogExtras">,
  prefix: "article" | "extra",
) {
  const rendered = entry.rendered;
  if (!rendered) return render(entry);
  const { headings } = await render(entry);
  const ids = new Map(headings.map(({ slug }) => [slug, `${prefix}-${slug}`]));
  const html = rendered.html
    .replace(/(<h[1-6]\b[^>]*?\bid=")([^"]+)(")/g, (_, before, id, after) =>
      before + (ids.get(id) ?? id) + after)
    .replace(/(<a\b[^>]*?\bhref="#)([^"]+)(")/g, (_, before, id, after) =>
      before + (ids.get(id) ?? id) + after);
  return render({
    ...entry,
    rendered: {
      ...rendered, html,
      metadata: {
        ...rendered.metadata,
        imagePaths: rendered.metadata?.imagePaths ?? [],
        headings: headings.map((heading) => ({ ...heading, slug: ids.get(heading.slug)! })),
      },
    },
  });
}

export function blogIdentity(entry: BlogEntry) {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/(en|cs)$/.exec(entry.id);
  if (!match) throw new Error(`Blog: use <article-slug>/en.md or cs.md, got ${entry.id}`);
  return { slug: match[1], locale: match[2] as Locale };
}

export async function publishedBlogEntries() {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries
    .filter((entry) => new Date(entry.data.publishedAt).getTime() <= Date.now())
    .sort((a, b) =>
      b.data.publishedAt.localeCompare(a.data.publishedAt) || a.id.localeCompare(b.id),
    );
}

export function blogAlternates(entry: BlogEntry, entries: BlogEntry[]) {
  const { slug } = blogIdentity(entry);
  return Object.fromEntries(entries
    .filter((item) => blogIdentity(item).slug === slug)
    .map((item) => {
      const { locale } = blogIdentity(item);
      return [locale, blogPath(locale, slug)];
    })) as Partial<Record<Locale, string>>;
}

export function blogDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "cs" ? "cs-CZ" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(value));
}

export function readingMinutes(...bodies: (string | undefined)[]) {
  const words = bodies.join(" ").replace(/<[^>]*>/g, "").match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}

export const blogCopy = {
  en: {
    eyebrow: "From the school magazine",
    intro: "Articles by Hugo Kubíček, with room for everything that did not fit on the printed page.",
    print: "In the magazine",
    printNote: "The original article, with a reference to its issue.",
    extra: "Beyond the page",
    extraNote: "Additional context, sources, images, and follow-up notes.",
    archive: "Article archive",
    empty: "The first article is still to come.",
    emptyNote: "This is where school magazine articles and their web extras will appear.",
    projects: "Explore our projects",
    all: "All articles",
    reading: "min read",
    published: "Published",
    updated: "Updated",
    source: "Originally in",
    openIssue: "Open magazine issue",
    pages: "Pages",
    onPage: "In this article",
    body: "Article",
    extraLabel: "Web extra",
    extraIntro: "Additional material accompanying the magazine article.",
    en: "English",
    cs: "Czech",
    back: "Back to TT Blog",
  },
  cs: {
    eyebrow: "Ze školního časopisu",
    intro: "Články Huga Kubíčka a prostor pro všechno, co se na papír nevešlo.",
    print: "V časopisu",
    printNote: "Původní článek s odkazem na číslo, ve kterém vyšel.",
    extra: "Na webu navíc",
    extraNote: "Další souvislosti, zdroje, obrázky a poznámky k tématu.",
    archive: "Archiv článků",
    empty: "První článek teprve přijde.",
    emptyNote: "Tady najdete texty ze školního časopisu a jejich webové doplnění.",
    projects: "Prohlédnout naše projekty",
    all: "Všechny články",
    reading: "min čtení",
    published: "Publikováno",
    updated: "Aktualizováno",
    source: "Původně v",
    openIssue: "Otevřít číslo časopisu",
    pages: "Strany",
    onPage: "V tomto článku",
    body: "Článek",
    extraLabel: "Webové doplnění",
    extraIntro: "Doplňující materiály k článku ze školního časopisu.",
    en: "Anglicky",
    cs: "Česky",
    back: "Zpět na TT Blog",
  },
};
