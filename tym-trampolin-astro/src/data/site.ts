import type { Locale } from "../i18n/routes";
export type Localized<T> = Record<Locale, T>;
export const choose = <T>(locale: Locale, en: T, cs: T): T =>
  locale === "en" ? en : cs;
export const contact = {
  email: "team@tymtrampolin.cz",
  phone: "+420 731 544 015",
  instagram: "https://www.instagram.com/tym_trampolin/",
  twitch: "https://www.twitch.tv/tym_trampolin",
};
export const brand: Localized<string> = {
  en: "Team Trampolin",
  cs: "Tým Trampolín",
};

export const ui = {
  en: {
    projects: "Projects",
    about: "About",
    journey: "Journey",
    collaborate: "Collaborate",
    gallery: "Gallery",
    music: "Music archive",
    privacy: "Privacy",
    cookies: "Cookies",
    accessibility: "Accessibility",
    menu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    home: "Home",
    viewProject: "View project",
    viewCode: "View code",
    openDemo: "Open demo",
    allProjects: "All projects",
    status: "Project status",
    author: "Built by",
    year: "Year",
    why: "Why we built it",
    made: "What we made",
    next: "Next steps",
    evidence: "Explore the work",
    technology: "Technology",
    related: "More projects",
    reachOut: "Start a conversation",
    join: "Join the team",
    work: "Work with us",
    photo: "Photo",
    previous: "Previous photo",
    nextPhoto: "Next photo",
    close: "Close",
    playGame: "Play the game",
    gameNote: "The original game interface is in Czech.",
    footer:
      "Student technology team in Prague. AI, cybersecurity, education, and creative projects.",
    newsletter: "Project updates",
    email: "Your email",
    subscribe: "Subscribe",
    newsletterSuccess: "Subscribed. We will send you project updates.",
    newsletterExists: "This email is already subscribed.",
    newsletterInvalid: "Enter a valid email address.",
    newsletterError: "Could not subscribe. Please try again or email us.",
  },
  cs: {
    projects: "Projekty",
    about: "O nás",
    journey: "Naše cesta",
    collaborate: "Spolupráce",
    gallery: "Galerie",
    music: "Hudební archiv",
    privacy: "Soukromí",
    cookies: "Cookies",
    accessibility: "Přístupnost",
    menu: "Otevřít menu",
    closeMenu: "Zavřít menu",
    language: "Jazyk",
    home: "Domů",
    viewProject: "Prohlédnout projekt",
    viewCode: "Prohlédnout kód",
    openDemo: "Otevřít demo",
    allProjects: "Všechny projekty",
    status: "Stav projektu",
    author: "Autor projektu",
    year: "Rok",
    why: "Proč projekt vznikl",
    made: "Co jsme vytvořili",
    next: "Další kroky",
    evidence: "Prohlédnout výstupy",
    technology: "Technologie",
    related: "Další projekty",
    reachOut: "Ozvat se nám",
    join: "Přidat se k týmu",
    work: "Spolupracovat s námi",
    photo: "Fotka",
    previous: "Předchozí fotka",
    nextPhoto: "Další fotka",
    close: "Zavřít",
    playGame: "Zahrát si hru",
    gameNote: "Původní rozhraní hry je v češtině.",
    footer:
      "Studentský technologický tým z Prahy. AI, kyberbezpečnost, vzdělávání a kreativní projekty.",
    newsletter: "Novinky z projektů",
    email: "Váš e-mail",
    subscribe: "Odebírat",
    newsletterSuccess: "Přihlášeno. Pošleme vám novinky z projektů.",
    newsletterExists: "Tento e-mail už novinky odebírá.",
    newsletterInvalid: "Zadejte platný e-mail.",
    newsletterError:
      "Přihlášení se nepovedlo. Zkuste to znovu nebo nám napište.",
  },
} satisfies Localized<Record<string, string>>;

