# رفيق القرآن — V88 Modular Performance + Content-ready

This package keeps the V87 modular performance work and fixes the missing deployment assets/data structure.

## Included
- `index.html`
- `css/app.css`
- `js/` modular scripts
- `manifest.webmanifest`
- `sw.js`
- `assets/icon.svg`
- `assets/icon-192.png`
- `data/content-manifest.json`
- `data/README.md`

## Quran data
The app first loads `quran-uthmani.json` locally when it exists. If it is missing, it resolves the `content-v1` GitHub release asset with the same filename, downloads it once, and caches it in IndexedDB for later use.

This means an incomplete upload does not silently leave the Quran screen broken.
