# V1.3 — jednotný web

Horní menu vede na místní podstránky ve stejném stylu jako landing page. Jejich úplné zdroje a sestavené stránky jsou součástí nadřazeného projektu.

# V1.2 — původní rozcestník

Horní menu obnovuje odkazy Projekty, O nás, Naše cesta, TT Blog a Spolupráce na původním webu `tymtrampolin.cz`. Ovládání LAB bylo z landing page odstraněno. Níže následuje popis předchozích verzí; historické zmínky o LAB popisují původní vývojové nástroje.

# V1.1 — modré vrstevnice v úvodu

Tato verze vychází z dodaného téměř finálního archivu V1.0. Přidává vlastní SVG pole modrých vrstevnic inspirované dodanými plakáty; hlavní obsah, rozvržení, projektový katalog a původní 3D příběh zůstávají převzaté ze ZIPu. Grafika při prvním posunu stránky mizí, aby nevstupovala do dráhy 3D objektu. Respektuje omezený pohyb a statickou záložní variantu.

Změny jsou v `src/ui/HeroContours.tsx`, `src/ui/heroContours.css` a ve dvou řádcích zapojení v `src/App.tsx`. Původní popis projektu následuje.

# Tým Trampolín — website V1.0

Samostatná React + TypeScript + Vite aplikace v `website/`, odvozená od Evolution Engine v0.2. Původní prototyp zůstává v `../prototypes/evolution-engine-v0.1/`; synchronizované podklady v `../sources/` jsou pouze ke čtení.

Web spojuje šest obsahových kapitol s jedním souvislým 3D příběhem: přírodní pěstní klín → ozubené kolo → žárovka → čip → raketa → prostor pro originální logo. Obsah, odkazy a doložené výsledky shrnuje [obsahový audit](docs/content-audit.md). Jde o lokálně připravenou aplikaci; veřejné nasazení není součástí tohoto adresáře.

[Stav akceptačních kritérií a zbývající podklady](docs/acceptance.md)

## Spuštění a kontrola

Vyžaduje moderní Node.js kompatibilní s Vite 8 a npm. Z tohoto adresáře:

```sh
npm ci
npm run dev -- --port 5200 --strictPort
```

Vývojový náhled: <http://127.0.0.1:5200/>. Kontroly:

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright bez proměnné prostředí spustí nebo použije vývojový server na portu 5200. Při prvním použití může být nutná instalace jeho prohlížeče: `npx playwright install chromium`.

Pro kontrolu produkčního sestavení spusťte v jednom terminálu:

```sh
npm run build
npm run preview -- --port 5201 --strictPort
```

A ve druhém:

```sh
EVOLUTION_BASE_URL=http://127.0.0.1:5201 npm run test:e2e
EVOLUTION_BASE_URL=http://127.0.0.1:5201 node scripts/capture.mjs
```

Volba `--screenshots-only` u capture skriptu vynechá video. MP4 převod vyžaduje dostupný `ffmpeg`; cestu lze určit přes `FFMPEG_PATH`. Produkční statické soubory jsou v `dist/`. Lazy 3D modul má přibližně 952 kB / 256 kB gzip; Vite u něj hlásí upozornění přes 500 kB, nejde o chybu kompilace.

Prémiová vizuální úprava z 27. 10. 2026 přidává detailnější profily modelů, fyzikální povrchy, studiové odrazy a samostatnou animaci typografie a ovládání. Nejnovější rozšíření přidává rozsvícení žárovky s přesahem světla do stránky a start s ohněm a kouřem. Ověřeno nad produkčním sestavením: TypeScript, build, **62 jednotkových a 13 browserových testů prošlo**, bez chyb shaderů a konzole. Nové snímky a video jsou v `docs/preview/`. Automatické kontroly ověřují kontinuitu a determinismus morphingu, identity bufferů, uvolnění prostředků, skutečné scrollování, mobilní ovládání, dialogy a fallbacky. Lokální Chromium se softwarovým rendererem není měření FPS na fyzickém telefonu.

## Funkce a přístupnost

