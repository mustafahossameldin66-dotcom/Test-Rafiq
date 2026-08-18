# Audit V86 — Root Refactor

- IndexedDB is the primary application persistence layer; direct localStorage usage is limited to legacy migration.
- Prayer calculation is local (`RafiqPrayer`); no AlAdhan API remains in the application JS.
- The boot path no longer loads deep content or GitHub release metadata synchronously.
- Core startup data is embedded synchronously in `data.js`.
- Deep content is loaded on demand and cached in IndexedDB.
- New memorization and archive review are separated in `hifz-engine.js`.
- No-Zero Days now records a recovery event and shifts a bounded set of heavy due reviews.
- Content buttons resolve to direct release asset URLs; there is no fallback to the GitHub Assets page.
- Only Husary is exposed as the currently confirmed reciter; other recitations remain outside the current playable set until operational audio packs are provided.
- The dialect option is not part of the UI or state schema.
