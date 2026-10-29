# Motion system — website V1.0

## Jeden objekt a pevné buffery

Hlavní objekt je po celý příběh jeden `Mesh` s jednou indexed `BufferGeometry` a jedním `MeshPhysicalMaterial` (`vertexColors: false`). Buffer indexů i identity atributů zůstávají zachované. Posuny vrcholů, normály a pomocné barevné atributy se aktualizují v existujících polích; finální viditelný materiál řídí shaderové povrchy a jejich váhy, nikoli vertex colors. Během scrubu se nevyrábí nová geometrie, textura ani materiál. Neprobíhá přepnutí modelů ani crossfade dvou objektů.

První úsek zachovává v0.2: procedurální pěstní klín se zaobluje a zplošťuje do kamenného kola. Vnitřní prstenec se rozvírá v otvor a obvod získává 12 zubů. Před otevřením otvoru je jeho vnitřní stěna složená na osu; záměrně degenerované trojúhelníky nepředstírají průchozí otvor v celistvém kameni. Stejná souřadnicová struktura umožňuje při přechodu kola do žárovky otvor zase plynule uzavřít do pólu. Kolabovaným vrcholům se dodají konečné normály.

Cíle žárovky, čipu a rakety se spočítají jednou při vytvoření riggu. Žárovka a raketa používají rotační profily s hustšími prstenci u drobných průmyslových detailů. Oblé části vyhlazuje tvarově zachovávající kubická interpolace PCHIP, závit a tryska mají ostré hrany. Hlavní plocha kola je rovinná, zvýšený náboj závisí na skutečném poloměru, aby odrazy nevytvářely zvlnění. Žárovka má zaoblenou hlavu, zúžený krček, modelovaný závit a kontakt; raketa má profilovanou příď, válcový trup, čtyři široká směrová křídla a modelovanou trysku. Čip má vlastní přímou XY parametrizaci: ploché čtvercové tělo, vyvýšené jádro, zkosení a 16 širokých kontaktů. Výsledné pozice a pomocné pigmenty jsou uložené v CPU cache. Scroll interpoluje odpovídající souřadnice a aktualizuje normály.

Pro tuto předem známou sadu tvarů by obecný SDF + marching cubes přinesl zbytečnou rekonstrukci povrchu, měnící se počty vrcholů a složitější stabilní korespondenci během scrubu. Pevný parametrický povrch dává předvídatelné náklady a vratný pohyb. Není však obecnou podporou libovolné topologie: zvolená korespondence povrchu není vhodná pro několik oddělených plášťů, hluboké zářezy nebo další nezávislé otvory. Při přidání složitějšího modelu je nutné znovu posoudit parametrizaci, nikoli pouze importovat libovolný mesh.

## Povrchy, odrazy a světlo

`stoneTexture.ts` přidává přírodní šedohnědý a okrový pazourek: minerální vrstvy, jemné zrno, vložky a odvozené nerovnosti normál. Používá neměnné souřadnice `aRestPosition`, takže čas ani směr scrollování nemění rozložení kamenné textury. Modrá zůstává doplňkovým osvětlením, kámen nemá modrý pigment.

`craftFinish.ts` navazuje druhým `onBeforeCompile` hookem. Čtyři plynulé váhy určují obráběný kov s kruhovými stopami a drážkami, skleněnou hlavu žárovky s kovovým závitem, keramické pouzdro čipu se zlatými kontakty a modrou kresbou jádra, nebo bílomodrý lak rakety se spárami, okénkem a tmavou tryskou. Mění se pigment, lokální roughness, metalness, clearcoat a drobné normálové detaily. Většina jemných spár a stop je povrchový shaderový detail; nejde o další samostatně modelované díly.

