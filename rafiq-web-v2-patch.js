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
// 1. تشغيل المكتبة وإظهار الكتب والتلاوات
// ==========================================
function renderLibrary() {
  const grid = q('v80HomeLibraryGrid');
  if (!grid) return;
  
  const items = window.__RAFIQ_CONTENT_META || [];
  if (items.length === 0) {
    grid.innerHTML = '<div class="muted">لم يتم العثور على بيانات المكتبة. تأكد من ملف content-data.js</div>';
    return;
  }

  grid.innerHTML = items.map(x => {
    // تحديد إذا كان الملف صوتي/مضغوط أم كتاب
    const isAudio = x.category === 'audio' || /\.(rar|zip|mp3)$/i.test(x.name || '');
    const url = releaseUrl(x.name);
    return `
      <div class="v80-book">
        <span class="k">${isAudio ? '🎧 تلاوة' : '📖 كتاب'}</span>
        <h4>${escSafe(x.title || x.name)}</h4>
        <div class="s">${escSafe(x.seriesTitle || x.category)}</div>
        <div class="a">
          <a class="action info" target="_blank" rel="noopener" href="${url}">${isAudio ? '⬇️ تحميل' : '📖 فتح'}</a>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 2. محرك أسباب النزول الذكي
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
        // البحث عن الآية المحددة في قاعدة البيانات
        if (item.ayahs && (item.ayahs.includes(a) || item.ayahs.includes(String(a)))) {
          const text = item.occasions.join('<br><br>---<br><br>');
          window.rafiqAsbabCache[cacheKey] = text;
          return text;
        }
      }
    }
  } catch (e) {
      console.error("Asbab Fetch Error:", e);
  }
  
  // إذا لم يجد سبب نزول
  window.rafiqAsbabCache[cacheKey] = 'NOT_FOUND';
  return 'NOT_FOUND';
};

// تعديل نافذة التفسير لتشمل حالة البحث
if(typeof window.openAyahStudy === 'function'){
  const originalOpenAyahStudy = window.openAyahStudy;
  window.openAyahStudy = async function(s, a) {
    const res = await originalOpenAyahStudy(s, a);
    
    setTimeout(async () => {
      // البحث عن عنوان "أسباب النزول" في النافذة
      const asbabHeaders = Array.from(document.querySelectorAll('#ayahStudyInner h4')).filter(el => el.textContent.includes('أسباب النزول'));
      
      asbabHeaders.forEach(h4 => {
         const p = h4.nextElementSibling;
         if (p && p.tagName === 'P') {
             p.innerHTML = '⏳ جاري البحث في موسوعة أسباب النزول...';
         }
      });

      const txt = await window.getAsbabForAyah(s, a);
      
      asbabHeaders.forEach(h4 => {
         const p = h4.nextElementSibling;
         if (p && p.tagName === 'P') {
             if (txt !== 'NOT_FOUND') {
                 p.innerHTML = escSafe(txt) + '<br><br><small style="color:var(--gold)">(المصدر: صحيح أسباب النزول)</small>';
             } else {
                 p.innerHTML = 'لم يرد سبب نزول خاص ومباشر لهذه الآية بالتحديد.<br><small>تنبيه: أغلب آيات القرآن نزلت لتشريع أو توجيه عام دون حادثة معينة.</small>';
             }
         }
      });
    }, 150);
    
    return res;
  };
}

// تشغيل المكتبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderLibrary, 500);
});

})();
