/* Rafiq Application Core — orchestration + Zād al-Hāfiz content surface. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const DOORS=[
    ['quran','📖','القرآن'],['knowledge','📚','العلم الشرعي'],['hadith','📜','الحديث'],['seerah','🕌','السيرة'],['tafsir','🔎','التفسير وعلوم القرآن'],['tajweed','🎙️','التجويد'],['tazkiyah','🌱','التزكية'],['adab','🤝','الآداب والحياة'],['optional','⭐','كتب للتوسع']
  ];
  const TRACK_ORDER={'ما لا يسع المسلم جهله':10,'الفقه الميسر':20,'فقه المعاملات':30,'الحديث':40,'السيرة':50,'القرآن':5,'التجويد':60,'التزكية':70,'الآداب والحياة':80,'كتب مفيدة':90};
  function size(n){const x=Number(n||0);return x>1048576?`${(x/1048576).toFixed(1)} MB`:x>1024?`${(x/1024).toFixed(0)} KB`:`${x} B`}
  function esc(s){const d=document.createElement('div');d.textContent=s??'';return d.innerHTML}
  function doorFor(a){const s=a.seriesTitle||a.category||'';if(s==='القرآن')return'quran';if(['ما لا يسع المسلم جهله','الفقه الميسر','فقه المعاملات'].includes(s))return'knowledge';if(s==='الحديث')return'hadith';if(s==='السيرة')return'seerah';if(s==='التجويد')return'tajweed';if(s==='التزكية')return'tazkiyah';if(s==='الآداب والحياة')return'adab';if(s==='كتب مفيدة')return'optional';return s.includes('تفسير')||a.category==='tafsir'?'tafsir':'optional'}
  function renderZadContent(door='all'){window.__rafiqCurrentZadDoor=door;
    const host=$('zadContentOverview');if(!host)return;
    const all=(window.RafiqContent?.all?.()||[]).filter(a=>a.title&&a.title!=='المصحف العثماني — نص القرآن');
    const groups=new Map(DOORS.map(d=>[d[0],[]]));all.forEach(a=>{const k=doorFor(a);if(groups.has(k))groups.get(k).push(a)});
    for(const [k,list] of groups)list.sort((a,b)=>(TRACK_ORDER[a.seriesTitle]||999)-(TRACK_ORDER[b.seriesTitle]||999)||String(a.title).localeCompare(String(b.title),'ar'));
    const visible=door==='all'?all.filter(a=>a.seriesTitle):groups.get(door)||[];
    const tabs=DOORS.map(([id,ic,t])=>`<button class="action ${door===id?'info':''}" type="button" data-zad-door="${id}">${ic} ${esc(t)}</button>`).join('');
    const trackMap=window.RafiqData?.courseTracks||{};
    const visibleTracks=[...new Set(visible.map(a=>a.seriesTitle).filter(Boolean))];
    const trackBlock=visibleTracks.length?`<div class="grid3">${visibleTracks.map(t=>{const d=trackMap[t];return `<article class="card"><div class="small">${esc(d?.label||'مسار')}</div><h3>${esc(t)}</h3><p class="small">${esc(d?.desc||'مسار منظم داخل زاد الحافظ.')}</p></article>`}).join('')}</div>`:'';
    const cards=visible.map(a=>{const audio=a.category==='audio',available=a.available!==false;return `<article class="zad-book-card" data-content-id="${esc(a.id||a.name)}"><div class="small">${audio?'تلاوة':esc(a.seriesTitle||a.category||'محتوى')}</div><h3>${esc(a.title)}</h3><p class="small">${audio?'حزمة صوتية مرتبطة بالمصحف':'المصدر الكامل المرتبط بهذا الباب'}</p><div class="small">${size(a.size)}${!available?' — غير متاح في النسخة المنشورة حاليًا':''}</div><div class="zad-book-actions"><button class="action info" type="button" data-zad-open="${esc(a.id||a.name)}" ${available?'':'disabled'}>📖 فتح</button><button class="action" type="button" data-zad-download="${esc(a.id||a.name)}" ${available?'':'disabled'}>${available?'⬇️ تنزيل المحتوى':'غير متاح حاليًا'}</button></div></article>`}).join('');
    host.innerHTML=`<section class="zad-overview"><div class="zad-overview-head"><div><div class="badge gold">📚 زاد الحافظ</div><h2>${door==='all'?'المحتوى جزء من رحلتك':esc((DOORS.find(d=>d[0]===door)||DOORS[0])[2])}</h2><p>الكتب والمصادر والورد الدراسي داخل الباب نفسه؛ لا تحتاج إلى البحث عنها في مكان آخر.</p></div></div><div class="zad-content-tabs">${tabs}</div>${trackBlock}<div class="zad-overview-grid">${cards||'<div class="muted">لا يوجد محتوى متاح لهذا الباب في الحزمة الحالية.</div>'}</div></section>`;
    host.querySelectorAll('[data-zad-door]').forEach(b=>b.onclick=()=>renderZadContent(b.dataset.zadDoor));
    host.querySelectorAll('[data-zad-download]').forEach(b=>b.onclick=async()=>{const a=window.RafiqContent.find(b.dataset.zadDownload);if(!a)return;const r=await window.RafiqContent.install(a);if(r&&!r.external)renderZadContent(door);});
    host.querySelectorAll('[data-zad-open]').forEach(b=>b.onclick=async()=>{const a=window.RafiqContent.find(b.dataset.zadOpen);if(a)await window.RafiqContent.open(a)});
  }
  async function boot(){
    const jobs=[()=>window.RafiqDB?.open?.(),()=>window.RafiqDB?.migrate?.(),()=>window.RafiqHifz?.bootstrap?.(),()=>window.RafiqContent?.bootstrap?.(),()=>window.RafiqUI?.boot?.()];
    for(const job of jobs){try{await job()}catch(e){console.error('[Rafiq] boot step failed',e)}}
    renderZadContent('all');window.__rafiqRenderZadContent=renderZadContent;
  }
  window.RafiqApp={start:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