Fyzikální transmise je shaderovou maskou omezena na hlavu žárovky a její fázovou váhu. Zbytek hlavního objektu zůstává neprůsvitný; není zde přepnutí mezi dvěma skořepinami. Uvnitř je skutečné samostatné geometrické emisivní vlákno s intenzitou až 9.5. Teplé bodové světlo má intenzitu až 4.5. Samostatný shaderový parametr výkonu přidává měkké teplé rozptýlení ve skle; dvourozměrná náhražka kresby vlákna se nepoužívá. Transmisivní materiál se neaktivuje přepínáním shaderové varianty během scrubu. Bílý scene background odpovídá stránce a je podkladem pro transmise. Jde o real-time stylizaci, nikoli přesnou optickou simulaci dvojitého skleněného pláště.

Jednou pečené HDR studio s tmavým okolím a čtyřmi jasnými softboxy vytváří čitelné odrazy. PMREM má velikost 256 ve standardním a 128 v úsporném profilu; `transmissionResolutionScale` je 0.75, respektive 0.5. Prostředí slouží odrazům, pozadí webu zůstává bílé. Přímá světla tvarují siluetu a jemné modré okrajové světlo navazuje na identitu.

Doplňkové efekty tvoří měkké billboardové halo žárovky a motoru a kontaktní stín. Stín a halo jsou stylizované plochy, nikoli ray-traced stíny, volumetrické světlo nebo bloom postprocessing. Efekty nepřekrývají morph výměnou hlavního modelu.

`launchEffects.ts` skládá oheň ze dvou zkřížených měkce ukončených ploch: bílého jádra, oranžového těla a modrého základu. Kouř je jeden `InstancedMesh` s 24 billboardy ve standardním a 12 v úsporném profilu. Jejich poloha a velikost jsou čistou funkcí indexu, zážehu a průběhu startu; neukládá se věk částic ani kumulovaná simulace. Zpětný scroll tak okamžitě obnoví stejnou stopu. Pouze jemné shaderové víření čte ambientní čas. Celá skupina se v prostoru řídí skutečnou polohou trysky a velikostí rakety v responzivní scéně. Jde o stylizovaný real-time oheň a kouř, nikoli fluidní simulaci.

`WebsiteCanvas` promítá skutečný zdroj žárovkového světla do viewportu a na `.website` nastavuje `--bulb-x`, `--bulb-y` a `--bulb-light`. Zápis souřadnic probíhá při aktivním světle; zhasnutí nastaví nulovou intenzitu. `SceneLight` používá tyto proměnné pro teplý radiální přesah do bílého pozadí. Projektové nadpisy a texty získají mírné oteplení a měkký odlesk, CTA povrchový světelný nádech. Vrstva neblokuje ukazatel a je skrytá pro asistivní technologie. CSS neobsahuje vlastní nezávislou světelnou smyčku; případné jemné pulzování přichází pouze z povoleného ambientu. Cleanup i reduced-motion/fallback světlo vynulují. Tento přesah je koordinovaná DOM stylizace, nikoli fyzikální výpočet osvětlení HTML.

## Čistá osa příběhu

`evaluateStory(progress)` přijímá jediné číslo v rozsahu 0–1. Přetečení se ořízne, nekonečné hodnoty a NaN se vrátí na začátek. Funkce nečte čas, DOM ani náhodný generátor. Vrací zdroj a cíl tvaru, smoothstep mix, samostatný průběh původní evoluce kamene, prostorovou pozici, náklon, měřítko, fyzikální materiálové kanály, emisi, zážeh, start a finále.

| Průběh | Děj |
|---|---|
| 0–0.035 | Celistvý pěstní klín |
| 0.035–0.18 | Kámen → ozubené kolo |
| 0.18–0.23 | Kolo drží tvar |
| 0.23–0.38 | Kolo → žárovka |
| 0.38–0.42 | Žárovka drží tvar |
| 0.42–0.56 | Žárovka → čip |
| 0.56–0.61 | Čip drží tvar |
| 0.61–0.77 | Čip → raketa |
| 0.77–0.82 | Raketa se narovnává |
| 0.81–0.86 | Plynulý zážeh |
| 0.85–0.94 | Start a odlet nad obraz |
| 0.94–1 | Finále, rezervovaný slot originálního loga |

