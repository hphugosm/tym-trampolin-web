# Team Trampolin website

A static Astro website presenting the student technology team, its work, completed competitions, and collaboration opportunities. English is the default language. Czech is available at `/cs/` through a switch that keeps visitors on the corresponding page.

## Local development

```sh
npm ci
npm run dev
npm run check
npm run build
npm run verify:site
```

The project requires Node 22.12 or newer. GitHub Actions builds this directory and deploys `dist/` to GitHub Pages at `tymtrampolin.cz`.

## Content and routes

- `src/data/site.ts`: English and Czech project descriptions, authors, milestones, media references, and interface text.
- `src/i18n/paths.json`: shared localized page paths, also used by the sitemap.
- `src/i18n/routes.ts`: project paths, matching language links, and legacy redirect destinations.
- `src/components/site/`: shared page sections and one project detail template.
- `src/pages/[...path].astro`: static generation of the new public pages.
- `src/pages/projekty/` and the older Czech entry points: static redirects preserving existing links.
- `../tools/verify-site.py`: checks the built public pages, local links, metadata, alternate languages, retired-project exclusions, and sitemap.

The main navigation has Projects, About, Journey, and Collaborate. The portfolio contains six areas. AI radio is a paused MVP, not a live broadcast. DemocraTICon is presented in the history and results. E-shop and analytics projects are excluded from the public portfolio. Original Markdown records remain available to the internal dashboard.

The original logo, navy/cyan/violet palette, and game assets are retained. The public site uses Chakra Petch headings, Archivo body text, and JetBrains Mono labels. The original games keep their Czech interfaces; links and surrounding presentation explain this. The music archive and gallery have localized controls. Public project descriptions distinguish research prototypes, studies, and completed client work.

## Data and integrations

Contact actions open email drafts. The existing newsletter and event tracking use Supabase. Local development does not send tracking events. Browser verification must not submit test email addresses to the production subscriber database; check local validation without a successful submission.

## Verification and publishing

`npm run check` checks Astro templates, TypeScript, and Svelte components. `npm run verify:site` runs after a build and verifies both languages and static legacy redirects. GitHub Pages serves the generated redirect HTML using a meta refresh; it does not provide an HTTP 301 for those files.

Pushing to `main` triggers production deployment. Review changes before publishing. Internal `/admin/` pages and local radio-player experiments are excluded from the public sitemap and are outside this content migration.


## Materials and audit fixes (October 2026)

`public/press/team-profile-en.pdf` and `team-profile-cs.pdf` are the current one-page team profiles. The old `partner-onepager.pdf` address serves the Czech profile. `press-kit.zip` contains both languages, the current logos, and archive photographs. Localized sharing images live in `public/media/og/` (six projects plus the default in each language).

Regenerate the materials from the repository root, with Python `reportlab` and `Pillow` installed:

```sh
node --experimental-strip-types tools/export-materials.mjs | python3 tools/generate-materials.py
```

The generator reads current team/project data and contains the concise partner-profile copy. Review both PDFs visually after regeneration. Included print fonts are licensed under the SIL Open Font License; license texts are in `tools/material-fonts/`.

Project selection is encoded in the URL fragment. The optional reduced-effects preference uses `localStorage` (`trampolin-effects`); system reduced-motion preferences always take precedence. The music archive's visualization runs only during playback while visible and permitted by the motion preference. Navigating away releases its audio context and listeners.

For a clean verification outside a local output directory:

```sh
npm run build -- --outDir /tmp/trampolin-build
npm run verify:site -- --dist /tmp/trampolin-build
```

npm and `package-lock.json` are authoritative. The old pnpm lockfile was retired. The deploy workflow uses Node 22 and checks all public language pairs before publication.

Still dependent on owner-provided material or service access: new member portraits; publishable real-estate videos and image credits; radio benchmark results/paper; review of Supabase access policies, rate limiting, and newsletter delivery. Production mail subscriptions must not be created as browser test data.