export const pageCopy = {
  en: {
    home: {
      title: "Student Technology Team",
      heading: "AI tools, browser games, and creative experiments.",
      description:
        "Explore Team Trampolin’s work in AI, cybersecurity, web development, education, and video. Student projects, competition results, and collaboration opportunities.",
    },
    projects: {
      title: "Projects",
      heading: "Projects",
      description:
        "Prototypes, client work, and creative experiments. See what we built, why we built it, and what works today.",
    },
    about: {
      title: "About",
      heading: "The people behind the projects",
      description:
        "Hugo, Dan, and Vojta. A student technology team from Prague, open to new members.",
    },
    journey: {
      title: "Our Journey",
      heading: "Our journey",
      description:
        "From a student competition to technology and creative projects. Completed milestones, competition results, and media coverage.",
    },
    collaborate: {
      title: "Collaborate",
      heading: "Work with Team Trampolin",
      description:
        "Client work, internships, research mentoring, support for experiments, and opportunities to join the team.",
    },
    gallery: {
      title: "Gallery",
      heading: "From the team archive",
      description:
        "Photographs from the DemocraTICon final in Olomouc and the team’s activities.",
    },
    music: {
      title: "Music Archive",
      heading: "The team album",
      description:
        "An archive of our anthem in ten musical versions, created around our competition activities.",
    },
    privacy: {
      title: "Privacy",
      heading: "Privacy",
      description:
        "How this website handles visitor data and contact information.",
    },
    cookies: {
      title: "Cookies",
      heading: "Cookies and local storage",
      description: "Information about browser storage and embedded content.",
    },
    accessibility: {
      title: "Accessibility",
      heading: "Accessibility",
      description:
        "Keyboard navigation, reduced motion, and known accessibility limitations.",
    },
    missing: {
      title: "Page Not Found",
      heading: "Page not found",
      description:
        "This page does not exist or has moved. Explore our projects or return home.",
    },
  },
  cs: {
    home: {
      title: "Studentský technologický tým",
      heading: "AI nástroje, hry v prohlížeči a kreativní experimenty.",
      description:
        "Poznejte práci Týmu Trampolín v AI, kyberbezpečnosti, vývoji webů, vzdělávání a videu. Studentské projekty, soutěžní výsledky a možnosti spolupráce.",
    },
    projects: {
      title: "Projekty",
      heading: "Projekty",
      description:
        "Prototypy, klientská tvorba a kreativní experimenty. Co jsme vytvořili, proč projekt vznikl a co dnes funguje.",
    },
    about: {
      title: "O nás",
      heading: "Lidé za projekty",
      description:
        "Hugo, Dan a Vojta. Studentský technologický tým z Prahy, otevřený novým členům.",
    },
    journey: {
      title: "Naše cesta",
      heading: "Naše cesta",
      description:
        "Od studentské soutěže k technologickým a kreativním projektům. Dokončené milníky, soutěžní výsledky a mediální ohlasy.",
    },
    collaborate: {
      title: "Spolupráce",
      heading: "Spolupracujte s Týmem Trampolín",
      description:
        "Zakázky, stáže, výzkumný mentoring, podpora experimentů a možnost přidat se do týmu.",
    },
    gallery: {
      title: "Galerie",
      heading: "Z týmového archivu",
      description:
        "Fotografie z finále DemocraTIConu v Olomouci a týmových aktivit.",
    },
    music: {
      title: "Hudební archiv",
      heading: "Týmové album",
      description:
        "Archiv týmové hymny v deseti hudebních verzích, vytvořených kolem našich soutěžních aktivit.",
    },
    privacy: {
      title: "Soukromí",
      heading: "Ochrana soukromí",
      description:
        "Jak web nakládá s údaji návštěvníků a kontaktními informacemi.",
    },
    cookies: {
      title: "Cookies",
      heading: "Cookies a lokální úložiště",
      description: "Informace o úložišti prohlížeče a vloženém obsahu.",
    },
    accessibility: {
      title: "Přístupnost",
      heading: "Přístupnost",
      description:
        "Ovládání klávesnicí, omezení pohybu a známé limity přístupnosti.",
    },
    missing: {
      title: "Stránka nenalezena",
      heading: "Stránka nenalezena",
      description:
        "Tato stránka neexistuje nebo byla přesunuta. Prohlédněte si projekty nebo se vraťte na úvod.",
    },
  },
};

