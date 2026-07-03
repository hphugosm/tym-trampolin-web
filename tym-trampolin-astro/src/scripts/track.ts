// Privacy-friendly analytics hooks. No cookies, no third-party trackers.
// Events queue into window.__ttEvents; a collector endpoint can be attached
// later without touching call sites. Elements opt in via data-track /
// data-track-meta attributes.

export type TrackEventName =
  | 'partner_cta_click'
  | 'press_kit_download'
  | 'project_detail_view'
  | 'external_game_click'
  | 'sponsor_email_click'
  | 'media_download_logo'
  | 'account_copy';

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

const ENDPOINT = ''; // intentionally empty — set later to enable the collector

export function track(name: TrackEventName, meta?: Record<string, string>): void {
  const event: TrackEvent = { name, meta, ts: Date.now(), path: location.pathname };
  window.__ttEvents = window.__ttEvents || [];
  window.__ttEvents.push(event);
  if (import.meta.env.DEV) console.debug('[track]', name, meta ?? {});
  if (ENDPOINT) {
    try {
      navigator.sendBeacon(ENDPOINT, JSON.stringify(event));
    } catch { /* beacon is best-effort */ }
  }
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
