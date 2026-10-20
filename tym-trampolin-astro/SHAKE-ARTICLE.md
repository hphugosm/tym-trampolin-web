# SHAKE: The AI Trick That Works by Refusing to Help You

The first English TT Blog article has an independent, light editorial layout.
Its route is generated at `/blog/the-ai-trick-that-works-by-refusing-to-help-you/`.
Both blog archives link to this English version. No Czech translation or print
issue number is claimed. The print issue is forthcoming.

## Source and implementation

- `src/content/blog/the-ai-trick-that-works-by-refusing-to-help-you/en.md`:
  the complete supplied article, with three HTML comment markers locating the
  research, activity and closing statement. Preserve these markers when editing.
- `src/components/shake/ShakeArticle.astro`: standalone semantic document,
  illustration, chart, challenge, tutor examples, prompt and sources.
- `src/styles/shake-article.css`: responsive editorial typography and layout.
- `src/scripts/shake-study.ts`: countdown, attempt/hint stages, reset, tabs,
  clipboard fallback, chart animation and reading progress.
- `src/data/shake-study.ts`: the exact copyable prompt and source links.
- `../tools/generate-shake-cover.py`: original social image generator (Pillow).

The page has no API keys, backend, authentication, analytics or external AI calls.
Answers exist only in the current page's memory. They are neither persisted nor
transmitted. Reset clears the attempt. Refreshing starts a new session.

The countdown uses a fixed wall-clock deadline and recalculates elapsed time when
the tab returns. It never depends on receiving exactly one timer tick per second.
Screen readers receive stage announcements rather than thirty live countdown
announcements. Hints require all thirty seconds and a submitted attempt (including
“I'm not sure”), then one further interaction for each hint and the explanation.

The copy button copies the full visible/expandable prompt, tries a legacy copy
fallback if necessary, and otherwise selects the text with manual copy
instructions. It never claims ChatGPT has received the prompt automatically.

## Local preview and checks

Use the existing Astro application with Node 22.12 or newer:

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro, followed by the article route above.

```sh
npm run check
npm run build
npm run verify:site
npm run preview
```

No new frontend dependencies were added. The chart respects reduced motion. The
article and full prompt remain readable without JavaScript; the timed activity
requires JavaScript. The comparison is explicitly a scripted illustration.

## Deployment and QR codes

The existing GitHub Pages workflow builds this application and deploys `dist/`
when `main` is pushed. The `CNAME` and Astro `site` setting preserve the current
`tymtrampolin.cz` domain. Canonical and sharing URLs derive from that real site.
For Vercel, choose `tym-trampolin-astro` as the root, the Astro framework preset,
`npm run build` as the build command and `dist` as the output directory. Set
Astro's `site` to the actual production domain if hosting under another domain.

After deployment, open the article and verify its real public address before
creating a QR code. Encode that verified address with a QR generator or the
optional `qrencode` CLI:

```sh
qrencode -t SVG -o shake-article-qr.svg 'PASTE_THE_VERIFIED_PUBLIC_ARTICLE_URL_HERE'
```

This command is documentation only; no placeholder QR is shipped. Scan the final
code on a phone before printing and keep its white quiet zone intact. Once it is
printed, preserve the article slug so the code keeps working.
