# Bannery portfolia

Bannery jsou **AI-generované přes Higgsfield** (`marketing_studio_image`, dark Odraz styl,
akcent dle projektu) a doplněné čistým textovým overlayem (název + eyebrow) přes inkscape.

| Projekt | Akcent | OG 1200×630 | Čtverec 1080×1080 | Karta (thumb) |
|---|---|---|---|---|
| DemocraTICon | gold `#ffc94a` | `democraticon-og.jpg` | `democraticon-square.jpg` | reálná fotka (`media/…`) |
| Hry | cyan `#4fc8ff` | `hry-og.jpg` | `hry-square.jpg` | `hry-card.jpg` (bez textu) |
| E-shop | cyan `#4fc8ff` | `eshop-og.jpg` | `eshop-square.jpg` | reálná fotka (`media/…`) |
| Ukázkové weby | indigo `#7d8bff` | `ukazkove-weby-og.jpg` | `ukazkove-weby-square.jpg` | `ukazkove-weby-card.jpg` |
| AI videa | rose `#f472b6` | `ai-videa-og.jpg` | `ai-videa-square.jpg` | `ai-videa-card.jpg` |
| Digitalizace školství | emerald `#34d399` | `digitalizace-skolstvi-og.jpg` | `…-square.jpg` | `…-card.jpg` |
| Analytický systém | gold `#ffc94a` | `analyticky-system-og.jpg` | `…-square.jpg` | reálná fotka (`media/…`) |

## Zapojení
- **OG (1200×630)** = `og:image` na detailu projektu (`banner:` ve frontmatteru) — všech 7.
- **Karta (thumb)** — 4 nové projekty používají textless AI verzi `*-card.jpg`; DemocraTICon /
  E-shop / Analytický si drží reálnou fotku.
- **Čtverec (1080×1080)** = slot pro IG / čtvercové náhledy, zatím nikde nezapojený.

## Přegenerování
Chceš jiný banner? Vygeneruj nový přes Higgsfield (`marketing_studio_image`, 16:9), a buď
přepiš `*-og.jpg` stejným názvem, nebo mi řekni a udělám to. Skripty:
`scratchpad/gen-overlays.mjs` (text overlay) + inkscape export.
