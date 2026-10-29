# V1.10 — přímé projekty, český článek, logo a doména

Obě projektová CTA úvodu vedou přímo do lokálního katalogu v příslušném jazyce. Starý stručný modal je odpojený z aplikace a nevstupuje do výsledného balíčku. Český článek /cs/blog/ai-ktera-pomaha-tim-ze-neporadi/ obsahuje celý překlad, graf, minipokus, nápovědy, rozhovory, prompt i zdroje. Jazykový přepínač vede mezi dvěma verzemi stejného článku; anglická cesta zůstává zachovaná.

Podle výslovného rozhodnutí vlastníka z 29. 10. 2026 mají všechny webové exporty loga průhledné pozadí a přesnou barvu #173DA5. Původní Logo.png zůstává beze změny; geometrie exportů je odvozena z jeho rastrové masky. Změna je zapsaná v reference/brand i autoritativní GitHub větvi docs/brand-bible. Hlavičky/patičky, ikony, social preview a press kit používají aktualizované exporty. Původní zdroj i schválený webový export jsou jasně odlišené.

Příprava tymtrampolin.cz: prepare-production.mjs sloučí ověřený původní Astro výstup s novým webem do sibling output/tym-trampolin-production. Zachovává 225 původních public souborů, obě hry, DOOM service worker závislosti, 11 admin rout a jejich _assets. Obsahuje 25 starých přesměrování, cílové fragmenty media/competitions/archive a partner-onepager.pdf alias. Metadata produkčního balíčku míří na https://tymtrampolin.cz; kontrolní Site používá svou vlastní adresu. Podrobnosti jsou v migration/README.md. Příprava sama nemění DNS ani nenasazuje doménu.

Ověřeno: produkční build a TypeScript, 38 HTML a místní reference, jazykové dvojice článku, přímé CTA; mobilní podoba článku a skutečný český timer/odpověď/nápověda v prohlížeči. Původní Astro build i jeho verify:site prošly; sloučený balík prošel kontrolou souborů her, cache a dashboard rout. Přihlašování a finanční API dashboardu nebyly znovu provozně testovány.

# V1.9 — mobil, rychlost a dodané logo

Dodané Logo.png je zachované beze změn v brand/tt-original.png. Menší přesné rastrové exporty používají společné hlavičky a patičky, závěr landing page, favicon, Apple ikona a všech 14 náhledů sdílení. Originál je také v mediálním balíčku. Barva a proporce se zachovávají; podrobnosti a kontrolní součet jsou v brand/README.md.

Galerie má 45 responzivních WebP exportů (480/800/1200 px), správnou EXIF orientaci a původní JPG pro lightbox. Celá 800px sada má 965 kB oproti 12,4 MB originálů (−92,2 %); přenos konkrétní stránky závisí na velikosti displeje a lazy loadingu. Export obnoví node optimize-gallery.mjs. Specializované CSS se načítá jen tam, kde se používá.

3D se načítá až po prvním vykreslení a ve volném čase prohlížeče; do prvního 3D snímku zůstávají lehké ilustrace. Reduced motion, Save-Data, 2G a prokazatelně slabé mobilní zařízení dostanou statickou variantu. Skryté okno, menu a projektový dialog pozastaví 3D i související scroll/pointer práci; běžný desktop a schopný telefon zachovávají 3D zážitek. Mobilní podstránky používají jednorázová odhalení bez průběžného parallaxu. Hlavní ovládání má nejméně 44px dotykové cíle a okamžitou odezvu, galerie nevyžaduje hover. Menu respektuje krátký displej a pozadí úvodu při otevření není interaktivní.

Ověření: produkční build, TypeScript, 65 testů; kontrola místních odkazů a jazykových stránek; skutečný náhled v prohlížeči 320/390px i desktop, menu/dialog pause-resume, galerie a ovládání lightboxu. Nebyl proveden nezávislý Lighthouse ani fyzický test všech telefonů.

# V1.8 — návrat DOOMu k původní arkádě

