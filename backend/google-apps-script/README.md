# Google Apps Script Collector

- Source file: `collector.gs`
- Purpose: receive analytics events from frontend and provide summary endpoint.

## Deploy

1. Create/open Google Sheet.
2. Open Extensions -> Apps Script.
3. Paste contents of `collector.gs`.
4. Deploy as Web App.
5. Copy `/exec` URL and set it in `admin.html`.

## Security note

Do not commit private keys or service credentials to this repository.
Prefer placing collector behind your own backend/proxy for stricter control.