interface ProjectText {
  title: string;
  category: string;
  summary: string;
  status: string;
  why: string;
  made: string[];
  next: string;
  note?: string;
}
export interface Project {
  id: string;
  image?: string;
  imageAlt: Localized<string>;
  visual?: "radio" | "message";
  year: string;
  authors: string[];
  stack: string[];
  text: Localized<ProjectText>;
  links: {
    href: string;
    label: Localized<string>;
    kind?: "demo" | "repo" | "proof";
  }[];
  studies?: {
    title: string;
    description: Localized<string>;
    href: string;
    repo: string;
  }[];
  metric?: { value: string; label: Localized<string> };
}

export const projects: Project[] = [
  {
    id: "clearmessage",
    visual: "message",
    imageAlt: {
      en: "An illustrated, fictional suspicious message",
      cs: "Ilustrace fiktivní podezřelé zprávy",
    },
    year: "2026",
    authors: ["Hugo Kubíček"],
    stack: ["React", "TypeScript", "FastAPI", "scikit-learn", "Tesseract.js"],
    text: {
      en: {
        title: "ClearMessage",
        category: "Cybersecurity · AI",
        summary:
          "A research prototype that helps people understand suspicious messages and choose a next step. 2nd place at EVOHACKS 2026.",
        status: "Research prototype",
        why: "Suspicious messages can be hard to understand, especially for people less familiar with technology. We wanted to make the warning signs and the next step clearer.",
        made: [
          "The local application combines a trained text classifier, transparent rules, and practical guidance. Screenshot text recognition happens in the browser; confirmed text is analysed by the application backend.",
          "The public demo replays a recorded result. It cannot analyse a visitor’s own messages.",
        ],
        next: "Independent evaluation on more diverse messages, testing with real users, and a verified public deployment.",
        note: "TF-IDF and logistic regression achieved macro-F1 of 0.864 on a previously evaluated 880-message test set. This is an experimental dataset result, not independently measured performance on real-world fraud.",
      },
      cs: {
        title: "ClearMessage",
        category: "Kyberbezpečnost · AI",
        summary:
          "Výzkumný prototyp pro porozumění podezřelým zprávám a volbu dalšího kroku. 2. místo na EVOHACKS 2026.",
        status: "Výzkumný prototyp",
        why: "V podezřelých zprávách se těžko orientuje, zejména lidem, kteří se v technologiích méně vyznají. Cílem bylo zpřehlednit varovné signály a další postup.",
        made: [
          "Lokální aplikace kombinuje natrénovaný textový klasifikátor, transparentní pravidla a praktická doporučení. Rozpoznání textu ze snímku probíhá v prohlížeči; potvrzený text analyzuje backend aplikace.",
          "Veřejné demo přehrává zaznamenaný výsledek. Neumožňuje analyzovat vlastní zprávy návštěvníka.",
        ],
        next: "Nezávislé vyhodnocení na rozmanitějších zprávách, testování se skutečnými uživateli a ověřené veřejné nasazení.",
        note: "TF-IDF a logistická regrese dosáhly macro-F1 0,864 na dříve vyhodnocené testovací sadě 880 zpráv. Jde o experimentální výsledek na datasetu, nikoli nezávisle ověřenou úspěšnost v reálných podvodech.",
      },
    },
    links: [
      {
        href: "https://hphugosm.github.io/clearmessage-evohacks/",
        label: {
          en: "Explore the recorded demo",
          cs: "Prohlédnout zaznamenané demo",
        },
        kind: "demo",
      },
      {
        href: "https://github.com/hphugosm/clearmessage-evohacks",
        label: {
          en: "View code and model documentation",
          cs: "Kód a dokumentace modelu",
        },
        kind: "repo",
      },
      {
        href: "https://devpost.com/software/clearmessage-ai-phishing-detection",
        label: { en: "2nd place on Devpost", cs: "2. místo na Devpostu" },
        kind: "proof",
      },
    ],
    metric: {
      value: "2nd",
      label: { en: "place · EVOHACKS 2026", cs: "místo · EVOHACKS 2026" },
    },
  },
  {
    id: "real-estate-video",
    image: "banners/ai-videa-card.jpg",
    imageAlt: {
      en: "Creative AI video project artwork",
      cs: "Vizuál kreativní tvorby AI videa",
    },
    year: "2026",
    authors: ["Hugo Kubíček"],
    stack: ["AI video", "Motion design", "Editing"],
    text: {
      en: {
        title: "Real estate video",
        category: "Creative work · Client project",
        summary:
          "Six AI videos across three real estate projects for a RE/MAX agent. Future buildings, possible renovations, and everyday life in a home.",
        status: "Completed client work",
        why: "How do you present a property that does not yet exist, or help someone imagine a different use of an existing home?",
        made: [
          "Between May and September 2026, three projects for a RE/MAX agent produced six videos. The work explored possible buildings and renovations, along with scenes of people playing, swimming, sharing dinner, and enjoying a home through different seasons.",
          "The videos were designed to make the possibilities and atmosphere of each property easier to imagine.",
        ],
        next: "Explore further creative briefs and ways to combine property information with an engaging visual story.",
        note: "AI concept visualisations show imagined possibilities. They do not document an existing building or guarantee a future renovation.",
      },
      cs: {
        title: "Realitní videa",
        category: "Kreativní tvorba · Klientský projekt",
        summary:
          "Šest AI videí ve třech realitních projektech pro makléřku RE/MAX. Budoucí stavby, možné rekonstrukce a běžný život v domě.",
        status: "Dokončená klientská tvorba",
        why: "Jak představit nemovitost, která ještě nestojí, nebo pomoci zájemci vidět jiné využití existujícího domu?",
        made: [
          "Od května do září 2026 vzniklo ve třech projektech pro makléřku RE/MAX šest videí. Tvorba zahrnovala možné stavby a rekonstrukce i scény lidí, kteří si hrají, plavou, večeří a užívají si dům v různých ročních obdobích.",
          "Cílem videí bylo přiblížit možnosti prostoru a jeho atmosféru.",
        ],
        next: "Další kreativní zadání a způsoby propojení informací o nemovitosti s poutavým vizuálním příběhem.",
        note: "AI vizualizace představují možné návrhy. Nejde o dokumentaci existující stavby ani záruku budoucí rekonstrukce.",
      },
    },
    links: [],
    metric: {
      value: "6",
      label: { en: "videos · 3 properties", cs: "videí · 3 nemovitosti" },
    },
  },
  {
    id: "website-studies",
    image: "banners/ukazkove-weby-card.jpg",
    imageAlt: {
      en: "Website design and development studies",
      cs: "Ukázky designu a vývoje webů",
    },
    year: "2026",
    authors: ["Hugo Kubíček"],
    stack: ["JavaScript", "TypeScript", "Next.js", "3D", "CSS"],
    text: {
      en: {
        title: "Website studies",
        category: "Web development · Learning",
        summary:
          "Presentation and product websites built to develop our skills in design, interaction, and web development for client work.",
        status: "Design and development studies",
        why: "We learn web development by building websites with different purposes, from product presentation to information and visual storytelling.",
        made: [
          "SkyRing explores an interactive 3D product, TitanGOAT uses video controlled by scrolling, and a website about Olomouc focuses on information and presentation.",
          "These self-initiated studies demonstrate techniques we can bring to client work.",
        ],
        next: "Put these skills into practice through focused website briefs and feedback from clients.",
      },
      cs: {
        title: "Ukázkové weby",
        category: "Vývoj webů · Vzdělávání",
        summary:
          "Prezentační a produktové weby, na kterých rozvíjíme design, interakce a vývoj pro budoucí zakázky.",
        status: "Designové a vývojové ukázky",
        why: "Vývoj se učíme tvorbou webů s různými cíli, od prezentace produktu po informace a vizuální vyprávění.",
        made: [
          "SkyRing zkoumá interaktivní 3D produkt, TitanGOAT využívá video řízené posouváním stránky a web o Olomouci se zaměřuje na informace a prezentaci.",
          "Vlastní ukázky představují postupy využitelné v klientské tvorbě.",
        ],
        next: "Využít tyto dovednosti při konkrétních zadáních webů a získávat zpětnou vazbu od klientů.",
      },
    },
    links: [],
    studies: [
      {
        title: "SkyRing",
        description: {
          en: "An interactive 3D product presentation.",
          cs: "Interaktivní 3D prezentace produktu.",
        },
        href: "https://skyring-web.vercel.app",
        repo: "https://github.com/hphugosm/skyring-web",
      },
      {
        title: "TitanGOAT",
        description: {
          en: "A product story with video controlled by scrolling.",
          cs: "Produktový příběh s videem řízeným posouváním stránky.",
        },
        href: "https://titangoat-web.vercel.app",
        repo: "https://github.com/hphugosm/titangoat-web",
      },
      {
        title: "Olomouc",
        description: {
          en: "An information and presentation website about the city.",
          cs: "Informační a prezentační web o městě.",
        },
        href: "https://hphugosm.github.io/copilot-direct-fastlane/",
        repo: "https://github.com/hphugosm/copilot-direct-fastlane",
      },
    ],
  },
  {
    id: "doom-bounce",
    image: "media/doom/doom_title.webp",
    imageAlt: {
      en: "DOOM Bounce game title artwork",
      cs: "Titulní obrázek hry DOOM Bounce",
    },
    year: "2026",
    authors: ["Hugo Kubíček"],
    stack: ["JavaScript", "Canvas", "Raycasting", "AI animation", "AI voices"],
    text: {
      en: {
        title: "DOOM Bounce",
        category: "Browser game · Creative experiment",
        summary:
          "A browser game inspired by the DemocraTICon final. An experiment in raycasting, custom bosses, and AI-generated animation and voices.",
        status: "Playable experiment",
        why: "Could we build a game in the style of classic DOOM that runs in a browser?",
        made: [
          "DOOM Bounce explores that question with a custom raycasting engine, bosses inspired by the competition, and AI-generated cutscenes and voiceovers.",
          "It combines programming, game design, and creative asset production in one playable experiment.",
        ],
        next: "Continue learning from the game’s design, performance, and production process.",
      },
      cs: {
        title: "DOOM Bounce",
        category: "Hra v prohlížeči · Kreativní experiment",
        summary:
          "Hra inspirovaná finále DemocraTIConu. Experiment s raycastingem, vlastními bossy a AI animacemi a hlasy.",
        status: "Hratelný experiment",
        why: "Šlo by vytvořit hru ve stylu klasického DOOMu, která běží v prohlížeči?",
        made: [
          "DOOM Bounce tuto otázku zkoumá pomocí vlastního raycastingového enginu, bossů inspirovaných soutěží a AI cutscén a voiceoverů.",
          "Spojuje programování, herní design a kreativní produkci do jednoho hratelného experimentu.",
        ],
        next: "Dál se učit z herního designu, výkonu a produkčního procesu.",
      },
    },
    links: [
      {
        href: "/tym_trampolin_doom.html",
        label: { en: "Play the game", cs: "Zahrát si hru" },
        kind: "demo",
      },
    ],
  },
  {
    id: "education-tools",
    image: "banners/digitalizace-skolstvi-card.jpg",
    imageAlt: {
      en: "Digital tools for school activities",
      cs: "Digitální nástroje pro školní aktivity",
    },
    year: "2026",
    authors: ["Hugo Kubíček"],
    stack: ["JavaScript", "HTML", "CSS", "PWA"],
    text: {
      en: {
        title: "Education tools",
        category: "Education · Web applications",
        summary:
          "Practical school projects: a quiz for choosing English graduation seminars and an information website for a study trip to Berlin.",
        status: "Completed school projects",
        why: "Small web tools can bring useful information together and support decisions classmates actually need to make.",
        made: [
          "Academic Vanguard was used by classmates to help choose their English graduation seminars. Its questionnaire explains the recommendations it makes.",
          "Berlin 2026 brought the programme and practical information for a study trip to Berlin into one place.",
        ],
        next: "Explore more situations where a focused web tool can help students and teachers.",
      },
      cs: {
        title: "Digitalizace školství",
        category: "Vzdělávání · Webové aplikace",
        summary:
          "Praktické školní projekty: kvíz pro výběr anglických maturitních seminářů a informační web zájezdu do Berlína.",
        status: "Dokončené školní projekty",
        why: "Malé webové nástroje mohou soustředit užitečné informace a pomoci s rozhodnutími, která spolužáci skutečně řeší.",
        made: [
          "Academic Vanguard spolužáci využívali při výběru maturitních seminářů v angličtině. Dotazník vysvětluje svá doporučení.",
          "Berlín 2026 soustředil program a praktické informace poznávacího zájezdu do Berlína na jedno místo.",
        ],
        next: "Zkoumat další situace, ve kterých může konkrétní webový nástroj pomoci studentům a učitelům.",
      },
    },
    links: [],
    studies: [
      {
        title: "Academic Vanguard",
        description: {
          en: "A quiz used by classmates to choose English graduation seminars.",
          cs: "Kvíz používaný spolužáky k výběru anglických maturitních seminářů.",
        },
        href: "https://hphugosm.github.io/subject-fit-quiz/",
        repo: "https://github.com/hphugosm/subject-fit-quiz",
      },
      {
        title: "Berlin 2026",
        description: {
          en: "Programme and information for a school study trip.",
          cs: "Program a informace pro školní poznávací zájezd.",
        },
        href: "https://hphugosm.github.io/berlin2026/",
        repo: "https://github.com/hphugosm/berlin2026",
      },
    ],
  },
  {
    id: "ai-radio",
    visual: "radio",
    imageAlt: {
      en: "Illustrative spectrum for the AI radio experiment",
      cs: "Ilustrační spektrum experimentu AI rádia",
    },
    year: "2026",
    authors: ["Hugo Kubíček"],
    stack: ["Music generation", "AI DJ", "Model benchmarking", "FFmpeg"],
    text: {
      en: {
        title: "AI radio",
        category: "AI music · Research in progress",
        summary:
          "A music radio MVP for energetic work sessions without repeating the same tracks. Broadcasting is paused while a more sustainable version is being developed.",
        status: "MVP · Broadcasting paused",
        why: "Music with enough energy for focused work, without a playlist becoming familiar through repetition.",
        made: [
          "The September 2026 MVP explored autonomous music generation and broadcasting.",
          "The next version focuses on a more sustainable way to run the system. We are benchmarking models and intend to publish a paper on the project.",
        ],
        next: "Develop the next version, document model benchmarks, and prepare the planned paper.",
        note: "Broadcasting is currently paused. The next version and paper are work in progress.",
      },
      cs: {
        title: "AI rádio",
        category: "AI hudba · Probíhající výzkum",
        summary:
          "MVP hudebního rádia pro energickou práci bez opakování stejných skladeb. Vysílání je pozastavené během vývoje udržitelnější verze.",
        status: "MVP · Vysílání pozastaveno",
        why: "Hudba s dostatkem energie pro soustředěnou práci, která se opakováním neohraje.",
        made: [
          "MVP ze září 2026 zkoušelo autonomní generování hudby a vysílání.",
          "Další verze se zaměřuje na udržitelnější provoz systému. Benchmarkujeme modely a plánujeme publikovat práci na toto téma.",
        ],
        next: "Vyvíjet další verzi, dokumentovat benchmarky modelů a připravit plánovanou publikaci.",
        note: "Vysílání je nyní pozastavené. Nová verze i publikace jsou rozpracované.",
      },
    },
    links: [],
  },
];
export const projectById = (id: string) =>
  projects.find((project) => project.id === id);

