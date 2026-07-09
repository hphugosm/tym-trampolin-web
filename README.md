# Tým Trampolín — web

Hlavní web značky **Tým Trampolín**: landing, e-shop podpory, hudební album s playerem a hlasováním, dvě mini-hry, meme platforma, finance dashboard a vlastní analytics — bez závislosti na externích trackerech.

## Cíl

Jedno místo, kde žije celý brand: prezentace, prodej podpory, komunita (memes, hlasování o hymně) a interní přehledy (analytics, finance). Web musí běžet jako statický hosting a přežít bez placeného backendu.

## Jak to funguje

**Frontend** — původní část je ručně psané HTML/CSS/JS bez frameworku (`index.html`, `eshop_tym_trampolin.html`, `album-listen.html`, hry `kilometry-jdes.html` a `tym_trampolin_doom.html`, `memes.html`). Novější část v `tym-trampolin-astro/` je **Astro 6 + Svelte islands** — mimo jiné interaktivní **Finance Ledger** (CRUD nad Supabase, grafy, filtry, souhrny).

**Backend & analytics** — dvě lehké vrstvy místo klasického serveru:

1. **`tracking.js`** — vlastní client-side analytics: eventy se řadí do lokální fronty, payload se sanitizuje, endpoint musí být HTTPS a projít host allowlistem. Žádný endpoint není hardcoded — nastavuje se za běhu přes admin (`admin.html`) nebo runtime config.
2. **Google Apps Script collector** (`backend/google-apps-script/collector.gs`) — bezplatný sběrný endpoint; přijímá eventy z tracking.js a zapisuje je do Sheets.
3. **Supabase** — data vrstva finance dashboardu; klient používá výhradně *anon/publishable* klíč, data chrání RLS policies.

**Deploy** — GitHub Actions workflow (build Astro části + Pages deploy).

## Použité nástroje

Vanilla JS · Astro 6 · Svelte · Supabase (Postgres + RLS) · Google Apps Script · GitHub Actions/Pages

## Výsledky

- Produkční web se všemi sekcemi + admin panel
- 11 variant hymny s hlasováním, 2 hratelné mini-hry, meme upload s komentáři
- Vlastní analytics pipeline bez cookies třetích stran
- Bezpečnostní hardening zdokumentovaný v `docs/SECURITY.md` (HTTPS-only collector, host allowlist, sanitizace payloadů)

## Lessons learned

- Analytics endpoint nikdy nehardcodovat — po hardeningu se konfiguruje jen za běhu a repo je čisté.
- Google Apps Script je překvapivě použitelný „backend zdarma" pro nízké objemy eventů.
- Postupná migrace na Astro (islands) umožnila přidat interaktivní části bez přepisu celého webu.
