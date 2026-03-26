# Repository Structure

This document describes the intended folder and file layout.

## Top-level pages

- `index.html` - main landing page
- `admin.html` - admin dashboard
- `eshop_tym_trampolin.html` - e-shop page
- `album-listen.html` - album player/listening analytics
- `kilometry-jdes.html` - runner game
- `tym_trampolin_doom.html` - doom game
- `memes.html` - meme interactions

## Shared runtime logic

- `tracking.js` - analytics queue + endpoint config + local metrics

## Backend

- `backend/google-apps-script/collector.gs` - Google Apps Script collector source

## Documentation

- `README.md` - project overview and onboarding
- `docs/SECURITY.md` - security model and hardening details
- `docs/OPERATIONS.md` - deployment and operational procedures
- `docs/REPOSITORY_STRUCTURE.md` - this file

## Legacy files

- `archive/html/` - historical html snapshots kept for reference

## Security tooling

- `tools/security/audit.sh` - quick static scan for endpoint leaks and risky strings
