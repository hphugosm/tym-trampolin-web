// Typovaný mock pro moduly bez reálného zdroje (Fáze 1).
// Každý dataset má meta.source='mock' → UI zobrazí odznak „ukázková data".
// Ve Fázi 2–3 se vnitřek nahradí reálným fetchem, typy zůstanou.
import type {
  GithubStats, AiUsage, InfraStatus, FinanceData, CollabData,
  AchievementsData, LogsData,
} from '../../types/dashboard';

const ASOF = 'ukázková data';

// deterministický „náhodný" průběh (žádné Math.random — kvůli stabilnímu buildu)
function series(n: number, seed: number, base: number, amp: number) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const v = Math.round(base + amp * (0.5 + 0.5 * Math.sin((i + seed) * 0.7) * Math.cos((i + seed) * 0.31)));
    out.push({ day: d.toISOString().slice(0, 10), count: Math.max(0, v) });
  }
  return out;
}

export const MOCK_GITHUB: GithubStats = {
  meta: { source: 'mock', asOf: ASOF, note: 'Ve F2 nahradí veřejné GitHub API' },
  commits30d: 84,
  lastDeploy: { at: new Date().toISOString(), status: 'success', sha: '03df75d' },
  stars: 3,
  forks: 1,
  openIssues: 2,
  contributors: 1,
  commitsByDay: series(30, 2, 2, 4),
  recentRuns: [
    { name: 'Deploy Astro site', status: 'success', at: new Date(Date.now() - 3.6e6).toISOString() },
    { name: 'Deploy Astro site', status: 'success', at: new Date(Date.now() - 9e6).toISOString() },
    { name: 'Deploy Astro site', status: 'failure', at: new Date(Date.now() - 8.6e7).toISOString() },
  ],
};

export const MOCK_AI: AiUsage = {
  meta: { source: 'mock', asOf: ASOF, note: 'Higgsfield nemá veřejné API — plnit ručně' },
  higgsfieldCreditsUsed: 390,
  higgsfieldCreditsTotal: 600,
  byType: [
    { label: 'Obrázky (portréty/panely)', value: 26, accent: 'violet' },
    { label: 'Videa (intro/fatality)', value: 10, accent: 'rose' },
    { label: 'Hlasy (dabing)', value: 13, accent: 'cyan' },
  ],
  spendByMonth: series(6, 5, 40, 30),
  recent: [
    { at: new Date(Date.now() - 8.6e7).toISOString(), kind: 'video', detail: 'intro_nerudovka.mp4 (kling3 turbo)' },
    { at: new Date(Date.now() - 1.7e8).toISOString(), kind: 'obrázek', detail: 'og-default.png (nano banana)' },
  ],
};

export const MOCK_INFRA: InfraStatus = {
  meta: { source: 'mock', asOf: ASOF, note: 'Ve F2 živé health pingy' },
  services: [
    { name: 'Web (GitHub Pages)', status: 'ok', detail: '200 OK', latencyMs: 120 },
    { name: 'DOOM Bounce', status: 'ok', detail: '200 OK', latencyMs: 140 },
    { name: 'Supabase REST', status: 'ok', detail: 'aktivní', latencyMs: 90 },
    { name: 'Edge funkce tt-admin', status: 'ok', detail: 'aktivní', latencyMs: 210 },
  ],
  dbRows: [
    { label: 'tt_events', value: 9, accent: 'cyan' },
    { label: 'tt_subscribers', value: 0, accent: 'emerald' },
    { label: 'doom_scores', value: 0, accent: 'rose' },
  ],
  buildSizeMb: 59,
  lastBuild: new Date(Date.now() - 3.6e6).toISOString(),
};

export const MOCK_FINANCE: FinanceData = {
  meta: { source: 'mock', asOf: ASOF, note: 'Příjmy ve F3 z Google Sheet, výdaje ručně' },
  raisedTotal: 596,
  supporters: 11,
  avgGift: 54,
  expensesByCategory: [
    { label: 'Cestovné a doprava', value: 30, accent: 'cyan' },
    { label: 'Ubytování', value: 20, accent: 'violet' },
    { label: 'Technologie a nástroje', value: 20, accent: 'emerald' },
    { label: 'Vzdělávání a kurzy', value: 10, accent: 'gold' },
    { label: 'Produkce a merch', value: 10, accent: 'rose' },
    { label: 'Rozvoj týmu', value: 10, accent: 'muted' },
  ],
  budgetTarget: 5000,
  balance: 596,
  ledger: [
    { at: new Date(Date.now() - 2e8).toISOString(), label: 'Příspěvek — Sofi', amount: 191, kind: 'in' },
    { at: new Date(Date.now() - 3e8).toISOString(), label: 'Příspěvek — Dominik', amount: 150, kind: 'in' },
    { at: new Date(Date.now() - 4e8).toISOString(), label: 'Higgsfield kredity', amount: -120, kind: 'out' },
  ],
};

export const MOCK_COLLABS: CollabData = {
  meta: { source: 'mock', asOf: ASOF, note: 'Ve F3 Supabase tabulka tt_partners' },
  partners: [
    { id: 'p1', name: 'Ukázková tech firma', stage: 'jednání', pkg: 'Partner projektu', value: 15000, lastContact: new Date(Date.now() - 3e8).toISOString() },
    { id: 'p2', name: 'Lokální médium', stage: 'oslovený', pkg: 'Mediální partner', lastContact: new Date(Date.now() - 6e8).toISOString() },
    { id: 'p3', name: 'Gymnázium Amazon', stage: 'aktivní', pkg: 'In-kind partner', lastContact: new Date(Date.now() - 1e9).toISOString() },
    { id: 'p4', name: 'Ukázkový sponzor', stage: 'domluveno', pkg: 'Podporovatel', value: 5000, lastContact: new Date(Date.now() - 2e8).toISOString() },
  ],
};

export const MOCK_ACHIEVEMENTS: AchievementsData = {
  meta: { source: 'mock', asOf: ASOF, note: 'Část se dopočítá z reálných dat ve F3' },
  milestones: [
    { label: '1 000 návštěv webu', current: 340, target: 1000, accent: 'cyan' },
    { label: '10 partnerů', current: 1, target: 10, accent: 'gold' },
    { label: '100 hráčů DOOM', current: 0, target: 100, accent: 'rose' },
    { label: '50 odběratelů', current: 0, target: 50, accent: 'emerald' },
    { label: '10 projektů', current: 9, target: 10, accent: 'violet' },
  ],
  records: [
    { label: 'Nejlepší den (návštěvy)', value: '—' },
    { label: 'Nejsledovanější projekt', value: 'DOOM Bounce 2.0' },
    { label: 'Soutěžní umístění', value: '3. místo DemocraTICon 2026' },
  ],
};

export const MOCK_LOGS: LogsData = {
  meta: { source: 'mock', asOf: ASOF, note: 'Ve F3 reálné deploy/error logy' },
  entries: [
    { at: new Date(Date.now() - 3.6e6).toISOString(), source: 'deploy', severity: 'ok', text: 'Deploy 03df75d proběhl úspěšně' },
    { at: new Date(Date.now() - 4e6).toISOString(), source: 'event', severity: 'info', text: 'project_detail_view — /projekty/doom-bounce/' },
    { at: new Date(Date.now() - 9e6).toISOString(), source: 'deploy', severity: 'ok', text: 'Deploy 4bf63a6 proběhl úspěšně' },
    { at: new Date(Date.now() - 8.6e7).toISOString(), source: 'error', severity: 'warn', text: 'Historický „pages build" job selhal (neškodné)' },
  ],
};
