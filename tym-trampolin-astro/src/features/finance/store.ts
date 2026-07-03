// Reaktivní stav ledgeru. Optimistické updaty → UI reaguje okamžitě,
// při chybě se vrátí zpět. Derived stores přepočítají karty/tabulku/grafy samy.
import { writable, derived, get } from 'svelte/store';
import type { Transaction, NewTransaction, Filters } from './types';
import { supabaseRepository as repo } from './repository';
import { applyFilters, computeSummary, projectSummaries } from './service';

export const transactions = writable<Transaction[]>([]);
export const loading = writable(true);
export const loadError = writable<string | null>(null);
export const toast = writable<{ msg: string; kind: 'ok' | 'err' } | null>(null);

export const emptyFilters: Filters = {
  search: '', project: '', category: '', type: '', status: '',
  dateFrom: '', dateTo: '', amountMin: '', amountMax: '', client: '',
};
export const filters = writable<Filters>({ ...emptyFilters });

export const filtered = derived([transactions, filters], ([$t, $f]) => applyFilters($t, $f));
export const summary = derived(transactions, ($t) => computeSummary($t));
export const projectRollup = derived(transactions, ($t) => projectSummaries($t));

let toastTimer: any;
function flash(msg: string, kind: 'ok' | 'err' = 'ok') {
  toast.set({ msg, kind });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.set(null), 2600);
}

function stamp(action: string) {
  return { at: new Date().toISOString(), action };
}

export async function load() {
  loading.set(true);
  loadError.set(null);
  try {
    transactions.set(await repo.list());
  } catch (e: any) {
    loadError.set(e?.message === 'unauthorized' ? 'unauthorized' : 'load-failed');
  } finally {
    loading.set(false);
  }
}

export async function addTx(data: NewTransaction): Promise<boolean> {
  try {
    const created = await repo.create({ ...data, history: [stamp('vytvořeno')] } as any);
    transactions.update((list) => [created, ...list]);
    flash('Přidáno');
    return true;
  } catch (e: any) {
    if (e?.message === 'unauthorized') { document.dispatchEvent(new Event('tt:authfail')); }
    flash('Uložení selhalo', 'err');
    return false;
  }
}

export async function updateTx(id: string, patch: Partial<Transaction>) {
  const before = get(transactions);
  const prev = before.find((t) => t.id === id);
  if (!prev) return;
  const history = [...(prev.history || []), stamp('upraveno: ' + Object.keys(patch).join(', '))];
  // optimisticky
  transactions.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch, history } : t)));
  try {
    await repo.update(id, { ...patch, history });
  } catch (e: any) {
    transactions.set(before); // revert
    if (e?.message === 'unauthorized') document.dispatchEvent(new Event('tt:authfail'));
    flash('Změna se neuložila', 'err');
  }
}

export async function removeTx(id: string) {
  const before = get(transactions);
  transactions.update((list) => list.filter((t) => t.id !== id)); // optimisticky
  try {
    await repo.remove(id);
    flash('Smazáno');
  } catch (e: any) {
    transactions.set(before);
    if (e?.message === 'unauthorized') document.dispatchEvent(new Event('tt:authfail'));
    flash('Mazání selhalo', 'err');
  }
}

export async function duplicateTx(t: Transaction) {
  const { id, createdAt, updatedAt, history, ...rest } = t;
  await addTx({ ...(rest as NewTransaction), title: rest.title + ' (kopie)' });
}

export function resetFilters() {
  filters.set({ ...emptyFilters });
}