Hodnoty `from` a `to` se při dosažení dalšího cíle posunou; reprezentovaný povrch je na hranici totožný. Směr pohybu střídá pravou a levou stranu, mezi cíli vede jemným obloukem. `x` je zlomek šířky viewportu, `y` zlomek výšky s kladným směrem vzhůru. Mobilní scéna zmenšuje horizontální pohyb a měřítko, obsah má vlastní responzivní rozložení.

Základní materiálové kanály z čisté časové osy přetrvávají; lokální shaderové masky nad nimi vytvářejí kovové drážky, sklo, keramiku, kontakty a lak. Váhy povrchů se odvozují ze stejného `from`/`to` a mixu jako deformace. Nemají vlastní časový přechod ani skryté spouštěče. Kamenný shader postupně odeznívá při vzniku kovu.

Týmové profily drží raketu ve stavu 0.77. Zážeh a start se odvíjejí až od následujícího volného úseku `data-launch-runway`, kde je už fotografie mimo viewport. Mezi tímto bodem a kapitolou `future` proběhne zbytek osy do 0.96. Kamera během vzletu přidává malý, čistě scrollovaný svislý posun `sin(π × launch) × 0.25` a po odletu se vrací; bez časových spouštěčů.

Všechny fáze včetně zážehu, odletu a materiálu jsou vratné; návrat na stejné procento obnoví stejný základní stav.

## Scroll a ambient

`useWebsiteScroll` vytváří jediný GSAP ScrollTrigger nad hlavním obsahem. Skutečné vršky elementů `[data-chapter]` mapuje na autorské body: `hero` 0, `about` 0.18, `projects` 0.38, `results` 0.56, `team` 0.77, `future` 0.96. Pozice se měří znovu při refreshi a změně velikosti obsahu; konec dokumentu dokončí finále. Footer se nepovažuje za další kapitolu. Nativní hash navigace proto zůstává použitelná i při různých výškách projektových seznamů. Obnovenou scroll pozici čte také při úvodním refreshi a události `pageshow`.

Store odděluje aktuální scroll od ručně nastaveného LAB průběhu. Ruční režim nepřestává sledovat skutečný scroll; návrat ke scrollu převezme jeho poslední hodnotu. Cleanup odpojí ResizeObserver, události i GSAP kontext.

Ambient rotace, náklon a vznášení se aplikují samostatnými transformacemi scény. Na přesném desktopovém kurzoru je doplňuje jemná vyhlazená paralaxa; vypnutí ambientu ji vrátí na nulu. Kámen a kolo se průběžně otáčejí; čip a raketa mají omezené jemné natočení, aby jejich přední detaily zůstaly čitelné. Čas ani kurzor nemění deformaci geometrie. R3F používá demand rendering, při zapnutém ambientu si vyžádá další snímek; při vypnutí se znovu kreslí na změnu stavu. Skrytý dokument a scéna mimo viditelnost přeruší ambient. Reduced-motion používá statické ilustrace bez nekonečného pohybu a bez načítání 3D chunku.

## Výkon a životní cyklus

Standardní profil používá povrch 10 368 vrcholů / 20 736 trojúhelníků, nejvýše DPR 1.5 a pool 48 doplňkových fragmentů. Úsporný profil má 5 472 vrcholů / 10 944 trojúhelníků, DPR nejvýše 1 a pool 24 fragmentů. Volí se pro šířku do 760 px, nejvýše čtyři logická CPU nebo hlášenou paměť nejvýše 4 GB. Konstruktor nepovolí více než 64 fragmentů. Fragmenty jsou standardně vypnuté a pouze doplňují první přechod; hlavní objekt se kompletně nerozpadá.

