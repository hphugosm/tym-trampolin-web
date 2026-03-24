(function () {
  const NAMESPACE = "tym-trampolin-web";
  const EVENT_ENDPOINT_KEY = "tt_analytics_endpoint";
  const EVENT_QUEUE_KEY = "tt_analytics_event_queue_v1";
  const VISITOR_ID_KEY = "tt_visitor_id";
  const SESSION_ID_KEY = "tt_session_id";
  const DEFAULT_EVENT_ENDPOINT = "https://script.google.com/macros/s/AKfycbwR_OhNW85jSf-r5eRqNZwT3TZ-YhD8cyqyQWJF3KFjqdCr1SWUHk3QBhicIc2ZYpFI5A/exec";

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
    const fromRuntime = window.TTAnalyticsConfig && typeof window.TTAnalyticsConfig.endpoint === "string"
      ? window.TTAnalyticsConfig.endpoint.trim()
      : "";
    if (fromRuntime) return fromRuntime;
    const fromStorage = String(localStorage.getItem(EVENT_ENDPOINT_KEY) || "").trim();
    if (fromStorage) return fromStorage;
    return DEFAULT_EVENT_ENDPOINT;
  }

  function setEndpoint(url) {
    const next = String(url || "").trim();
    if (!next) {
      localStorage.removeItem(EVENT_ENDPOINT_KEY);
      return;
    }
    localStorage.setItem(EVENT_ENDPOINT_KEY, next);
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
    return {
      namespace: NAMESPACE,
      event: String(eventName || "custom_event"),
      metric: String(extra.metric || extra.metricKey || ""),
      value: Number.isFinite(Number(extra.value)) ? Number(extra.value) : 1,
      path: location.pathname,
      href: location.href,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      user: String(extra.user || ""),
      meta: extra.meta && typeof extra.meta === "object" ? extra.meta : {},
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
    getEndpoint
  };
})();
