# 03 — Barevnost: Editorial Blue

## Schválené rozhodnutí

Paletu **Editorial Blue** tvoří přesně těchto pět barev:

| Implementační název | HEX | CSS token | Doporučená role |
| --- | --- | --- | --- |
| Blue | `#173DA5` | `--tt-color-blue` | Výrazný modrý akcent a klíčová sdělení. |
| Ink | `#0A0C12` | `--tt-color-ink` | Tmavý text a tmavé plochy. |
| White | `#FFFFFF` | `--tt-color-white` | Světlé pozadí a text na tmavých plochách. |
| Surface | `#F3F5F9` | `--tt-color-surface` | Jemně odlišená světlá plocha. |
| Muted | `#7C8494` | `--tt-color-muted` | Doplňková grafika a informace pouze s ověřeným kontrastem. |

HEX hodnoty jsou schválené; názvy a doporučené role jsou praktickým mapováním pro použití. Pevný poměr barev, další odstíny, gradienty, průhlednosti ani tiskové převody nebyly schváleny.

## Praktická doporučení

Černobílý obraz, světlé a tmavé plochy tvoří redakční základ. Modrá vede pozornost k důležitému prvku. Nespoléhat na barvu jako jediný nositel významu; odkaz, stav či důležitou informaci podpořit textem, tvarem nebo jiným rozeznatelným znakem.

Pro hlavní text na bílém či světlém pozadí použít Ink nebo Blue. Na modré ploše dobře funguje bílý text. Muted na světlém pozadí nepoužívat pro běžný drobný text. Blue na Ink nepoužívat pro text vyžadující čitelnost.

## Kontrast

Následující poměry jsou vypočtené z neprůhledných sRGB hodnot palety a pro přehled zaokrouhlené na dvě desetinná místa. Nepotvrzují kontrast nad fotografií, při průhlednosti nebo v animaci.

| Dvojice | Kontrast | Doporučení pro běžný text |
| --- | --- | --- |
| Ink / White | 19,55 : 1 | Vhodná základní kombinace. |
| Ink / Surface | 17,91 : 1 | Vhodná základní kombinace. |
| Blue / White | 9,34 : 1 | Vhodná pro výrazný text i bílé texty na modré. |
| Blue / Surface | 8,56 : 1 | Vhodná. |
| Muted / Ink | 5,20 : 1 | Vhodná při zachování těchto barev bez průhlednosti. |
| Muted / White | 3,76 : 1 | Pro běžný text nevyhovuje hranici 4,5 : 1. |
| Muted / Surface | 3,44 : 1 | Pro běžný text nevyhovuje hranici 4,5 : 1. |
| Blue / Ink | 2,09 : 1 | Nevhodná pro běžný i velký text. |

Pro webový text vychází orientační kontrola z [WCAG 2.2, Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): běžný text alespoň 4,5 : 1, velký text alespoň 3 : 1. Základní paleta sama o sobě nezaručuje přístupnost celého rozhraní; ověřit skutečnou kombinaci a zobrazení.

## Tokeny a další média

Zdrojem pro implementaci jsou synchronní [tokens.css](tokens.css) a [tokens.json](tokens.json). Při převodu pro tisk nejprve připravit nátisk pro konkrétní profil a materiál; tato dokumentace nepředepisuje nedoložené CMYK nebo přímé barvy.

Souvislost obrazu a barvy řeší [Vizuální styl a motion](06-vizualni-styl-a-motion.md). Projektovou volnost vymezuje [Experimentální identita](07-experimentalni-identita.md).
