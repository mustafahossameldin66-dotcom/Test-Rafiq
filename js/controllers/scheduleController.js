const ScheduleController = {
    init() { this.bindEvents(); if (document.body.dataset.view === 'schedule') this.render(); },
    bindEvents() {
        document.addEventListener('viewChanged', (e) => { if (e.detail.view === 'schedule') this.render(); });
        Utils.delegate('click', '#view-schedule', '#addSchedule', () => { const title = prompt('اسم المحطة؟'); if (!title) return; const time = prompt('الوقت أو الوصف؟', 'بعد الفجر'); ScheduleService.addSchedule(title, time); this.render(); Utils.toast('تمت إضافة المحطة'); });
        Utils.delegate('click', '#view-schedule', '[data-del-s]', (e, btn) => { ScheduleService.removeSchedule(Number(btn.dataset.delS)); this.render(); });
        Utils.delegate('click', '#view-schedule', '#addReminder', () => { const title = prompt('عنوان التذكير؟'); if (!title) return; const time = prompt('الوقت؟', '20:00'); ScheduleService.addReminder(title, time); this.render(); Utils.toast('تمت إضافة التذكير'); });
        Utils.delegate('click', '#view-schedule', '[data-del-r]', (e, btn) => { ScheduleService.removeReminder(Number(btn.dataset.delR)); this.render(); });
        Utils.delegate('click', '#view-schedule', '#notifyPermission', async () => { if (!('Notification' in window)) return Utils.toast('الإشعارات غير مدعومة هنا'); const p = await Notification.requestPermission(); Utils.toast(p === 'granted' ? 'الإشعارات مفعلة ✅' : 'لم يتم منح الإذن'); });
    },
    render() {
        const sList = Utils.$('#scheduleList'), rList = Utils.$('#reminderList'), esc = (str) => str ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
        if (sList) sList.innerHTML = ScheduleService.getSchedule().map((x, i) => `<div class="schedule-item"><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div><button class="btn" data-del-s="${i}">حذف</button></div>`).join('');
        if (rList) { const r = ScheduleService.getReminders(); rList.innerHTML = r.length ? r.map((x, i) => `<div class="schedule-item"><div><b>${esc(x.title)}</b><small>${esc(x.time || 'وقت مرن')}</small></div><button class="btn" data-del-r="${i}">حذف</button></div>`).join('') : '<div class="muted">لا توجد تذكيرات بعد.</div>'; }
    }
};
document.addEventListener('DOMContentLoaded', () => ScheduleController.init());
