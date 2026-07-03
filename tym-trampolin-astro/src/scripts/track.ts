// Privacy-friendly analytics. No cookies, no third-party trackers, no user
// identification — just anonymous named events into our own Supabase table
// (insert-only RLS). Elements opt in via data-track / data-track-meta.

export type TrackEventName =
  | 'partner_cta_click'
  | 'press_kit_download'
  | 'project_detail_view'
  | 'external_game_click'
  | 'sponsor_email_click'
  | 'media_download_logo'
  | 'account_copy'
  | 'newsletter_signup'
  | 'page_view';

interface TrackEvent {
  name: TrackEventName;
  meta?: Record<string, string>;
  ts: number;
  path: string;
}

declare global {
  interface Window {
    __ttEvents: TrackEvent[];
    __ttTrack: (name: TrackEventName, meta?: Record<string, string>) => void;
  }
}

export const SUPABASE_URL = 'https://vdvvcdikpquajfzxprnr.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Y04q7Q2HKkzbNruooHbX5g_h7jyoml2';
const EVENTS_ENDPOINT = `${SUPABASE_URL}/rest/v1/tt_events`;

export function track(name: TrackEventName, meta?: Record<string, string>): void {
  const event: TrackEvent = { name, meta, ts: Date.now(), path: location.pathname };
  window.__ttEvents = window.__ttEvents || [];
  window.__ttEvents.push(event);
  if (import.meta.env.DEV) {
    console.debug('[track]', name, meta ?? {});
    return; // don't pollute production data from local dev
  }
  fetch(EVENTS_ENDPOINT, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name,
      meta: meta ?? {},
      path: location.pathname.slice(0, 300),
      client_ts: new Date().toISOString(),
    }),
  }).catch(() => { /* analytics must never break the page */ });
}

function wire() {
  window.__ttTrack = track;
  document.querySelectorAll<HTMLElement>('[data-track]:not([data-track-wired])').forEach((el) => {
    el.dataset.trackWired = '1';
    el.addEventListener('click', () => {
      const name = el.dataset.track as TrackEventName;
      let meta: Record<string, string> | undefined;
      if (el.dataset.trackMeta) {
        try { meta = JSON.parse(el.dataset.trackMeta); } catch { meta = { raw: el.dataset.trackMeta }; }
      }
      track(name, meta);
    });
  });

  // project_detail_view fires on page load of a project detail
  const marker = document.querySelector<HTMLElement>('[data-track-view]');
  if (marker && !marker.dataset.trackViewFired) {
    marker.dataset.trackViewFired = '1';
    track(marker.dataset.trackView as TrackEventName, marker.dataset.trackMeta ? JSON.parse(marker.dataset.trackMeta) : undefined);
  }
}

wire();
document.addEventListener('astro:page-load', wire);
