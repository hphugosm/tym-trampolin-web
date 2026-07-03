/* Service worker pro DOOM BOUNCE — cache-first pro herní assety, síť pro zbytek webu. */
const CACHE = 'doom-bounce-v6';

const CORE = [
  'tym_trampolin_doom.html',
  'manifest_doom.json',
  'doom_icon_192.png',
  'doom_icon_512.png',
  'doom.mp3',
  'tracking.js',
];

const RUNTIME_PREFIXES = [
  '/media/doom/',
];

const RUNTIME_FILES = [
  'HymnaTT_phonk1.mp3',
  'HymnaTT_phonk2.mp3',
  'HymnaTT_hardstyle1.mp3',
  'HymnaTT-hardstyle2.mp3',
  'HymnaTT-hooligans.mp3',
  'HymnaTT-tribe2.mp3',
  'HymnaTT-tribe.1mp3.mp3',
  'HymnaTT-epic1.mp3',
  'HymnaTT-epic2.mp3',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('doom-bounce-') && k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isDoomAsset(url) {
  const u = new URL(url);
  if (u.origin !== self.location.origin) return false;
  const path = u.pathname;
  const file = path.split('/').pop();
  if (RUNTIME_PREFIXES.some(p => path.includes(p))) return true;
  if (CORE.includes(file) || RUNTIME_FILES.includes(file)) return true;
  return false;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !isDoomAsset(req.url)) return; // zbytek webu jde normálně na síť

  const isHtml = req.url.includes('tym_trampolin_doom.html') || req.mode === 'navigate';

  if (isHtml) {
    // HTML: network-first, cache jen jako offline fallback — updaty hry se projeví hned
    event.respondWith(
      fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true })))
    );
    return;
  }

  // média a hudba: cache-first (neměnné soubory)
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        if (hit) return hit;
        return fetch(req).then(resp => {
          // media servery vrací 206 na range requesty — cachovat jen plné 200
          if (resp && resp.status === 200) cache.put(req, resp.clone());
          return resp;
        });
      })
    )
  );
});
