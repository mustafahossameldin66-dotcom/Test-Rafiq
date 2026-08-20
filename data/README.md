# Data

- `quran-uthmani.json` is the local Quran payload expected by the app.
- For this modular package, the app also has a safe online fallback to the project's `content-v1` GitHub release when the local payload is not yet present.
- Once loaded, the Quran payload is cached in IndexedDB for repeat use without re-downloading.
