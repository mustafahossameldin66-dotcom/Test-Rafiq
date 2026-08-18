/* Loads structured content outside the HTML payload. */
(async function(){
  const base='./';
  async function get(name,fallback){try{const r=await fetch(base+name,{cache:'no-store'});if(!r.ok)throw new Error(r.status);return await r.json()}catch(err){console.warn('[Rafiq] content load failed:',name,err);return fallback}}
  const content=await get('core-content.json',window.RafiqData||{});
  const meta=await get('content-meta.json',[]);
  content.contentMeta=meta;
  // Merge release catalog from static content metadata; app uses it for friendly names and routing.
  window.RafiqData=content;
  window.RafiqData.contentMeta=meta;
  window.RafiqAppDataReady=true;
  window.dispatchEvent(new CustomEvent('rafiq:data-ready'));
  if(window.RafiqApp?.start)await window.RafiqApp.start();
})();
