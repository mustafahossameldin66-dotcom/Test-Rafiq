const PlanController = {
    init() { this.bindEvents(); if (document.body.dataset.view === 'plan') this.render(); },
    bindEvents() {
        document.addEventListener('viewChanged', (e) => { if (e.detail.view === 'plan') this.render(); });
        Utils.$('#goalUnit')?.addEventListener('change', () => this.syncUnitUI());
        Utils.delegate('click', '#view-plan', '#savePlan', () => this.savePlanFromUI());
        Utils.delegate('click', '#view-plan', '#resetPlan', () => { PlanService.clearPlan(); this.render(); Utils.toast('تمت إعادة ضبط الخطة'); document.dispatchEvent(new CustomEvent('planUpdated')); });
    },
    syncUnitUI() {
        const unit = Utils.$('#goalUnit')?.value;
        if (Utils.$('#planSurahField')) Utils.$('#planSurahField').hidden = (unit !== 'آية');
        if (unit === 'آية') {
            const sel = Utils.$('#planSurah');
            if (sel && QuranService.isLoaded) {
                sel.innerHTML = QuranService.getAllSurahs().map((s, i) => `<option value="${i + 1}">${i + 1}. ${s.name} · ${s.count} آية</option>`).join('');
                sel.value = String(PlanService.getPlan().surah || 1);
            }
        }
    },
    savePlanFromUI() {
        const goal = Number(Utils.$('#goalAmount')?.value), days = Number(Utils.$('#planDays')?.value), unit = Utils.$('#goalUnit')?.value, name = Utils.$('#planName')?.value.trim();
        if (!goal || !days) return Utils.toast('اكتب الهدف وعدد الأيام أولاً');
        let surahNum = null;
        if (unit === 'آية') {
            if (!QuranService.isLoaded) return Utils.toast('انتظر تحميل بيانات المصحف');
            surahNum = Number(Utils.$('#planSurah')?.value || 1);
            if (goal > QuranService.getSurah(surahNum).count) return Utils.toast(`سورة ${QuranService.getSurah(surahNum).name} فيها ${QuranService.getSurah(surahNum).count} آية فقط`);
        }
        const daily = PlanService.calculateDaily(goal, days);
        PlanService.savePlan({ goal, days, unit, name, daily, remaining: goal, created: Date.now(), surah: surahNum });
        this.render(); Utils.toast('تم حفظ الخطة ✅'); document.dispatchEvent(new CustomEvent('planUpdated'));
    },
    render() {
        const p = PlanService.getPlan();
        if (Utils.$('#goalAmount')) Utils.$('#goalAmount').value = p.goal || '';
        if (Utils.$('#goalUnit')) Utils.$('#goalUnit').value = p.unit || 'صفحة';
        if (Utils.$('#planDays')) Utils.$('#planDays').value = p.days || '';
        if (Utils.$('#planName')) Utils.$('#planName').value = p.name || '';
        this.syncUnitUI();
        if (Utils.$('#planGoal')) Utils.$('#planGoal').textContent = p.goal ? `${p.goal} ${p.unit}` : '—';
        if (Utils.$('#planDaily')) Utils.$('#planDaily').textContent = p.daily ? `${p.daily} ${p.unit}` : '—';
        if (Utils.$('#planRemain')) Utils.$('#planRemain').textContent = p.remaining != null ? `${p.remaining} ${p.unit}` : '—';
        if (Utils.$('#planDaysView')) Utils.$('#planDaysView').textContent = p.days ? `${p.days} يوم` : '—';
        if (Utils.$('#planBar')) Utils.$('#planBar').style.width = PlanService.getPercent() + '%';
    }
};
document.addEventListener('DOMContentLoaded', () => PlanController.init());