Na výslovné přání uživatele má detail DOOM Bounce vlastní původní arkádový vzhled (`doom-retro.css`), včetně lokálních fontů Press Start 2P a Chakra Petch, zlatých a levandulových titulků, kovového kabinetu, barevné grafiky a CRT vrstvy. Tato projektová výjimka z Editorial Blue se načítá pouze na českém a anglickém detailu DOOMu. Grafika `cs_intro.webp` i fonty jsou přibalené s licencemi; přepínač efektů respektuje systémové omezení pohybu. Pixelová vrstva je progresivní doplněk, původní obrázky zůstávají čitelné bez JavaScriptu.

Detaily nyní mají pět autorských kompozic (`case-studies.mjs/.css`) a samostatný herní kabinet DOOM (`doom-case.mjs/.css/.js`). DOOM navazuje na původní veřejnou stránku, používá původní portréty bossů a krátkou animaci cmd; výběr bossů funguje klávesnicí a video se nepřehrává automaticky. Veškeré původní faktické popisy projektů zůstávají zachované. Realitní záběry jsou označené jako ilustrační vizuál, ClearMessage jako fiktivní ukázka bez živé analýzy a rádio jako pozastavené.

`next-project.mjs/.css` uzavírá každý detail velkým odkazem na následující projekt ve stejném jazyce. `collaboration-choices.mjs/.css` nabízí zadání, mentoring, přidání do týmu a podporu experimentu; odkazy otevírají editovatelný e-mail s předmětem a otázkami, nic se automaticky neodesílá.

Úvod je nyní anglicky na `/` a česky na `/cs/`, včetně dialogů, navigace a metadat. Logo vnitřních stránek vrací na správnou jazykovou verzi. Sdílení používá 14 vlastních obrázků 1200 × 630 (`social/`, reprodukce `render-social.mjs` se Sharp). `press/` obsahuje oba dvoustránkové profily, textová fakta, licence a mediální balíček. Reprodukce PDF přes `generate-press.py` vyžaduje reportlab, fonttools a brotli. V podkladech stále chybí schválený symbol TT; web používá textový název.

Aktuální úvod na `/` a `/cs/` je sestavený z téměř finálního uživatelského `tym-trampolin-website-v1.0.zip`. Jeho samostatný zdroj je v `landing-app/`; přidané modré vrstevnice jsou v komponentě `HeroContours`. Obsah, kapitoly, 3D geometrie a časová osa ZIPu byly zachované. Doprovodné stránky dřívějšího portfolia zůstávají na svých adresách.

Projekty, O nás, Naše cesta, TT Blog a Spolupráce nyní vedou na místní stránky se stejnými písmy, paletou a modrými vrstevnicemi jako úvod. Nový společný vzhled zahrnuje také projektové detaily, galerii, hudební archiv, blogový článek i informační stránky v obou jazycích. Vývojové ovládání LAB se nezobrazuje.

Šest projektových náhledovek tvoří společný plakátový systém v `project-art.mjs` a `project-art.css`: výrazná typografie, modré kontury a vlastní motiv každého projektu. Stejná grafika se používá v katalogu, na detailech, v souvisejících projektech i v projektovém dialogu úvodu. Vektorové vrstvy reagují na hover a zaměření klávesnicí, při omezení pohybu zůstávají statické.

Scrollové animace zajišťují `experimental-motion.js` a `.css`: řádky titulků, postupné odhalení obsahu, dekorativní paralaxa na přesném ukazateli a vykreslování časové osy. `experimental-hover.css` přidává reakce náhledů, fotografií, šipek a podtržení. Pohyb respektuje `prefers-reduced-motion`, změnu nastavení za běhu, klávesnici, návrat z historie a filtrování projektů; bez JavaScriptu zůstává obsah viditelný.

Každá hlavní stránka má vlastní kompozici: katalog projektů střídá měřítka, tým pracuje s fotografickou koláží, historie s velkým letopočtem a osou milníků, blog s magazínovou titulní stranou a spolupráce s typografickou výzvou. Galerie připomíná kontaktní arch a hudební archiv obal desky. Detaily projektů mají samostatný titulní list. Responzivní varianty zachovávají tyto rozdíly a přirozené pořadí obsahu.

