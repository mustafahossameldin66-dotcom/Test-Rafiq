/* RafiqDB v3 — IndexedDB for app state, structured content and Hifz data. */
(function(){
  'use strict';
  const DB='rafiq-quran-v3',VERSION=3;
  let dbp;
  function open(){
    if(dbp)return dbp;
    dbp=new Promise((resolve,reject)=>{
      const r=indexedDB.open(DB,VERSION);
      r.onupgradeneeded=()=>{
        const d=r.result;
        for(const s of ['kv','quran','prayer','content','hifz']) if(!d.objectStoreNames.contains(s)) d.createObjectStore(s);
      };
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>reject(r.error);
    });
    return dbp;
  }
  async function get(store,key){const d=await open();return new Promise((res,rej)=>{const t=d.transaction(store,'readonly'),q=t.objectStore(store).get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
  async function set(store,key,value){const d=await open();return new Promise((res,rej)=>{const t=d.transaction(store,'readwrite');t.objectStore(store).put(value,key);t.oncomplete=()=>res(value);t.onerror=()=>rej(t.error)})}
  async function del(store,key){const d=await open();return new Promise((res,rej)=>{const t=d.transaction(store,'readwrite');t.objectStore(store).delete(key);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
  async function clearAll(){const d=await open();return Promise.all(['kv','quran','prayer','content','hifz'].map(s=>new Promise((res,rej)=>{const t=d.transaction(s,'readwrite');t.objectStore(s).clear();t.oncomplete=res;t.onerror=()=>rej(t.error)})))}
  async function readLegacyValue(dbName,store,key){return new Promise(resolve=>{try{const r=indexedDB.open(dbName);r.onsuccess=()=>{const d=r.result;if(!d.objectStoreNames.contains(store)){d.close();resolve(null);return}const q=d.transaction(store,'readonly').objectStore(store).get(key);q.onsuccess=()=>{const v=q.result;d.close();resolve(v)};q.onerror=()=>{d.close();resolve(null)}};r.onerror=()=>resolve(null)}catch{resolve(null)}})}
  async function migrate(){
    if(await get('kv','__legacy_migrated_v3'))return;
    try{
      const oldState=await readLegacyValue('rafiq-quran-v2','kv','rafiq-state-v2');
      if(oldState&&typeof oldState==='object')await set('kv','rafiq-state-v2',oldState);
    }catch{}
    try{const raw=localStorage.getItem('rafiq-state-v2');if(raw){const parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object'){await set('kv','rafiq-state-v2',parsed);localStorage.removeItem('rafiq-state-v2')}}}catch{}
    try{
      const oldBook=await readLegacyValue('rafiq-quran-v61','book','full');
      if(Array.isArray(oldBook)&&oldBook.length)await set('quran','full',oldBook);
    }catch{}
    try{await set('kv','__legacy_migrated_v3',{at:Date.now()})}catch{}
  }
  window.RafiqDB={open,get,set,del,clearAll,migrate};
})();
