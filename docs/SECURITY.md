# Security

## Threat model (high level)

- Main risk: client-side endpoint exposure in static frontend code.
- Secondary risk: accidental PII leak through analytics payload fields.
- Additional risk: unrestricted third-party calls from browser runtime.

## What was hardened

1. Removed hardcoded analytics endpoint from client runtime.
2. Disabled default endpoint in `tracking.js`.
3. Added endpoint validation:
   - HTTPS required
   - optional host allowlist (`allowedHosts`) support
4. Added payload minimization:
   - `href` and `referrer` are redacted to `origin + path`
   - `meta` fields are sanitized and limited
5. Made remote metric service optional (opt-in only).

## Configuration options

Runtime object (optional):

```js
window.TTAnalyticsConfig = {
  endpoint: "https://analytics.example.com/collect",
  allowedHosts: ["analytics.example.com"],
  enableRemoteCounter: false
};
```

Local API exposed by `TTTracking`:

- `setEndpoint(url)`
- `getEndpoint()`
- `setAllowedHosts([host])`
- `getAllowedHosts()`
- `setRemoteCounterEnabled(boolean)`
- `flushQueue()`

## Admin auth hardening

- `admin.html` uz nepouziva hardcoded heslo.
- Prvni nastaveni hesla (lokalne v prohlizeci):

```js
await window.TTAdminSetPassword("zde-vloz-silne-heslo-min-12")
```

- Volitelne lze injectnout runtime hash:

```js
window.TTAdminSecurity = { passHash: "<sha256_hex>" };
```

- Pri opakovanych neuspesnych pokusech se aktivuje lockout.

## Album auth hardening

- Odstranen admin backdoor login.
- Doporuzeny rezim je `hash-list` (bez legacy generatoru):

```js
window.TTAlbumAuth = {
   mode: "hash-list",
   allowLegacy: false,
   userPasswordHashes: {
      "jmeno uzivatele": "sha256_hex_z_retezce_jmeno:heslo"
   }
};
```

- Pri opakovanych neuspesnych pokusech se aktivuje lockout.

## Incident cleanup (last 24h)

Collector podporuje purge endpoint:

- `GET ?mode=purge_recent&hours=24&token=<ADMIN_TOKEN>`

`ADMIN_TOKEN` se bere ze Script Properties v Google Apps Script:

- key: `ADMIN_TOKEN`
- value: silny tajny token

Pomocny skript:

- `tools/security/purge_recent.sh`

## Important limitation

If analytics is sent directly from browser to external endpoint, endpoint visibility in client runtime is unavoidable.

## Recommended production architecture

Use same-origin proxy:

- Browser -> `/api/analytics` (same domain)
- Server/proxy -> external analytics backend

Benefits:

- external target hidden from browser
- central auth/rate-limit/validation
- easier WAF and observability

## Operational controls

- Add CSP and strict security headers on hosting edge.
- Log and monitor rejected payloads.
- Rotate backend secrets outside repository.
- Keep `.env` and key material out of git.
