/* RafiqDB: persistent app state/content metadata. Binary assets remain in Cache Storage. */
(function(){
  const DB='rafiq-quran-v2'; const VERSION=2; let dbp=null;
  function open(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const d=r.result;for(const s of ['kv','quran','prayer','content'])if(!d.objectStoreNames.contains(s))d.createObjectStore(s)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
  async function get(store,key){const d=await open();return new Promise((res,rej)=>{const t=d.transaction(store,'readonly');const q=t.objectStore(store).get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
  async function set(store,key,value){const d=await open();return new Promise((res,rej)=>{const t=d.transaction(store,'readwrite');t.objectStore(store).put(value,key);t.oncomplete=()=>res(value);t.onerror=()=>rej(t.error)})}
  async function del(store,key){const d=await open();return new Promise((res,rej)=>{const t=d.transaction(store,'readwrite');t.objectStore(store).delete(key);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
  async function clearAll(){const d=await open();return Promise.all(['kv','quran','prayer','content'].map(s=>new Promise((res,rej)=>{const t=d.transaction(s,'readwrite');t.objectStore(s).clear();t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})))}
  window.RafiqDB={open,get,set,del,clearAll};
})();
