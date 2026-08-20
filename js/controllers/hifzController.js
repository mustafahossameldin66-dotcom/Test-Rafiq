const HifzController = {
    init() {
        this.skyContainer = Utils.$('#hifzSky');
        this.bindEvents();
        if (document.body.dataset.view === 'galaxy') this.renderGalaxy();
    },
    bindEvents() {
        document.addEventListener('viewChanged', (e) => { if (e.detail.view === 'galaxy' && !this.isRendered) this.renderGalaxy(); });
        Utils.delegate('click', '#hifzSky', '.hifz-star', (e, star) => {
            const surahNum = Number(star.dataset.surah);
            const isSaved = HifzService.toggleSurah(surahNum);
            star.classList.toggle('active', isSaved);
            Utils.toast(isSaved ? 'اكتمل حفظ السورة ✦' : 'أُزيلت علامة حفظ السورة');
        });
        document.addEventListener('hifzUpdated', (e) => { this.updateGalaxyMeter(); this.syncSpecificStar(e.detail.surah, e.detail.isSaved); });
        Utils.delegate('click', '#view-quran', '#markSurahMemorized', () => {
            if (typeof QuranController !== 'undefined') HifzService.toggleSurah(QuranController.currentSurah);
        });
        document.addEventListener('surahRendered', (e) => {
            const btn = Utils.$('#markSurahMemorized'), stateEl = Utils.$('#surahHifzState');
            if (!btn || !stateEl) return;
            const active = HifzService.isMemorized(e.detail.surah);
            btn.textContent = active ? '✦ السورة محفوظة' : '✦ حفظت السورة';
            btn.classList.toggle('primary', !active);
            stateEl.textContent = active ? 'نجمتها مضيئة في مجرة الحفظ' : 'لم تُعلّم كمحفوظة بعد';
            stateEl.classList.toggle('is-on', active);
        });
    },
    renderGalaxy() {
        if (!this.skyContainer) return;
        const rings = [6, 12, 18, 24, 30, 24], radii = [8.5, 14.5, 21.5, 29.5, 37.5, 46.5], positions = [];
        rings.forEach((count, ring) => { for (let j = 0; j < count; j++) { const theta = (j / count) * Math.PI * 2 + ring * 0.045; const petal = 1 + 0.12 * Math.cos(theta * 6); const r = radii[ring] * petal; positions.push({ x: 50 + Math.cos(theta) * r, y: 50 + Math.sin(theta) * r * 0.70, spin: (theta * 180 / Math.PI + ring * 11 + j * 2) % 360, scale: (0.78 + ((j + ring * 3) % 8) * 0.045).toFixed(2) }); } });
        const memorized = HifzService.getMemorized();
        this.skyContainer.innerHTML = Array.from({ length: 114 }, (_, i) => {
            const surahNum = i + 1, pos = positions[i], isActive = memorized.includes(surahNum), delay = ((i % 37) * -0.16).toFixed(2), duration = (6.8 + (i % 6) * 0.55).toFixed(2);
            return `<span class="hifz-star ${isActive ? 'active' : ''}" role="button" data-surah="${surahNum}" style="left: ${Math.max(5, Math.min(95, pos.x))}%; top: ${Math.max(8, Math.min(92, pos.y))}%; --delay: ${delay}s; --spin: ${pos.spin.toFixed(1)}deg; --scale: ${pos.scale}; --duration: ${duration}s"><span aria-hidden="true"></span></span>`;
        }).join('');
        this.isRendered = true; this.updateGalaxyMeter();
    },
    syncSpecificStar(surahNum, isSaved) {
        if (!this.isRendered) return;
        const star = Utils.$(`.hifz-star[data-surah="${surahNum}"]`, this.skyContainer);
        if (star) star.classList.toggle('active', isSaved);
        if (typeof QuranController !== 'undefined' && QuranController.currentSurah === surahNum) {
            document.dispatchEvent(new CustomEvent('surahRendered', { detail: { surah: surahNum } }));
        }
    },
    updateGalaxyMeter() {
        const total = HifzService.getTotalSaved(), pct = Math.round((total / 114) * 100);
        if (Utils.$('#hifzProgress')) Utils.$('#hifzProgress').textContent = `${total} / 114 محفوظة`;
        if (Utils.$('#galaxyMeter')) Utils.$('#galaxyMeter').textContent = `${pct}%`;
    }
};
document.addEventListener('DOMContentLoaded', () => HifzController.init());
