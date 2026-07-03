// Central proof/trust data — single source of truth for metrics, packages
// and media facts. Every metric carries its context and an as-of date.

export const PROOF_AS_OF = 'červen 2026';

export interface Metric {
  value: string;
  suffix?: string;
  label: string;
  context: string;
  source?: string;
  gold?: boolean;
}

export const METRICS: Metric[] = [
  {
    value: '3',
    suffix: '.',
    label: 'místo v ČR',
    context: 'DemocraTICon 2026 — finále, Praha',
    source: 'https://www.democraticon.cz',
    gold: true,
  },
  {
    value: '318',
    label: 'týmů v soutěži',
    context: 'registrovaných do DemocraTICon 2026',
    source: 'https://www.democraticon.cz',
  },
  {
    value: '14',
    label: 'finalistů',
    context: 'postup přes tři soutěžní kola',
  },
  {
    value: '9',
    label: 'dokončených projektů',
    context: 'hry, hudba, e-shop, fyzické artefakty',
  },
  {
    value: '10',
    label: 'skladeb alba',
    context: 'vlastní hymna v deseti žánrech',
  },
];

export interface SponsorPackage {
  name: string;
  pitch: string;
  outputs: string[];
}

// Psáno výstupově, ne cenově.
export const SPONSOR_PACKAGES: SponsorPackage[] = [
  {
    name: 'Podporovatel',
    pitch: 'Pro jednotlivce a menší firmy, které chtějí fandit konkrétnímu studentskému týmu.',
    outputs: [
      'Jméno/logo v žebříčku podporovatelů na webu',
      'Poděkování na sociálních sítích',
      'Děkovná kartička z vlastní produkce',
    ],
  },
  {
    name: 'Partner projektu',
    pitch: 'Spojte své jméno s jedním konkrétním projektem — hrou, albem nebo fyzickým artefaktem.',
    outputs: [
      'Logo placement na stránce projektu',
      'Zmínka v projektové case study',
      'Social mention při launchi projektu',
      'Zahrnutí do press kitu projektu',
    ],
  },
  {
    name: 'Hlavní partner sezóny',
    pitch: 'Dlouhodobé partnerství přes celou soutěžní sezónu. Nejviditelnější forma spolupráce.',
    outputs: [
      'Logo na homepage a všech materiálech',
      'Společná case study a PR výstup',
      'Pravidelný reporting aktivit a metrik',
      'Možnost společného obsahu (video, workshop)',
      'Přednostní přístup k novým projektům',
    ],
  },
  {
    name: 'In-kind partner',
    pitch: 'Podpora nástroji, technikou, prostory nebo mentoringem místo peněz.',
    outputs: [
      'Logo placement v sekci partnerů',
      'Zmínka u projektů, kde pomohl váš nástroj',
      'Zpětná vazba a use-case z reálného nasazení',
    ],
  },
  {
    name: 'Mediální partner',
    pitch: 'Pro média a tvůrce obsahu — příběh studentského týmu s reálnými výsledky.',
    outputs: [
      'Přednostní přístup k novinkám a rozhovorům',
      'Kompletní press kit a fotomateriál',
      'Vzájemná propagace obsahu',
    ],
  },
];

export interface MediaFact {
  label: string;
  value: string;
}

export const MEDIA_FACTS: MediaFact[] = [
  { label: 'Název', value: 'Tým Trampolín' },
  { label: 'Založení', value: 'Září 2025' },
  { label: 'Členové', value: 'Hugo (strategie & technologie), Dan (operace & organizace), Vojta (prezentace & komunikace)' },
  { label: 'Škola', value: 'Gymnázium Amazon, Praha' },
  { label: 'Hlavní úspěch', value: '3. místo DemocraTICon 2026 (318 týmů, 14 finalistů; pořádá Člověk v tísni & JSNS)' },
  { label: 'Zaměření', value: 'Průnik politiky, technologií a umělé inteligence' },
  { label: 'Projekty', value: '2 hry s vlastním enginem, digitální album (10 skladeb), e-shop, fyzické artefakty, mikrokurz, analytický systém' },
  { label: 'Kontakt pro média', value: 'hugo.kubicek@icloud.com, +420 731 544 015' },
];

export const CONTACT = {
  email: 'hugo.kubicek@icloud.com',
  phone: '+420 731 544 015',
  phoneHref: 'tel:+420731544015',
  instagram: 'https://www.instagram.com/tym_trampolin/',
  twitch: 'https://www.twitch.tv/tym_trampolin',
};
