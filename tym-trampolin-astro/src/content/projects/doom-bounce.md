---
title: DOOM Bounce 2.0
tagline: 'Kampaň „Cesta na vrchol": 20 vln, 10 bossů, anime cutscény'
year: 2026
order: 11
parent: hry
featured: true
tags: [Hra, Vlastní engine, Anime, PWA]
accent: var(--color-rose)
thumb: media/doom/doom_title.webp
media:
  - type: image
    src: media/doom/doom_title.webp
    alt: Title art hry DOOM Bounce 2.0
  - type: image
    src: media/doom/cs_intro.webp
    alt: Úvodní cutscéna — vyhlášení, kde trofej začne zářit
  - type: image
    src: media/doom/boss_nerudovka.webp
    alt: Finální boss NERUDOVKA — anime portrét
  - type: image
    src: media/doom/shop_skolnik.webp
    alt: Školníkův kumbál — obchod mezi vlnami
  - type: video
    src: media/doom/intro_nerudovka.mp4
    poster: media/doom/boss_nerudovka.webp
    alt: Lore animace finálního bosse
challenge: 'Verze 1.0 byla technické demo raycasteru. Šlo udělat z jednoho HTML souboru plnohodnotnou hru s příběhem, kampaní a produkčními hodnotami — bez enginu, bez build kroku?'
solution: 'Kampaň „Cesta na vrchol": z 3. místa se probíjíte prokletým žebříčkem soutěže až na vrchol. 10 bossů podle reálných soupeřů s unikátními mechanikami, anime cutscény s dabingem a lore animacemi (Higgsfield pipeline), obchod, perky, bestiář, achievementy, tři herní režimy s online žebříčky, mobil s joystickem, gamepad i instalace jako PWA. Pořád jeden soubor, žádné závislosti.'
role: Kompletní vývoj — engine, design, pixel art, AI produkce assetů
teamMembers: [Hugo]
updatedAt: červenec 2026
outcomeMetrics:
  - value: '20'
    label: vln kampaně
    context: 3 epizody s příběhem
  - value: '10'
    label: bossů
    context: každý s vlastní mechanikou, dabingem a fatality videem
  - value: '3'
    label: herní režimy
    context: kampaň, Boss Rush, denní výzva — online žebříčky
  - value: '1'
    label: HTML soubor
    context: celá hra bez enginu a build kroku
proofLinks:
  - href: tym_trampolin_doom.html
    label: Hra je veřejně hratelná
  - href: doom_manual.html
    label: Hráčská příručka
sponsorFit:
  - Ukázka kompletní produkce — kód, pixel art, anime cutscény, dabing i hudba z vlastní dílny
  - AI-asistovaná asset pipeline (Higgsfield) jako reálný use-case pro tech partnery
  - Hratelné demo pro workshopy, veletrhy a média — funguje i na telefonu jako PWA
ctaLabel: Zahrát si DOOM Bounce 2.0
ctaUrl: tym_trampolin_doom.html
---

**Verze 2.0 „Cesta na vrchol"** — z technického dema je plnohodnotná hra. Skončili jsme v soutěži třetí; ve hře se z bronzové příčky probíjíte prokletým žebříčkem přes 10 strážců-bossů (parodie reálných soupeřů, od TEAM 1 po finální NERUDOVKU se třemi fázemi) až k zlaté trofeji.

Pod kapotou: vlastní raycasting engine s floor castingem a vertikalitou (skoky, trampolíny, stomp killy), **anime cutscény s českým dabingem a lore animacemi**, Školníkův kumbál s upgrady, 10 perků, bestiář, achievementy, checkpoint save, tři obtížnosti. Hraje se na klávesnici, gamepadu i na telefonu (virtuální joystick, haptika) a dá se nainstalovat jako PWA. Online žebříčky přes Supabase pro kampaň, Boss Rush i denní výzvu.

A pořád je to **jeden HTML soubor** — žádný engine, žádný build krok.
