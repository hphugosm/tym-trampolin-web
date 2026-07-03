// Startovní transakce — naseedují prázdnou tabulku, ať má ledger co ukázat.
// Reálná data si přidáš/upravíš přímo v dashboardu; tyhle klidně smaž.
import type { NewTransaction } from './types';

const iso = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

export const SEED: NewTransaction[] = [
  { date: iso(3), title: 'Klientský web — první platba', type: 'income', amount: 8000, category: 'client', project: 'client', status: 'paid', note: 'Záloha 50 %', client: 'Ukázkový klient', invoiceNumber: '2026001', recurring: 'none', attachments: [], archived: false },
  { date: iso(10), title: 'Higgsfield kredity', type: 'expense', amount: 1200, category: 'ai', project: 'doom', status: 'paid', note: 'Produkce DOOM cutscén', aiProvider: 'higgsfield', recurring: 'none', attachments: [], archived: false },
  { date: iso(12), title: 'Claude API', type: 'expense', amount: 640, category: 'ai', project: 'ai-worker', status: 'paid', note: '', aiProvider: 'claude', recurring: 'monthly', attachments: [], archived: false },
  { date: iso(20), title: 'ElevenLabs dabing', type: 'expense', amount: 320, category: 'ai', project: 'doom', status: 'paid', note: 'Hlasy bossů', aiProvider: 'elevenlabs', recurring: 'none', attachments: [], archived: false },
  { date: iso(6), title: 'Doména tymtrampolin.cz', type: 'expense', amount: 250, category: 'domain', project: 'tym-trampolin-web', status: 'paid', note: 'Roční', recurring: 'yearly', attachments: [], archived: false },
  { date: iso(2), title: 'Sponzorský příspěvek', type: 'income', amount: 5000, category: 'sponsorship', project: 'general', status: 'pending', note: 'Přislíbeno, čeká na platbu', client: 'Ukázkový sponzor', dueDate: iso(-14), recurring: 'none', attachments: [], archived: false },
  { date: iso(28), title: 'Klientská zakázka — druhá část', type: 'income', amount: 8000, category: 'client', project: 'client', status: 'overdue', note: 'Po splatnosti', client: 'Ukázkový klient', invoiceNumber: '2026002', dueDate: iso(5), recurring: 'none', attachments: [], archived: false },
  { date: iso(15), title: 'Software — licence nástrojů', type: 'expense', amount: 480, category: 'software', project: 'general', status: 'paid', note: '', recurring: 'monthly', attachments: [], archived: false },
];
