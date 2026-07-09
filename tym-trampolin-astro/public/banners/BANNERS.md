# Bannery portfolia — sloty pro Higgsfield / ChatGPT Image

Každý nadřazený projekt má 2 slotové obrázky. Vygeneruj je ve stejném dark stylu
(Odraz, pozadí `#030814`, akcent dle projektu) a **přepiš stejnojmenný placeholder
soubor** — cesty i názvy zůstávají stejné, takže se v kódu nic měnit nemusí.

| Projekt | Akcent | OG 1200×630 (náhled odkazu) | Čtverec 1080×1080 |
|---|---|---|---|
| DemocraTICon | gold `#ffc94a` | `democraticon-og.png` | `democraticon-square.png` |
| Hry | cyan `#4fc8ff` | `hry-og.png` | `hry-square.png` |
| E-shop | cyan `#4fc8ff` | `eshop-og.png` | `eshop-square.png` |
| Ukázkové weby | indigo `#7d8bff` | `ukazkove-weby-og.png` | `ukazkove-weby-square.png` |
| AI videa | rose `#f472b6` | `ai-videa-og.png` | `ai-videa-square.png` |
| Digitalizace školství | emerald `#34d399` | `digitalizace-skolstvi-og.png` | `digitalizace-skolstvi-square.png` |
| Analytický systém | gold `#ffc94a` | `analyticky-system-og.png` | `analyticky-system-square.png` |

## Jak jsou zapojené

- **OG 1200×630** = `og:image` na detailu projektu (náhled při sdílení odkazu).
  - Zapojeno hned u **Hry, Ukázkové weby, AI videa, Digitalizace školství**
    (mají `banner: banners/<slug>-og.png` ve frontmatteru).
  - U **DemocraTICon / E-shop / Analytický systém** je OG zatím reálná fotka (`thumb`).
    Až budeš mít branded banner, přidej do jejich `.md` řádek
    `banner: banners/<slug>-og.png`.
- **Čtverec 1080×1080** = slot pro IG / čtvercové náhledy. Zatím nikde nezapojený,
  jen připravený k použití.
- **Karetní náhled** 4 nových projektů je zatím `banners/<slug>.svg` (1200×480).
  Můžeš nahradit reálným obrázkem změnou `thumb:` ve frontmatteru.

## Stav

Všechny `*-og.png` a `*-square.png` jsou momentálně **placeholdery** (tmavé pozadí,
název projektu, popisek „PLACEHOLDER"). Stačí je přepsat finálními obrázky.
