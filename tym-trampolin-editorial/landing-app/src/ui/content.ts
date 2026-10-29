import { locale, t } from "./locale";
export interface Project {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  detail: string;
  url?: string;
  source: string;
  image?: string;
  links?: { label: string; url: string }[];
}
const portfolioSource =
  "https://github.com/hphugosm/tym-trampolin-web/blob/main/tym-trampolin-astro/src/data/site.ts";
const projectsCs: Project[] = [
  {
    id: "clearmessage",
    name: "ClearMessage",
    category: "KYBERBEZPEČNOST / AI",
    status: "Výzkumný prototyp",
    description: "Pomáhá porozumět podezřelým zprávám a zvolit další krok.",
    detail:
      "Lokální prototyp kombinuje klasifikátor, transparentní pravidla a OCR. Veřejné demo přehrává zaznamenaný výsledek; neanalyzuje vlastní zprávy návštěvníka a nemá živý backend.",
    url: "https://devpost.com/software/clearmessage-ai-phishing-detection",
    source: portfolioSource,
    links: [
      {
        label: "Devpost",
        url: "https://devpost.com/software/clearmessage-ai-phishing-detection",
      },
      {
        label: "Zaznamenané demo",
        url: "https://hphugosm.github.io/clearmessage-evohacks/",
      },
    ],
  },
  {
    id: "realitni-videa",
    name: "Realitní videa",
    category: "KREATIVNÍ TVORBA / AI",
    status: "Dokončená klientská tvorba",
    description: "Šest AI videí pro tři realitní projekty.",
    detail:
      "Klientská tvorba pro makléřku RE/MAX z května až září 2026. AI vizualizace ukazují návrhy možného využití; nejsou dokumentací existující stavby ani příslibem realizace. Hotová klientská videa nemají v katalogu veřejný odkaz.",
    image: "/media/realitni-videa.jpg",
    source: portfolioSource,
  },
  {
    id: "weby",
    name: "Ukázkové weby",
    category: "FRONTEND / DESIGN",
    status: "Designové a vývojové ukázky",
    description: "Prostor pro design, interakce a nové přístupy k webu.",
    detail:
      "Prezentační a produktové studie SkyRing, TitanGOAT a Olomouc rozvíjejí naše zkušenosti s designem a frontendem. Jde o ukázky, nikoli skutečné klientské zakázky.",
    image: "/media/ukazkove-weby.jpg",
    source: portfolioSource,
    links: [
      { label: "SkyRing", url: "https://skyring-web.vercel.app" },
      { label: "TitanGOAT", url: "https://titangoat-web.vercel.app" },
      {
        label: "Olomouc",
        url: "https://hphugosm.github.io/copilot-direct-fastlane/",
      },
    ],
  },
  {
    id: "doom",
    name: "DOOM Bounce",
    category: "HRA / KREATIVNÍ EXPERIMENT",
    status: "Hratelný experiment",
    description: "Raycastingový svět inspirovaný finále DemocraTIConu.",
    detail:
      "Vlastní experiment pro prohlížeč, s bossy a AI animacemi i hlasy. Kreativní reakce na společný soutěžní zážitek.",
    image: "/media/doom-bounce.webp",
    source: portfolioSource,
    links: [
      {
        label: "Otevřít hru",
        url: "https://tymtrampolin.cz/tym_trampolin_doom.html",
      },
    ],
  },
  {
    id: "skolstvi",
    name: "Digitalizace školství",
    category: "VZDĚLÁVÁNÍ / APLIKACE",
    status: "Dokončené školní projekty",
    description: "Digitální nástroje pro rozhodování i společné zážitky.",
    detail:
      "Academic Vanguard pomáhá s volbou anglických maturitních seminářů. Berlín 2026 soustřeďuje informace školního zájezdu.",
    image: "/media/digitalizace.jpg",
    source: portfolioSource,
    links: [
      {
        label: "Academic Vanguard",
        url: "https://hphugosm.github.io/subject-fit-quiz/",
      },
      { label: "Berlín 2026", url: "https://hphugosm.github.io/berlin2026/" },
    ],
  },
  {
    id: "radio",
    name: "AI rádio",
    category: "AI HUDBA / VÝZKUM",
    status: "MVP · vysílání pozastaveno",
    description: "Experiment s autonomně generovanou hudbou pro práci.",
    detail:
      "Zářijový experiment z roku 2026. Další verze, benchmarky a plánovaná publikace jsou rozpracované. Vysílání je momentálně pozastavené; veřejný živý přehrávač není k dispozici.",
    source: portfolioSource,
  },
];
export const results = [
  {
    place: t("2.", "2nd"),
    name: "EVOHACKS",
    year: "2026",
    label: t("místo", "place"),
    source: "https://devpost.com/software/clearmessage-ai-phishing-detection",
  },
  {
    place: t("3.", "3rd"),
    name: "DemocraTICon",
    year: "2026",
    label: t("místo", "place"),
    source: "https://www.democraticon.org/",
  },
];
export const team = [
  {
    name: "Hugo Kubíček",
    role: t("Vedoucí týmu", "Team lead"),
    initials: "HK",
    source: "https://tymtrampolin.cz/",
  },
  {
    name: "Daniel Voženílek",
    role: t("Člen týmu", "Team member"),
    initials: "DV",
    source: "https://tymtrampolin.cz/",
  },
  {
    name: "Vojtěch Čakrt",
    role: t("Člen týmu", "Team member"),
    initials: "VČ",
    source: "https://tymtrampolin.cz/",
  },
  {
    name: "Honza Smrz",
    role: t("Člen týmu", "Team member"),
    initials: "HS",
    source: "Jméno a role doplněné týmem",
  },
];
export const contact = {
  email: "team@tymtrampolin.cz",
  instagram: "https://www.instagram.com/tym_trampolin/",
  twitch: "https://www.twitch.tv/tym_trampolin",
  github: "https://github.com/hphugosm/tym-trampolin-web",
};
/** Replace only with the approved original asset. No approximated symbol is generated. */
export const originalLogo: string | null = '/assets/brand/tt-symbol.webp';