`experimental-heroes.mjs` a `experimental-heroes.css` skládají úvody, `experimental-layouts.css` mění navazující rozvržení a `experimental-archives.mjs` / `.css` obsahují kompozice galerie a alba.

`page-shell.mjs` skládá společnou navigaci a patičku, `page-field.mjs` kreslí SVG vrstevnice, `pages.css` obsahuje styl vnitřních stránek. `sync-page-assets.mjs` kopíruje lokální fonty a ovládání. `article-extras.mjs` a `article-challenge.js` zachovávají původní interaktivní výzvu, prompt i zdroje blogového článku. Zpracování odpovědi probíhá pouze na stránce.

`npm run build` sestaví doprovodné stránky i React landing page. Před prvním sestavením nainstalujte závislosti pomocí `npm ci --prefix landing-app`. `node check.mjs` kontroluje soubory a odkazy; jednotkové testy původního 3D systému spustíte přes `npm test --prefix landing-app`.

Předchozí dokumentace portfolia:

# Tým Trampolín — Editorial Blue

Prezentační web s redakčním redesignem podle dodaných vizuálních referencí a brand bible v GitHub větvi `docs/brand-bible`. Zachovává současný obsah Astro webu: šest projektů s úplnými detaily, tým, historii a mediální ohlasy, spolupráci, galerii, deset skladeb alba a publikovaný blogový článek. Angličtina je výchozí, čeština pod `/cs/`.

## Spuštění

Vyžaduje Node.js 25 nebo jinou verzi s podporou přímého načtení TypeScriptu.

```sh
npm run build
npm run check
python3 -m http.server 5318 --bind 127.0.0.1 --directory dist
```

Web je statický a nemá instalační závislosti. `build.mjs` sestavuje 35 obsahových stránek, metadata, sitemapu a chybovou stránku. `homepage.mjs` skládá asymetrickou úvodní stránku s vrstvenou typografií a fotografií, `shared.mjs` obsahuje routování a společné komponenty, `pages.mjs` vnitřní stránky, `pages.css` jejich styly a `dist/assets/main.css` společný základ a `dist/assets/editorial.css` redakční vizuální směr. Černá a bílá dominují, Editorial Blue zvýrazňuje drobné orientační prvky. Projekty mají různé rozměry a střídavé odsazení. `dist/assets/app.js` řídí menu, filtry, kopírování e-mailu a galerii. Přehrávače jsou nativní HTML audio a automaticky se navzájem pozastavují.

## Obsah a identita

Podklad: [aktuální obsah](https://github.com/hphugosm/tym-trampolin-web/blob/docs/brand-bible/tym-trampolin-astro/src/data/site.ts), [brand bible](https://github.com/hphugosm/tym-trampolin-web/tree/docs/brand-bible/brand). Snapshot obsahu je v `reference/site.ts`; schválené dokumenty v `reference/brand/`. Původní synchronizované projektové zdroje nebyly upravené.

Paleta Editorial Blue: #173DA5, #0A0C12, #FFFFFF, #F3F5F9, #7C8494. Nadpisy Space Grotesk, text Inter; fonty jsou lokální včetně české diakritiky, licence OFL u souborů. Fotografie se zobrazují černobíle přes CSS, originály zůstávají beze změn. Hlavní pohyb tvoří kinetická typografie; nastavení omezeného pohybu vypne animace.

Přesné schválené logo C v podkladech chybí. Hlavička proto používá obyčejný textový název týmu. Obecná šipka v ikoně webu není logo TT. Po dodání masteru stačí vložit originál; symbol nebyl překreslený ani aproximovaný.

Externí projekty, původní hry, mediální balíček a ZIP alba vedou na ověřené původní cíle. Odběr novinek vede na původní web. Nová statická verze neobsahuje analytiku, nepředstírá odeslání formulářů a nepřenáší interní dashboard ani jeho finanční integrace.

## Nasazení

`.openai/hosting.json` obsahuje identitu nového soukromého webu Sites. Produkční doména původního webu nebyla změněná. Složka `dist/` tvoří nasazovaný výstup.
