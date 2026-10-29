# Originální logo — evidence podkladů

## Aktuální doplnění — 29. 10. 2026

Dodaný `Logo.png` (1536 × 1024 px) pochází přímo od uživatele. Původní soubor je archivovaný ve zdrojích webové implementace, kontrolní součet SHA-256: `60614bec4814b148a48f8c7cf6aaecb33c3e7dd3a1e27125327b971710ae4a93`.

Vlastník schválil webový export v barvě `#173DA5`, s průhledným pozadím a se zachovanou geometrií. [tt-symbol-web.svg](tt-symbol-web.svg) je přenositelná obálka původní rastrové masky, ne automatická vektorizace ani překreslený symbol. Bílý obdélník se za logo nevkládá. Horizontální master C není tímto dodáním potvrzen.

## Historický stav kontroly z 27. 10. 2026

**Přesné originální logo variant A a C nebylo v níže popsané kontrole nalezeno.** V tomto adresáři proto není náhradní SVG ani překreslený symbol. Schválená volba zůstává platná:

- **A — samostatný TT symbol:** projekty a prezentace.
- **C — horizontální logo:** hlavní web.
- **B:** nepoužívat.
- Zachovat **originální zakřivené horní části a zkosené spodní části**.

Úplná pravidla obsahuje [02 — Logo](../../02-logo.md). Chybějící master je otevřený podklad pro doplnění; samotná dokumentace není potvrzením připravenosti loga k nasazení.

## Rozsah kontroly

Kontrola proběhla 27. 10. 2026 nad větví `main` v commitu [`c7a7b4ff82349ff0e4efb557117d13a8630e0477`](https://github.com/hphugosm/tym-trampolin-web/tree/c7a7b4ff82349ff0e4efb557117d13a8630e0477). Zahrnula úplný strom souborů, kandidáty podle názvu a formátu, existující SVG, zdrojové komponenty, archivní HTML, vložené SVG a data URI, obsah press kitu a generátor materiálů. Závěr se vztahuje k tomuto snapshotu; netvrdí, že master neexistuje v jiných větvích, starší historii či mimo repozitář.

## Existující kandidáti

| Soubor v repozitáři | Zjištění | Použití v nové identitě |
| --- | --- | --- |
| [logo-trampolin.svg](../../../tym-trampolin-astro/public/press/logo-trampolin.svg) | Dvě hranatá T, doplněná obloukem a tečkou; text je vykreslovaný písmem Archivo. Horní části T jsou rovné a spodní konce nejsou zkosené podle požadavku. | Nepovažovat za přesný originál A/C. |
| [logo-trampolin-dark.svg](../../../tym-trampolin-astro/public/press/logo-trampolin-dark.svg) | Stejná geometrie, jiná barevnost pro tmavé pozadí. Stejný nesoulad tvarů. | Nepovažovat za přesný originál A/C. |
| [favicon.svg](../../../tym-trampolin-astro/public/favicon.svg) | Zmenšený příbuzný motiv s hranatými T, obloukem a tečkou. | Není zdrojem pro rekonstrukci schváleného symbolu. |
| [press-kit.zip](../../../tym-trampolin-astro/public/press/press-kit.zip) | Obsahuje stejné dva SVG kandidáty, profily PDF, fotografie a README; další originální soubor loga neobsahuje. | Archiv nepotvrzuje schválení ani přesnost těchto SVG. |

Tyto soubory zůstávají v původních cestách. Do `brand/assets/logo/` nejsou kopírované jako schválené assety a nejsou zpětně označené za návrhovou variantu B; přiřazení A/B/C bez původních návrhů by nebylo doložené.

### Další prověřené zdroje

- Archivní HTML obsahuje inline obrázek trampolíny; není to schválený TT symbol. Vložené rastrové obrázky neposkytly samostatný přesný originál A/C.
- Inline loga v [Navigation.astro](../../../tym-trampolin-astro/src/components/Navigation.astro) a [DashboardLayout.astro](../../../tym-trampolin-astro/src/layouts/DashboardLayout.astro) opakují rovná TT a oblouk. Odkazy press sekce vedou na stávající press assety; nebyl nalezen další doložený master.
- [Generátor materiálů](../../../tools/generate-materials.py) balí stávající soubory loga do press kitu; nedokládá jiný originál.
- `favicon.ico` obsahuje rastrovou ikonu 32 × 32 px s motivem A, nikoli TT; není zdrojem schváleného masteru A/C. Projektové obrázky a fotografie nejsou samy o sobě zdrojem pro přesné překreslení loga.

### Kontrolní součty prověřených souborů

SHA-256 identifikuje přesný prověřený obsah. **Kontrolní součet není potvrzení správnosti značky.**

```text
84ba8992228a6e0dccb4687789475eca1d0f1fd1acafabdcf09aa2656b1e5781  tym-trampolin-astro/public/press/logo-trampolin.svg
da5831a31a5d7ad40382de9486a55db1af3d1ed838f5eba0aacf952a5c8970ca  tym-trampolin-astro/public/press/logo-trampolin-dark.svg
e50b00989eedf4c57f4976d73597a586d223cb4ee673dbb686e85c8f542276ff  tym-trampolin-astro/public/favicon.svg
59ce13f9fa54889e867d791423d83dcd43699b79de5274ea1a373b335ea1349e  tym-trampolin-astro/public/press/press-kit.zip
```

## Doplnění skutečného originálu

1. Převzít master nebo schválený export od vlastníka značky a doložit, zda jde o A nebo C. Pokud je k dispozici jen jedna varianta, označit druhou jako stále chybějící.
2. Porovnat soubor s původním schváleným návrhem: zakřivené horní části, zkosené spodní části, proporce a u C celou horizontální sestavu. Nepřidávat text, prvky nebo křivky odhadem.
3. Uložit původní soubor beze změn. Doporučené názvy jsou `tt-symbol-a-original.<ext>` a `tt-horizontal-c-original.<ext>`; nejde o odkazy na již existující soubory. Zachovat skutečný formát, nevyměňovat rastr za automaticky trasované SVG.
4. Do tohoto inventáře dopsat zdroj, datum převzetí, označení varianty, rozměry či `viewBox`, barevnou verzi, SHA-256 a stav porovnání s originálem. Případné odvozené exporty evidovat zvlášť a ověřit shodu s masterem.
5. Doplnit odkazy a náhledy až na skutečně dodané soubory. Nasazení do webu připravit samostatně podle role C; projekty a prezentace používají A.

Číselný ochranný prostor, minimální velikost a povolené barevné verze nejsou v této evidenci domyšlené. Vyplní se pouze na základě doložených podkladů a dalšího rozhodnutí vlastníka značky.