export const team = [
  {
    name: "Hugo Kubíček",
    photo: "media/team-coding.webp",
    role: { en: "Team lead", cs: "Vedoucí týmu" },
    bio: {
      en: "Builds the technology and creative projects in this portfolio. Competed in DemocraTICon with Dan and Vojta.",
      cs: "Tvoří technologické a kreativní projekty v tomto portfoliu. S Danem a Vojtou se zapojil do DemocraTIConu.",
    },
  },
  {
    name: "Daniel Voženílek",
    photo: "media/team-consultation.webp",
    role: { en: "Team member", cs: "Člen týmu" },
    bio: {
      en: "Worked on DemocraTICon with Hugo and Vojta and represented the team at the national final.",
      cs: "S Hugem a Vojtou pracoval na DemocraTIConu a reprezentoval tým v celostátním finále.",
    },
  },
  {
    name: "Vojtěch Čakrt",
    photo: "media/finale-stage-1.webp",
    role: { en: "Team member", cs: "Člen týmu" },
    bio: {
      en: "Worked on the team’s DemocraTICon entry with Hugo and Dan.",
      cs: "S Hugem a Danem pracoval na týmové účasti v DemocraTIConu.",
    },
  },
];

export const timeline = [
  {
    date: { en: "January 2026", cs: "Leden 2026" },
    title: { en: "Team Trampolin begins", cs: "Vznik Týmu Trampolín" },
    text: {
      en: "Three students form a team for DemocraTICon, win the first round in Prague, and advance to the national final.",
      cs: "Tři studenti sestavují tým pro DemocraTICon, vyhrávají první kolo v Praze a postupují do celostátního finále.",
    },
  },
  {
    date: { en: "April 9–10, 2026", cs: "9.–10. dubna 2026" },
    title: { en: "3rd place in Olomouc", cs: "3. místo v Olomouci" },
    text: {
      en: "Hugo and Dan represent the team at the DemocraTICon national final and bring home third place.",
      cs: "Hugo a Dan reprezentují tým v celostátním finále DemocraTIConu a přivážejí třetí místo.",
    },
  },
  {
    date: { en: "May–September 2026", cs: "Květen–září 2026" },
    title: {
      en: "Client work and creative projects",
      cs: "Klientská tvorba a vlastní projekty",
    },
    text: {
      en: "Three projects for a RE/MAX agent produce six videos. Hugo also develops DOOM Bounce and website studies.",
      cs: "Tři projekty pro makléřku RE/MAX přinášejí šest videí. Hugo zároveň tvoří DOOM Bounce a ukázkové weby.",
    },
  },
  {
    date: { en: "September 2026", cs: "Září 2026" },
    title: { en: "The AI radio MVP", cs: "MVP AI rádia" },
    text: {
      en: "An experiment in generated music for work, without repeating the same tracks.",
      cs: "Experiment s generovanou hudbou k práci bez opakování stejných skladeb.",
    },
  },
  {
    date: { en: "October 10–11, 2026", cs: "10.–11. října 2026" },
    title: { en: "2nd place at EVOHACKS", cs: "2. místo na EVOHACKS" },
    text: {
      en: "Hugo’s ClearMessage prototype wins second place in an online student hackathon focused on AI for Automation.",
      cs: "Hugův prototyp ClearMessage získává druhé místo na online studentském hackathonu s tématem AI for Automation.",
    },
  },
];

