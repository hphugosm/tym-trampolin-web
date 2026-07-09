---
title: Hry
tagline: Dvě hry, dva vlastní enginy — od endless runneru po raycaster s bossy
year: 2026
order: 2
accent: var(--color-brand)
tags: [Hra, Vlastní engine, Canvas]
thumb: banners/hry-card.jpg
banner: banners/hry-og.jpg
howItWorks: |
  Obě hry běží na jedné herní smyčce (requestAnimationFrame) a kreslí do jednoho `<canvas>` — žádný engine, žádné knihovny. Stav hry (skóre, životy, vlna) drží prostý objekt, který smyčka každý snímek přečte a překreslí.

  **Co si odnést:** na 2D hru v prohlížeči framework nepotřebuješ. Klíč je oddělit tři věci — aktualizaci stavu, detekci kolizí (obdélník × obdélník bohatě stačí) a vykreslení. Když to držíš oddělené, přidat vlnu, bosse nebo nový typ nepřítele je otázka pár řádků.
polozky:
  - nazev: Kilometry Jdeš
    popis: Endless runner v čistém Canvas API — procedurální překážky, skóre, žádná knihovna.
    detailSlug: kilometry-jdes
    liveUrl: kilometry-jdes.html
    liveLabel: Hrát hru
    stack: [Canvas API, Vanilla JS]
    jakFunguje: Herní smyčka na requestAnimationFrame kreslí celý svět do jednoho canvasu; překážky vznikají procedurálně podle ujeté vzdálenosti a kolize se počítají z obdélníků kolem objektů.
    demo: hra
    flagship: true
  - nazev: DOOM Bounce 2.0
    popis: Kampaňová hra v jednom HTML souboru — raycaster engine, 20 vln, 10 bossů, anime cutscény, PWA a online žebříček.
    detailSlug: doom-bounce
    liveUrl: tym_trampolin_doom.html
    liveLabel: Hrát hru
    stack: [Raycasting, Canvas, PWA, Supabase]
    jakFunguje: Vlastní raycaster promítá 2D mapu do pseudo-3D sloupců, stav kampaně drží jeden konečný automat a online žebříček běží přes Supabase.
    demo: hra
    flagship: true
---

Naše hlavní hřiště pro kód. Obě hry jsme postavili od nuly — bez herních enginů, jen prohlížeč, canvas a čistý JavaScript.

**Kilometry Jdeš** je svižný endless runner do jedné ruky, **DOOM Bounce** je plnohodnotná kampaň s bossy, příběhem, anime cutscénami a online žebříčkem. Každá ukazuje jinou stránku toho, co v prohlížeči bez knihoven zvládneme.
