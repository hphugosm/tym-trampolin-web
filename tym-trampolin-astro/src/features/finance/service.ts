// Čisté výpočty nad transakcemi — žádný stav, žádné UI. Testovatelné.
import type { Transaction, Filters, Summary, ProjectSummary } from './types';
import { AI_PROVIDERS, projectLabel } from './config';

const signed = (t: Transaction) => (t.type === 'income' ? t.amount : -t.amount);

function monthKey(d: string) { return d.slice(0, 7); }
function thisMonth() { return new Date().toISOString().slice(0, 7); }
function prevMonth() {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}
function delta(now: number, prev: number): number {
  if (!prev) return now ? 100 : 0;
  return Math.round(((now - prev) / Math.abs(prev)) * 100);
}

// posledních 6 měsíců jako série (pro sparkline)
function monthlySeries(txs: Transaction[], pick: (t: Transaction) => number): number[] {
  const out: number[] = [];
  const base = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base); d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    out.push(txs.filter((t) => monthKey(t.date) === key).reduce((s, t) => s + pick(t), 0));
  }
  return out;
}

export function computeSummary(all: Transaction[]): Summary {
  const txs = all.filter((t) => !t.archived);
  const tm = thisMonth(), pm = prevMonth();
  const inM = (k: string) => txs.filter((t) => monthKey(t.date) === k);

  const income = inM(tm).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = inM(tm).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const pIncome = inM(pm).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const pExpense = inM(pm).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const aiCost = inM(tm).filter((t) => t.type === 'expense' && (t.category === 'ai' || t.aiProvider)).reduce((s, t) => s + t.amount, 0);
  const pAi = inM(pm).filter((t) => t.type === 'expense' && (t.category === 'ai' || t.aiProvider)).reduce((s, t) => s + t.amount, 0);
  const pending = txs.filter((t) => t.status === 'pending' || t.status === 'overdue').reduce((s, t) => s + signed(t), 0);
  const cashflow = txs.reduce((s, t) => s + signed(t), 0);

  return {
    income, expense, profit: income - expense, pending, aiCost, cashflow,
    incomeDelta: delta(income, pIncome),
    expenseDelta: delta(expense, pExpense),
    profitDelta: delta(income - expense, pIncome - pExpense),
    aiDelta: delta(aiCost, pAi),
    incomeSpark: monthlySeries(txs, (t) => (t.type === 'income' ? t.amount : 0)),
    expenseSpark: monthlySeries(txs, (t) => (t.type === 'expense' ? t.amount : 0)),
    profitSpark: monthlySeries(txs, signed),
    cashflowSpark: (() => { const s = monthlySeries(txs, signed); let acc = 0; return s.map((v) => (acc += v)); })(),
    aiSpark: monthlySeries(txs, (t) => (t.type === 'expense' && (t.category === 'ai' || t.aiProvider) ? t.amount : 0)),
    pendingSpark: monthlySeries(txs, (t) => (t.status !== 'paid' ? signed(t) : 0)),
  };
}

export function applyFilters(txs: Transaction[], f: Filters): Transaction[] {
  const q = f.search.trim().toLowerCase();
  const min = f.amountMin ? parseFloat(f.amountMin) : null;
  const max = f.amountMax ? parseFloat(f.amountMax) : null;
  return txs.filter((t) => {
    if (t.archived) return false;
    if (q && !(`${t.title} ${t.note} ${t.client ?? ''}`.toLowerCase().includes(q))) return false;
    if (f.project && t.project !== f.project) return false;
    if (f.category && t.category !== f.category) return false;
    if (f.type && t.type !== f.type) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.client && (t.client ?? '').toLowerCase() !== f.client.toLowerCase()) return false;
    if (f.dateFrom && t.date < f.dateFrom) return false;
    if (f.dateTo && t.date > f.dateTo) return false;
    if (min !== null && t.amount < min) return false;
    if (max !== null && t.amount > max) return false;
    return true;
  });
}

export function projectSummaries(all: Transaction[]): ProjectSummary[] {
  const txs = all.filter((t) => !t.archived);
  const byProject = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (!byProject.has(t.project)) byProject.set(t.project, []);
    byProject.get(t.project)!.push(t);
  }
  return [...byProject.entries()].map(([project, list]) => {
    const income = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const profit = income - expense;
    const last = [...list].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return { project, income, expense, profit, margin: income ? Math.round((profit / income) * 100) : 0, count: list.length, last };
  }).sort((a, b) => b.income - a.income);
}

// AI náklady po providerech tento měsíc (feed do modulu AI Usage)
export function aiCostsByProvider(all: Transaction[]): { id: string; label: string; value: number; accent?: string }[] {
  const tm = thisMonth();
  const ai = all.filter((t) => !t.archived && t.type === 'expense' && (t.category === 'ai' || t.aiProvider) && monthKey(t.date) === tm);
  return AI_PROVIDERS.map((p) => ({
    id: p.id, label: p.label, accent: p.accent,
    value: ai.filter((t) => (t.aiProvider || 'other-ai') === p.id).reduce((s, t) => s + t.amount, 0),
  })).filter((x) => x.value > 0);
}

export function categoryBreakdown(txs: Transaction[], type: 'income' | 'expense') {
  const map = new Map<string, number>();
  for (const t of txs.filter((x) => !x.archived && x.type === type)) {
    map.set(t.category, (map.get(t.category) || 0) + t.amount);
  }
  return [...map.entries()].map(([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);
}

export function toCSV(txs: Transaction[]): string {
  const head = ['datum', 'nazev', 'projekt', 'kategorie', 'typ', 'castka', 'stav', 'klient', 'faktura', 'poznamka'];
  const esc = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const rows = txs.map((t) => [t.date, t.title, projectLabel(t.project), t.category, t.type, t.amount, t.status, t.client ?? '', t.invoiceNumber ?? '', t.note].map(esc).join(','));
  return [head.join(','), ...rows].join('\n');
}

export function fmtCZK(n: number): string {
  return n.toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) + ' Kč';
}
