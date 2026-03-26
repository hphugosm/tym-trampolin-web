(function () {
  const NAMESPACE = "tym-trampolin-web";
  const EVENT_ENDPOINT_KEY = "tt_analytics_endpoint";
  const ENDPOINT_ALLOWED_HOSTS_KEY = "tt_analytics_allowed_hosts";
  const REMOTE_COUNTER_ENABLED_KEY = "tt_remote_counter_enabled";
  const EVENT_QUEUE_KEY = "tt_analytics_event_queue_v1";
  const VISITOR_ID_KEY = "tt_visitor_id";
  const SESSION_ID_KEY = "tt_session_id";
  const DEFAULT_EVENT_ENDPOINT = "";

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
    setRemoteCounterEnabled
  };
})();
