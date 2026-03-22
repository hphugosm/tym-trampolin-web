(function () {
  const NAMESPACE = "tym-trampolin-web";

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
      return true;
    } catch (e) {
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
  }

  window.TTTracking = {
    track,
    trackPageView,
    getLocalMetric
  };
})();