export const media = [
  {
    source: "Shake",
    date: "2026-03-30",
    title: {
      en: "Qualification for the national final",
      cs: "Postup do celostátního finále",
    },
    text: {
      en: "The school magazine introduces the team and its DemocraTICon qualification.",
      cs: "Školní časopis představuje tým a jeho postup do finále DemocraTIConu.",
    },
    href: "https://www.gymnazium-amazon.cz/files/casopis-shake-3-cislo-2025-2026.pdf#page=3",
  },
  {
    source: "Shake",
    date: "2026-06-26",
    title: { en: "A bronze finish in Olomouc", cs: "Bronz z Olomouce" },
    text: {
      en: "The school magazine reports on Hugo and Dan’s third-place finish.",
      cs: "Školní časopis popisuje třetí místo Huga a Dana.",
    },
    href: "https://www.gymnazium-amazon.cz/files/casopis-shake-4-cislo-2025-2026.pdf#page=3",
  },
  {
    source: "AI First",
    date: "2026-04-20",
    title: {
      en: "AI-assisted coding at DemocraTICon",
      cs: "AI asistované programování na DemocraTIConu",
    },
    text: {
      en: "Coverage of the competition final and its coding challenge, with an audio version.",
      cs: "Článek o soutěžním finále a úloze s programováním, včetně audioverze.",
    },
    href: "https://www.aifirst.cz/clanky/firmy-vahaji-mesice-stredoskolaci-vibe-coduji",
  },
];
