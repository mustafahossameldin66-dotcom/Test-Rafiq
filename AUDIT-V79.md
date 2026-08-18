# رفيق القرآن V79 — Root Architecture Refactor Audit

## What changed

1. **Persistence**
   - User state moved from runtime `localStorage` JSON to IndexedDB (`kv` store).
   - Quran study text/cache moved to IndexedDB (`quran` store).
   - Prayer cache moved to IndexedDB (`prayer` store).
   - Release metadata moved to IndexedDB.
   - A one-time migration reads the legacy `rafiq-supreme-v15` key, writes it to IndexedDB, then removes the legacy key.
   - Large binary PDFs/audio remain in Cache Storage rather than `localStorage`.

2. **Offline prayer calculation**
   - Added a standalone solar calculation module with Fajr, sunrise, Dhuhr, Asr, Maghrib/Sunset, and Isha fallback.
   - Online AlAdhan remains an update/enrichment source; cached/API data wins, local solar calculation is the offline fallback when coordinates exist.

3. **Content payload**
   - `index.html` no longer contains the large encyclopedia/content objects.
   - Structured content is externalized to JSON under `assets/data/` and loaded before UI boot.
   - Content catalog metadata is externalized from the HTML.

4. **Global scope**
   - All legacy feature code now lives inside one private application scope.
   - Only explicit compatibility APIs are exposed on `window` for existing HTML handlers and integrations.

5. **No Zero Day**
   - Added a focused rescue mode that hides the dashboard visually and presents one Quran action and one simple completion button.
   - The existing No Zero Days action is connected to the rescue mode.

6. **Personalization**
   - Existing role/study data is now used to add role-specific guidance rather than only changing the welcome screen.

7. **CSS/HTML structure**
   - Inline `<style>` blocks were removed from `index.html` into one external stylesheet.
   - CSS was compacted by merging repeated top-level selectors where safe.
   - HTML keeps one visible `<main>` and has no duplicate IDs.

## Static verification

- All JavaScript files pass `node --check`.
- CSS parses with zero `tinycss2` parse errors.
- `index.html` contains exactly one `<main>`.
- No duplicate DOM IDs detected.
- No Unicode Private Use Area characters detected in HTML/CSS/JS/JSON/SVG source files.
- PWA manifest includes 192px and 512px icons.
- Runtime application JavaScript contains no direct `localStorage` calls; only the explicit one-time migration in `storage.js` reads the legacy state.

## Remaining non-blocking cleanup

- There are still some inline `style="..."` attributes inside the existing visual markup; they are kept where they are part of the established UI layout and generated feature cards.
- The stylesheet is substantially smaller and consolidated, but legacy visual selectors remain because they are still used by the premium UI.
- Binary book/audio packs are intentionally not embedded in the site shell; they remain Release assets and are downloaded on demand.
