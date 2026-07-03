// Konfigurace ledgeru — kategorie, projekty, AI provideři. Žádná data v UI.

export interface Option {
  id: string;
  label: string;
  accent?: string; // CSS var pro grafy
}

export const INCOME_CATEGORIES: Option[] = [
  { id: 'client', label: 'Klientský příjem', accent: 'var(--color-emerald)' },
  { id: 'sponsorship', label: 'Sponzoring', accent: 'var(--color-brand)' },
  { id: 'donation', label: 'Dar / podpora', accent: 'var(--color-accent-2)' },
  { id: 'grant', label: 'Grant', accent: 'var(--color-gold)' },
  { id: 'other-income', label: 'Ostatní příjem', accent: 'var(--color-text-muted)' },
];

export const EXPENSE_CATEGORIES: Option[] = [
  { id: 'ai', label: 'AI', accent: 'var(--color-accent-2)' },
  { id: 'hosting', label: 'Hosting', accent: 'var(--color-brand)' },
  { id: 'domain', label: 'Doména', accent: 'var(--color-emerald)' },
  { id: 'hardware', label: 'Hardware', accent: 'var(--color-gold)' },
  { id: 'software', label: 'Software', accent: 'var(--color-rose)' },
  { id: 'travel', label: 'Cestování', accent: 'var(--color-brand-hot)' },
  { id: 'production', label: 'Produkce & merch', accent: 'var(--color-accent-2)' },
  { id: 'education', label: 'Vzdělávání', accent: 'var(--color-emerald)' },
  { id: 'other-expense', label: 'Ostatní náklad', accent: 'var(--color-text-muted)' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function categoryLabel(id: string): string {
  return ALL_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
export function categoryAccent(id: string): string {
  return ALL_CATEGORIES.find((c) => c.id === id)?.accent ?? 'var(--color-text-muted)';
}
export function categoriesFor(type: 'income' | 'expense'): Option[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export const PROJECTS: Option[] = [
  { id: 'tym-trampolin-web', label: 'Tým Trampolín Web', accent: 'var(--color-brand)' },
  { id: 'doom', label: 'Doom', accent: 'var(--color-rose)' },
  { id: 'ai-worker', label: 'AI Worker', accent: 'var(--color-accent-2)' },
  { id: 'creator-worker', label: 'Creator Worker', accent: 'var(--color-emerald)' },
  { id: 'client', label: 'Klientské zakázky', accent: 'var(--color-gold)' },
  { id: 'general', label: 'Obecné', accent: 'var(--color-text-muted)' },
];
export function projectLabel(id: string): string {
  return PROJECTS.find((p) => p.id === id)?.label ?? id;
}
export function projectAccent(id: string): string {
  return PROJECTS.find((p) => p.id === id)?.accent ?? 'var(--color-text-muted)';
}

export const AI_PROVIDERS: Option[] = [
  { id: 'claude', label: 'Claude', accent: 'var(--color-brand)' },
  { id: 'gpt', label: 'GPT', accent: 'var(--color-emerald)' },
  { id: 'kling', label: 'Kling', accent: 'var(--color-rose)' },
  { id: 'runway', label: 'Runway', accent: 'var(--color-gold)' },
  { id: 'higgsfield', label: 'Higgsfield', accent: 'var(--color-accent-2)' },
  { id: 'elevenlabs', label: 'ElevenLabs', accent: 'var(--color-brand-hot)' },
  { id: 'other-ai', label: 'Ostatní AI', accent: 'var(--color-text-muted)' },
];
export function aiProviderLabel(id: string): string {
  return AI_PROVIDERS.find((p) => p.id === id)?.label ?? id;
}

// Předlohy pro Quick-add — otevřou formulář předvyplněný.
export interface QuickAddPreset {
  id: string;
  label: string;
  patch: Record<string, unknown>;
}
export const QUICK_ADD: QuickAddPreset[] = [
  { id: 'client-income', label: 'Klientský příjem', patch: { type: 'income', category: 'client', project: 'client' } },
  { id: 'ai', label: 'AI náklad', patch: { type: 'expense', category: 'ai', project: 'ai-worker', aiProvider: 'claude' } },
  { id: 'hosting', label: 'Hosting', patch: { type: 'expense', category: 'hosting', project: 'general' } },
  { id: 'domain', label: 'Doména', patch: { type: 'expense', category: 'domain', project: 'general' } },
  { id: 'hardware', label: 'Hardware', patch: { type: 'expense', category: 'hardware', project: 'general' } },
  { id: 'software', label: 'Software', patch: { type: 'expense', category: 'software', project: 'general' } },
  { id: 'travel', label: 'Cestování', patch: { type: 'expense', category: 'travel', project: 'general' } },
];

export const STATUS_LABELS: Record<string, string> = {
  paid: 'Zaplaceno', pending: 'Čeká', overdue: 'Po splatnosti',
};
export const STATUS_ACCENT: Record<string, string> = {
  paid: 'var(--color-emerald)', pending: 'var(--color-gold)', overdue: 'var(--color-rose)',
};
