# Obsahový audit — 27. října 2026

## Rozsah a zdroje

Lokální `sources/` je prázdné. Žádné synchronizované podklady nebyly měněny. Audit četl lokální původní metadata podcastu a veřejné zdroje soutěží, školy a existujícího týmového webového repozitáře.

Aktuální veřejný obsah původního webu je v [site.ts](https://github.com/hphugosm/tym-trampolin-web/blob/main/tym-trampolin-astro/src/data/site.ts). Čten celý přes GitHub connector. Pro reprodukci auditu byl `main` ve stavu `c7a7b4ff82349ff0e4efb557117d13a8630e0477`. [proof.ts](https://github.com/hphugosm/tym-trampolin-web/blob/main/tym-trampolin-astro/src/data/proof.ts) výslovně označuje své exporty za kompatibilitu a určuje `site.ts` jako aktuální veřejný obsah.

Starší `src/content/projects/*.md` byly přečteny, ale obsahují rozpory. Zejména `democraticon.md` zmiňuje Prahu, 318 týmů, 14 finalistů a tři kola; aktuální `site.ts` a primární výsledky podporují Olomouc. Tyto starší počty, místa a přisuzování pořadatelů nepřebírat. Také starší propagační tvrzení o soukromí analytiky nejsou nezávislým technickým ověřením.

## Schválený katalog projektů

Níže uvedené popisy jsou zkrácené parafráze současného týmového `site.ts`. Nejde o nezávislé ověření všech implementačních nebo klientských tvrzení. Na novém webu lze použít jako doložené týmové portfolio. Stav zachovat přesně; plánovanou práci nevydávat za hotovou.

| Projekt | Kategorie a stav | Bezpečný popis | Doložené odkazy / obrazový podklad |
|---|---|---|---|
| ClearMessage | Kyberbezpečnost · AI; výzkumný prototyp | Pomáhá porozumět podezřelým zprávám a zvolit další krok. Lokální aplikace kombinuje klasifikátor, transparentní pravidla a OCR. | [Devpost](https://devpost.com/software/clearmessage-ai-phishing-detection), [repo](https://github.com/hphugosm/clearmessage-evohacks), [zaznamenané demo](https://hphugosm.github.io/clearmessage-evohacks/). Vizuál zprávy musí být označený jako ilustrační. |
| Realitní videa | Kreativní tvorba · klientský projekt; dokončená klientská tvorba | Šest AI videí pro tři realitní projekty makléřky RE/MAX, květen–září 2026. | `public/banners/ai-videa-card.jpg`. Současný katalog nemá veřejný odkaz na hotová klientská videa. AI vizualizace jsou návrhy možného využití, nikoli dokumentace existující stavby nebo příslib realizace. |
| Ukázkové weby | Vývoj webů · vzdělávání; designové a vývojové ukázky | Prezentační a produktové weby rozvíjející design, interakce a frontend. | `public/banners/ukazkove-weby-card.jpg`; [SkyRing](https://skyring-web.vercel.app), [repo](https://github.com/hphugosm/skyring-web); [TitanGOAT](https://titangoat-web.vercel.app), [repo](https://github.com/hphugosm/titangoat-web); [Olomouc](https://hphugosm.github.io/copilot-direct-fastlane/), [repo](https://github.com/hphugosm/copilot-direct-fastlane). Neoznačovat studie za skutečné klientské zakázky. |
| DOOM Bounce | Hra v prohlížeči · kreativní experiment; hratelný experiment | Vlastní raycastingový experiment inspirovaný finále DemocraTIConu, s bossy a AI animacemi/hlasy. | `public/media/doom/doom_title.webp`; [hra na původním webu](https://tymtrampolin.cz/tym_trampolin_doom.html). Funkčnost odkazu nebyla v tomto auditu interaktivně testována. |
| Digitalizace školství | Vzdělávání · webové aplikace; dokončené školní projekty | Academic Vanguard pomáhá volit anglické maturitní semináře; Berlín 2026 soustřeďuje informace školního zájezdu. | `public/banners/digitalizace-skolstvi-card.jpg`; [Academic Vanguard](https://hphugosm.github.io/subject-fit-quiz/), [repo](https://github.com/hphugosm/subject-fit-quiz); [Berlín 2026](https://hphugosm.github.io/berlin2026/), [repo](https://github.com/hphugosm/berlin2026). |
| AI rádio | AI hudba · probíhající výzkum; MVP · vysílání pozastaveno | Zářijový experiment s autonomně generovanou hudbou pro práci. Další verze, benchmarky a plánovaná publikace jsou rozpracované. | Ilustrační vizuál spektra. Žádný veřejný živý přehrávač ani odkaz současný katalog neuvádí. Neoznačovat vysílání za aktivní. |

Všech šest projektů má v `site.ts` rok 2026 a autora Hugo Kubíček. ClearMessage je navíc přímo doložen autorským projektem na Devpostu a veřejným repozitářem. [README ClearMessage](https://github.com/hphugosm/clearmessage-evohacks) uvádí, že veřejné demo přehrává zaznamenaný výsledek: nemá živý backend a neanalyzuje vlastní zprávy návštěvníka. Nezveřejňovat garance bezpečnosti, přesnost v reálných podvodech ani experimentální metriky bez jejich omezení.

### Kandidáti bez podkladů

CyberSim, Energetická mapa ČR a Demografická analýza Ústeckého kraje nebyly nalezeny v lokálních podkladech ani současném veřejném katalogu. V master promptu jsou uvedeny jako kandidáti k ověření. Nezařazovat je mezi hotové projekty; případné editovatelné sloty musí být jasně označené jako nedoplněné. Náhodně nalezené cizí projekty se stejným jménem CyberSim nejsou důkazem týmového autorství.

## Soutěže a výsledky

| Výsledek | Primární důkaz | Omezení |
|---|---|---|
| EVOHACKS 2026 — 2. místo, ClearMessage | [Devpost projektu](https://devpost.com/software/clearmessage-ai-phishing-detection), oddíly „Submitted to“ a „Created by“; [oficiální hackathon](https://evohackathon2026.devpost.com/) proběhl 10.–11. října 2026. | Výzkumný prototyp; autor na Devpostu Hugo Kubíček. Neodvozovat jiná ocenění nebo počet soutěžních projektů z počtu přihlášených účastníků. |
| DemocraTICon 2026 — 3. místo | [Oficiální výsledky pořadatele](https://www.democraticon.org/) uvádějí třetí Tým trampolín, Anglicko-české gymnázium Amazon, Praha. | Finále v Olomouci 9.–10. dubna podle současného týmového webu a školního časopisu; nepublikovat rozporné starší počty týmů/finalistů. |
| Energetická olympiáda — doložená účast a 22 bodů v tabulce | [Oficiální výsledková tabulka](https://enol.cz/vysledky), první datový řádek: tým trampolín / AMAZON, 22 bodů, čas 00:59:08. | Tabulka při auditu neoznačovala rok ani fázi a nebylo dohledáno pravidlo postupu. Není důkaz celkového vítězství ani samostatně potvrzeného postupu do finále. Použít „22 bodů ve zveřejněné tabulce“ nebo ponechat požadovaný postup do finále jako položku k ověření. |

Školní [SHAKE č. 3, 30. 3. 2026, str. 3](https://www.gymnazium-amazon.cz/files/casopis-shake-3-cislo-2025-2026.pdf#page=3), extrahované řádky 186–188, uvádí jména týmu a datum chystaného finále. Pozdější [SHAKE č. 4, str. 3](https://www.gymnazium-amazon.cz/files/casopis-shake-4-cislo-2025-2026.pdf#page=3) je odkazovaný v týmovém `site.ts`; v tomto auditu nebyl celý samostatně načten. Místní původní metadata `outputs/podcast-clips/source/podcast.info.json` také dokládají podcast o 3. místě: [LookUp #7](https://www.youtube.com/watch?v=1lBHlnD6FcQ), vydavatel AMAZON, zveřejněn 25. 10. 2026.

## Tým a fotografie

Jména potvrzuje školní časopis, role a mapování fotografií existující týmový `site.ts`.

| Člen | Role a popis | Původní cesta v repozitáři |
|---|---|---|
| Hugo Kubíček | Vedoucí týmu; tvoří technologické a kreativní projekty portfolia. | `tym-trampolin-astro/public/media/team-coding.webp` |
| Daniel Voženílek | Člen týmu; s Hugem reprezentoval tým v celostátním finále DemocraTIConu. | `tym-trampolin-astro/public/media/team-consultation.webp` |
| Vojtěch Čakrt | Člen týmu; podílel se na týmové účasti v DemocraTIConu. | `tym-trampolin-astro/public/media/finale-stage-1.webp` |
| Honza Smrz | Člen týmu; jméno a roli doplnil přímo uživatel v komentáři k webu. | Individuální fotografie není dodaná; profil uvádí potvrzené jméno a roli. |

Další dostupný týmový záběr: `tym-trampolin-astro/public/media/team-trio.webp`. Fotografie jsou reportážní záběry, ne nutně izolované portréty; před individuálním ořezem ověřit identitu vizuálně. Původní přiřazení fotografie samo nedokazuje, že každý člověk v záběru je daný člen. Pro plné zdrojové URL použít prefix `https://raw.githubusercontent.com/hphugosm/tym-trampolin-web/c7a7b4ff82349ff0e4efb557117d13a8630e0477/` a uvedenou cestu.

## Kontakty

Doloženo aktuálním `contact` v `site.ts`:

- E-mail: `team@tymtrampolin.cz`.
- Instagram: <https://www.instagram.com/tym_trampolin/>.
- Twitch: <https://www.twitch.tv/tym_trampolin>.
- Telefon: `+420 731 544 015` (již veřejný v oficiálním zdrojovém souboru; není nutné jej přidávat, pokud jej layout nevyžaduje).
- GitHub: bezpečný odkaz na [existující týmový webový repozitář](https://github.com/hphugosm/tym-trampolin-web) nebo na konkrétní doložené projekty. Osobní účet `hphugosm` nevydávat za novou týmovou organizaci.

Dostupnost cílových stránek byla ověřována čtením zdrojů, ne provedením kontaktního odeslání. Žádná zpráva nebyla nikomu odeslána.

## Logo a poslední fáze evoluce

`sources/` ani dostupná lokální média neobsahují originální schválené nové TT. `read_thread` konverzace `6adf7b43-eac4-83eb-85a7-2b44de4113ca` vrátil pouze posledních pět tahů, žádné přílohy a žádný další cursor; starší obrazové návrhy nejsou touto cestou dostupné.

V původním veřejném repozitáři byly nalezeny dva soubory:

- `tym-trampolin-astro/public/press/logo-trampolin.svg`
- `tym-trampolin-astro/public/press/logo-trampolin-dark.svg`

Jejich zdroj byl načten. Obsahují hranatá T s obdélníkovými spodními částmi, oblouk pod monogramem a žlutou tečku, se starší azurovou/fialovou paletou. **Neodpovídají uživatelem popsanému novému schválenému logu se zakřivenými horními částmi a zkosenými horními hranami spodních částí. Nepoužít je jako originál rebrandu a nevytvářet aproximaci.**

Závěr webu může zobrazit typografický název „Tým Trampolín“ a slogan; integrační slot pro originální logo zůstává zdokumentovaným chybějícím assetem. Nelze prohlásit akceptační bod o schváleném novém logu za dokončený, dokud není dodán originální grafický soubor.
