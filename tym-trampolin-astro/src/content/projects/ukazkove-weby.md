---
title: Ukázkové weby
tagline: Od Apple-style produktovek s 3D a scroll-videem po multi-page weby a PWA
year: 2026
order: 4
accent: var(--color-accent-2)
tags: [Web, Frontend, AI-assisted]
thumb: banners/ukazkove-weby-card.jpg
banner: banners/ukazkove-weby-og.jpg
howItWorks: |
  Společný recept flagshipů (SkyRing, TitanGOAT) je „scroll = časová osa". Pozici scrollu převedeš na číslo 0–1 a tím řídíš buď kameru nad 3D modelem, nebo snímek videa kresleného do canvasu. Obsah je „připnutý" (sticky) přes několik obrazovek, takže se nehýbe stránka, ale scéna.

  **Co si odnést:** plynulost dělá interpolace a damping — nikdy neskákej na cílovou hodnotu skokem, vždy se k ní přibližuj po malých krocích. A těžké assety (3D model, sekvenci snímků) přednačti dopředu, jinak scroll trhá.
polozky:
  - nazev: SkyRing 400
    popis: Produktová landing pro kulatou trampolínu s interaktivním 3D modelem řízeným scrollem.
    repoUrl: https://github.com/hphugosm/skyring-web
    liveUrl: https://skyring-web.vercel.app
    liveLabel: Živý web
    stack: [Next.js, react-three-fiber, GSAP, TypeScript]
    jakFunguje: GLB model se nejdřív normalizuje do jednotné velikosti, pak scroll řídí šest keyframů kamery s plynulou interpolací a textové panely se crossfadují synchronně s pohybem.
    demo: iframe
    flagship: true
  - nazev: TitanGOAT
    popis: Produktovka pre-workoutu — jeden souvislý scroll příběh „sestup do ledu" se scroll-scrubovaným videem.
    repoUrl: https://github.com/hphugosm/titangoat-web
    liveUrl: https://titangoat-web.vercel.app
    liveLabel: Živý web
    stack: [Next.js, Framer Motion, Lenis, Canvas]
    jakFunguje: Místo trhaného přehrávání videa se 240 přednačtených snímků kreslí do canvasu podle pozice scrollu; textové claimy se objevují přesně v jejich oknech.
    demo: iframe
    flagship: true
  - nazev: Olomouc
    popis: Vícestránkový prezentační web o Olomouci s reálnými fotkami a doloženými zdroji.
    repoUrl: https://github.com/hphugosm/copilot-direct-fastlane
    liveUrl: https://hphugosm.github.io/copilot-direct-fastlane/
    liveLabel: Živý web
    stack: [Vite, Static site, GitHub Pages]
    jakFunguje: Statický multi-page web sestavený Vite buildem s obsahem odděleným od šablon; nasazení běží automaticky přes GitHub Pages.
    demo: iframe
  - nazev: Vibecoder
    popis: Interní AI orchestrátor, který generuje kompletní weby — showcase toho, co nástroj umí.
    repoUrl: https://github.com/hphugosm/vibecoder-showcase
    stack: [AI orchestrace, Generování kódu]
    jakFunguje: Pipeline řetězí několik AI kroků — brief, struktura, obsah, kód, publikace — do jednoho průchodu; showcase ukazuje reálné vygenerované weby.
    demo: video
  - nazev: Vizuální esej 10 er
    popis: Scrollovací vizuální esej o deseti érách Kanye Westa — příběh vyprávěný jen typografií a barvami.
    repoUrl: https://github.com/hphugosm/kanye
    liveUrl: https://hphugosm.github.io/kanye/
    liveLabel: Živý web
    stack: [Single-file HTML, CSS]
    jakFunguje: Vše v jednom HTML souboru; každá éra má vlastní barevnou paletu i typografické měřítko a přechody řídí čistě CSS podle scrollu.
    demo: iframe
  - nazev: Osobní web
    popis: Jednoduchá statická osobní stránka — jeden soubor, žádný build.
    repoUrl: https://github.com/hphugosm/jana.kubickova
    liveUrl: https://hphugosm.github.io/jana.kubickova/
    liveLabel: Živý web
    stack: [Static HTML]
    jakFunguje: Ryze statické HTML/CSS bez build kroku, nasazené přes GitHub Pages — ukázka, že i minimalismus může být čistý.
    demo: iframe
---

Ukázky, na kterých pilujeme řemeslo. Nahoře **flagshipy** — Apple-style produktovky s reálným 3D (**SkyRing**) a scroll-scrubovaným videem (**TitanGOAT**), obě živě na Vercelu.

Pod nimi další weby: prezentační web o Olomouci, interní generátor webů Vibecoder, typografická vizuální esej a minimalistická osobní stránka. Různé cíle, jeden důraz — čistý frontend a poctivé řemeslo.
