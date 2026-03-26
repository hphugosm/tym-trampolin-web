# tym-trampolin-web

Webovy projekt Tym Trampolin (landing, e-shop, album, hry, admin, analytics).

## Rychly prehled

- Produkcni vstup: `index.html`
- Sdilena analytika: `tracking.js`
- Admin panel: `admin.html`
- Runner hra: `kilometry-jdes.html`
- Doom hra: `tym_trampolin_doom.html`

## Aktualni struktura repozitare

- `index.html` - hlavni landing stranka.
- `admin.html` - sprava metrik, objednavek a endpointu.
- `eshop_tym_trampolin.html` - e-shop podpory.
- `album-listen.html` - player, hlasovani, analytika poslechu.
- `kilometry-jdes.html` - hra + leaderboard.
- `tym_trampolin_doom.html` - Doom mini hra.
- `memes.html` - meme upload/votes/comments.
- `tracking.js` - klientska analytics vrstva (queue, endpoint config).
- `backend/google-apps-script/collector.gs` - server-side collector pro Google Apps Script.
- `archive/html/` - historicke HTML varianty.
- `docs/` - dokumentace (security, provoz, struktura).
- `tools/security/` - pomocne security skripty.

## Bezpecnostni stav po hardeningu

1. V klientu uz neni natvrdo zadny Google endpoint.
2. `tracking.js` ma defaultne endpoint vypnuty.
3. Endpoint lze nastavit pouze konfiguraci/adminem.
4. Odesilani na remote counter (`countapi`) je defaultne vypnute (opt-in).
5. URL v eventech se redaguji na `origin + path` bez query/hash.
6. `meta` payload je sanitizovany (omezeni hloubky, poctu klicu, citlivych nazvu).

Dulezite: endpoint, na ktery klient posila data, nelze v cistem frontendu plne skryt. Pokud endpoint existuje v runtime konfiguraci, uzivatel ho muze z klienta zjistit. Pro maximalni ochranu pouzij proxy/backend ve vlastni domene.

## Jak nastavit analytics endpoint

1. Otevri `admin.html`.
2. V sekci `Backend collector endpoint` nastav URL collectoru.
3. Klikni na `Ulozit endpoint`.
4. Volitelne klikni `Flush fronty`.

Pokud endpoint neni nastaven, udalosti zustavaji lokalne ve fronte a aplikace funguje v local-first rezimu.

## Google Apps Script collector

Zdroj: `backend/google-apps-script/collector.gs`

1. V Google Sheets otevri `Extensions -> Apps Script`.
2. Vloz obsah souboru `backend/google-apps-script/collector.gs`.
3. Deploy `Web app` (Execute as Me, access dle potreby).
4. URL vloz do admin panelu.

## Doporucene dalsi hardening kroky (deploy)

1. Nastavit CSP a security headers na hostingu.
2. Pouzit backend proxy na stejne domene (`/api/analytics`) misto primeho third-party endpointu.
3. Zapnout rate-limit a IP throttling na collectoru.
4. Monitorovat 4xx/5xx chyby a nevalidni payloady.

Detaily jsou v:

- `docs/SECURITY.md`
- `docs/OPERATIONS.md`
- `docs/REPOSITORY_STRUCTURE.md`
