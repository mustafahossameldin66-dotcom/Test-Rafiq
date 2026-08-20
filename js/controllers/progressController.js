const ProgressController = {
    isRendered: false,
    init() {
        this.bindEvents();
        if (document.body.dataset.view === 'progress') this.renderAll();
    },
    bindEvents() {
        document.addEventListener('activityLogged', (e) => {
            ActivityService.logActivity(e.detail.type, e.detail.amount);
            if (document.body.dataset.view === 'progress') this.renderAll(); else this.isRendered = false;
        });
        document.addEventListener('viewChanged', (e) => { if (e.detail.view === 'progress' && !this.isRendered) this.renderAll(); });
        document.addEventListener('planUpdated', () => { this.isRendered = false; });
        document.addEventListener('hifzUpdated', () => { this.isRendered = false; });
    },
    renderAll() { this.updateKPIs(); this.drawActivityChart(); this.drawHeatmap(); this.drawWeekDetails(); this.updateForecast(); this.drawJourneyBars(); this.isRendered = true; },
    updateKPIs() {
        const streak = StorageManager.get('streak') || 0, bestStreak = StorageManager.get('bestStreak') || 0, savedSurahs = typeof HifzService !== 'undefined' ? HifzService.getTotalSaved() : 0, planPercent = typeof PlanService !== 'undefined' ? PlanService.getPercent() : 0, hasPlan = typeof PlanService !== 'undefined' && !!PlanService.getPlan().goal;
        const recentWeek = ActivityService.getRecentDays(7), activeDays = recentWeek.filter(day => day.score > 0).length, totalSessions = recentWeek.reduce((sum, day) => sum + day.sessions, 0);
        const set = (id, val) => { if (Utils.$(`#${id}`)) Utils.$(`#${id}`).textContent = val; };
        set('progressFlame', `${streak} يوم`); set('progressBest', `أفضل سلسلة: ${bestStreak} يوم`); set('progressMem', `${savedSurahs} / 114`); set('progressMemRemain', `باقي ${114 - savedSurahs} سورة`); set('progressPlanPct', hasPlan ? `${planPercent}%` : '—'); set('progressActiveDays', `${activeDays} يوم`); set('progressSessions7', `${totalSessions} جلسة خلال 7 أيام`);
    },
    drawActivityChart() {
        const canvas = Utils.$('#activityChart'); if (!canvas) return; const rect = canvas.getBoundingClientRect(); if (rect.width === 0) return;
        const w = Math.max(320, Math.floor(rect.width)), h = 290, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = w * dpr; canvas.height = h * dpr; const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
        const recentData = ActivityService.getRecentDays(30).map(d => d.score), maxScore = Math.max(8, ...recentData), px = 20, pt = 22, pb = 34;
        ctx.strokeStyle = 'rgba(233, 205, 112, 0.08)'; ctx.lineWidth = 1;
        for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(px, pt + (h - pt - pb) * (j / 3)); ctx.lineTo(w - px, pt + (h - pt - pb) * (j / 3)); ctx.stroke(); }
        const grad = ctx.createLinearGradient(0, pt, 0, h - pb); grad.addColorStop(0, 'rgba(244, 220, 134, 0.24)'); grad.addColorStop(1, 'rgba(52, 214, 162, 0.02)'); ctx.fillStyle = grad; ctx.beginPath();
        recentData.forEach((score, i) => { const x = px + i * (w - px * 2) / 29, y = h - pb - (score / maxScore) * (h - pt - pb); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.lineTo(w - px, h - pb); ctx.lineTo(px, h - pb); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#f4dc86'; ctx.lineWidth = 2.2; ctx.beginPath();
        recentData.forEach((score, i) => { const x = px + i * (w - px * 2) / 29, y = h - pb - (score / maxScore) * (h - pt - pb); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke();
        ctx.fillStyle = '#f4dc86';
        recentData.forEach((score, i) => { if (score <= 0) return; const x = px + i * (w - px * 2) / 29, y = h - pb - (score / maxScore) * (h - pt - pb); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); });
    },
    drawHeatmap() {
        const heatContainer = Utils.$('#activityHeatmap'); if (!heatContainer) return;
        heatContainer.innerHTML = ActivityService.getRecentDays(90).map(day => `<div class="heat-cell ${day.score >= 10 ? 'l4' : day.score >= 6 ? 'l3' : day.score >= 2 ? 'l2' : day.score > 0 ? 'l1' : ''}" title="${day.date} · نشاط ${Math.round(day.score)}"></div>`).join('');
    },
    drawWeekDetails() {
        const wdContainer = Utils.$('#weekDetail'); if (!wdContainer) return;
        wdContainer.innerHTML = ActivityService.getRecentDays(7).map(day => `<article class="week-detail-row"><div class="week-day-badge"><strong>${day.name}</strong><small>${day.date}</small></div><div class="week-progress-stack"><div class="mini-track"><i style="width: ${Math.min(100, Math.round((day.score / 8) * 100))}%"></i></div><div class="week-metrics"><span>📖 ${day.read}</span><span>🎧 ${day.sessions}</span><span>✨ ${day.mem}</span><span>🪶 ${day.athar}</span></div></div><div class="day-score"><b>${Math.round(day.score)}</b><small>نشاط</small></div></article>`).join('');
    },
    updateForecast() {
        const finishContainer = Utils.$('#finishForecast'); if (!finishContainer || typeof PlanService === 'undefined') return;
        const hasPlan = !!PlanService.getPlan().goal, forecast = PlanService.getForecast(), pct = PlanService.getPercent();
        finishContainer.innerHTML = hasPlan ? `<div class="forecast-orb" style="--ring: ${pct}%"><div><strong>${pct}%</strong><span>التزام</span></div></div><strong>${forecast.text}</strong><p>${forecast.detail}</p><span class="badge">المتبقي: ${PlanService.getPlan().remaining ?? PlanService.getPlan().goal} ${PlanService.getPlan().unit || ''}</span>` : `<div class="forecast-orb empty"><div><strong>—</strong><span>خطة</span></div></div><strong>ابدأ بخطة</strong><p>بمجرد تحديد الهدف والمعدل اليومي سترى هنا تقديراً واضحاً لموعد الانتهاء.</p><button class="btn primary" type="button" data-go="plan">افتح الخطة</button>`;
    },
    drawJourneyBars() {
        const jContainer = Utils.$('#journeyBars'); if (!jContainer) return;
        const savedSurahs = typeof HifzService !== 'undefined' ? HifzService.getTotalSaved() : 0, avgScore = ActivityService.getRecentDays(7).reduce((sum, day) => sum + day.score, 0) / 7, weekPct = Math.min(100, Math.round((avgScore / 8) * 100));
        let savedAyahs = 0, totalAyahs = 6236, juzEquivalent = 0;
        if (typeof QuranService !== 'undefined' && QuranService.isLoaded) {
            const memArr = HifzService.getMemorized(); totalAyahs = 0;
            QuranService.getAllSurahs().forEach((s, i) => { const count = s.verses?.length || s.count || 0; totalAyahs += count; if (memArr.includes(i + 1)) savedAyahs += count; });
            juzEquivalent = Math.max(0, Math.min(30, (savedAyahs / totalAyahs) * 30));
        }
        jContainer.innerHTML = `<div class="journey-row"><b>حفظ السور</b><div class="journey-track"><i style="width: ${Math.round((savedSurahs / 114) * 100)}%"></i></div><span>${savedSurahs}/114 سورة</span></div><div class="journey-row"><b>الآيات المحفوظة</b><div class="journey-track"><i style="width: ${Math.round((savedAyahs / totalAyahs) * 100)}%"></i></div><span>${savedAyahs.toLocaleString('ar-EG')} آية</span></div><div class="journey-row"><b>مقدار الأجزاء</b><div class="journey-track"><i style="width: ${Math.round((juzEquivalent / 30) * 100)}%"></i></div><span>≈ ${juzEquivalent.toFixed(juzEquivalent % 1 ? 1 : 0)} / 30</span></div><div class="journey-row"><b>نشاط الأسبوع</b><div class="journey-track"><i style="width: ${weekPct}%"></i></div><span>${weekPct}%</span></div>`;
    }
};
document.addEventListener('DOMContentLoaded', () => ProgressController.init());
