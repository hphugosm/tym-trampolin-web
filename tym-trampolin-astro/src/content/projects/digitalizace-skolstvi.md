---
title: Digitalizace školství
tagline: Ed-tech nástroje pro reálné školní situace — od výletní PWA po doporučování předmětů
year: 2026
order: 6
accent: var(--color-emerald)
tags: [Vzdělávání, Ed-tech, PWA]
thumb: banners/digitalizace-skolstvi.svg
banner: banners/digitalizace-skolstvi-og.png
polozky:
  - nazev: Berlín 2026 — výletní PWA
    popis: Offline-schopná appka školního výletu — program podle času, vlakový tracker, mapy, kurzová kalkulačka, checklist.
    repoUrl: https://github.com/hphugosm/berlin2026
    liveUrl: https://hphugosm.github.io/berlin2026/
    liveLabel: Živá appka
    stack: [Vanilla JS, Leaflet, PWA, Service Worker]
    jakFunguje: Service worker cachuje celý program, takže appka funguje i bez signálu; obsah reaguje na aktuální čas a místo v itineráři.
    demo: iframe
    flagship: true
  - nazev: Academic Vanguard
    popis: Adaptivní kvíz, který studentovi doporučí předměty podle profilu ve 24 dimenzích — a vysvětlí proč.
    repoUrl: https://github.com/hphugosm/subject-fit-quiz
    liveUrl: https://hphugosm.github.io/subject-fit-quiz/
    liveLabel: Spustit kvíz
    stack: [Vanilla JS, Adaptivní scoring]
    jakFunguje: Každá odpověď posune skóre napříč 24 osami; výsledek není černá skříňka — kvíz ukáže, které odpovědi k doporučení vedly.
    demo: iframe
    flagship: true
---

Nástroje, které řeší konkrétní situace ve škole. **Berlín 2026** provede třídu výletem i bez signálu, **Academic Vanguard** pomůže s volbou předmětů — obojí čistý frontend, žádný server.

Ed-tech nás baví právě proto, že výsledek hned někdo reálně použije.
