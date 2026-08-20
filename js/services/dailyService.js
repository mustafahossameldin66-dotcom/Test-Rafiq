const DailyService = {
    pools: {
        hadith: [{ text: 'من يرد الله به خيرًا يفقهه في الدين', ref: 'صحيح البخاري · 71' }, { text: 'أحب الأعمال إلى الله أدومها وإن قل', ref: 'صحيح البخاري · 6465' }, { text: 'يسروا ولا تعسروا، وبشروا ولا تنفروا', ref: 'صحيح البخاري · 69' }],
        dua: [{ text: 'اللهم أعنّي على ذكرك وشكرك وحسن عبادتك', ref: 'دعاء مأثور' }, { text: 'رب اشرح لي صدري ويسر لي أمري', ref: 'طه · 25–26' }],
        qudsi: { text: 'يا عبادي إني حرمت الظلم على نفسي فلا تظالموا', ref: 'صحيح مسلم · 2577' },
        athar: [{ type: 'آية', text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', ref: 'طه: 114' }, { type: 'حديث نبوي', text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', ref: 'متفق عليه' }]
    },
    getRitualMoment(date = new Date()) { const mins = date.getHours() * 60 + date.getMinutes(); const boundary = StorageManager.get('maghribMinutes') || 18 * 60; return mins >= boundary ? new Date(date) : new Date(date.getTime() - 86400000); },
    getRitualKey() { const d = this.getRitualMoment(); return `hijri-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
    getRitualLabel() { try { return new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(this.getRitualMoment()); } catch { return 'اليوم'; } },
    getDailyContent() {
        const key = this.getRitualKey(); let cache = StorageManager.get('dailyHome');
        if (!cache || cache.key !== key) {
            const seed = key.split('').reduce((n, c) => ((n * 31 + c.charCodeAt(0)) >>> 0), 11);
            const surahs = QuranService.isLoaded ? QuranService.getAllSurahs() : [];
            let verse = { text: 'وَقُلْ رَبِّ زِدْنِي عِلْمًا', ref: 'طه · آية 114', s: 20, a: 114 };
            if (surahs.length > 0) { const s = surahs[seed % surahs.length]; const v = s.verses[seed % (s.verses.length || 1)]; verse = { text: v.text, ref: `${s.name} · آية ${v.a}`, s: s.number || surahs.indexOf(s) + 1, a: v.a }; }
            cache = { key, verse, hadith: this.pools.hadith[seed % this.pools.hadith.length], dua: this.pools.dua[seed % this.pools.dua.length], qudsi: this.pools.qudsi, reason: { text: 'لم يرد سبب نزول محدد، تُحمل على ظاهرها.', ref: 'تفسير عام' } };
            StorageManager.set('dailyHome', cache);
        }
        return cache;
    },
    getAtharHistory() { return StorageManager.get('atharHistory') || []; },
    saveAthar(note, action, atharData) {
        let history = this.getAtharHistory();
        history.unshift({ type: atharData.type, text: atharData.text, ref: atharData.ref, note, action, time: Date.now() });
        StorageManager.set('atharHistory', history.slice(0, 50));
        document.dispatchEvent(new CustomEvent('activityLogged', { detail: { type: 'athar', amount: 1 } }));
    },
    clearAtharHistory() { StorageManager.set('atharHistory', []); }
};
