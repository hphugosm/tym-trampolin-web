# Tým Trampolín / press kit
Profiles and team facts dated 28 October 2026. Original logo and approved transparent web export added 29 October 2026. Profile links target the planned production domain https://tymtrampolin.cz.

## Contents
- team-profile-cs.pdf / team-profile-en.pdf: two-page editorial team profiles.
- team-facts-cs.txt / team-facts-en.txt: short team description, member names, competition results, six factual project summaries, URLs, and contact details.
- FONT-LICENSE-manrope.txt / FONT-LICENSE-dm-sans.txt: original font licenses and copyright notices.
- Logo.png: unchanged user-provided original logo, supplied 29 October 2026.
- Logo-web.webp: approved derived transparent web export in Editorial Blue (#173DA5), approved 29 October 2026.
- press-kit.zip: both language profiles, both facts files, the original logo, the derived web export, font licenses, and this README.

## Media and rights
Logo.png is an unchanged copy of the original logo supplied by the user on 29 October 2026 (1536 × 1024 pixels). Logo-web.webp is a derived transparent export for website use in Editorial Blue (#173DA5), approved on 29 October 2026; it is not the unchanged original. Inclusion does not grant a general reuse license; contact team@tymtrampolin.cz for permission and usage guidance. No photographs, client media, or third-party game artwork are included. The existing PDFs typeset the team name as text; they do not reconstruct or reproduce the logo. Contour drawings are generated for these documents. Manrope ExtraBold and DM Sans Regular are embedded as subsets for PDF display, using the same bundled fonts as the website. No standalone font binaries are included in this kit. Font software remains subject to its original license (SIL Open Font License).

The facts are provided for identifying and describing the team. This kit does not assert ownership or grant reuse rights for third-party trademarks, client work, photographs, game references, or assets visible on linked sites. For additional logo formats, portraits, licensed media, interviews, or reuse requests, contact team@tymtrampolin.cz. Follow external project links for project-specific information and rights.

## Accuracy and status
Current team: Hugo Kubíček, Daniel Voženílek, Vojtěch Čakrt, and Honza Smrz. Honza is identified only as a member. The historical DemocraTICon participation involved Hugo, Daniel, and Vojtěch. Other portfolio work is credited to Hugo. ClearMessage is a research prototype; its public demo replays a recorded result. AI radio broadcasting is paused. No commercial performance or independent safety claims are made.

Sources: repository reference/site.ts, pages.mjs (current fourth member), and the linked project pages. Contact details are public team contacts.

## Rebuild
Run generate-press.py from the repository root using Python with reportlab, fonttools, and brotli installed. It merges the Latin and Latin Extended subsets of the bundled Manrope ExtraBold and DM Sans Regular fonts from dist/assets/fonts (or the @fontsource packages under landing-app/node_modules). All data and generated contour paths are contained in that script. Render and inspect all four pages after rebuilding.
