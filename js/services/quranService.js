const QuranService = {
    data: [], isLoaded: false, _loadPromise: null,
    async load() {
        if (this.isLoaded) return this.data;
        if (this._loadPromise) return this._loadPromise;
        this._loadPromise = fetch('quran-uthmani.json').then(res => res.json()).then(json => {
            this.data = json; this.isLoaded = true; return this.data;
        }).catch(error => { Utils.toast('حدث خطأ أثناء تحميل المصحف المحلي'); return []; });
        return this._loadPromise;
    },
    getAllSurahs() { return this.data; },
    getSurah(index) { return this.data[index - 1] || null; },
    getVerse(surahIndex, ayahNumber) {
        const surah = this.getSurah(surahIndex);
        if (!surah || !surah.verses) return null;
        return surah.verses.find(v => v.a === ayahNumber) || surah.verses[ayahNumber - 1];
    },
    getTotalSurahs() { return this.data.length; }
};
