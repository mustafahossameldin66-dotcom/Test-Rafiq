(function(){
'use strict';
const q=id=>document.getElementById(id);
const escSafe=s=>{const d=document.createElement('div');d.textContent=s??'';return d.innerHTML};

function releaseUrl(name){
  const repo='mustafahossameldin66-dotcom/Test-Rafiq',tag='content-v1';
  return `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(name)}`;
}
window.rafiqReleaseUrl=releaseUrl;

// ==========================================
// 1. إخفاء العدادات وتجميل شكل المكتبة (CSS)
// ==========================================
const style = document.createElement('style');
style.innerHTML = `
  /* إخفاء عدادات المراجعة والتكرار والتركيز تماماً */
  .mission-grid { display: none !important; }
  
  /* تصميم فخم للمكتبة يتماشى مع زاد الحافظ */
  .v80-book { 
      background: linear-gradient(145deg, rgba(11, 40, 21, 0.66), rgba(7, 24, 13, 0.54)) !important; 
      border: 1px solid rgba(177, 232, 196, 0.16) !important; 
      color: #edfaf1 !important; 
      box-shadow: 0 18px 52px rgba(4, 12, 7, 0.24) !important; 
      backdrop-filter: blur(4px); 
      border-radius: 18px; 
      padding: 18px; 
      display: flex; 
      flex-direction: column; 
      gap: 12px; 
  }
  .v80-book h4 { color: var(--gold-bright); margin: 0; font-size: 17px; line-height: 1.4; }
  .v80-book .k { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); padding: 4px 12px; border-radius: 999px; font-size: 11px; color: var(--gold); align-self: flex-start; font-weight: bold; }
  .v80-book .desc { font-size: 13px; color: var(--muted); flex: 1; line-height: 1.6; }
  .v80-book .action { background: rgba(9, 32, 17, 0.52) !important; border: 1px solid rgba(177, 232, 196, 0.15) !important; border-radius: 12px; padding: 10px 14px; text-align: center; text-decoration: none; color: #e0f6e7 !important; font-weight: bold; transition: 0.3s; }
  .v80-book .action:hover { background: rgba(38, 131, 70, 0.2) !important; border-color: rgba(212, 175, 55, 0.4) !important; color: #ffe7a0 !important; }
`;
document.head.appendChild(style);

// ==========================================
// 2. تشغيل المكتبة الذكية
// ==========================================
function renderLibrary() {
  const grid = q('v80HomeLibraryGrid');
  if (!grid) return;
  
  const items = window.__RAFIQ_CONTENT_META || [];
  if (items.length === 0) return;

  grid.innerHTML = items.map(x => {
    const isAudio = x.category === 'audio' || /\.(rar|zip|mp3)$/i.test(x.name || '');
    const url = releaseUrl(x.name);
    
    // توضيح للمستخدم إن الأونلاين شغال من جوة المصحف، والملفات دي للتحميل فقط
    let btnText = isAudio ? '⬇️ تحميل الحزمة المضغوطة' : '📖 فتح الكتاب';
    let desc = isAudio ? 'ملاحظة: يمكنك الاستماع للتلاوات أونلاين من داخل "المصحف" مباشرة. هذا الملف الضخم مخصص لمن يريد تحميل القرآن كاملاً لجهازه.' : escSafe(x.seriesTitle || x.category);
    
    return `
      <div class="v80-book">
        <span class="k">${isAudio ? '🎧 تلاوات (للتحميل)' : '📚 كتاب PDF'}</span>
        <h4>${escSafe(x.title || x.name)}</h4>
        <div class="desc">${desc}</div>
        <a class="action" target="_blank" rel="noopener" href="${url}">${btnText}</a>
      </div>
    `;
  }).join('');
}

// ==========================================
// 3. محرك أسباب النزول المعدّل
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
         if (p && p.tagName === 'P') p.innerHTML = '⏳ جاري البحث في كتاب أسباب النزول...';
      });

      const txt = await window.getAsbabForAyah(s, a);
      
      asbabHeaders.forEach(h4 => {
         const p = h4.nextElementSibling;
         if (p && p.tagName === 'P') {
             if (txt !== 'NOT_FOUND') {
                 p.innerHTML = escSafe(txt);
             } else {
                 p.innerHTML = 'لم تُفهرس رواية محددة لهذه الآية في قاعدة البيانات الرقمية.<br><br><a href="' + releaseUrl('asnz.pdf') + '" target="_blank" style="color:var(--gold); text-decoration:underline;">للتأكد، يُرجى الرجوع للنسخة الأصلية (أسباب النزول للواحدي) بالضغط هنا.</a>';
             }
         }
      });
    }, 150);
    
    return res;
  };
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderLibrary, 500);
});

})();
