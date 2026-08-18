/* Rafiq Content Manager — one catalog, direct release URLs, local cache. */
(function(){
  'use strict';
  const OWNER='mustafahossameldin66-dotcom',REPO='Test-Rafiq',TAG='content-v1';
  const API=`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`;
  const CACHE='rafiq-content-v4';
  const META=Array.isArray(window.__RAFIQ_CONTENT_META)?window.__RAFIQ_CONTENT_META:[];
  const CATALOG=Array.isArray(window.RafiqData?.CATALOG)?window.RafiqData.CATALOG:[];
  let assets=[];
  const norm=s=>String(s||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/[ًٌٍَُِّْٰـ]/g,'').replace(/[_\-]+/g,' ').replace(/[^\p{L}\p{N} ]/gu,' ').replace(/\s+/g,' ').trim();
  const byTitle=new Map(META.map(x=>[norm(x.title),x]));
  const bySize=new Map(META.filter(x=>x.size).map(x=>[String(x.size),x]));
  const byName=new Map(META.map(x=>[norm(x.name),x]));
  function direct(name){return `https://github.com/${OWNER}/${REPO}/releases/download/${TAG}/${encodeURIComponent(String(name||''))}`}
  function enrich(a={}){
    const c=CATALOG.find(x=>String(x.id)===String(a.id))||byTitle.get(norm(a.title))||byName.get(norm(a.name))||bySize.get(String(a.size))||{};
    const m=byTitle.get(norm(c.title||a.title))||byName.get(norm(c.name||a.name))||{};
    return {
      ...m,...c,...a,
      id:a.id||c.id||m.id||`meta-${String(a.title||c.title||m.title||a.name||'').replace(/\s+/g,'-')}`,
      title:a.title||c.title||m.title||a.name||'محتوى',
      name:a.name||m.name||c.name||'',
      size:Number(a.size||c.size||m.size||0),
      seriesTitle:a.seriesTitle||c.seriesTitle||m.seriesTitle||c.section||m.seriesTitle||'',
      category:a.category||c.category||m.category||'',
      desc:a.desc||c.desc||m.desc||'',
      available:a.available!==false,
      browser_download_url:a.browser_download_url||m.browser_download_url||'',
      catalog:c
    };
  }
  function localCatalog(){
    return CATALOG.filter(c=>c.id!=='audio-fares'&&c.id!=='audio-minshawy').map(enrich);
  }
  async function refresh(){
    try{
      const r=await fetch(API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
      if(!r.ok)throw new Error(String(r.status));
      const j=await r.json();
      const uploaded=new Map((j.assets||[]).filter(a=>a?.state==='uploaded').map(a=>[norm(a.name),a]));
      const merged=localCatalog().map(x=>{const hit=uploaded.get(norm(x.name))||uploaded.get(norm(x.title));return hit?enrich({...x,...hit,available:true}):enrich(x)});
      // Include any other uploaded asset that is represented by our metadata.
      for(const a of (j.assets||[]).filter(x=>x?.state==='uploaded')){
        const match=META.find(m=>norm(m.name)===norm(a.name));
        if(match&&!merged.some(x=>x.id===match.id))merged.push(enrich({...match,...a,available:true}));
      }
      assets=merged;
      await RafiqDB.set('content','release-assets',assets);
      return assets;
    }catch(e){
      assets=(await RafiqDB.get('content','release-assets'))||localCatalog();
      return assets;
    }
  }
  function all(){return assets.length?assets:localCatalog()}
  function find(a){if(typeof a==='string')return all().find(x=>x.id===a||x.name===a||x.title===a)||null;return a?.id?enrich(a):null}
  function url(a){const x=find(a);if(!x)return '';return x.browser_download_url||direct(x.name)}
  const directUrl=name=>direct(name);
  async function install(a){
    const x=find(a); if(!x||!x.name)return null;
    const u=url(x); if(!u)return null;
    const key='/content/'+encodeURIComponent(String(x.id||x.name));
    try{
      if(Number(x.size||0)<=80*1024*1024){
        const r=await fetch(u,{cache:'no-store'}); if(!r.ok)throw new Error(String(r.status));
        const c=await caches.open(CACHE); await c.put(key,r.clone());
        await RafiqDB.set('content','asset:'+String(x.id||x.name),{...x,key,installedAt:Date.now(),mode:'cached'});
        return {...x,external:false,mode:'cached'};
      }
    }catch(e){/* fall through to direct download */}
    const aEl=document.createElement('a');aEl.href=u;aEl.download=x.name;aEl.rel='noopener';aEl.target='_blank';document.body.appendChild(aEl);aEl.click();aEl.remove();
    await RafiqDB.set('content','asset:'+String(x.id||x.name),{...x,key,installedAt:Date.now(),mode:'direct-download'});
    return {...x,external:true,mode:'direct-download'};
  }
  async function has(a){const x=find(a);if(!x)return false;try{const c=await caches.open(CACHE);return !!(await c.match('/content/'+encodeURIComponent(String(x.id||x.name))))}catch{return false}}
  async function getBlob(a){const x=find(a);if(!x)return null;try{const c=await caches.open(CACHE),r=await c.match('/content/'+encodeURIComponent(String(x.id||x.name)));return r?await r.blob():null}catch{return null}}
  async function open(a){const x=find(a);if(!x)return null;const blob=await getBlob(x);if(blob){const u=URL.createObjectURL(blob);const w=window.open(u,'_blank','noopener');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),60000);return x}window.open(url(x),'_blank','noopener');return x}
  async function remove(a){const x=find(a);if(!x)return;try{const c=await caches.open(CACHE);await c.delete('/content/'+encodeURIComponent(String(x.id||x.name)))}catch{};try{await RafiqDB.del('content','asset:'+String(x.id||x.name))}catch{}}
  async function ayahMeta(s,a){const k=`${s}:${a}`,d=window.RafiqData||{};return{tafsir:d.tafsir?.[k]||'',words:d.wordMeanings?.[k]||'',asbab:d.asbab?.[k]||''}}
  async function bootstrap(){assets=(await RafiqDB.get('content','release-assets'))||localCatalog();setTimeout(()=>refresh().then(()=>window.__rafiqRenderZadContent?.(window.__rafiqCurrentZadDoor||'all')).catch(()=>{}),0);window.RafiqContent={bootstrap,refresh,all,find,url,direct:directUrl,install,has,getBlob,open,remove,ayahMeta};return assets}
  window.RafiqContent={bootstrap,refresh,all,find,url,direct:directUrl,install,has,getBlob,open,remove,ayahMeta};
})();
