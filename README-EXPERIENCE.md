# Rafiq Experience Build

This is the responsive experience build based on the feature-rich V90 baseline, with platform-specific navigation:
- Desktop: fixed premium side navigation.
- Tablet: adaptive sticky navigation.
- Mobile: bottom navigation optimized for touch.
- Reduced paint/motion on small or lower-power devices.
- Keyboard shortcuts 1–7 map to the main sections on desktop.

## Run on Windows
1. Open PowerShell in this folder.
2. Run `python -m http.server 8787`.
3. Open `http://127.0.0.1:8787` on the computer.

For mobile evaluation on the same Wi‑Fi, use the computer LAN address with port 8787, for example `http://192.168.1.10:8787`.

The app is a responsive PWA/web experience and preserves the V90 feature set and content catalog. Content assets that are online/optional remain online or become locally cached when the app supports/downloads them.
