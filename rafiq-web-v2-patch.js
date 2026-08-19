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
// 1. إخفاء العدادات وتجميل شكل المكتبة
// ==========================================
const style = document.createElement('style');
style.innerHTML = `
  .mission-grid { display: none !important; }
  
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
  .v80-book .action { background: rgba(9, 32, 17, 0.52) !important; border: 1px solid rgba(177, 232, 196, 0.15) !important; border-radius: 12px; padding: 10px 14px; text-align: center; text-decoration: none; color: #e0f6e7 !important; font-weight: bold; transition: 0.3s; cursor: pointer; }
  .v80-book .action:hover { background: rgba(38, 131, 70, 0.2) !important; border-color: rgba(212, 175, 55, 0.4) !important; color: #ffe7a0 !important; }
`;
document.head.appendChild(style);

// ==========================================
// 2. قارئ الكتب الداخلي المدمج (In-App Reader)
// ==========================================
window.openInternalReader = function(url, title) {
    // نستخدم Google Docs Viewer لضمان فتح الـ PDF داخل المتصفح وعدم تحميله إجبارياً
    const viewerUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true';
    
    let reader = q('internalPdfReader');
    if(!reader) {
        reader = document.createElement('div');
        reader.id = 'internalPdfReader';
        reader.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:#07100b; z-index:99999; display:flex; flex-direction:column;';
        document.body.appendChild(reader);
    }
    reader.innerHTML = `
        <div style="padding:16px; background:#0a1c12; border-bottom:1px solid rgba(212,175,55,0.3); display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--gold-bright); font-size:18px;">📖 ${escSafe(title)}</b>
            <button class="action danger" style="padding:8px 16px; border-radius:12px; background:rgba(200,50,50,0.2); color:#ff8888; border:1px solid rgba(200,50,50,0.4);" onclick="document.getElementById('internalPdfReader').style.display='none'">✕ إغلاق الكتاب</button>
        </div>
        <iframe src="${viewerUrl}" style="flex:1; width:100%; border:none; background:#fff;"></iframe>
    `;
    reader.style.display = 'flex';
};

