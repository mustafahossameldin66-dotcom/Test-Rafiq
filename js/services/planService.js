const PlanService = {
    getPlan() { return StorageManager.get('plan') || {}; },
    savePlan(planData) { StorageManager.set('plan', planData); },
    clearPlan() { StorageManager.set('plan', {}); },
    calculateDaily(goal, days) { return Math.ceil((goal / days) * 10) / 10; },
    getPercent() {
        const p = this.getPlan();
        if (!p.goal || !p.days) return 0;
        const remaining = p.remaining != null ? p.remaining : p.goal;
        return Math.min(100, Math.round((Math.max(0, p.goal - remaining) / p.goal) * 100));
    },
    getForecast() {
        const p = this.getPlan();
        if (!p.goal || !p.daily) return { text: 'لا توجد خطة', detail: 'أنشئ خطة لمعرفة الموعد المتوقع.' };
        const remaining = Math.max(0, Number(p.remaining != null ? p.remaining : p.goal));
        const daily = Math.max(0.01, Number(p.daily));
        const daysLeft = Math.ceil(remaining / daily);
        if (daysLeft === 0) return { text: 'اكتملت الخطة', detail: 'ما شاء الله، وصلت للهدف.' };
        const when = new Date(); when.setDate(when.getDate() + daysLeft);
        return { text: `${daysLeft} يوم تقريبًا`, detail: `لو حافظت على ${daily} ${p.unit || ''} يوميًا، فالموعد التقريبي ${when.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.` };
    }
};
