# Rafiq Quran V72 — Audit & Cleanup

## What was fixed

- Removed the duplicate HTML doctype.
- Kept a single visible `<main>` landmark; the Mushaf container and generated article container are now `div` regions.
- Moved all dynamically appended `<style>` blocks from `<body>` into `<head>`.
- Fixed the CSS block containing literal `\\n` sequences; CSS parser check now reports zero parse errors.
- Converted the floating portal cards from `<button>` elements containing block-level children into accessible `<div role="button" tabindex="0">` cards.
- Added `type="button"` to static buttons where omitted.
- Added labels/ARIA labels to common form controls.
- Added a visible fallback heading for the daily-splash greeting.
- Added and verified PWA `192x192` and `512x512` icons in `manifest.webmanifest`.
- Updated the service-worker shell cache version to V72.
- Removed Yasser Ad-Dussary from the visible reciter list and daily verse defaults; allowed reciters are Husary, Fares Abbad, and Minshawy.
- Corrected `Asad al-Ghabah` classification to the Seerah section and added its catalog entry.
- Corrected basic-study catalog labels so "ما لا يسع المسلم جهله" and "الفقه الميسر" remain separate tracks.
- Removed duplicate/alternate clutter from the user-facing Tazkiyah catalog for duplicate editions.

## Static checks performed

- JavaScript syntax: all embedded script blocks pass `node --check`.
- CSS parsing: zero parser errors via `tinycss2`.
- Document structure: exactly one visible `<main>` and no `<style>` tags in `<body>`.
- Floating cards: no remaining floating-card `<button>` elements with block-level children.
- Empty headings: none in the static document after fallback text.
- Legacy `dayDiff`: zero references; `diffDays` is used.
- Previously missing functions are present: `renderTafsirHTML`, `renderWordsHTML`, `renderAsbabHTML`, `renderRecitationHTML`, `renderMethod`, `openFocus`, `renderExplore`.
- Visible Yasser Ad-Dussary references: none.
