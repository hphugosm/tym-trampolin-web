const SHEET_NAME = "events";

function getAdminToken_() {
  return String(PropertiesService.getScriptProperties().getProperty("ADMIN_TOKEN") || "").trim();
}

function verifyAdminToken_(candidate) {
  const configured = getAdminToken_();
  if (!configured) return false;
  return String(candidate || "").trim() === configured;
}

function parseIsoDate_(value) {
  const dt = new Date(String(value || ""));
  if (!Number.isFinite(dt.getTime())) return null;
  return dt;
}

function purgeRecentRows_(hours, namespaceFilter) {
  const safeHours = Math.max(1, Math.min(168, Number(hours || 24)));
  const cutoffMs = Date.now() - safeHours * 60 * 60 * 1000;
  const ns = String(namespaceFilter || "").trim();

  const sheet = ensureSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { deletedRows: 0, scannedRows: 0, cutoffIso: new Date(cutoffMs).toISOString() };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const toDeleteSheetRows = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const ts = parseIsoDate_(row[0]);
    const namespace = String(row[1] || "").trim();
    if (!ts) continue;
    if (ns && namespace !== ns) continue;
    if (ts.getTime() >= cutoffMs) {
      toDeleteSheetRows.push(i + 2);
    }
  }

  for (let i = toDeleteSheetRows.length - 1; i >= 0; i--) {
    sheet.deleteRow(toDeleteSheetRows[i]);
  }

  return {
    deletedRows: toDeleteSheetRows.length,
    scannedRows: values.length,
    cutoffIso: new Date(cutoffMs).toISOString()
  };
}

function ensureSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "ts",
      "namespace",
      "event",
      "metric",
      "value",
      "path",
      "href",
      "referrer",
      "visitorId",
      "sessionId",
      "user",
      "meta_json"
    ]);
  }
  return sheet;
}

function safeJsonParse_(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = safeJsonParse_(e && e.postData && e.postData.contents ? e.postData.contents : "") || {};
  const row = [
    payload.ts || new Date().toISOString(),
    payload.namespace || "",
    payload.event || "",
    payload.metric || "",
    Number(payload.value || 0),
    payload.path || "",
    payload.href || "",
    payload.referrer || "",
    payload.visitorId || "",
    payload.sessionId || "",
    payload.user || "",
    JSON.stringify(payload.meta || {})
  ];

  const sheet = ensureSheet_();
  sheet.appendRow(row);
  return jsonResponse_({ ok: true });
}

function doGet(e) {
  const mode = String((e && e.parameter && e.parameter.mode) || "").toLowerCase();
  if (mode === "purge_recent") {
    const token = String((e && e.parameter && e.parameter.token) || "").trim();
    if (!verifyAdminToken_(token)) {
      return jsonResponse_({ ok: false, error: "unauthorized" });
    }

    const hours = Number((e && e.parameter && e.parameter.hours) || 24);
    const namespaceFilter = String((e && e.parameter && e.parameter.namespace) || "").trim();
    const result = purgeRecentRows_(hours, namespaceFilter);
    return jsonResponse_({
      ok: true,
      mode: "purge_recent",
      hours: Math.max(1, Math.min(168, Number(hours || 24))),
      namespace: namespaceFilter || "all",
      deletedRows: Number(result.deletedRows || 0),
      scannedRows: Number(result.scannedRows || 0),
      cutoffIso: String(result.cutoffIso || "")
    });
  }

  if (mode !== "summary") {
    return jsonResponse_({ ok: true, message: "Use ?mode=summary" });
  }

  const sheet = ensureSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1);

  const byEvent = {};
  const byMetric = {};
  const dashboardMetrics = {};
  const byUserListenSeconds = {};
  const byTrackListenSeconds = {};
  const byHourListenSeconds = {};
  const byUserTrackSeconds = {};
  const byUserHourListenSeconds = {};
  const dinoBestByUser = {};
  let fullAlbumCompletions = 0;

  rows.forEach((r) => {
    const ts = String(r[0] || "");
    const eventName = String(r[2] || "");
    const metric = String(r[3] || "");
    const value = Number(r[4] || 0);
    const user = String(r[10] || "") || "host";
    const meta = safeJsonParse_(String(r[11] || "")) || {};

    byEvent[eventName] = (byEvent[eventName] || 0) + 1;
    if (metric) byMetric[metric] = (byMetric[metric] || 0) + value;

    // Canonical counters for admin dashboard: only metric_hit events are counted.
    if (eventName === "metric_hit" && metric) {
      dashboardMetrics[metric] = (dashboardMetrics[metric] || 0) + value;
    }

    if (eventName === "album_track_listen_session") {
      byUserListenSeconds[user] = (byUserListenSeconds[user] || 0) + value;

      const trackTitle = String(meta.trackTitle || "").trim() ||
        (Number.isFinite(Number(meta.trackIndex)) ? `Track ${Number(meta.trackIndex) + 1}` : "Unknown Track");
      byTrackListenSeconds[trackTitle] = (byTrackListenSeconds[trackTitle] || 0) + value;

      const date = new Date(ts);
      const hour = Number.isFinite(date.getTime()) ? String(date.getHours()) : "-1";
      byHourListenSeconds[hour] = (byHourListenSeconds[hour] || 0) + value;

      if (!byUserTrackSeconds[user]) byUserTrackSeconds[user] = {};
      if (!byUserHourListenSeconds[user]) byUserHourListenSeconds[user] = {};
      byUserTrackSeconds[user][trackTitle] = (byUserTrackSeconds[user][trackTitle] || 0) + value;
      byUserHourListenSeconds[user][hour] = (byUserHourListenSeconds[user][hour] || 0) + value;
    }
    if (eventName === "album_full_play_completed") {
      fullAlbumCompletions += 1;
    }

    if (eventName === "dino_leaderboard_pb") {
      const score = Number(meta.score || value || 0);
      if (score > 0) {
        const key = String(meta.emailHash || user || "anonymous").toLowerCase();
        const current = dinoBestByUser[key];
        const candidate = {
          name: String(meta.name || user || "Neznamy hrac"),
          best: score,
          updatedAt: ts || new Date().toISOString()
        };
        if (!current || score > Number(current.best || 0)) {
          dinoBestByUser[key] = candidate;
        }
      }
    }
  });

  const dinoLeaderboard = Object.keys(dinoBestByUser)
    .map((k) => dinoBestByUser[k])
    .sort((a, b) => Number(b.best || 0) - Number(a.best || 0))
    .slice(0, 50);

  return jsonResponse_({
    ok: true,
    rows: rows.length,
    byEvent,
    byMetric,
    dashboardMetrics,
    byUserListenSeconds,
    byTrackListenSeconds,
    byHourListenSeconds,
    byUserTrackSeconds,
    byUserHourListenSeconds,
    fullAlbumCompletions,
    dinoLeaderboard,
    generatedAt: new Date().toISOString()
  });
}
