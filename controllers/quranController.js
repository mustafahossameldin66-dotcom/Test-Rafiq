const QuranController = {
    currentSurah: 1,
    async init() {
        this.bindEvents();
        this.currentSurah = (StorageManager.get('last') || { s: 1 }).s;
        await QuranService.load();
        this.renderSurahGrid();
        this.renderSurah(this.currentSurah);
    },
    bindEvents() {
        Utils.$('#surahSearch')?.addEventListener('input', (e) => this.renderSurahGrid(e.target.value));
        Utils.delegate('click', '#surahGrid', '.surah-btn', (e, btn) => this.changeSurah(Number(btn.dataset.s)));
        Utils.delegate('click', '#view-quran', '#nextSurah', () => { if (this.currentSurah < QuranService.getTotalSurahs()) this.changeSurah(this.currentSurah + 1); });
        Utils.delegate('click', '#view-quran', '#prevSurah', () => { if (this.currentSurah > 1) this.changeSurah(this.currentSurah - 1); });
        Utils.delegate('click', '#view-quran', '#goLast', () => this.changeSurah((StorageManager.get('last') || { s: 1 }).s));
        Utils.delegate('click', '#ayahs', '[data-mark]', (e, btn) => this.saveBookmark(this.currentSurah, Number(btn.dataset.mark)));
        Utils.delegate('click', '#ayahs', '[data-ayah-play]', (e, btn) => { if (typeof AudioController !== 'undefined') AudioController.playFromUI(this.currentSurah, Number(btn.dataset.ayahPlay)); });
        Utils.delegate('click', '#ayahs', '[data-ayah-study]', (e, btn) => document.dispatchEvent(new CustomEvent('openAyahStudy', { detail: { surah: this.currentSurah, ayah: Number(btn.dataset.ayahStudy), tab: 'summary' } })));
        Utils.delegate('click', '.quran-study-actions', '[data-study-topic]', (e, btn) => document.dispatchEvent(new CustomEvent('openAyahStudy', { detail: { surah: this.currentSurah, ayah: (StorageManager.get('last') || { a: 1 }).a, tab: btn.dataset.studyTopic } })));
    },
    changeSurah(surahNum) {
        this.currentSurah = surahNum;
        StorageManager.set('last', { s: this.currentSurah, a: 1 });
        this.renderSurahGrid(Utils.$('#surahSearch')?.value || '');
        this.renderSurah(this.currentSurah);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    saveBookmark(surahNum, ayahNum) {
        StorageManager.set('last', { s: surahNum, a: ayahNum });
        const sessions = StorageManager.get('sessions') || 0;
        StorageManager.set('sessions', sessions + 1);
        document.dispatchEvent(new CustomEvent('activityLogged', { detail: { type: 'read', amount: 1 } }));
        Utils.toast('تم حفظ الموضع ✅');
    },
    renderSurahGrid(filterQuery = '') {
        const grid = Utils.$('#surahGrid'); if (!grid) return;
        const q = filterQuery.trim().toLowerCase();
        grid.innerHTML = QuranService.getAllSurahs().map((s, i) => ({ s, num: i + 1 })).filter(x => !q || x.s.name.includes(q) || String(x.num) === q).map(x => `<button class="surah-btn ${this.currentSurah === x.num ? 'active' : ''}" data-s="${x.num}"><b>${x.num}. ${x.s.name}</b><small>${x.s.type} · ${x.s.count} آيات</small></button>`).join('');
    },
    renderSurah(surahNum) {
        const s = QuranService.getSurah(surahNum); if (!s) return;
        if (Utils.$('#quranInfo')) Utils.$('#quranInfo').textContent = s.name;
        if (Utils.$('#surahTitle')) Utils.$('#surahTitle').textContent = s.name;
        if (Utils.$('#surahMeta')) Utils.$('#surahMeta').textContent = `${s.type} · ${s.count} آيات`;
        const ayahsContainer = Utils.$('#ayahs');
        if (ayahsContainer) {
            ayahsContainer.innerHTML = s.verses.map(v => `<article class="quran-ayah" data-ayah="${v.a}"><div class="quran-text">${v.text}</div><div class="ayah-meta"><span>${s.name} · ${v.a}</span><span>آية رقم ${v.global}</span></div><div class="ayah-actions"><button class="btn quran-ayah-btn" type="button" data-mark="${v.a}">🔖 موضع</button><button class="btn quran-ayah-btn" type="button" data-ayah-study="${v.a}">📚 دراسة الآية</button><button class="btn quran-ayah-btn" type="button" data-ayah-play="${v.a}">▶ استماع</button></div></article>`).join('');
        }
        document.dispatchEvent(new CustomEvent('surahRendered', { detail: { surah: surahNum } }));
    }
};
document.addEventListener('DOMContentLoaded', () => QuranController.init());
