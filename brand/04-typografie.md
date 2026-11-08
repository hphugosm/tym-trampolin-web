# 04 — Typografie

## Schválené rozhodnutí

| Role | Písmo |
| --- | --- |
| Nadpisy | Space Grotesk |
| Běžné texty | Inter |

Space Grotesk nese nadpisovou vrstvu identity. Inter zajišťuje textovou vrstvu pro souvislé čtení.

Konkrétní řezy, velikosti, řádkování, prostrkání ani responzivní škála nebyly v tomto schválení určeny. Implementační hodnoty se mají volit podle média a ověřit v reálném rozvržení; nemají být vydávány za schválené konstanty značky.

## Praktická doporučení

- Pro titulky stránek, sekcí, prezentací a výrazné typografické kompozice použít Space Grotesk.
- Pro odstavce, popisy, delší vysvětlení a drobné informační texty použít Inter.
- Hierarchii stavět konzistentně a omezit počet současně používaných velikostí a řezů v jednom výstupu.
- Ověřit českou diakritiku, dlouhé nadpisy, úzké displeje a dostatečnou čitelnost textu přes fotografie.
- Při animování textu zachovat možnost sdělení přečíst. Motion nesmí narušit informační hierarchii.

### Příklad použití

Nadpis „Další velký skok.“ v písmu Space Grotesk může uvádět projekt. Navazující odstavec v písmu Inter vysvětlí, co tým zkoušel a kam jej výsledek posunul.

## Implementace a zdroje

Rodiny písem jsou zachyceny v [tokens.css](tokens.css) a [tokens.json](tokens.json). Dostupnost fontových souborů, jejich licenci a způsob načítání je nutné ověřit před nasazením. Tato kapitola sama nepotvrzuje, že jsou fonty v repozitáři přítomné.

Typografii v pohybu rozpracovává [06 — Vizuální styl a motion](06-vizualni-styl-a-motion.md).
