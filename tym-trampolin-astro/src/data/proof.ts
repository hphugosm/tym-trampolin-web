// Compatibility exports for legacy components. Current public content lives in site.ts.
import { contact, team } from './site';
export const PROOF_AS_OF = 'říjen 2026';
export interface Metric { value: string; suffix?: string; label: string; context: string; source?: string; gold?: boolean; }
export const METRICS: Metric[] = [
  { value: '2', suffix: '.', label: 'místo na EVOHACKS', context: 'ClearMessage, říjen 2026', source: 'https://devpost.com/software/clearmessage-ai-phishing-detection', gold: true },
  { value: '3', suffix: '.', label: 'místo v ČR', context: 'DemocraTICon 2026, finále v Olomouci', source: 'https://www.democraticon.cz/' },
  { value: '6', label: 'realitních videí', context: '3 projekty pro makléřku RE/MAX, květen až září 2026' },
  { value: '10', label: 'skladeb alba', context: 'soutěžní archiv' },
];
export interface SponsorPackage { name: string; pitch: string; outputs: string[]; }
// Support is discussed per project; no unapproved sponsorship benefits are offered.
export const SPONSOR_PACKAGES: SponsorPackage[] = [];
export interface MediaFact { label: string; value: string; }
export const MEDIA_FACTS: MediaFact[] = [
  { label: 'Název', value: 'Tým Trampolín' },
  { label: 'Založení', value: 'Leden 2026' },
  { label: 'Členové', value: team.map(member => member.name).join(', ') },
  { label: 'Škola', value: 'Gymnázium Amazon, Praha' },
  { label: 'Výsledky', value: '2. místo EVOHACKS 2026; 3. místo DemocraTICon 2026' },
  { label: 'Zaměření', value: 'Kyberbezpečnost, AI, weby, hry, vzdělávání a video' },
  { label: 'Kontakt pro média', value: `${contact.email}, ${contact.phone}` },
];
export const CONTACT = { ...contact, phoneHref: 'tel:+420731544015' };
