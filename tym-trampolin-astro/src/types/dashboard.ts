// Sdílené typy Mission Control dashboardu.
// Každý dataset nese `meta.source`, aby UI vždy férově ukázalo, odkud číslo je.

export type SourceKind = 'live' | 'public' | 'manual' | 'mock';

export interface DataMeta {
  source: SourceKind;
  asOf?: string;
  note?: string;
}

export type Accent = 'cyan' | 'violet' | 'gold' | 'emerald' | 'rose' | 'muted';

export interface Kpi {
  label: string;
  value: string | number;
  unit?: string;
  /** procentní změna vůči minulému období; kladné = růst */
  delta?: number;
  deltaGood?: 'up' | 'down'; // který směr je pozitivní (default up)
  spark?: number[];
  accent?: Accent;
}

export interface TrendPoint {
  day: string;
  count: number;
}

export interface BarItem {
  label: string;
  value: number;
  accent?: Accent;
}

export interface FeedItem {
  at: string;
  kind: string;
  text: string;
  accent?: Accent;
}

export interface Module {
  id: string;
  label: string;
  href: string;
  accent: Accent;
  icon: string; // SVG path 'd' (viewBox 0 0 24 24, stroke)
}

// ─── Doménové typy modulů ──────────────────────────────

export interface WebStats {
  meta: DataMeta;
  totalEvents: number;
  byName: Record<string, number>;
  byDay: TrendPoint[];
  recent: { name: string; path: string; meta: Record<string, string>; at: string }[];
  subscriberCount: number;
  subscribers: { email: string; source: string; at: string }[];
}

export interface DoomStats {
  meta: DataMeta;
  totalGames: number;
  uniquePlayers: number;
  byMode: Record<string, number>;
  victoryRate: number;
  gamesByDay: TrendPoint[];
  waveHistogram: { wave: number; count: number }[];
  topCampaign: { name: string; score: number; wave: number; victory: boolean }[];
  topBossrush: { name: string; time_sec: number; kills: number }[];
  topDaily: { name: string; score: number; wave: number }[];
}

export interface GithubStats {
  meta: DataMeta;
  commits30d: number;
  lastDeploy: { at: string; status: 'success' | 'failure' | 'running'; sha: string };
  stars: number;
  forks: number;
  openIssues: number;
  contributors: number;
  commitsByDay: TrendPoint[];
  recentRuns: { name: string; status: 'success' | 'failure' | 'running'; at: string }[];
}

export interface AiUsage {
  meta: DataMeta;
  higgsfieldCreditsUsed: number;
  higgsfieldCreditsTotal: number;
  byType: BarItem[];
  spendByMonth: TrendPoint[];
  recent: { at: string; kind: string; detail: string }[];
}

export interface InfraService {
  name: string;
  status: 'ok' | 'warn' | 'down';
  detail: string;
  latencyMs?: number;
}

export interface InfraStatus {
  meta: DataMeta;
  services: InfraService[];
  dbRows: BarItem[];
  buildSizeMb: number;
  lastBuild: string;
}

export interface FinanceData {
  meta: DataMeta;
  raisedTotal: number;
  supporters: number;
  avgGift: number;
  expensesByCategory: BarItem[];
  budgetTarget: number;
  balance: number;
  ledger: { at: string; label: string; amount: number; kind: 'in' | 'out' }[];
}

export interface Collab {
  id: string;
  name: string;
  stage: 'oslovený' | 'jednání' | 'domluveno' | 'aktivní';
  pkg: string;
  value?: number;
  lastContact: string;
}

export interface CollabData {
  meta: DataMeta;
  partners: Collab[];
}

export interface Milestone {
  label: string;
  current: number;
  target: number;
  accent?: Accent;
}

export interface AchievementsData {
  meta: DataMeta;
  milestones: Milestone[];
  records: { label: string; value: string }[];
}

export interface LogEntry {
  at: string;
  source: 'deploy' | 'event' | 'subscriber' | 'error' | 'system';
  severity: 'info' | 'ok' | 'warn' | 'error';
  text: string;
}

export interface LogsData {
  meta: DataMeta;
  entries: LogEntry[];
}

export interface ProjectStat {
  id: string;
  title: string;
  tagline: string;
  featured: boolean;
  updatedAt?: string;
  views: number;
  ctaClicks: number;
}

export interface ProjectsData {
  meta: DataMeta;
  projects: ProjectStat[];
}
