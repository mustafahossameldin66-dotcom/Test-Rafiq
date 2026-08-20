const HifzService = {
    getMemorized() { return StorageManager.get('hifz') || []; },
    isMemorized(surahNum) { return this.getMemorized().includes(surahNum); },
    toggleSurah(surahNum) {
        let hifz = this.getMemorized();
        const isSaved = hifz.includes(surahNum);
        if (isSaved) { hifz = hifz.filter(n => n !== surahNum); } 
        else { hifz = [...hifz, surahNum].sort((a, b) => a - b); document.dispatchEvent(new CustomEvent('activityLogged', { detail: { type: 'mem', amount: 1 } })); }
        StorageManager.set('hifz', hifz);
        document.dispatchEvent(new CustomEvent('hifzUpdated', { detail: { surah: surahNum, isSaved: !isSaved } }));
        return !isSaved;
    },
    getTotalSaved() { return this.getMemorized().length; }
};
