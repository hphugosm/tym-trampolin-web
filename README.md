# tym-trampolin-web

Finalni verze webu pro Tym Trampolin.

## Hlavni soubor

- `index.html` je aktivni produkcni verze.

## Archiv verzi

- Historicke HTML varianty jsou ulozene v `archive/html/`.

## Assety

- Obrazky a audio soubory zatim zustavaji v koreni repozitare, aby se nerozbily odkazy v `index.html`.

## Backend analytics (cross-device)

Pro kompletni statistiky napric uzivateli a zarizenimi je potreba endpoint, kam klient posila eventy.

### Co je uz hotove v kodu

- `tracking.js` umi posilat eventy na backend endpoint (`TTTracking.trackEvent(...)`).
- Pokud endpoint neni dostupny, eventy uklada do lokalni fronty a pozdeji je zkusi znovu odeslat.
- Endpoint lze nastavit v adminu v sekci `Backend collector endpoint`.

### Rychly start pres Google Apps Script

1. Vytvor Google Sheet.
2. Otevri Extensions -> Apps Script.
3. Vloz obsah souboru `analytics-collector-apps-script.gs`.
4. Deploy -> New deployment -> Web app:
	- Execute as: Me
	- Who has access: Anyone
5. Zkopiruj `.../exec` URL.
6. V adminu vloz URL do pole `Backend collector endpoint` a klikni `Ulozit endpoint`.
7. Pro okamzite odeslani lokalni fronty klikni `Flush fronty`.

Poznamka: pokud menis logiku v Apps Script (napr. nove summary pole), udelej `Deploy -> Manage deployments -> Edit -> Deploy` pro novou verzi.

### Test endpointu

- `GET <endpoint>?mode=summary` vraci souhrn eventu v JSON.
- Admin KPI (`page_views`, `views_*`, `eshop_clicks`, `order_clicks`) jsou brane z `dashboardMetrics`, ktere backend pocita z eventu `metric_hit`.