- Responzivní kapitoly, hlavní navigace, výsledky, tým a kontakty. Na landing page je jediné tlačítko **Prozkoumejte projekty**; katalog šesti projektů a jejich detaily se otevřou v přístupném dialogu. Barvy a lokální fonty vycházejí z identity Trampolín.
- Jeden průběžně deformovaný hlavní mesh: přírodní pazourek s minerálním zrnem, obráběné kovové kolo, skleněná žárovka s vláknem, keramický čip se zlatými kontakty a lakovaná raketa. Procedurální mapování povrchu nevyžaduje bitmapové textury. Studiové softboxy se odrážejí v materiálech.
- Rozsvícené vnitřní vlákno a teplá bodová lampa doplňují maskovanou skleněnou hlavu. Její skutečná promítnutá poloha řídí měkký světelný přesah do pozadí, textů a CTA v sekci projektů.
- Raketa startuje s bílým jádrem plamene, oranžovým ohněm, modrým základem a postupně se rozvíjejícím kouřem. Posun, materiál, světlo i základ kouřové stopy se při scrollování zpět přesně vracejí. Ambient a jemná odezva na kurzor jsou oddělené od geometrického stavu.
- Typografie se odhaluje po slovech, následují texty a CTA; výsledky, tým a footer mají vlastní vstup. Linky se postupně vykreslí, odkazy mají viditelný hover i focus a katalog má odstupňovaný vstup. Pohyb není nutný pro čtení a ovládání.
- LAB nabízí ruční průběh, návrat ke scrollování, ambient motion, doplňkové fragmenty a wireframe. Ovládání nemění deterministický základ geometrie.
- `prefers-reduced-motion`, nedostupný WebGL2 a ztráta kontextu používají statické ilustrace jednotlivých fází. Obsah zůstává v DOM; 3D canvas je dekorativní a je načítaný samostatně.
- Sémantické `header`, `nav`, `main`, `section`, `article`, nadpisy a `footer`, skip link, viditelný focus a nativní hash odkazy podporují klávesnici. Mobilní menu lze zavřít Escape, detail projektu používá nativní dialog.
- Základní metadata a jazyk dokumentu jsou v `index.html`. Před veřejným nasazením doplňte skutečnou veřejnou URL a finální sdílecí podklady podle zvolené domény.

## Úpravy obsahu a chybějící podklady

`src/ui/content.ts` obsahuje projekty, výsledky, členy týmu, kontakty a `originalLogo`. Obrázky jsou v `public/media/`, vizuální identita v `src/theme.ts` a `src/styles.css`. Obrázkové cesty v obsahu používejte vůči `public/`, například `/media/soubor.webp`, a upravte odpovídající alternativní text v UI.

Schválené originální logo TT není dodané: `originalLogo` je záměrně `null`. Po obdržení souboru jej přidejte do `public/media/` a nastavte přesnou cestu. Závěrečný slot již existuje; neobsahuje vymyšlenou aproximaci značky. Honza Smrz je podle doplnění týmu uveden jako člen týmu. Samostatná fotografie nebyla dodaná. U Energetické olympiády nebyla doložená finálová kvalifikace, proto takové tvrzení není zveřejněné. CyberSim, Energetická mapa ČR a demografické mapové projekty bez podkladů také nejsou v katalogu hotových projektů. Podrobnosti a zdroje jsou v auditu.

## Technické rozdělení

| Soubor | Odpovědnost |
|---|---|
| `src/engine/geometry.ts`, `morphGeometry.ts` | Pěstní klín a původní souvislý přechod do kola |
| `src/engine/storyGeometry.ts` | Cache cílových povrchů a aktualizace stejného indexed bufferu |
| `src/engine/story.ts` | Čistá časová osa všech tvarů, materiálů a startu |
| `src/engine/websiteScroll.ts`, `store.ts` | GSAP mapování DOM kapitol a ruční/scroll režim |
| `src/scene/WebsiteCanvas.tsx`, `websiteResources.ts` | R3F scéna, ambient pohyb, světla a vlastnictví GPU prostředků |
| `src/scene/stoneTexture.ts`, `craftFinish.ts` | Procedurální minerál a fyzikální povrchy kovu, skla, keramiky a laku |
| `src/scene/studioEnvironment.ts`, `visualEffects.ts` | Pečené studiové odrazy, skutečné vnitřní vlákno, halo a kontaktní stín |
| `src/scene/launchEffects.ts` | Sdílené plochy plamene a instancovaný deterministický kouř |
| `src/ui/SceneLight.tsx`, `styles.css` | Světlo žárovky promítnuté do vrstvy stránky a okolního UI |
| `src/ui/useChapterReveal.ts`, `styles.css` | Samostatné vstupy typografie, obsahových prvků a mikrointerakce |
| `src/ui/` | Obsah, LAB, statické ilustrace a preference |

Principy morphingu, známá omezení a správa prostředků jsou v [motion-system.md](docs/motion-system.md). Aplikace má standardní a úsporný profil; skutečných 60 FPS na konkrétním mobilním hardwaru tato lokální validace neslibuje. Fonty, projektová média a ostatní assety potřebné pro vlastní zobrazení jsou lokální. Kliknutí na externí projektové odkazy samozřejmě otevírá příslušné cizí služby.

## Náhledy

Capture skript ukládá výstupy do `docs/preview/`: `hero.png`, `about.png`, `projects.png`, `results.png`, `team.png`, `team-members.png`, `cleanup-overview.png`, `future.png`, `rocket.png`, `launch-86.png`, `launch-875.png`, `light-and-launch.png`, `finale.png`, `footer.png`, `static-experience.png`, `evolution-overview.png`, `tablet-820.png`, `mobile-390.png`, `mobile-375.png` a jejich varianty `mobile-390-projects.png` / `mobile-375-projects.png`. Samostatný snímek zachycuje statickou variantu; jednotlivé fáze používají skutečnou 3D scénu. Velmi vysoký celostránkový snímek překračuje limit povrchu místního softwarového rendereru, proto dokumentujeme každou sekci samostatně. Při zachycení videa přidá `website-tour.webm` a podle dostupnosti ffmpeg také `website-tour.mp4` celé jízdy vpřed i zpět.