// ==========================================
// 3. ربط أبواب "زاد الحافظ" بالكتب الأصلية 
// ==========================================
window.openSpace = function(spaceId) {
    const meta = window.ARCHIVE_META ? window.ARCHIVE_META[spaceId] : {title: 'الموسوعة', intro: ''};
    const extra = window.ARCHIVE_EXTRA ? window.ARCHIVE_EXTRA[spaceId] : [];

    // خريطة ربط كل باب بالكتاب الخاص به من الملفات اللي إنت رفعتها
    const bookMap = {
        'tazkiyah': 'الداء والدواء - ت. أسامة العتيبي.pdf',
        'knowledge': 'ما_لا_يسع_المسلم_جهله.pdf',
        'tafsir': 'التفسير الميسر_73731_Foulabook.com_.pdf',
        'words': '5769.pdf', // السراج
        'asbab': 'asnz.pdf',
        'adhkar': 'رياض الصالحين من كلام رسول الله سيد العارفين- النووي - ط دار المنهاج.pdf',
        'prophets': 'قصص_الأنبياء_ابن_كثير.pdf',
        'friday': 'رياض الصالحين من كلام رسول الله سيد العارفين- النووي - ط دار المنهاج.pdf',
        'duas': 'القرآن تدبر وعمل كاملا.pdf',
        'practice': 'القرآن تدبر وعمل كاملا.pdf',
        'tajweed': 'ar_Tuhfat_Alatfal.pdf',
        'resources': 'lianak allah موقع جديد بدف.pdf'
    };
    
    const bookFileName = bookMap[spaceId];
    const bookItem = (window.__RAFIQ_CONTENT_META || []).find(x => x.name === bookFileName) || { title: meta.title };
    const pdfUrl = bookFileName ? releaseUrl(bookFileName) : '';

    // سحب الورد النصي لليوم (يتغير حسب اليوم)
    const todayWirdIndex = Math.floor(Date.now() / 86400000) % (extra.length || 1);
    const wird = extra[todayWirdIndex] || ['ورد اليوم', 'تصفح الكتاب الأصلي للمزيد من العلم.'];

    const html = `
        <div class="archive-article">
            <div class="ency-title-row">
                <div>
                    <span class="ency-kicker">📖 الورد العلمي اليومي</span>
                    <h3 style="color:var(--gold-bright); font-size:26px; margin:8px 0;">من كتاب: ${escSafe(bookItem.title || bookItem.name)}</h3>
                    <p class="ency-intro">${escSafe(meta.intro)}</p>
                </div>
            </div>
            
            <div class="ency-section highlight" style="margin-top:20px; background:linear-gradient(145deg, rgba(77,194,107,0.1), rgba(0,0,0,0.2)); border:1px solid rgba(76,166,93,0.3); padding:18px; border-radius:18px;">
                <div class="ency-section-head" style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                    <span style="font-size:24px;">💡</span>
                    <div><b style="color:var(--gold); font-size:18px;">مقتطف اليوم: ${escSafe(wird[0])}</b><br><small style="color:var(--muted)">يتجدد يومياً</small></div>
                </div>
                <p style="color:#d0dbd5; font-size:15px; line-height:2;">${escSafe(wird[1])}</p>
                ${wird[2] ? `<p style="color:#d0dbd5; font-size:15px; line-height:2;">${escSafe(wird[2])}</p>` : ''}
            </div>

            ${pdfUrl ? `
            <div style="margin-top:24px; padding:22px; background:rgba(11, 40, 21, 0.4); border-radius:18px; border:1px solid rgba(212, 175, 55, 0.3); text-align:center;">
                <h4 style="color:var(--gold-bright); margin-top:0; font-size:22px;">📚 تصفح الكتاب بالكامل</h4>
                <p class="muted" style="font-size:14px; margin-bottom:16px;">لقد تم دمج الكتاب داخل التطبيق لتقرأ منه وردك المتصل دون الخروج من الموقع.</p>
                <button class="main" style="font-size:16px; padding:12px 24px; border-radius:12px; cursor:pointer;" onclick="openInternalReader('${pdfUrl}', '${escSafe(bookItem.title)}')">📖 افتح الكتاب داخل التطبيق الآن</button>
            </div>
            ` : ''}
        </div>
    `;

    const container = q('spaceContent');
    if(container) container.innerHTML = html;

    const st = q('spaceTitle'); if(st) st.textContent = meta.title;
    const si = q('spaceIntro'); if(si) si.textContent = 'الورد العلمي المخصص لك اليوم من صميم الكتب المرفقة.';

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const sv = q('spaceView');
    if(sv) {
        sv.style.display = 'block';
        sv.classList.add('show');
        document.body.classList.add('space-world');
    }
};

// ==========================================
// 4. تشغيل المكتبة في الشاشة الرئيسية 
// ==========================================
function renderLibrary() {
  const grid = q('v80HomeLibraryGrid');
  if (!grid) return;
  const items = window.__RAFIQ_CONTENT_META || [];
  if (items.length === 0) return;

  grid.innerHTML = items.map(x => {
    const isAudio = x.category === 'audio' || /\.(rar|zip|mp3)$/i.test(x.name || '');
    const url = releaseUrl(x.name);
    
    if (isAudio) {
      return `
        <div class="v80-book">
          <span class="k">🎧 تلاوات (للتحميل)</span>
          <h4>${escSafe(x.title || x.name)}</h4>
          <div class="desc">الاستماع أونلاين متاح داخل المصحف. هذا الملف للتحميل الكامل.</div>
          <a class="action" target="_blank" rel="noopener" href="${url}">⬇️ تحميل الحزمة</a>
        </div>
      `;
    } else {
      return `
        <div class="v80-book">
          <span class="k">📚 كتاب مدمج</span>
          <h4>${escSafe(x.title || x.name)}</h4>
          <div class="desc">${escSafe(x.seriesTitle || x.category)}</div>
          <button class="action" onclick="openInternalReader('${url}', '${escSafe(x.title || x.name)}')">📖 قراءة داخل التطبيق</button>
        </div>
      `;
    }
  }).join('');
}

// ==========================================
// 5. محرك أسباب النزول الذكي
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
                 p.innerHTML = 'لم تُفهرس رواية محددة لهذه الآية في قاعدة البيانات الرقمية.<br><br><button class="action info" style="margin-top:8px; padding:6px 12px; font-size:12px; cursor:pointer;" onclick="openInternalReader(\\'' + releaseUrl('asnz.pdf') + '\\', \\'أسباب النزول - الواحدي\\')">📖 افتح كتاب الواحدي للتأكد</button>';
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
