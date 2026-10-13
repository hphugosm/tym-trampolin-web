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

The original logo, palette, fonts, and game assets are retained. The original games keep their Czech interfaces; links and surrounding presentation explain this. The music archive and gallery have localized controls. Public project descriptions distinguish research prototypes, studies, and completed client work.

## Data and integrations

Contact actions open email drafts. The existing newsletter and event tracking use Supabase. Local development does not send tracking events. Browser verification must not submit test email addresses to the production subscriber database; check local validation without a successful submission.

## Verification and publishing

`npm run check` checks TypeScript. `npm run verify:site` runs after a build and verifies both languages and static legacy redirects. GitHub Pages serves the generated redirect HTML using a meta refresh; it does not provide an HTTP 301 for those files.

Pushing to `main` triggers production deployment. Review changes before publishing. Internal `/admin/` pages and local radio-player experiments are excluded from the public sitemap and are outside this content migration.
