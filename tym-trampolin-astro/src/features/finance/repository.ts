// Datová hranice ledgeru. Komponenty i store mluví jen s tímto rozhraním —
// pozdější výměna backendu (jiná DB, API) = nový adaptér, UI se nedotkne.
import type { Transaction, NewTransaction } from './types';

export interface FinanceRepository {
  list(): Promise<Transaction[]>;
  create(tx: NewTransaction): Promise<Transaction>;
  update(id: string, patch: Partial<Transaction>): Promise<Transaction>;
  remove(id: string): Promise<void>;
  importMany(txs: NewTransaction[]): Promise<number>;
}

const FN = 'https://vdvvcdikpquajfzxprnr.supabase.co/functions/v1/tt-finance';
const TOKEN_KEY = 'tt_admin_token_v1';

function token(): string {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

// ── mapování camelCase (UI) ↔ snake_case (DB) ──
type Row = Record<string, unknown>;

function toRow(tx: Partial<Transaction>): Row {
  const r: Row = {};
  const map: Record<string, string> = {
    invoiceNumber: 'invoice_number', dueDate: 'due_date', aiProvider: 'ai_provider',
  };
  for (const [k, v] of Object.entries(tx)) {
    if (['id', 'createdAt', 'updatedAt'].includes(k)) continue;
    r[map[k] || k] = v;
  }
  return r;
}

function fromRow(r: Row): Transaction {
  return {
    id: String(r.id),
    date: String(r.date),
    title: String(r.title ?? ''),
    type: (r.type as Transaction['type']) ?? 'expense',
    amount: Number(r.amount ?? 0),
    category: String(r.category ?? 'other'),
    project: String(r.project ?? 'general'),
    status: (r.status as Transaction['status']) ?? 'paid',
    note: String(r.note ?? ''),
    client: (r.client as string) || undefined,
    invoiceNumber: (r.invoice_number as string) || undefined,
    dueDate: (r.due_date as string) || undefined,
    aiProvider: (r.ai_provider as string) || undefined,
    recurring: (r.recurring as Transaction['recurring']) ?? 'none',
    attachments: Array.isArray(r.attachments) ? (r.attachments as Transaction['attachments']) : [],
    history: Array.isArray(r.history) ? (r.history as Transaction['history']) : [],
    archived: Boolean(r.archived),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

async function call(action: string, extra: Row = {}): Promise<any> {
  const res = await fetch(FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token() },
    body: JSON.stringify({ action, ...extra }),
  });
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) throw new Error('finance-' + res.status);
  return res.json();
}

export const supabaseRepository: FinanceRepository = {
  async list() {
    const d = await call('list');
    return (d.transactions || []).map(fromRow);
  },
  async create(tx) {
    const d = await call('create', { tx: toRow(tx) });
    return fromRow(d.transaction);
  },
  async update(id, patch) {
    const d = await call('update', { id, patch: toRow(patch) });
    return fromRow(d.transaction);
  },
  async remove(id) {
    await call('delete', { id });
  },
  async importMany(txs) {
    const d = await call('import', { txs: txs.map(toRow) });
    return d.inserted || 0;
  },
};
