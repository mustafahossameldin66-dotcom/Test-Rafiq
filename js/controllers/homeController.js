const HomeController = {
    init() {
        this.bindEvents();
        if (document.body.dataset.view === 'home' || document.body.dataset.view === 'athar') this.render();
        this.checkWelcomeScreen();
        document.addEventListener('visibilitychange', () => { if (!document.hidden) this.render(); });
    },
    bindEvents() {
        document.addEventListener('viewChanged', (e) => { if (['home', 'athar'].includes(e.detail.view)) this.render(); });
        Utils.delegate('click', '#welcomeScreen', '#closeWelcomeBtn', () => this.closeWelcome());
        Utils.$('#welcomeScreen')?.addEventListener('click', (e) => { if (e.target.id === 'welcomeScreen') this.closeWelcome(); });
        Utils.delegate('click', '#view-athar', '#newAthar', () => this.renderAtharCard());
        Utils.delegate('click', '#view-athar', '#saveAthar', () => this.saveAtharFromUI());
        Utils.delegate('click', '#view-athar', '#clearAtharHistory', () => { DailyService.clearAtharHistory(); this.renderAtharMemory(); Utils.toast('تم مسح سجل الأثر ✅'); });
        Utils.delegate('click', '#charityCard', '#charityDone', (e, btn) => { document.dispatchEvent(new CustomEvent('activityLogged', { detail: { type: 'athar', amount: 1 } })); btn.textContent = '✓ تم تسجيل دعاء اليوم'; Utils.toast('ربنا يفرّج عنه ويحفظ والديك 🤍'); });
        document.addEventListener('planUpdated', () => this.updateDashboardStats());
        document.addEventListener('activityLogged', () => this.updateDashboardStats());
        document.addEventListener('hifzUpdated', () => this.updateDashboardStats());
    },
    render() { this.renderDailyCards(); this.renderAtharCard(); this.renderAtharMemory(); this.updateDashboardStats(); },
    renderDailyCards() {
        const content = DailyService.getDailyContent(), set = (id, val) => { if (Utils.$(`#${id}`)) Utils.$(`#${id}`).textContent = val; };
        set('homeDailyDate', DailyService.getRitualLabel());
        const h = new Date().getHours(), greeting = h < 5 ? 'ليلة هادئة' : h < 12 ? 'صباح الخير' : h < 18 ? 'يوم طيب' : 'مساء الخير', name = StorageManager.get('name') || '';
        set('dailyWelcomeTitle', name ? `أهلًا يا ${name}` : 'أهلًا بك في رفيق القرآن'); set('homeDailyGreeting', `${greeting}، خطوة هادئة مع كتاب الله تكفي لتصنع فرقًا.`);
        set('homeDailyAyah', content.verse.text); set('homeDailyAyahRef', content.verse.ref); set('homeDailyHadith', content.hadith.text); set('homeDailyHadithRef', content.hadith.ref); set('homeDailyQudsi', `«${content.qudsi.text}»`); set('homeDailyReason', content.reason.text);
        const q = content.athar || DailyService.pools.athar[0];
        set('homeQuote', q.text); set('homeQuoteRef', `${q.type} · ${q.ref}`);
    },
    updateDashboardStats() {
        const streak = StorageManager.get('streak') || 0, planPercent = typeof PlanService !== 'undefined' ? PlanService.getPercent() : 0, savedSurahs = typeof HifzService !== 'undefined' ? HifzService.getTotalSaved() : 0;
        const set = (id, val) => { if (Utils.$(`#${id}`)) Utils.$(`#${id}`).textContent = val; };
        set('homePct', `${planPercent}%`); if (Utils.$('#homeOrb')) Utils.$('#homeOrb').style.setProperty('--p', `${planPercent}%`);
        set('homeFlame', `${streak} يوم`); set('heroFlameValue', `${streak} يوم`); set('homeMemProgress', `${savedSurahs} / 114`); set('homePlanProgress', typeof PlanService !== 'undefined' && PlanService.getPlan().goal ? `${planPercent}%` : '—');
        const plan = typeof PlanService !== 'undefined' ? PlanService.getPlan() : {};
        if (plan.daily) { set('statWard', `${plan.daily} ${plan.unit || ''}`); } else { if (Utils.$('#statWard')) Utils.$('#statWard').innerHTML = '<button class="inline-cta" data-go="plan" type="button">حدد وردك اليوم</button>'; }
        set('statSessions', StorageManager.get('sessions') || 0); set('statStreak', streak);
        const last = StorageManager.get('last');
        if (typeof QuranService !== 'undefined' && QuranService.isLoaded && last?.s) { set('statLast', `${QuranService.getSurah(last.s)?.name || 'غير محدد'} · آية ${last.a || '—'}`); }
    },
    checkWelcomeScreen() {
        const key = DailyService.getRitualKey(), lastSeen = StorageManager.get('welcomeSeenKey');
        if (lastSeen !== key) {
            const screen = Utils.$('#welcomeScreen'); if (!screen) return;
            const content = DailyService.getDailyContent();
            if (Utils.$('#welcomeAyahText')) Utils.$('#welcomeAyahText').textContent = content.verse.text;
            if (Utils.$('#welcomeAyahRef')) Utils.$('#welcomeAyahRef').textContent = content.verse.ref;
            if (Utils.$('#welcomeHadith')) Utils.$('#welcomeHadith').textContent = content.hadith.text;
            if (Utils.$('#welcomeHadithRef')) Utils.$('#welcomeHadithRef').textContent = content.hadith.ref;
            if (Utils.$('#welcomeDua')) Utils.$('#welcomeDua').textContent = content.dua.text;
            if (Utils.$('#welcomeDuaRef')) Utils.$('#welcomeDuaRef').textContent = content.dua.ref;
            screen.classList.remove('hidden', 'leaving'); screen.setAttribute('aria-hidden', 'false'); document.body.classList.add('welcome-lock');
        }
    },
    closeWelcome() {
        const screen = Utils.$('#welcomeScreen'); if (!screen) return;
        StorageManager.set('welcomeSeenKey', DailyService.getRitualKey());
        screen.classList.add('leaving');
        setTimeout(() => { screen.classList.add('hidden'); screen.classList.remove('leaving'); screen.setAttribute('aria-hidden', 'true'); document.body.classList.remove('welcome-lock'); }, 420);
    },
    renderAtharCard() {
        const pool = DailyService.pools.athar, idx = Math.floor(Math.random() * pool.length); this.currentAthar = pool[idx];
        if (Utils.$('#atharText')) Utils.$('#atharText').textContent = this.currentAthar.text; if (Utils.$('#atharRef')) Utils.$('#atharRef').textContent = this.currentAthar.ref; if (Utils.$('#atharType')) Utils.$('#atharType').textContent = this.currentAthar.type;
        if (Utils.$('#atharNote')) Utils.$('#atharNote').value = ''; if (Utils.$('#atharAction')) Utils.$('#atharAction').value = '';
    },
    saveAtharFromUI() {
        const note = Utils.$('#atharNote')?.value.trim(), action = Utils.$('#atharAction')?.value.trim();
        if (!note && !action) return Utils.toast('اكتب فكرة أو خطوة واحدة أولاً');
        DailyService.saveAthar(note, action, this.currentAthar || DailyService.pools.athar[0]);
        this.renderAtharMemory(); Utils.$('#atharNote').value = ''; Utils.$('#atharAction').value = ''; Utils.toast('اتحفظ الأثر في رحلتك ✅');
    },
    renderAtharMemory() {
        const list = Utils.$('#atharMemoryList'); if (!list) return;
        const history = DailyService.getAtharHistory(), escape = (str) => str ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
        if (!history.length) return list.innerHTML = '<div class="athar-memory-empty">لسه مفيش أثر محفوظ. اكتب فكرتك واضغط «حفظ الفكرة».</div>';
        list.innerHTML = history.slice(0, 10).map(item => `<article class="athar-memory-item"><div class="athar-memory-icon">${item.type === 'حديث قدسي' ? '🌙' : item.type === 'حديث نبوي' ? '🌿' : '✨'}</div><div><strong>${escape(item.text)}</strong><p>${escape(item.note || 'بدون ملاحظة')}</p>${item.action ? `<p>🧭 ${escape(item.action)}</p>` : ''}</div><span class="athar-memory-meta">${new Date(item.time).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span></article>`).join('');
    }
};
document.addEventListener('DOMContentLoaded', () => HomeController.init());
