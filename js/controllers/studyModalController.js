const StudyModalController = {
    init() { this.modal = Utils.$('#rafiqStudyModal'); this.body = Utils.$('#rafiqStudyModalBody'); this.bindEvents(); },
    tabMap: { 'التفسير': 'tafsir', 'التجويد': 'tajweed', 'غريب القرآن': 'words', 'أسباب النزول': 'asbab', 'summary': 'summary', 'tafsir': 'tafsir', 'tajweed': 'tajweed', 'words': 'words', 'asbab': 'asbab' },
    bindEvents() {
        Utils.delegate('click', '#rafiqStudyModal', '#rafiqStudyModalClose', () => this.close());
        this.modal?.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.modal?.classList.contains('open')) this.close(); });
        Utils.delegate('click', '#rafiqStudyModal', '.study-tab', (e, btn) => this.switchTab(btn.dataset.studyView));
        document.addEventListener('openAyahStudy', (e) => this.open(e.detail.surah, e.detail.ayah, e.detail.tab));
        Utils.delegate('click', '#rafiqStudyModalBody', '[data-speak-word]', (e, btn) => this.pronounceWord(btn.dataset.speakWord));
        Utils.delegate('click', '#rafiqStudyModalBody', '#studyPlayNow', () => { if (typeof AudioController !== 'undefined') AudioController.playFromUI(this.currentSurah, this.currentAyah); });
        Utils.delegate('click', '#rafiqStudyModalBody', '#studyChangeReciter', () => Utils.$('#settingsReciterSelect')?.focus());
    },
    open(surah, ayah, rawTab = 'summary') {
        this.currentSurah = surah; this.currentAyah = ayah; this.currentTab = this.tabMap[rawTab] || 'summary';
        const verse = QuranService.getVerse(surah, ayah); const surahData = QuranService.getSurah(surah);
        if (Utils.$('#rafiqStudyModalTitle')) Utils.$('#rafiqStudyModalTitle').textContent = `📚 دراسة ${surahData?.name || 'الآية'} · ${ayah}`;
        if (Utils.$('#rafiqStudyModalSub')) Utils.$('#rafiqStudyModalSub').textContent = verse ? verse.text : '';
        this.modal?.classList.add('open'); this.modal?.setAttribute('aria-hidden', 'false'); this.renderCurrentTab();
    },
    close() { this.modal?.classList.remove('open'); this.modal?.setAttribute('aria-hidden', 'true'); },
    switchTab(tabName) { this.currentTab = this.tabMap[tabName] || 'summary'; this.renderCurrentTab(); },
    escapeHtml(unsafe) { return (unsafe||'').toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); },
    async renderCurrentTab() {
        if (!this.body) return;
        Utils.$$('.study-tab', this.modal).forEach(btn => btn.classList.toggle('active', btn.dataset.studyView === this.currentTab));
        const verse = QuranService.getVerse(this.currentSurah, this.currentAyah); const surahData = QuranService.getSurah(this.currentSurah);
        if (['tafsir', 'tajweed'].includes(this.currentTab)) this.body.innerHTML = '<div class="study-info-card"><p>جارٍ التحميل...</p></div>';
        try {
            if (this.currentTab === 'tafsir') { const data = await StudyService.getTafsir(this.currentSurah, this.currentAyah); this.body.innerHTML = `<article class="study-info-card"><h4>📖 التفسير الميسر</h4><p>${this.escapeHtml(data.text)}</p></article>`; }
            else if (this.currentTab === 'tajweed') { const data = await StudyService.getTajweed(this.currentSurah, this.currentAyah); this.body.innerHTML = `<div class="study-verse-hero"><div class="tajweed-verse">${data.text.replace(/<tajweed\s+class="?([\w_]+)"?>([\s\S]*?)<\/tajweed>/gi, (_, c, t) => `<span class="${/ghn/i.test(c)?'tw-ghn':/qlq/i.test(c)?'tw-qalqalah':/idgh/i.test(c)?'tw-idgham':/ikhf/i.test(c)?'tw-ikhfa':/iqlb/i.test(c)?'tw-iqlab':/madda/i.test(c)?'tw-madda':'tw-silent'}" title="${c}">${t}</span>`).replace(/<span class="end">([\s\S]*?)<\/span>/gi, '<span>$1</span>')}</div></div><div class="tajweed-legend"><span class="tw-ghn">● غنة</span><span class="tw-qalqalah">● قلقلة</span><span class="tw-idgham">● إدغام</span><span class="tw-ikhfa">● إخفاء</span><span class="tw-iqlab">● إقلاب</span><span class="tw-madda">● مد</span><span class="tw-silent">● وقف/صامت</span></div>`; }
            else if (this.currentTab === 'words') { const words = (verse?.text || '').replace(/﴿|﴾/g, '').split(/\s+/).filter(Boolean); this.body.innerHTML = `<div class="study-info-card"><h4>🔎 الكلمات والنطق</h4><div class="word-grid">${words.map(w => `<div class="word-chip"><span>${this.escapeHtml(w)}</span><button type="button" data-speak-word="${this.escapeHtml(w)}">🔊</button></div>`).join('')}</div></div>`; }
            else if (this.currentTab === 'asbab') { this.body.innerHTML = `<div class="study-info-card"><h4>📜 سبب النزول</h4><p>يرجى مراجعة كتاب أسباب النزول للواحدي من قسم الدراسة للتحقق من الروايات.</p></div>`; }
            else {
                const prefs = StorageManager.get('prefs') || {}; const reciterObj = AudioService.reciters.find(r => r.folder === (prefs.reciter||'')); const reciterName = reciterObj ? reciterObj.name : 'لم يتم اختيار قارئ بعد';
                this.body.innerHTML = `<div class="study-verse-hero"><div class="arabic">${this.escapeHtml(verse?.text)}</div><div class="ref">${this.escapeHtml(surahData?.name)} · الآية ${this.currentAyah}</div></div><div class="study-info-grid"><article class="study-info-card"><h4>🔊 الاستماع</h4><button class="btn primary" type="button" id="studyPlayNow">▶ استمع للآية</button></article><article class="study-info-card"><h4>🎙️ القارئ المثبت</h4><p>${this.escapeHtml(reciterName)}</p></article></div>`;
            }
        } catch (error) { this.body.innerHTML = `<div class="study-info-card"><p>تعذر تحميل البيانات. تأكد من اتصالك بالإنترنت.</p></div>`; }
    },
    pronounceWord(word) { try { const u = new SpeechSynthesisUtterance(word); u.lang = 'ar-SA'; u.rate = 0.72; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch(e) {} }
};
document.addEventListener('DOMContentLoaded', () => StudyModalController.init());
