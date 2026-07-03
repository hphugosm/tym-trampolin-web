import { defineCollection, z } from 'astro:content';
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
  }),
});

export const collections = { projects };
