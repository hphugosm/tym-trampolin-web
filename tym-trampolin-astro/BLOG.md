# Publikování na TT Blogu

Blog je na `/blog/` a `/cs/blog/`. Články jsou textové soubory v repozitáři:
`src/content/blog/`. Lze je upravovat i přímo na GitHubu. Web zatím nemá
samostatný redakční editor ani formulář pro nahrávání článků.
`draft` řídí zobrazení na webu, nikoli viditelnost zdrojového souboru na GitHubu.

## První článek

1. Zkopíruj složku `src/content/blog/prvni-clanek/` a pojmenuj ji podle článku,
   například `jak-vznikalo-radio`. Používej malá písmena bez diakritiky a pomlčky.
   Název tvoří adresu článku, proto ho po zveřejnění neměň.
2. V `cs.md` vyplň údaje mezi značkami `---` a pod ně vlož svůj text.
   Název se vykreslí automaticky — v textu začínej až podnadpisy `##`.
3. Doplňky dej do `cs.extra.md` ve stejné složce. Je to běžný Markdown bez
   povinné hlavičky. Zobrazí se v odděleném bloku **Na webu navíc**.
   Když není potřeba, soubor vynech.
4. Nech `draft: true`, dokud text není hotový. Pro publikování nastav
   `draft: false`, zkontroluj náhled a změny ulož a pushni do větve `main`.
   GitHub Actions pak web automaticky nasadí.

```yaml
---
title: "Skutečný název článku"
description: "Jedna až dvě věty, které vystihují obsah."
author: "Hugo Kubíček"
publishedAt: "2026-10-20"
draft: true
tags: ["AI", "Vzdělávání"]
magazine:
  name: "SHAKE"
  issue: "Číslo 4 / 2025–2026"
  pages: "12–13"
  url: "https://www.gymnazium-amazon.cz/files/casopis-shake-4-cislo-2025-2026.pdf"
---
```

Ukázkové údaje o čísle a stranách nahraď údaji skutečného článku. `magazine`,
`issue`, `pages`, `url` i `tags` jsou volitelné; neznámé údaje vynech.
`title`, `description`, `author` a `publishedAt` jsou povinné.
Datum piš v uvozovkách jako `"YYYY-MM-DD"`. Při pozdější úpravě přidej
`updatedAt: "YYYY-MM-DD"`; původní datum neměň. Články s budoucím datem se při
buildu nevydají. Nejde o automatický plánovač: po dosažení data je nutný nový build.

Volitelné `readingMinutes: 3` nastaví vlastní odhad čtení místo výpočtu z délky
textu, například u interaktivního článku.

## Angličtina

Do stejné složky přidej `en.md` s anglickou hlavičkou a překladem textu.
Jeho `draft` nastav na `false`, až bude hotový. Anglické doplnění může být
v `en.extra.md`. České doplnění se do anglického článku automaticky nekopíruje.

Každý článek má vlastní stav vydání v každém jazyce. Rozpracovaný překlad se
nezveřejní. V přehledu se článek objeví jednou, přednostně v aktuálním jazyce.
Chybí-li překlad, přehled nabídne dostupnou verzi a označí její jazyk.
V detailu bude nepřeložený jazyk neaktivní; nevytváříme prázdné překlady.

## Obrázky, zdroje a doplňky

Soubory dej do `public/media/blog/nazev-clanku/`. V Markdownu odkazuj například:

```md
![Popis obsahu obrázku](/media/blog/nazev-clanku/obrazek.webp)

[Zdroj nebo další čtení](https://example.com/)

> Citace s uvedením autora a zdroje.
```

Obrázky zmenši na rozumnou velikost, použij WebP nebo JPEG a napiš popis
pro čtečky obrazovky. Pro dlouhé video použij odkaz na přehrání.
`cs.extra.md` může obsahovat libovolně dlouhý doplňující text i stejné typy materiálů.
Veřejné soubory v `public/` jsou přístupné i při `draft: true` — soukromé materiály
tam ukládej až při vydání.

## Kontrola před vydáním

```sh
npm run check
npm run build
npm run verify:site
```

Náhled přes `npm run dev` zobrazuje jen vydané články. Pro místní kontrolu
rozpracovaného textu nastav dočasně `draft: false`; před commitem ho vrať na
`true`, pokud článek ještě nechceš vydat. Zkontroluj také druhý jazyk, odkazy,
zdrojové číslo časopisu a zobrazení na telefonu.
