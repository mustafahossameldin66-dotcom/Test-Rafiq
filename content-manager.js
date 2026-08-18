/* Rafiq Content Manager — one source of truth for release metadata + local cache. */
(function(){
  'use strict';
  const OWNER='mustafahossameldin66-dotcom',REPO='Test-Rafiq',TAG='content-v1';
  const API=`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`;
  const CACHE='rafiq-content-v3';
  const manifest=Array.isArray(window.__RAFIQ_CONTENT_META)?window.__RAFIQ_CONTENT_META:[];
  const bySize=new Map(manifest.map(x=>[String(x.size),x]));
  let assets=[];
  function direct(name){return `https://github.com/${OWNER}/${REPO}/releases/download/${TAG}/${encodeURIComponent(String(name||''))}`}
  function enrich(a,available=true){const c=bySize.get(String(a.size))||{};return {...c,...a,title:a.title||c.title||a.name,seriesTitle:a.seriesTitle||c.seriesTitle,category:a.category||c.category,catalog:{...(c.catalog||{}),...(a.catalog||{})},available}}
  async function refresh(){
    try{
      const r=await fetch(API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(!r.ok)throw new Error(`release ${r.status}`);
      const j=await r.json();assets=(j.assets||[]).filter(a=>a?.state==='uploaded'&&!/\.json$/i.test(a.name)).map(a=>enrich(a,true));
      await RafiqDB.set('content','release-assets',assets);return assets;
    }catch{
      assets=(await RafiqDB.get('content','release-assets'))||[];
      return assets.length?assets:manifest.map(x=>enrich({id:'meta-'+x.title,name:x.name,size:x.size,title:x.title,seriesTitle:x.seriesTitle,category:x.category},x.category!=='audio'||x.title==='تلاوة الحصري'));
    }
  }
  function all(){if(assets.length)return assets;return manifest.map(x=>enrich({id:'meta-'+x.title,name:x.name,size:x.size,title:x.title,seriesTitle:x.seriesTitle,category:x.category},x.category!=='audio'||x.title==='تلاوة الحصري'))}
  function find(a){if(typeof a==='string')return all().find(x=>x.name===a||x.title===a||x.id===a)||null;return a?.name?enrich(a,a.available!==false):null}
  function url(a){const x=find(a);return x?.available===false?'':(x?.browser_download_url||x?.url||direct(x?.name))}
  async function install(a){const x=find(a);if(!x||x.available===false)return null;const u=url(x);if(!u)return null;const key='/content/'+encodeURIComponent(String(x.id||x.name));
    // Small assets are cached in-app for true offline reuse; very large assets use a native direct download to avoid buffering gigabytes in JS memory.
    if(Number(x.size||0)>80*1024*1024){const link=document.createElement('a');link.href=u;link.download=x.name||'';link.target='_blank';link.rel='noopener';document.body.appendChild(link);link.click();link.remove();await RafiqDB.set('content','asset:'+String(x.id||x.name),{...x,key,installedAt:Date.now(),mode:'direct-download'});return {...x,external:true,mode:'direct-download'}}
    try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));const c=await caches.open(CACHE);await c.put(key,r.clone());await RafiqDB.set('content','asset:'+String(x.id||x.name),{...x,key,installedAt:Date.now(),mode:'cached'});try{await navigator.storage?.persist?.()}catch{}return x}catch{const link=document.createElement('a');link.href=u;link.download=x.name||'';link.target='_blank';link.rel='noopener';document.body.appendChild(link);link.click();link.remove();return {...x,external:true,mode:'direct-download'}}}
  async function has(a){const x=find(a);if(!x)return false;const c=await caches.open(CACHE);return !!(await c.match('/content/'+encodeURIComponent(String(x.id||x.name))))}
  async function getBlob(a){const x=find(a);if(!x)return null;const c=await caches.open(CACHE),r=await c.match('/content/'+encodeURIComponent(String(x.id||x.name)));return r?await r.blob():null}
  async function open(a){const x=find(a);if(!x||x.available===false)return null;const blob=await getBlob(x);if(blob){const objectUrl=URL.createObjectURL(blob);const w=window.open(objectUrl,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);if(!w)window.location.href=objectUrl;return x}window.open(url(x),'_blank','noopener');return x}
  async function remove(a){const x=find(a);if(!x)return;const c=await caches.open(CACHE);await c.delete('/content/'+encodeURIComponent(String(x.id||x.name)));await RafiqDB.del('content','asset:'+String(x.id||x.name))}
  async function ayahMeta(s,a){const key=`${s}:${a}`,d=window.RafiqData||{};return{tafsir:d.tafsir?.[key]||'',words:d.wordMeanings?.[key]||'',asbab:d.asbab?.[key]||''}}
  async function bootstrap(){assets=(await RafiqDB.get('content','release-assets'))||manifest.map(x=>enrich({id:'meta-'+x.title,name:x.name,size:x.size,title:x.title,seriesTitle:x.seriesTitle,category:x.category},x.category!=='audio'||x.title==='تلاوة الحصري'));setTimeout(()=>refresh().then(()=>window.__rafiqRenderZadContent?.(window.__rafiqCurrentZadDoor||'all')).catch(()=>{}),0);return assets}
  window.RafiqContent={bootstrap,refresh,all,find,url,direct,install,has,getBlob,open,remove,ayahMeta};
})();
