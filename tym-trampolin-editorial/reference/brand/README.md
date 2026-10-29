# Tým Trampolín — Brand Bible

Dokumentace sedmi schválených částí identity Týmu Trampolín. Slouží jako společný podklad pro web, projekty, prezentace, fotografie, video a další výstupy.

**Stav:** všech sedm směrů je schválených; tato dokumentace je připravená k revizi v draft PR. Přesné originální logo A/C zatím nebylo v prověřených podkladech nalezeno. Jeho doplnění je otevřený assetový úkol, nikoli důvod měnit schválené rozhodnutí.

## Schválené volby

| Část | Rozhodnutí | Podrobnosti |
| --- | --- | --- |
| 01 — Identita | **Experimentální tým**: autentický, odvážný, zkouší a ladí. | [Identita](01-identita.md) |
| 02 — Logo | **A**: samostatný TT symbol pro projekty a prezentace. **C**: horizontální varianta pro hlavní web. **B nepoužívat.** Zachovat originální zakřivené horní části a zkosené spodní části. | [Logo](02-logo.md) |
| 03 — Barvy | **Editorial Blue**: `#173DA5`, `#0A0C12`, `#FFFFFF`, `#F3F5F9`, `#7C8494`. | [Barevnost](03-barevnost.md) |
| 04 — Typografie | **Space Grotesk** pro nadpisy, **Inter** pro texty. | [Typografie](04-typografie.md) |
| 05 — Komunikace | **Sebevědomý experimentátor**. Hlavní slogan: „Historie zná velké kroky. My děláme skoky.“ Anglicky: „History remembers great steps. We make leaps.“ | [Komunikace a všechny vedlejší slogany](05-komunikace.md) |
| 06 — Obraz a pohyb | **Cinematic Editorial**; černobílé fotografie s modrým akcentem. **Kinetic Typography** jako hlavní motion styl; **3D evoluce** doplňkově. | [Vizuální styl a motion](06-vizualni-styl-a-motion.md) |
| 07 — Projekty | **Experimental Identity**: projekty mohou mít vlastní experimentální grafický jazyk při zachování základní identity. | [Experimentální identita](07-experimentalni-identita.md) |

Vedlejší slogany: „Nejdřív to zkusíme.“, „Permanentně ve vývoji.“, „Tohle nás nikdo neučil.“, „Návod jsme přeskočili.“, „Další velký skok.“

## Struktura

```text
brand/
├── README.md
├── 01-identita.md
├── 02-logo.md
├── 03-barevnost.md
├── 04-typografie.md
├── 05-komunikace.md
├── 06-vizualni-styl-a-motion.md
├── 07-experimentalni-identita.md
├── tokens.css
├── tokens.json
└── assets/
    └── logo/
        └── README.md
```

## Jak dokumentaci používat

Kapitoly oddělují **schválená rozhodnutí** od **praktických doporučení**. Doporučení rozvádějí použití, ale nepředstavují nové schválené rozměry, řezy písem, motion časy ani varianty loga. Při rozporu má přednost výslovně schválená volba uvedená výše. Změnu základní identity je potřeba pojmenovat a předložit k posouzení; projektový experiment ji sám nepřepisuje.

Pro první návrh zvolit roli loga, barevnou kombinaci, nadpis a obrazový motiv podle příslušných kapitol. Před výstupem ověřit čitelnost, přesné znění sloganů a původ použitého loga. U projektu stručně zapsat, co je jeho vlastní grafický experiment a co přebírá ze společné identity.

## Tokeny

[tokens.css](tokens.css) a [tokens.json](tokens.json) obsahují stejné schválené barvy a rodiny písem. Názvy `blue`, `ink`, `white`, `surface`, `muted` jsou implementační názvy pro pět barev; nemění paletu. Záložní `system-ui, sans-serif` jsou technický fallback, nikoli další značková písma.

JSON má jednoduchou místní strukturu: `color.<name>` obsahuje HEX řetězec a `fontFamily.heading` / `fontFamily.body` obsahují pole názvů rodin v pořadí fallbacku. `meta` popisuje formát a rozsah. Nepředpokládá konkrétní nástroj pro převod tokenů. CSS pouze deklaruje proměnné s prefixem `--tt-`; neobsahuje import fontů ani pravidla pro komponenty.

| JSON | CSS |
| --- | --- |
| `color.blue` | `--tt-color-blue` |
| `color.ink` | `--tt-color-ink` |
| `color.white` | `--tt-color-white` |
| `color.surface` | `--tt-color-surface` |
| `color.muted` | `--tt-color-muted` |
| `fontFamily.heading` | `--tt-font-heading` |
| `fontFamily.body` | `--tt-font-body` |

Při změně hodnot udržovat oba soubory synchronní. Nezavádět neodsouhlasenou škálu velikostí, spacingu ani motion parametrů do části označené jako schválená identita.

## Stav assetů a návaznost na web

Podrobný inventář a důvody vyřazení existujících kandidátů jsou v [assets/logo/README.md](assets/logo/README.md). Název souboru v press kitu sám o sobě nedokládá přesnost originálu. Dokud není doložený master, nevytvářet náhradní SVG, neodvozovat symbol z fontu a neprohlašovat historické logo za variantu A nebo C.

Aktuální web používá jinou typografii a historické assety. Přidání `brand/` je dokumentační změna; aplikace tokenů, výměna loga a případná migrace webu patří do samostatné implementační úpravy. Evidence assetů je vztažena k výchozímu commitu uvedenému v inventáři, nikoli automaticky ke všem budoucím verzím webu.

## Revize

- Jsou všechna rozhodnutí v souladu se sedmi schválenými částmi?
- Zůstávají loga A/C přesná a varianta B vyřazená?
- Odpovídají obě sady tokenů a používají se barvy s vhodným kontrastem?
- Je zřejmé, co je schválený základ, doporučení a projektový experiment?
- Je případné nově doplněné logo doložené zdrojem a porovnané s originálem?

Schválené směry vycházejí ze zadání vlastníka značky navazujícího na konverzaci [Návrhy loga rebrandu](https://chatgpt.com/c/6adf7b43-eac4-83eb-85a7-2b44de4113ca). Pro práci s tímto adresářem není přístup do konverzace potřeba: všechna rozhodnutí jsou zde zapsaná.

