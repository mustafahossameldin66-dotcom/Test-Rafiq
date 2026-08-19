(function(){
'use strict';
const escSafe=s=>{const d=document.createElement('div');d.textContent=s??'';return d.innerHTML};
window.rafiqReleaseUrl=function(name){return `https://github.com/mustafahossameldin66-dotcom/Test-Rafiq/releases/download/content-v1/${encodeURIComponent(name)}`};
const style=document.createElement('style');style.textContent='.mission-grid{display:none!important}';document.head.appendChild(style);
function renderLibrary(){
 const grid=document.getElementById('v80HomeLibraryGrid'); if(!grid)return;
 const items=(window.__RAFIQ_CONTENT_META||[]).filter(x=>x&&x.name&&x.category!=='system');
 if(!items.length){grid.innerHTML='<div class="muted">لا يوجد محتوى محلي متاح.</div>';return}
 grid.innerHTML=items.map(x=>{
  const local=x.name==='5769.pdf'?'content/zad/quran/seraj-ghareeb.pdf':x.name==='asnz.pdf'?'content/zad/quran/asbab-alnuzul-alwahidi.pdf':x.name.includes('مباحث')?'content/zad/quran/mabahith-ulum-alquran.pdf':x.name==='mutashabihat-lafziya.pdf'?'content/zad/quran/mutashabihat-lafziya.pdf':'';
  if(!local)return '';
  return `<article class="v80-book"><span class="k">📚 ${escSafe(x.section||x.category||'كتاب')}</span><h4>${escSafe(x.title||x.name)}</h4><div class="desc">موجود فعليًا داخل هذه النسخة.</div><a class="action" target="_blank" rel="noopener" href="${local}">📖 فتح الكتاب</a></article>`;
 }).join('');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(renderLibrary,100),{once:true});else setTimeout(renderLibrary,100);
window.addEventListener('load',()=>setTimeout(renderLibrary,100));
// ==========================================
// 6. محرك أسباب النزول للواحدي
// ==========================================
window.rafiqAsbabCache = {};
window.getAsbabForAyah = async function(s, a) {
  const cacheKey = `${s}:${a}`;
  if (window.rafiqAsbabCache[cacheKey]) return window.rafiqAsbabCache[cacheKey];
  try {
    const suraNum = String(s).padStart(3, '0');
    const url = `https://cdn.jsdelivr.net/gh/mostafaahmed97/asbab-al-nuzul-dataset@main/data/structured/json/${suraNum}.json`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      for (const item of data) {
        if (item.ayahs && (item.ayahs.includes(a) || item.ayahs.includes(String(a)))) {
          const text = item.occasions.join('<br><br>---<br><br>');
          window.rafiqAsbabCache[cacheKey] = text;
          return text;
        }
      }
    }
  } catch (e) {}
  window.rafiqAsbabCache[cacheKey] = 'NOT_FOUND';
  return 'NOT_FOUND';
};

if(typeof window.openAyahStudy === 'function'){
  const originalOpenAyahStudy = window.openAyahStudy;
  window.openAyahStudy = async function(s, a) {
    const res = await originalOpenAyahStudy(s, a);
    setTimeout(async () => {
      const asbabHeaders = Array.from(document.querySelectorAll('#ayahStudyInner h4')).filter(el => el.textContent.includes('أسباب النزول'));
      asbabHeaders.forEach(h4 => {
         const p = h4.nextElementSibling;
         if (p && p.tagName === 'P') p.innerHTML = '⏳ جاري البحث في موسوعة أسباب النزول...';
      });

      const txt = await window.getAsbabForAyah(s, a);
      asbabHeaders.forEach(h4 => {
         const p = h4.nextElementSibling;
         if (p && p.tagName === 'P') {
             if (txt !== 'NOT_FOUND') {
                 p.innerHTML = escSafe(txt);
             } else {
                 p.innerHTML = 'لم تُفهرس رواية محددة لهذه الآية في قاعدة البيانات الرقمية.<br><br><a href="' + 'content/zad/quran/asbab-alnuzul-alwahidi.pdf' + '" download target="_blank" style="display:inline-block; margin-top:8px; padding:8px 14px; background:rgba(212,175,55,0.1); border:1px solid var(--gold); border-radius:12px; color:var(--gold); text-decoration:none;">⬇️ حمل كتاب الواحدي للتأكد</a>';
             }
         }
      });
    }, 150);
    return res;
  };
}

})();
