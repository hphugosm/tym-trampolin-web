import type { Module } from '../../types/dashboard';

const base = import.meta.env.BASE_URL;

// Registr modulů = zdroj pravdy pro sidebar i pořadí.
export const MODULES: Module[] = [
  { id: 'overview', label: 'Overview', href: `${base}admin/`, accent: 'cyan',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'web', label: 'Web Analytics', href: `${base}admin/web/`, accent: 'cyan',
    icon: 'M3 3v18h18M7 14l4-4 3 3 5-6' },
  { id: 'doom', label: 'Doom Analytics', href: `${base}admin/doom/`, accent: 'rose',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 2M12 8h.01' },
  { id: 'projekty', label: 'Projekty', href: `${base}admin/projekty/`, accent: 'emerald',
    icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 13h6v6h-6z' },
  { id: 'github', label: 'GitHub', href: `${base}admin/github/`, accent: 'violet',
    icon: 'M6 3v12m0 0a3 3 0 100 6 3 3 0 000-6zm12-6a3 3 0 11-6 0 3 3 0 016 0zm-3 3v3a3 3 0 01-3 3H6' },
  { id: 'ai', label: 'AI Usage', href: `${base}admin/ai/`, accent: 'violet',
    icon: 'M5 3l1.5 3.5L10 8 6.5 9.5 5 13 3.5 9.5 0 8l3.5-1.5zM16 3l1 2.5L19.5 6 17 7l-1 2.5L15 7l-2.5-1L15 5zM17 14l1.2 2.8L21 18l-2.8 1.2L17 22l-1.2-2.8L13 18l2.8-1.2z' },
  { id: 'infra', label: 'Infrastruktura', href: `${base}admin/infra/`, accent: 'emerald',
    icon: 'M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01' },
  { id: 'finance', label: 'Finance', href: `${base}admin/finance/`, accent: 'gold',
    icon: 'M12 2v20m5-16H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { id: 'spoluprace', label: 'Spolupráce', href: `${base}admin/spoluprace/`, accent: 'cyan',
    icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8z' },
  { id: 'uspechy', label: 'Úspěchy', href: `${base}admin/uspechy/`, accent: 'gold',
    icon: 'M8 21h8m-4-4v4m7-17H5v4a7 7 0 0014 0V4zm0 0h3v3a3 3 0 01-3 3m-14-6H2v3a3 3 0 003 3' },
  { id: 'logs', label: 'Logy', href: `${base}admin/logs/`, accent: 'muted',
    icon: 'M4 6h16M4 12h16M4 18h10' },
];

export const ACCENT_VAR: Record<string, string> = {
  cyan: 'var(--color-brand)',
  violet: 'var(--color-accent-2)',
  gold: 'var(--color-gold)',
  emerald: 'var(--color-emerald)',
  rose: 'var(--color-rose)',
  muted: 'var(--color-text-muted)',
};
