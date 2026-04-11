# VibeCoder MVP (Monorepo)

Prvni implementacni batch pro soutez (API integration + git flow):
- lokalni backend API s OpenAI + Gemini integrací
- sekvenční orchestrace planner -> coder -> reviewer
- VS Code extension command + status UI
- git branch + commit metadata

## Quick start

1. Nainstaluj zavislosti:

```bash
npm install
```

2. Nastav API klíče (vytvoř `.env` v `apps/backend/`):

```bash
cp apps/backend/.env.example apps/backend/.env
# Pak uprav .env s tvýmy API klíči:
# OPENAI_API_KEY=sk-...
# GOOGLE_API_KEY=...
```

3. Spust backend lokalne:

```bash
npm run dev:backend
```

4. Sestav extension:

```bash
npm run build:extension
```

5. Otevri slozku `apps/extension` ve VS Code Extension Development Host (F5).

## Features

### Backend API

- `POST /api/jobs` - vytvoří job a spustí pipeline na pozadí
  - Input: `{ task: string }`
  - Output: `{ jobId: string, status: "queued" }`
- `GET /api/jobs/:id` - vrací průběžný stav, stage, trace, výsledek a git metadata
- `GET /health` - health check

### Pipeline

Sekvenční orchestrace:
1. **Planner** (OpenAI) - vytvoří detailní implementační plán
2. **Coder** (Gemini) - vygeneruje kód na základě plánu
3. **Reviewer** (OpenAI) - provede code review a vrátí feedback

Výsledek obsahuje všechny tři výstupy spojené s oddělovači.

### Extension

- Příkaz `VibeCoder: Run Task`
- Live Webview panel se stavem pipeline
- Status Bar ukazující aktuální stav
- Copy-to-clipboard tlačítka pro výsledek, branch name a commit message
- Git metadata: branch name, commit message s authored

## Git Flow

Po dokončení job má:
- `git.branchName`: `vibecoder/xxx-yyy` (generované z task)
- `git.commitMessage`: strukturovaná zpráva s taskem a pipeline info
- `git.authorName` a `git.authorEmail`: nastavitelné v .env (default: VibeCoder)

Uživatel si zkopíruje branch name a commit message z extension UI.

## Development

- `npm run typecheck` - typování w obou packagech
- `npm run build:extension` - sestav extension
- `npm --workspace @vibecoder/backend run build` - sestav backend
- `npm run dev:backend` - dev mode s tsx watch