const projectEnglish = [{"name": "ClearMessage", "category": "CYBERSECURITY / AI", "status": "Research prototype", "description": "Helps people understand suspicious messages and choose their next step.", "detail": "A local prototype combines a classifier, transparent rules and OCR. The public demo replays a recorded result; it does not analyse visitors’ messages and has no live backend."}, {"name": "Real estate videos", "category": "CREATIVE PRODUCTION / AI", "status": "Completed client work", "description": "Six AI videos for three real estate projects.", "detail": "Client work for a RE/MAX agent from May to September 2026. AI visualisations explore possible uses; they do not document an existing building or promise construction. The completed client videos have no public catalogue link."}, {"name": "Website studies", "category": "FRONTEND / DESIGN", "status": "Design and development studies", "description": "A space for design, interaction and new approaches to the web.", "detail": "SkyRing, TitanGOAT and Olomouc presentation and product studies develop our design and frontend skills. They are demonstrations, not real client commissions."}, {"name": "DOOM Bounce", "category": "GAME / CREATIVE EXPERIMENT", "status": "Playable experiment", "description": "A raycasting world inspired by the DemocraTICon final.", "detail": "An original browser experiment with bosses, AI animations and voices. A creative response to a shared competition experience."}, {"name": "Education tools", "category": "EDUCATION / APPLICATIONS", "status": "Completed school projects", "description": "Digital tools for decisions and shared experiences.", "detail": "Academic Vanguard helps students choose English graduation seminars. Berlin 2026 brings together information for a school trip."}, {"name": "AI radio", "category": "AI MUSIC / RESEARCH", "status": "MVP · broadcasting paused", "description": "An experiment with autonomously generated music for work.", "detail": "An experiment from September 2026. Further versions, benchmarks and a planned publication are in progress. Broadcasting is currently paused; no public live player is available."}];
export const projects: Project[] = projectsCs.map((project, index) => locale === "cs" ? project : ({ ...project, ...projectEnglish[index], links: project.links?.map(link => ({ ...link, label: ({ "Zaznamenané demo": "Recorded demo", "Otevřít hru": "Open game", "Berlín 2026": "Berlin 2026" } as Record<string, string>)[link.label] ?? link.label })) }));
