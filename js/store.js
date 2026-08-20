const STORAGE_KEY = 'rafiq-state-final';
const LEGACY_STATE_KEYS = ['rafiq-state-v85', 'rafiq-clean-v58-state', 'rafiq-fusion-state-v31', 'rafiq-zero-state-v5'];
const LEGACY_HIFZ_KEYS = ['rafiq-hifz-fusion-v34', 'rafiq-hifz-fusion-v31', 'rafiq-hifz-v1', 'rafiq-hifz-v2'];
const DEFAULT_STATE = { plan: {}, last: { s: 1, a: 1 }, athar: { note: '', action: '', saved: [] }, prefs: { motion: true, ocean: true, light: false, style: 'balanced', surface: 'balanced', performance: 'auto', fontSize: 'normal', contrast: false }, sessions: 0, streak: 0, bestStreak: 0, activityLog: {}, hifz: [], dailyHome: null, welcomeDaily: null, welcomeSeen: false };

const StorageManager = {
    state: null,
    init() {
        this.state = this.read(STORAGE_KEY);
        if (!this.state) this.migrateLegacyData();
        this.state = { ...DEFAULT_STATE, ...this.state, prefs: { ...DEFAULT_STATE.prefs, ...(this.state.prefs || {}) }, athar: { ...DEFAULT_STATE.athar, ...(this.state.athar || {}) }, hifz: Array.isArray(this.state.hifz) ? this.state.hifz : [] };
        this.save();
    },
    read(key) { try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : null; } catch (e) { return null; } },
    save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch (e) {} },
    migrateLegacyData() {
        let mergedState = { ...DEFAULT_STATE };
        const legacyState = LEGACY_STATE_KEYS.map(k => this.read(k)).find(Boolean);
        if (legacyState) mergedState = { ...mergedState, ...legacyState };
        const legacyHifz = LEGACY_HIFZ_KEYS.map(k => this.read(k)).find(v => Array.isArray(v));
        if (legacyHifz) mergedState.hifz = legacyHifz;
        [...LEGACY_STATE_KEYS, ...LEGACY_HIFZ_KEYS, 'rafiq-home-daily-v82', 'rafiq-welcome-daily-v83', 'rafiq-welcome-seen-v70'].forEach(k => localStorage.removeItem(k));
        this.state = mergedState;
    },
    get(key) { return this.state[key]; },
    set(key, value) { this.state[key] = value; this.save(); },
    updatePrefs(newPrefs) { this.state.prefs = { ...this.state.prefs, ...newPrefs }; this.save(); }
};
StorageManager.init();
