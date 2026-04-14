(function () {
  const NAMESPACE = "tym-trampolin-web";
  const EVENT_ENDPOINT_KEY = "tt_analytics_endpoint";
  const ENDPOINT_ALLOWED_HOSTS_KEY = "tt_analytics_allowed_hosts";
  const REMOTE_COUNTER_ENABLED_KEY = "tt_remote_counter_enabled";
  const EVENT_QUEUE_KEY = "tt_analytics_event_queue_v1";
  const VISITOR_ID_KEY = "tt_visitor_id";
  const SESSION_ID_KEY = "tt_session_id";
  const DEFAULT_EVENT_ENDPOINT = "";
  const MUSIC_PLAYER_ID = "tt-music-player";
  const MUSIC_BUTTON_CLASS = "tt-music-button";
  const MUSIC_FLOATING_CLASS = "tt-music-floating";
  const MUSIC_STYLE_ID = "tt-music-button-style";
  const MUSIC_TRACKS = [
    { src: "HymnaTT.mp3", label: "HymnaTT" },
    { src: "HymnaTT_original.mp3", label: "HymnaTT original" },
    { src: "HymnaTT_phonk1.mp3", label: "HymnaTT phonk 1" },
    { src: "HymnaTT_phonk2.mp3", label: "HymnaTT phonk 2" },
    { src: "HymnaTT_hardstyle1.mp3", label: "HymnaTT hardstyle 1" },
    { src: "HymnaTT-hardstyle2.mp3", label: "HymnaTT hardstyle 2" },
    { src: "HymnaTT-hooligans.mp3", label: "HymnaTT hooligans" },
    { src: "HymnaTT-tribe.1mp3.mp3", label: "HymnaTT tribe 1" },
    { src: "HymnaTT-tribe2.mp3", label: "HymnaTT tribe 2" },
    { src: "HymnaTT-epic1.mp3", label: "HymnaTT epic 1" },
    { src: "HymnaTT-epic2.mp3", label: "HymnaTT epic 2" }
  ];

  const musicState = {
    button: null,
    audio: null,
    playlist: [],
    index: -1,
    playing: false,
    initialized: false
  };

  function getRuntimeConfig() {
    return window.TTAnalyticsConfig && typeof window.TTAnalyticsConfig === "object"
      ? window.TTAnalyticsConfig
      : {};
  }

  function sanitizeHost(host) {
    const safe = String(host || "").trim().toLowerCase();
    return safe.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  function normalizeHostList(input) {
    if (Array.isArray(input)) {
      return input
        .map(sanitizeHost)
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i);
    }
    return [];
  }

  function getAllowedHosts() {
    const runtimeHosts = normalizeHostList(getRuntimeConfig().allowedHosts);
    if (runtimeHosts.length) return runtimeHosts;

    try {
      const parsed = JSON.parse(localStorage.getItem(ENDPOINT_ALLOWED_HOSTS_KEY) || "[]");
      const localHosts = normalizeHostList(parsed);
      return localHosts;
    } catch (e) {
      return [];
    }
  }

  function setAllowedHosts(hosts) {
    const normalized = normalizeHostList(hosts);
    localStorage.setItem(ENDPOINT_ALLOWED_HOSTS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function isSecureEndpoint(url) {
    try {
      const parsed = new URL(String(url || "").trim(), location.origin);
      return parsed.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function isAllowedEndpoint(url) {
    if (!isSecureEndpoint(url)) return false;
    const hosts = getAllowedHosts();
    if (!hosts.length) return true;
    try {
      const parsed = new URL(String(url || "").trim(), location.origin);
      const host = sanitizeHost(parsed.host);
      return hosts.includes(host);
    } catch (e) {
      return false;
    }
  }

  function redactUrl(value) {
    try {
      const parsed = new URL(String(value || ""), location.href);
      return `${parsed.origin}${parsed.pathname}`;
    } catch (e) {
      return "";
    }
  }

  function sanitizeString(value, maxLen) {
    return String(value == null ? "" : value).slice(0, maxLen);
  }

  function sanitizeMeta(meta, depth) {
    const currentDepth = Number(depth || 0);
    if (currentDepth > 2) return {};
    if (!meta || typeof meta !== "object") return {};

    const out = {};
    const keys = Object.keys(meta).slice(0, 40);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const lower = key.toLowerCase();
      const isSensitive = /password|secret|token|authorization|cookie|apikey|api_key/.test(lower);
      if (isSensitive) continue;

      const val = meta[key];
      if (val == null) continue;
      if (typeof val === "string") {
        out[key] = sanitizeString(val, 300);
      } else if (typeof val === "number" || typeof val === "boolean") {
        out[key] = val;
      } else if (Array.isArray(val)) {
        out[key] = val.slice(0, 20).map((item) => sanitizeString(item, 120));
      } else if (typeof val === "object") {
        out[key] = sanitizeMeta(val, currentDepth + 1);
      }
    }
    return out;
  }

  function isRemoteCounterEnabled() {
    const runtime = getRuntimeConfig();
    if (typeof runtime.enableRemoteCounter === "boolean") {
      return runtime.enableRemoteCounter;
    }
    return localStorage.getItem(REMOTE_COUNTER_ENABLED_KEY) === "1";
  }

  function setRemoteCounterEnabled(enabled) {
    localStorage.setItem(REMOTE_COUNTER_ENABLED_KEY, enabled ? "1" : "0");
  }

  function createId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function getVisitorId() {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = createId("v");
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  }

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = createId("s");
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  }

  function getConfiguredEndpoint() {
    const runtimeConfig = getRuntimeConfig();
    const fromRuntime = typeof runtimeConfig.endpoint === "string"
      ? runtimeConfig.endpoint.trim()
      : "";
    if (fromRuntime && isAllowedEndpoint(fromRuntime)) return fromRuntime;
    const fromStorage = String(localStorage.getItem(EVENT_ENDPOINT_KEY) || "").trim();
    if (fromStorage && isAllowedEndpoint(fromStorage)) return fromStorage;
    return isAllowedEndpoint(DEFAULT_EVENT_ENDPOINT) ? DEFAULT_EVENT_ENDPOINT : "";
  }

  function setEndpoint(url) {
    const next = String(url || "").trim();
    if (!next) {
      localStorage.removeItem(EVENT_ENDPOINT_KEY);
      return false;
    }
    if (!isAllowedEndpoint(next)) {
      return false;
    }
    localStorage.setItem(EVENT_ENDPOINT_KEY, next);
    return true;
  }

  function getEndpoint() {
    return getConfiguredEndpoint();
  }

  function loadEventQueue() {
    try {
      const raw = localStorage.getItem(EVENT_QUEUE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveEventQueue(queue) {
    localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify((queue || []).slice(-500)));
  }

  function queueEvent(eventPayload) {
    const queue = loadEventQueue();
    queue.push(eventPayload);
    saveEventQueue(queue);
  }

  function buildEventPayload(eventName, payload) {
    const extra = payload && typeof payload === "object" ? payload : {};
    const safePath = sanitizeString(location.pathname, 220);
    const safeHref = redactUrl(location.href);
    const safeReferrer = redactUrl(document.referrer || "");
    return {
      namespace: NAMESPACE,
      event: sanitizeString(eventName || "custom_event", 80),
      metric: sanitizeString(extra.metric || extra.metricKey || "", 80),
      value: Number.isFinite(Number(extra.value)) ? Number(extra.value) : 1,
      path: safePath,
      href: safeHref,
      referrer: safeReferrer,
      userAgent: navigator.userAgent,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      user: sanitizeString(extra.user || "", 120),
      meta: sanitizeMeta(extra.meta, 0),
      ts: new Date().toISOString()
    };
  }

  async function postEvent(endpoint, eventPayload) {
    if (!endpoint) return false;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(eventPayload),
        keepalive: true,
        cache: "no-store",
        mode: "no-cors"
      });
      // In no-cors mode response is opaque, so successful fetch resolution is considered delivered.
      return Boolean(res);
    } catch (e) {
      return false;
    }
  }

  async function flushQueue() {
    const endpoint = getConfiguredEndpoint();
    if (!endpoint) return false;
    const queue = loadEventQueue();
    if (!queue.length) return true;

    const remaining = [];
    for (let i = 0; i < queue.length; i++) {
      const ok = await postEvent(endpoint, queue[i]);
      if (!ok) {
        remaining.push(queue[i]);
      }
    }
    saveEventQueue(remaining);
    return remaining.length === 0;
  }

  async function trackEvent(eventName, payload) {
    const eventPayload = buildEventPayload(eventName, payload);
    const endpoint = getConfiguredEndpoint();
    if (!endpoint) {
      queueEvent(eventPayload);
      return false;
    }

    const ok = await postEvent(endpoint, eventPayload);
    if (!ok) {
      queueEvent(eventPayload);
      return false;
    }

    flushQueue();
    return true;
  }

  function bumpLocalMetric(metricKey) {
    const key = `tt_metric_${metricKey}`;
    const current = Number(localStorage.getItem(key) || 0);
    localStorage.setItem(key, String(current + 1));
    return current + 1;
  }

  function getLocalMetric(metricKey) {
    return Number(localStorage.getItem(`tt_metric_${metricKey}`) || 0);
  }

  async function hit(metricKey) {
    bumpLocalMetric(metricKey);
    if (isRemoteCounterEnabled()) {
      const endpoint = `https://api.countapi.xyz/hit/${NAMESPACE}/${encodeURIComponent(metricKey)}`;
      try {
        await fetch(endpoint, { cache: "no-store", keepalive: true });
        trackEvent("metric_hit", { metric: metricKey, value: 1 });
        return true;
      } catch (e) {
        trackEvent("metric_hit_local_only", { metric: metricKey, value: 1 });
        return false;
      }
    }
    trackEvent("metric_hit_local_only", { metric: metricKey, value: 1 });
    return false;
  }

  function track(metricKey) {
    return hit(metricKey);
  }

  function trackPageView(pageKey) {
    hit("page_views");
    if (pageKey) {
      hit(pageKey);
    }
    trackEvent("page_view", { metric: pageKey || "page_views", value: 1, meta: { pageKey: pageKey || "" } });
  }

  function shuffleTracks(items) {
    const next = items.slice();
    for (let index = next.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = next[index];
      next[index] = next[swapIndex];
      next[swapIndex] = temp;
    }
    return next;
  }

  function ensureMusicStyle() {
    if (document.getElementById(MUSIC_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = MUSIC_STYLE_ID;
    style.textContent = `
      .${MUSIC_BUTTON_CLASS} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 9px 14px;
        border-radius: 999px;
        border: 1px solid rgba(140, 205, 255, 0.18);
        background: rgba(127, 214, 255, 0.10);
        color: var(--text, #eef5ff);
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        transition: transform 180ms ease, background 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
        white-space: nowrap;
      }
      .${MUSIC_BUTTON_CLASS}:hover {
        transform: translateY(-1px);
        border-color: rgba(127, 214, 255, 0.34);
        background: rgba(127, 214, 255, 0.16);
      }
      .${MUSIC_BUTTON_CLASS}:focus-visible {
        outline: 2px solid rgba(127, 214, 255, 0.55);
        outline-offset: 2px;
      }
      .${MUSIC_BUTTON_CLASS}.is-playing {
        color: #04101b;
        border-color: transparent;
        background: linear-gradient(135deg, var(--accent, #7fd6ff) 0%, var(--accent2, #7d8bff) 100%);
        box-shadow: 0 12px 28px rgba(127, 214, 255, 0.18);
      }
      .${MUSIC_FLOATING_CLASS} {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 220;
      }
    `;
    document.head.appendChild(style);
  }

  function getMusicAudio() {
    if (musicState.audio) return musicState.audio;
    let audio = document.getElementById(MUSIC_PLAYER_ID);
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = MUSIC_PLAYER_ID;
      audio.preload = "auto";
      audio.hidden = true;
      audio.style.display = "none";
      audio.setAttribute("aria-hidden", "true");
      document.body.appendChild(audio);
    }
    audio.volume = 0.62;
    audio.loop = false;
    audio.addEventListener("ended", () => {
      if (!musicState.playing) return;
      void advanceMusicTrack(false);
    });
    musicState.audio = audio;
    return audio;
  }

  function setMusicButtonState() {
    if (!musicState.button) return;
    musicState.button.classList.toggle("is-playing", musicState.playing);
    musicState.button.setAttribute("aria-pressed", musicState.playing ? "true" : "false");
    const currentTrack = musicState.playlist[musicState.index] || null;
    musicState.button.title = currentTrack
      ? `Hudba: ${currentTrack.label}`
      : "Přehrát hudbu Týmu Trampolín";
  }

  function setMusicTrack(index) {
    const audio = getMusicAudio();
    const track = musicState.playlist[index];
    if (!track) return false;
    audio.pause();
    audio.src = track.src;
    audio.load();
    musicState.index = index;
    setMusicButtonState();
    return true;
  }

  async function playCurrentMusicTrack() {
    const audio = getMusicAudio();
    const track = musicState.playlist[musicState.index];
    if (!track) return false;
    audio.volume = 0.62;
    try {
      await audio.play();
      musicState.playing = true;
      setMusicButtonState();
      return true;
    } catch (error) {
      musicState.playing = false;
      setMusicButtonState();
      return false;
    }
  }

  async function startMusicPlayback() {
    musicState.playlist = shuffleTracks(MUSIC_TRACKS);
    musicState.index = 0;
    setMusicTrack(musicState.index);
    musicState.playing = true;
    setMusicButtonState();
    await playCurrentMusicTrack();
  }

  async function advanceMusicTrack(forceStart) {
    if (!musicState.playlist.length) {
      musicState.playlist = shuffleTracks(MUSIC_TRACKS);
      musicState.index = -1;
    }
    if (forceStart || musicState.index < 0) {
      await startMusicPlayback();
      return;
    }
    const nextIndex = musicState.index + 1;
    if (nextIndex >= musicState.playlist.length) {
      musicState.playlist = shuffleTracks(MUSIC_TRACKS);
      musicState.index = 0;
    } else {
      musicState.index = nextIndex;
    }
    setMusicTrack(musicState.index);
    musicState.playing = true;
    setMusicButtonState();
    await playCurrentMusicTrack();
  }

  function mountMusicButton() {
    if (musicState.initialized) return;
    const navLinks = document.querySelector(".nav-links");
    const navInner = document.querySelector("nav .nav-inner");
    let targetContainer = navLinks || navInner;
    if (!targetContainer) {
      const floatingContainer = document.createElement("div");
      floatingContainer.className = MUSIC_FLOATING_CLASS;
      document.body.appendChild(floatingContainer);
      targetContainer = floatingContainer;
    }

    ensureMusicStyle();

    const button = document.createElement("button");
    button.type = "button";
    button.className = MUSIC_BUTTON_CLASS;
    button.textContent = "Music";
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (window.TTTracking) {
        window.TTTracking.trackEvent("music_button_click", {
          metric: "music_button_click",
          value: 1,
          meta: {
            currentTrack: musicState.playlist[musicState.index]?.src || "",
            trackCount: MUSIC_TRACKS.length
          }
        });
      }
      void advanceMusicTrack(!musicState.playing);
    });

    targetContainer.appendChild(button);

    musicState.button = button;
    musicState.initialized = true;
    setMusicButtonState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountMusicButton, { once: true });
  } else {
    mountMusicButton();
  }

  window.addEventListener("online", () => {
    flushQueue();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      flushQueue();
    }
  });
  window.addEventListener("beforeunload", () => {
    flushQueue();
  });
  setTimeout(() => {
    flushQueue();
  }, 1200);

  window.TTTracking = {
    track,
    trackPageView,
    getLocalMetric,
    trackEvent,
    flushQueue,
    setEndpoint,
    getEndpoint,
    setAllowedHosts,
    getAllowedHosts,
    setRemoteCounterEnabled,
    startMusicPlayback,
    advanceMusicTrack
  };
})();
