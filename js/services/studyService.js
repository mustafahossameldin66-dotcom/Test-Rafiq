const StudyService = {
    _cache: new Map(),
    async fetchFromApi(endpoint) {
        if (this._cache.has(endpoint)) return this._cache.get(endpoint);
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/${endpoint}`, { cache: 'force-cache' });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            this._cache.set(endpoint, data.data);
            return data.data;
        } catch (error) { throw error; }
    },
    async getTafsir(surah, ayah) { return this.fetchFromApi(`ayah/${surah}:${ayah}/ar.muyassar`); },
    async getTajweed(surah, ayah) { return this.fetchFromApi(`ayah/${surah}:${ayah}/quran-tajweed`); }
};
