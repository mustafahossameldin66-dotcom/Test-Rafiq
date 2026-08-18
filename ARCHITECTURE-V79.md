# رفيق القرآن V79 — Architectural Refactor

- Persistent user state, prayer cache, and Quran study text use IndexedDB.
- Binary content packs remain in Cache Storage because they are large binary assets.
- Prayer times have an offline solar fallback; online AlAdhan remains an enrichment/update source.
- Large content payloads are external JSON and loaded before UI boot.
- All legacy feature code is held in one private application module scope; only explicit UI bridge APIs are exposed on `window`.
- The existing premium visual language is preserved while removing inline script/style blocks from `index.html`.
- No Zero Day now has a focused rescue mode that hides the dashboard and presents one small actionable step.
- User role/study context is used in recommendations rather than only the welcome message.
