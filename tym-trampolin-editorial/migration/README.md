# Production preparation (no publication)

`node prepare-production.mjs` combines a separately built original Astro website
with this editorial website in the absolute sibling directory
`../tym-trampolin-production`. It does not change DNS or deploy anything.

Prerequisites:

The initial upstream checkout was verified at main commit
`c7a7b4ff82349ff0e4efb557117d13a8630e0477`; its clean lockfile installation,
Astro build (73 routes), and `npm run verify:site` all passed. No upstream
`AGENTS.md` was present. Node 25.8.2 satisfied its declared Node >=22.12 engine.

1. Clone public `hphugosm/tym-trampolin-web` main into the sibling directory
   `../tym-trampolin-production-source` and follow its repository instructions.
2. In its `tym-trampolin-astro` directory run `npm ci` and `npm run build`.
3. Build the editorial website normally, then run this preparation command.

The original build is copied first, preserving its generated `/admin/` pages,
compiled `/_assets/`, standalone games, service worker, historical media and
downloads. The editorial build replaces public portfolio pages. Existing legacy
redirect files remain in place; missing aliases from `legacy-routes.json` are
generated as static HTML redirects. GitHub Pages does not return HTTP 301 for
these HTML files.

The approved exception is Kilometry Jdeš: `ungate-kilometry.mjs` removes its
newsletter-registration prerequisite only in the merged output. The original
upstream game remains unchanged. Guests can start, pause, resume, and restart;
local scoring tolerates unavailable browser storage. The transform fails on
unexpected upstream source changes rather than silently retaining the gate.
The missing historical `/HymnaTT.mp3` fallback is restored as a copy of the
original anthem, so the runner's existing audio URLs keep working.

For GitHub Actions the same command accepts explicit absolute
`--upstream=...`, `--public=...`, and `--destination=...` paths. The draft workflow
builds and verifies Astro first, prepares a separate `production-dist` artifact,
and uploads that artifact. Existing main-only push and manual triggers stay
unchanged: opening or updating the draft PR does not deploy production.

Only the exact editorial preview origin is rewritten in HTML/XML/text files to
`https://tymtrampolin.cz`. External links are retained. `.nojekyll` and the existing
production `CNAME` are included. The historical `partner-onepager.pdf` points to
the current Czech profile.

Preparation fails if either game, DOOM service-worker CORE dependencies, the
album ZIP, any of the 11 original dashboard routes, direct compiled dashboard
dependencies, or any legacy destination/fragment is missing. This is a static
continuity check; dashboard/API authorization still needs its existing service
configuration and owner validation before production.

Before a future release, serve the merged sibling output and verify games,
manual/offline install, audio downloads, the PDF alias, localized content, and
the dashboard login/API flow. Do not create test financial transactions during
verification. Keep the previous production
artifact for rollback. A push to the original repository's main branch already
deploys its Astro output, so do not push this package there until a reviewed
workflow change selects the merged artifact.
