# Dodaný originál a průhledné webové exporty loga

`tt-original.png` je přesná, nezměněná kopie uživatelem dodaného `Logo.png` z 29. října 2026 (1536 × 1024 px). SHA-256: `60614bec4814b148a48f8c7cf6aaecb33c3e7dd3a1e27125327b971710ae4a93`.

Na výslovné přání uživatele webové exporty odstraňují světlou obdélníkovou podložku a nahrazují původní modrou přesnou webovou barvou **#173DA5**. Geometrie, proporce, mezery a křivky dodaného symbolu zůstávají zachovány. Původní soubor zůstává archivním originálem; nepoužívá se jako běžný webový obrázek.

## Způsob exportu

`../export-brand.mjs` odvozuje průhlednost z modré barevné složky původních pixelů: `alpha = clamp((B − R − 3) / 249, 0, 1)`. Neutrální papír včetně jeho textury má nulovou průhlednostní masku; modrý tisk zachovává původní hrany a antialiasing. Barevná výplň má všude přesně #173DA5, včetně částečně průhledných okrajů; nevzniká bílý lem.

`tt-symbol.svg` a `tt-icon.svg` jsou SVG obálky nad vloženou rastrovou maskou odvozenou z originálu. Nejsou ručně překreslenou ani automaticky aproximovanou vektorovou rekonstrukcí. Symbol používá původní ořez `320 168 896 672`, ikony čtvercový ořez `320 64 896 896`. Zmenšení je rovnoměrné. Vstupní a výsledný maskovaný obrys mají shodný pixelový bounding box `[348,198,1187,810]` v původním obrazu.

## Exporty

- `tt-symbol-small.webp`: 112 × 84 px, průhledný symbol pro hlavičky a patičky.
- `tt-symbol.webp`: 336 × 252 px, průhledný symbol pro závěr úvodu a další kompozice.
- `favicon.png` a `tt-icon.webp`: 64 × 64 px, průhledná čtvercová ikona.
- `apple-touch-icon.png` a `tt-touch.webp`: 180 × 180 px, průhledná čtvercová ikona.
- `tt-symbol.svg` a `tt-icon.svg`: škálovatelné obálky s přesnou rastrovou maskou, bez externích odkazů.
- `export-report.json`: rozměry, velikosti, barevnost, maskové statistiky a SHA-256 hotových exportů.

Export je reprodukovatelný pomocí Node.js a Sharp 0.35.5. Pokud Sharp není lokálně dostupný, lze určit adresář balíčků: `SHARP_MODULE_ROOT=/absolute/path/to/node_modules node export-brand.mjs`. Běžný build používá hotové exporty, Sharp nepotřebuje. Bílou podložku není vhodné přidávat v CSS; průhlednost je součástí schválené webové varianty. Symbol doprovází čitelný název týmu; tato úprava sama nedokládá horizontální master varianty C.
