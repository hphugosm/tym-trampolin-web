# Operations

## Local testing

1. Open pages directly in browser or run static server.
2. Verify `TTTracking.getEndpoint()` in DevTools.
3. Verify events queue in localStorage key `tt_analytics_event_queue_v1`.

## Admin workflow

1. Open `admin.html`.
2. Set analytics endpoint.
3. Save endpoint.
4. Flush queue.
5. Refresh dashboard.

## Release checklist

1. Run `tools/security/audit.sh`.
2. Check no hardcoded endpoint/token leaks.
3. Confirm docs are updated.
4. Verify `tracking.js` changed behavior on staging.
5. Smoke-test key pages:
   - `index.html`
   - `admin.html`
   - `eshop_tym_trampolin.html`
   - `album-listen.html`
   - `kilometry-jdes.html`
   - `tym_trampolin_doom.html`

## Incident handling

If analytics endpoint leaks or is abused:

1. Rotate endpoint/backend URL.
2. Update admin endpoint setting.
3. Invalidate/clear queued sensitive payloads if needed.
4. Review logs for suspicious traffic and block sources.
