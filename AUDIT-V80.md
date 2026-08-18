# Rafiq V80 — Structural cleanup

## Fixes
- Removed invalid `defer="False"` values from all external scripts; scripts now use the valid boolean `defer` attribute.
- Changed the mushaf content landmark from a generic `div role="region"` to a semantic `<section aria-label="المصحف">`.
- Preserved script order by keeping `defer` on all external scripts.

## Verification
- JavaScript files pass `node --check`.
- Exactly one `<!doctype html>`.
- Exactly one `<main>` element.
- No `defer="False"` / `defer="false"` remains.
- No `role="region"` remains for the mushaf container.
- No duplicate structural patch added.
