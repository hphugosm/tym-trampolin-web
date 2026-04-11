# vibecoder-v2

Lokální interní worker pro role-based vibecoder workflow.

## Cíl

Nástroj vezme krátké zadání a spustí role v tomto pořadí:

`structure` → `ui` → `research` → `review` → `polish`

Před tím vším proběhne krátký strategický krok `plan`.

## Stack

- Node.js + npm
- Vite + React + TypeScript
- OpenCode CLI (lokálně)

## Struktura projektu

- `scripts/worker.ts` orchestrace workflow
- `prompts/*.md` instrukce pro jednotlivé role
- `opencode.json` lokální OpenCode konfigurace a agenti
- `src/` jednoduché interní UI pro zadání a runbook

## Instalace

```bash
npm install
```

## Spuštění preview

```bash
npm run dev
```

Preview poběží na adrese `http://localhost:5173`.

## Spuštění workeru

### Běžné použití

```bash
npm run worker -- --brief "Udělej modernější homepage pro DemocraTICon"
```

### Rychlý demo příkaz

```bash
npm run worker:demo
```

### Dry-run (vypíše příkazy bez exekuce)

```bash
npm run worker:dry
```

### Vynucený ostrý běh

```bash
npm run worker -- --execute --brief "Modernizuj homepage"
```

Poznámka: `--execute` obejde auto-detekci env proměnných a použije přihlášené OpenCode credentials (`opencode providers list`).

## OpenCode

Projekt používá `opencode.json` s agenty:

- `plan` strategický plán
- `build` implementační průchody (`structure`, `ui`, `research`)
- `review` tvrdá kontrola rizik a chyb
- `polish` finální zlepšení s malým diffem

Aktuálně jsou agenti namapovaní na free modely z provideru `opencode`:

- `opencode/qwen3.6-plus-free`
- `opencode/minimax-m2.5-free`
- `opencode/nemotron-3-super-free`

Pokud nemáš provider nastavený, worker přejde do dry-run módu.

Příklad lokálního startu OpenCode:

```bash
opencode .
```

Kontrola configu:

```bash
opencode debug config
```

## Iterace workflow

1. Uprav brief nebo prompt v `prompts/`.
2. Spusť worker (`npm run worker -- --brief "..."`).
3. Ověř výsledek v preview.
4. Spusť kontrolu:

```bash
npm run build
npm run lint
```

5. Opakuj další průchod jen nad tím, co má nejvyšší dopad.
