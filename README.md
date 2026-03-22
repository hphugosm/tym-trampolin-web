# tym-trampolin-web

Finalni verze webu pro Tym Trampolin.

## Hlavni soubor

- `index.html` je aktivni produkcni verze.

## Struktura projektu

- `index.html` - hlavni landing page (produkce).
- `Index2_updated_final_complete_fixed_sharinglink_v3.html` - alternativni landing varianta (v3).
- `eshop_tym_trampolin.html` - e-shop podpory.
- `album-listen.html` - digitalni album player + hlasovani.
- `admin.html` - admin panel (lokalni + backend analytics).
- `tracking.js` - sdilena analyticka vrstva (queue + endpoint).
- `analytics-collector-apps-script.gs` - Google Apps Script backend collector.
- `dino-game.html` - mini hra (Dino Run) s top score.

## Archiv verzi

- Historicke HTML varianty jsou ulozene v `archive/html/`.

## Assety

- Obrazky a audio soubory zatim zustavaji v koreni repozitare, aby se nerozbily odkazy v `index.html`.

## Nova funkcionalita

- Newsletter blok je na `index.html` i na `Index2_updated_final_complete_fixed_sharinglink_v3.html`.
- Prihlaseni newsletteru se uklada lokalne (`localStorage`, klic `tt_newsletter_subscribers_v1`) a odesila analytics event `newsletter_subscribe`.
- Novy `dino-game.html` ma lokalni top score (`tt_dino_topscore_v1`) a eventy `dino_game_start`, `dino_game_over`, `dino_game_topscore`.
- V `album-listen.html` je pridana volba poctu tracku na radek (1-4), uklada se do `tt_album_track_columns_v1`.

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
