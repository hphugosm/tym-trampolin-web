# Tým Trampolín web

Prezentační web studentského technologického týmu z Prahy. Portfolio zahrnuje ClearMessage, realitní AI videa, ukázkové weby, DOOM Bounce, školní nástroje a pozastavené MVP AI rádia. Web slouží zájemcům o spolupráci, univerzitám, nadacím a novým členům týmu.

## Aktuální web

Publikovaná aplikace se sestavuje v `tym-trampolin-astro/` pomocí Astro 7 a Tailwind CSS. Angličtina je výchozí jazyk, čeština je dostupná pod `/cs/`. Oba jazyky používají společná obsahová data a stejnou šablonu projektových stránek.

Hlavní navigace: Projects, About, Journey, Collaborate. Dokončené soutěže a média jsou součástí historie. E-shop a analytický systém jsou vyřazené z veřejného portfolia. Podrobnosti a příkazy pro lokální spuštění jsou v `tym-trampolin-astro/README.md`.

```sh
cd tym-trampolin-astro
npm ci
npm run dev
npm run check
npm run build
npm run verify:site
```

GitHub Actions ověří build, typy, jazykové páry, odkazy a sitemapu a nasadí `tym-trampolin-astro/dist` na GitHub Pages. Push do `main` spouští produkční nasazení na `tymtrampolin.cz`.

## Původní části

HTML stránky v kořeni a `archive/html/` uchovávají historii projektu. Původní hry a hudební soubory zůstávají v Astro `public/`. Staré veřejné adresy přesměrovávají na odpovídající nový obsah. Interní dashboard používá Svelte islands; veřejná obsahová migrace nemění jeho finanční integraci.

Repozitář obsahuje i původní analytický klient `tracking.js`, Google Apps Script collector a provozní dokumentaci v `docs/`. Aktuální Astro web používá samostatný klient v `src/scripts/track.ts` a Supabase pro události a odběr novinek. Podrobnosti původní analytické vrstvy jsou v `docs/SECURITY.md` a `backend/google-apps-script/README.md`.
