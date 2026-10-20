import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    year: z.coerce.string(),
    order: z.number().default(99),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    accent: z.string().default('var(--color-brand)'),
    thumb: z.string(),
    media: z
      .array(
        z.object({
          type: z.enum(['image', 'video']),
          src: z.string(),
          poster: z.string().optional(),
          alt: z.string().default(''),
        })
      )
      .default([]),
    link: z
      .object({
        href: z.string(),
        label: z.string(),
        external: z.boolean().default(false),
      })
      .optional(),
    // Case-study / trust layer (all optional)
    challenge: z.string().optional(),
    solution: z.string().optional(),
    role: z.string().optional(),
    teamMembers: z.array(z.string()).default([]),
    updatedAt: z.coerce.string().optional(),
    outcomeMetrics: z
      .array(
        z.object({
          value: z.coerce.string(),
          label: z.string(),
          context: z.string().optional(),
        })
      )
      .default([]),
    proofLinks: z
      .array(z.object({ href: z.string(), label: z.string() }))
      .default([]),
    awards: z.array(z.string()).default([]),
    pressMentions: z.array(z.string()).default([]),
    sponsorFit: z.array(z.string()).default([]),
    ctaLabel: z.string().optional(),
    ctaUrl: z.string().optional(),
    // ── Portfolio hierarchie (nadřazené projekty + sub-položky) ──
    // parent: slug nadřazené karty. Je-li vyplněn, je záznam pod-stránkou —
    // ve výpisu /projekty/ se nezobrazí, ale má vlastní detail (hybrid model).
    parent: z.string().optional(),
    // flagship: vyzdvižená karta (větší dlaždice ve výpisu / v gridu sub-položek).
    flagship: z.boolean().default(false),
    // banner: slot pro OG/hero banner (1200×630). Fallback při renderu je thumb.
    banner: z.string().optional(),
    repoUrl: z.string().optional(),
    liveUrl: z.string().optional(),
    liveLabel: z.string().optional(),
    stack: z.array(z.string()).default([]),
    // howItWorks: volitelný souhrnný blok „Jak to funguje" (jinak plyne z md těla).
    howItWorks: z.string().optional(),
    // polozky: sub-projekty nadřazené karty. detailSlug propojí položku
    // s její vlastní detailní pod-stránkou; jinak žije jako inline blok.
    polozky: z
      .array(
        z.object({
          nazev: z.string(),
          popis: z.string().optional(),
          repoUrl: z.string().optional(),
          liveUrl: z.string().optional(),
          liveLabel: z.string().optional(),
          detailSlug: z.string().optional(),
          thumb: z.string().optional(),
          stack: z.array(z.string()).default([]),
          jakFunguje: z.string().optional(),
          flagship: z.boolean().default(false),
          demo: z.string().optional(), // chat | produkt | hra | video | iframe | ig
        })
      )
      .default([]),
    // ── Fáze 2.5: interaktivní demo na detailu pod-stránky ──
    demo: z.string().optional(), // chat | hra | produkt | ig
    demoSrc: z.string().optional(), // iframe src hry (v public/)
    demoPoster: z.string().optional(), // náhled hry (click-to-play)
    chatLines: z
      .array(z.object({ role: z.enum(['bot', 'user']), text: z.string() }))
      .default([]),
    product: z
      .object({
        price: z.string(),
        note: z.string().optional(),
        cta: z.string().default('Přidat do košíku'),
      })
      .optional(),
    igPosts: z.array(z.object({ url: z.string(), caption: z.string().optional() })).default([]),
  }),
});

const blogDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  },
  'Use a valid date in YYYY-MM-DD format.',
);

const blog = defineCollection({
  loader: glob({ pattern: '*/{en,cs}.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    author: z.string().min(1),
    publishedAt: blogDate,
    updatedAt: blogDate.optional(),
    // Publishing is explicit; unfinished files are excluded from the website.
    draft: z.boolean().default(true),
    tags: z.array(z.string().min(1)).default([]),
    magazine: z.object({
      name: z.string().min(1),
      issue: z.string().optional(),
      pages: z.string().optional(),
      url: z.url({ protocol: /^https?$/ }).optional(),
    }).optional(),
  }).refine(
    ({ publishedAt, updatedAt }) => !updatedAt || updatedAt >= publishedAt,
    'updatedAt cannot be earlier than publishedAt.',
  ),
});

const blogExtras = defineCollection({
  loader: glob({
    pattern: '*/{en,cs}.extra.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.extra\.md$/, ''),
  }),
});

export const collections = { projects, blog, blogExtras };
