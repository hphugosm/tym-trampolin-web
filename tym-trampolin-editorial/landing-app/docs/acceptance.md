# Předání V1.0 — 27. 10. 2026

| Kritérium zadání | Stav |
| --- | --- |
| Funkční landing page a všechny hlavní sekce | Implementováno, včetně přímé navigace, projektových detailů a kontaktů. |
| Kámen, kolo, žárovka, čip, raketa | Jeden hlavní mesh, pět detailnějších procedurálních tvarů, minerální povrch, kov, transmisivní sklo s vláknem, keramika a lak. |
| Pohyb napříč obrazovkou | Střídání stran na desktopu; menší centrální scéna na mobilu. |
| Souvislá deformace | Pevné indexy a buffery, uzavření/vznik otvoru, žádný crossfade modelů. |
| Ambient bez scrollu | Oddělený čas, rotace, vznášení, přerušení ve skryté stránce. |
| Rozsvícení žárovky | Vnitřní geometrické vlákno, teplé bodové světlo, rozptyl ve skle a světelný přesah do pozadí i projektových textů a CTA. |
| Start rakety | Narovnání, vícebarevný oheň, deterministická kouřová stopa, odlet a krátké následování kamerou. Samostatný volný úsek za profily. |
| Obousměrný scroll | Ověřeno skutečným GSAP scrollem, shodnými pixely a vratným startem. |
| Schválené logo TT | **Čeká na originální asset.** Finále má integrační slot, žádná aproximace loga. |
| Responzivita a fallbacky | Ověřené 375/390 px a desktop, všechny informace dostupné bez WebGL i při reduced-motion. |
| Build a testy | TypeScript a produkční build prošly; 62 jednotkových a 13 browserových testů, bez chyb shaderů a konzole. |
| Ověřený obsah | Šest doložených projektů, dva výsledky, původní týmové fotografie a kontakty; Honza Smrz doplněný jako člen týmu podle zadání. |

## Zbývající podklady a limity

- Dodat schválený originální TT soubor, nastavit `originalLogo` v `src/ui/content.ts`. Bez něj nelze uzavřít kritérium schváleného loga.
- Honza Smrz a role „Člen týmu“ jsou doplněné. Individuální fotografie může být dodaná později; na stránce není zobrazený nedokončený profil.
- Další kandidátní projekty a postup do finále Energetické olympiády doplnit až s potvrzenými podklady; důvody jsou v [obsahovém auditu](content-audit.md).
- Žárovka má maskovanou fyzikální transmisi a vnitřní geometrické vlákno. Přesah světla do HTML je koordinovaná CSS vrstva, halo a stín jsou stylizované billboards. Oheň a kouř používají shaderové plochy a deterministické instance, nikoli volumetrickou fluidní simulaci. Mesh parametrizace podporuje tuto známou sadu tvarů; není obecným morpherem libovolných importovaných modelů.
- 60 FPS na fyzickém mobilu nebylo změřeno. Použité profily, adaptivní DPR a GPU limity popisuje [animační systém](motion-system.md).

## Obrazové ověření

[Desktop](preview/hero.png) · [Mobil 375 px](preview/mobile-375.png) · [Tablet 820 px](preview/tablet-820.png) · [Čip](preview/results.png) · [Světlo a vzlet](preview/light-and-launch.png) · [Start rakety](preview/launch-86.png) · [Statická varianta](preview/static-experience.png) · [Video vpřed a zpět](preview/website-tour.mp4)
