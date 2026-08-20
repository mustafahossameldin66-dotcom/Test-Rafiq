const ScheduleService = {
    getSchedule() { return StorageManager.get('schedule') || [['ورد القرآن', 'صباحًا'], ['مراجعة', 'مساءً']]; },
    addSchedule(title, time) { const s = this.getSchedule(); s.push([title, time || 'مرن']); StorageManager.set('schedule', s); },
    removeSchedule(index) { const s = this.getSchedule(); s.splice(index, 1); StorageManager.set('schedule', s); },
    getReminders() { return StorageManager.get('reminders') || []; },
    addReminder(title, time) { const r = this.getReminders(); r.push({ title, time }); StorageManager.set('reminders', r); },
    removeReminder(index) { const r = this.getReminders(); r.splice(index, 1); StorageManager.set('reminders', r); }
};
