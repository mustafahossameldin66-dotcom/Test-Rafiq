const ActivityService = {
    getDayKey(date = new Date()) { const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().split('T')[0]; },
    getLog() { return StorageManager.get('activityLog') || {}; },
    logActivity(type = 'general', amount = 1) {
        const log = this.getLog(); const key = this.getDayKey();
        const todayData = log[key] || { read: 0, sessions: 0, mem: 0, athar: 0 };
        todayData[type] = (todayData[type] || 0) + Number(amount); todayData.last = Date.now();
        log[key] = todayData; StorageManager.set('activityLog', log);
        this.recomputeStreak();
    },
    getDayScore(dateKey) { const log = this.getLog(); const d = log[dateKey] || {}; return (d.read || 0) + (d.sessions || 0) * 2 + (d.mem || 0) * 5 + (d.athar || 0); },
    recomputeStreak() {
        let currentStreak = 0, bestStreak = StorageManager.get('bestStreak') || 0; const today = new Date();
        for (let i = 0; i < 366; i++) { const d = new Date(today); d.setDate(today.getDate() - i); if (this.getDayScore(this.getDayKey(d)) > 0) currentStreak++; else if (i > 0) break; }
        let tempRun = 0;
        for (let i = 365; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); if (this.getDayScore(this.getDayKey(d)) > 0) { tempRun++; bestStreak = Math.max(bestStreak, tempRun); } else { tempRun = 0; } }
        StorageManager.set('streak', currentStreak); StorageManager.set('bestStreak', bestStreak);
    },
    getRecentDays(daysCount = 7) {
        const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']; const today = new Date(); const out = []; const log = this.getLog();
        for (let i = daysCount - 1; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); const key = this.getDayKey(d); const data = log[key] || {}; out.push({ name: names[d.getDay()], date: key, score: this.getDayScore(key), read: data.read || 0, sessions: data.sessions || 0, mem: data.mem || 0, athar: data.athar || 0 }); }
        return out;
    }
};