Adaptivní DPR po 60 zahřívacích a dalších 60 aktivních ambientních snímcích vyhodnotí průměrnou dobu snímku. Při trvalém průměru nad 24 ms jej sníží o 0.25, nejvýše třikrát a s odstupem nejméně pěti sekund, minimálně na 0.75. V rámci připojené scény jej opět nezvyšuje, aby rozlišení neoscilovalo. Pauzy nad 100 ms a neaktivní ambient ruší vzorek. Změna upraví velikost rendereru, nikoli geometrii; diagnostika `data-dpr` ukazuje aktuální hodnotu.

Rig vlastní 15 explicitně uvolňovaných GPU prostředků: hlavní a fragmentovou geometrii, dva základní materiály a fragmentový InstancedMesh (5); dvě geometrie a čtyři materiály běžných efektů (6); jednu sdílenou rovinnou geometrii, dva shaderové materiály a InstancedMesh kouře startovacího efektu (4). Cleanup je idempotentní. Shaderové povrchy nevytvářejí vlastní bitmapové GPU textury. Jejich hooky se skládají v pořadí kámen → finální povrch a uvolňují se v opačném pořadí `finish.dispose()` → `texture.dispose()`. CPU cache cílových povrchů zanikne s riggem.

Scéna navíc vlastní upečený PMREM render target. Dočasné studio a generátor se uvolní ihned po upečení; výsledný render target při odpojení scény. Obnoví se předchozí environment i background. Selhání inicializace také uvolní již vytvořené prostředky. Fyzikální transmise používá i interní renderer targety spravované Three.js, proto uvedených 15 není celkový počet rendererových interních alokací. Kontext a listenery R3F/DOM mají vlastní cleanup; WebGL ztráta přepne prezentaci do statického režimu.

## Pohyb ostatních prvků

`useChapterReveal` má vlastní scoped GSAP context, nezávislý na 3D scrubu a bez React renderování každý snímek. `IntersectionObserver` jednou spouští sestavené timelines. Nadpisy odhalují slova ze spodní masky, následují popis a CTA. Výsledky, členové týmu, fotografie a footer mají vlastní krátké vstupy; dělicí linky se vykreslují pomocí CSS proměnné. Maximální nástup trvá přibližně jednu sekundu. Při zpětném scrollu se přečtený obsah znovu neschovává.

Původní sémantické nadpisy a přirozené textové mezery zůstávají zachované. Doplňkové spany se při cleanupu odstraní. Focus v dosud nezobrazeném prvku dokončí příslušnou timeline okamžitě, takže animace nebrání klávesnici. Hook při reduced-motion nebo fallbacku vůbec nenastavuje skrytý stav. Cleanup odpojí observer i focus listener a vrátí inline styly pomocí `context.revert()`.

Odkazy mají viditelný hover a focus, primární tlačítka krátký průchod odlesku a katalog i mobilní navigace odstupňovaný vstup. Nativní dialog ponechává focus trap, Escape a návrat focusu. CSS respektuje `prefers-reduced-motion` také pro modal, backdrop a mikrointerakce. Obsahové zkrácení zůstává zachované: bez bloku principů, bez seznamu projektů na landing page a s kompaktní mezerou před výsledky.

Automatické kontroly sledují determinismus, kontinuitu, vratnost, konečné hodnoty, stabilitu identit bufferů a resource disposal. Prohlížečové kontroly mají ověřovat skutečný scroll, fallbacky, ovládání i stabilní renderer counters. Lokální Chromium se softwarovým rendererem není důkaz 60 FPS na reálném telefonu; před veřejným nasazením je vhodné změřit konkrétní cílová zařízení. Známé upozornění Vite na větší lazy 3D chunk nemá být zaměněné za neúspěšný build.

Dekorativní šipky, očíslované popisky kapitol, spodní úvodní lišta a čísla členů byly odstraněné. Fotografie týmu navazuje 24 px pod popisem; rozměry kapitol se dál měří z DOM, takže zkrácení nemění vratnost animace.
