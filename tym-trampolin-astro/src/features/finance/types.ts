// Datový model finance ledgeru. UI používá camelCase; repository mapuje na snake_case DB.

export type TxType = 'income' | 'expense';
export type TxStatus = 'paid' | 'pending' | 'overdue';
export type Recurring = 'none' | 'monthly' | 'yearly';

export interface HistoryEntry {
  at: string;
  action: string;
}

export interface Attachment {
  name: string;
  url?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: TxType;
  amount: number; // vždy kladné; znaménko určuje type
  category: string;
  project: string;
  status: TxStatus;
  note: string;
  client?: string;
  invoiceNumber?: string;
  dueDate?: string;
  aiProvider?: string;
  recurring: Recurring;
  attachments: Attachment[];
  history: HistoryEntry[];
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'history' | 'createdAt' | 'updatedAt'>;

export interface Filters {
  search: string;
  project: string; // '' = vše
  category: string;
  type: '' | TxType;
  status: '' | TxStatus;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  client: string;
}

export interface Summary {
  income: number;
  expense: number;
  profit: number;
  pending: number;
  aiCost: number;
  cashflow: number;
  incomeDelta: number;
  expenseDelta: number;
  profitDelta: number;
  aiDelta: number;
  incomeSpark: number[];
  expenseSpark: number[];
  profitSpark: number[];
  cashflowSpark: number[];
  aiSpark: number[];
  pendingSpark: number[];
}

export interface ProjectSummary {
  project: string;
  income: number;
  expense: number;
  profit: number;
  margin: number; // %
  count: number;
  last?: Transaction;
}
