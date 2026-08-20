const AudioService = {
    audioElement: new Audio(), playlist: [], currentIndex: 0, currentReciter: null, currentSurah: null, isPlaying: false,
    reciters: [
        {name:'محمود خليل الحصري', folder:'Husary_128kbps', source:'everyayah', quality:'128 kbps', mode:'verse'},
        {name:'محمد صديق المنشاوي', folder:'Minshawy_Murattal_128kbps', source:'everyayah', quality:'128 kbps', mode:'verse'},
        {name:'فارس عباد', folder:'Fares_Abbad_64kbps', source:'mp3quran', server:'https://server8.mp3quran.net/frs_a/', quality:'MP3Quran', mode:'surah'},
        {name:'عبد الباسط عبد الصمد', folder:'Abdul_Basit_Murattal_192kbps', source:'everyayah', quality:'192 kbps', mode:'verse'}
    ],
    init() {
        this.audioElement.preload = 'none'; this.audioElement.crossOrigin = 'anonymous';
        this.audioElement.addEventListener('play', () => { this.isPlaying = true; this.notifyStateChange('playing'); });
        this.audioElement.addEventListener('pause', () => { this.isPlaying = false; this.notifyStateChange('paused'); });
        this.audioElement.addEventListener('ended', () => this.handleTrackEnd());
        this.audioElement.addEventListener('error', () => { this.isPlaying = false; this.notifyStateChange('error', 'تعذر تحميل التلاوة. تأكد من الاتصال بالإنترنت.'); });
        this.audioElement.addEventListener('timeupdate', () => {
             this.notifyStateChange('timeupdate', { currentTime: this.audioElement.currentTime, duration: this.audioElement.duration || 0 });
             if (this.isPlaying) this.saveState();
        });
        this.restoreState();
    },
    getAudioUrl(reciter, surah, ayah) {
        const s = String(surah).padStart(3, '0');
        if (reciter.source === 'mp3quran') return `${reciter.server}${s}.mp3`;
        return `https://everyayah.com/data/${reciter.folder}/${s}${String(ayah).padStart(3, '0')}.mp3`;
    },
    async play(reciter, surah, verseIndex = 0, resumeTime = 0, verses = []) {
        try {
            this.currentReciter = reciter; this.currentSurah = surah;
            this.playlist = reciter.mode === 'surah' ? [{ a: 1 }] : verses;
            this.currentIndex = Math.max(0, Math.min(verseIndex, Math.max(0, this.playlist.length - 1)));
            const targetVerse = this.playlist[this.currentIndex];
            if (!targetVerse) throw new Error('لا توجد آيات للتشغيل.');
            const url = this.getAudioUrl(reciter, surah, targetVerse.a);
            if (this.audioElement.src !== url) { this.audioElement.src = url; this.audioElement.load(); }
            this.audioElement.currentTime = Math.max(0, Number(resumeTime) || 0);
            await this.audioElement.play(); this.saveState();
            this.notifyStateChange('trackStarted', { reciter, surah, verse: targetVerse.a });
        } catch (error) { this.isPlaying = false; this.notifyStateChange('error', 'حدث خطأ أثناء التشغيل.'); }
    },
    pause() { this.audioElement.pause(); this.saveState(); },
    toggle() { if (this.isPlaying) this.pause(); else if (this.audioElement.src) this.audioElement.play().catch(() => this.notifyStateChange('error', 'تعذر الاستئناف.')); },
    next() {
         if (this.currentReciter?.mode === 'surah') return this.notifyStateChange('surahEndReached', { surah: this.currentSurah, action: 'next' });
         if (this.currentIndex < this.playlist.length - 1) this.play(this.currentReciter, this.currentSurah, this.currentIndex + 1, 0, this.playlist);
         else this.notifyStateChange('surahEndReached', { surah: this.currentSurah, action: 'next' });
    },
    prev() {
         if (this.currentReciter?.mode === 'surah') return this.notifyStateChange('surahEndReached', { surah: this.currentSurah, action: 'prev' });
         if (this.currentIndex > 0) this.play(this.currentReciter, this.currentSurah, this.currentIndex - 1, 0, this.playlist);
    },
    stop() { this.pause(); this.audioElement.removeAttribute('src'); this.audioElement.load(); this.isPlaying = false; this.playlist = []; this.currentIndex = 0; this.saveState(); this.notifyStateChange('stopped'); },
    handleTrackEnd() {
        if (this.currentReciter?.mode === 'surah') return this.notifyStateChange('surahEndReached', { surah: this.currentSurah, action: 'auto' });
        if (this.currentIndex < this.playlist.length - 1) { this.currentIndex++; this.play(this.currentReciter, this.currentSurah, this.currentIndex, 0, this.playlist); } 
        else this.notifyStateChange('surahEndReached', { surah: this.currentSurah, action: 'auto' });
    },
    notifyStateChange(event, payload = null) { document.dispatchEvent(new CustomEvent('audioServiceUpdate', { detail: { event, payload, state: this.getState() } })); },
    getState() { return { isPlaying: this.isPlaying, reciter: this.currentReciter, surah: this.currentSurah, verseIndex: this.currentIndex, currentTime: this.audioElement.currentTime }; },
    saveState() { if (this.currentReciter && this.currentSurah) StorageManager.set('audioPlayback', { reciterFolder: this.currentReciter.folder, surah: this.currentSurah, verseIndex: this.currentIndex, time: this.audioElement.currentTime }); },
    restoreState() { const saved = StorageManager.get('audioPlayback'); if (saved && saved.reciterFolder) this._pendingRestore = saved; }
};
AudioService.init();
