# رفيق القرآن — Modular Build

Structure:
- index.html — page markup
- css/app.css — single cleaned stylesheet
- js/app.js — core application logic
- js/sw-register.js — service worker registration
- js/daily-focus.js — small home sync
- js/daily-home.js — daily content layer
- js/wind.js — ambient wind effect
- js/study-modal.js — Quran study modal
- js/settings.js — settings helpers

Performance changes:
- cached static canvas background; dynamic layer only redraws stars/motes/comets
- lower frame rate outside the home view
- pause canvas on hidden tabs
- reduced idle polling for daily focus
- no page reload when changing performance preset

Upload the whole folder to GitHub Pages. Keep manifest.webmanifest, icon.svg, icon-192.png, and sw.js from your existing repository in the project root when present.
