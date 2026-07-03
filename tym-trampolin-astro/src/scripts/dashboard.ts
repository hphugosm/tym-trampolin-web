// Sdílená klientská vrstva dashboardu: token gate + fetch reálných dat
// (web + doom) z token-gated edge funkce, s krátkou cache v sessionStorage.
// Citlivá data nikdy nejsou v HTML — čtou se runtime tímto modulem.

export const TOKEN_KEY = 'tt_admin_token_v1';
const FN = 'https://vdvvcdikpquajfzxprnr.supabase.co/functions/v1/tt-admin';
const CACHE_KEY = 'tt_admin_overview_cache_v1';
const TTL = 60_000;

export interface Overview {
  generated_at: string;
  total_events: number;
  events_by_name: Record<string, number>;
  events_by_day: { day: string; count: number }[];
  recent_events: { name: string; path: string; meta: Record<string, string>; at: string }[];
  subscriber_count: number;
  subscribers: { email: string; source: string; at: string }[];
  doom: {
    total_games: number;
    unique_players: number;
    by_mode: Record<string, number>;
    victory_rate: number;
    games_by_day: { day: string; count: number }[];
    wave_histogram: { wave: number; count: number }[];
    top_campaign: { name: string; score: number; wave: number; victory: boolean }[];
    top_bossrush: { name: string; time_sec: number; kills: number }[];
    top_daily: { name: string; score: number; wave: number }[];
  };
}

export function getToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
export function setToken(t: string) {
  try { localStorage.setItem(TOKEN_KEY, t); } catch { /* private mode */ }
}
export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

export class AuthError extends Error {}

export async function fetchOverview(force = false): Promise<Overview> {
  const token = getToken();
  if (!token) throw new AuthError('no-token');

  if (!force) {
    try {
      const c = sessionStorage.getItem(CACHE_KEY);
      if (c) {
        const { t, data } = JSON.parse(c);
        if (Date.now() - t < TTL) return data as Overview;
      }
    } catch { /* ignore cache errors */ }
  }

  const res = await fetch(FN, { method: 'POST', headers: { 'x-admin-token': token } });
  if (res.status === 401) { clearToken(); throw new AuthError('unauthorized'); }
  if (!res.ok) throw new Error('server-' + res.status);
  const data = (await res.json()) as Overview;
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch { /* ignore */ }
  return data;
}

// Malý formátovací helper sdílený napříč moduly.
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
export function fmtDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' });
}
export function fmtNum(n: number): string {
  return n.toLocaleString('cs-CZ');
}
export function esc(s: unknown): string {
  return String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] || c));
}
