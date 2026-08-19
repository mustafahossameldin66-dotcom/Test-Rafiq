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
// 1. محرك جلب أسباب النزول آلياً (Offline-Ready)
// ==========================================
window.rafiqAsbabCache = {};

window.getAsbabForAyah = async function(s, a) {
  const cacheKey = `${s}:${a}`;
  if (window.rafiqAsbabCache[cacheKey]) return window.rafiqAsbabCache[cacheKey];
  const local = localStorage.getItem(`rq-asbab-${s}-${a}`);
  if (local) return local;

  try {
    const suraNum = String(s).padStart(3, '0');
    // جلب البيانات من قاعدة صحيح أسباب النزول
    const url = `https://cdn.jsdelivr.net/gh/mostafaahmed97/asbab-al-nuzul-dataset@main/data/structured/json/${suraNum}.json`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    
    let foundText = '';
    for (const item of data) {
      if (item.ayahs && item.ayahs.includes(a)) {
        foundText = item.occasions.join('\n\n---\n\n');
        break;
      }
    }
    
    if (foundText) {
      window.rafiqAsbabCache[cacheKey] = foundText;
      localStorage.setItem(`rq-asbab-${s}-${a}`, foundText);
      return foundText;
    }
  } catch (e) {}
  
  window.rafiqAsbabCache[cacheKey] = 'NOT_FOUND';
  return '';
};

// دعم دراسة الآية بداخل قسم "المصحف"
if(typeof window.openAyahStudy === 'function'){
  const originalOpenAyahStudy = window.openAyahStudy;
  window.openAyahStudy = async function(s, a) {
    const res = await originalOpenAyahStudy(s, a);
    const txt = await window.getAsbabForAyah(s, a);
    
    // مراقب ذكي يضع نص سبب النزول فور فتح التبويب
    const observer = new MutationObserver(() => {
      const asbabTitle = Array.from(document.querySelectorAll('#ayahStudyInner .ayah-detail h4')).find(el => el.textContent.includes('أسباب النزول'));
      if (asbabTitle && asbabTitle.nextElementSibling && !asbabTitle.dataset.patched) {
         asbabTitle.dataset.patched = '1'; 
         const p = asbabTitle.nextElementSibling;
         if (txt && txt !== 'NOT_FOUND') {
           p.innerHTML = escSafe(txt) + '<br><br><small style="color:var(--gold)">(المصدر: صحيح أسباب النزول)</small>';
         } else {
           p.innerHTML = 'لا توجد رواية خاصة محفوظة لهذه الآية في قاعدة البيانات.<br><small>لا نختلق سبب نزول؛ يُرجع إلى كتاب الواحدي بالمكتبة والمصادر التوثيقية.</small>';
         }
      }
    });
    
    const studyInner = document.getElementById('ayahStudyInner');
    if (studyInner) observer.observe(studyInner, { childList: true, subtree: true });
    
    const exact=document.querySelector(`.mushaf-ayah[data-sura="${s}"][data-ayah="${a}"]`);
    if(exact) exact.scrollIntoView({behavior:'smooth',block:'nearest'});
    
    return res;
  };
}

// دعم دراسة الآية بداخل قسم "الدراسة"
window.renderAsbabHTML = function() {
  if(!Array.isArray(window.currentVerses)||!window.currentVerses.length) {
      return `<section class="study-panel"><h3 style="color:var(--gold)">🕊️ أسباب النزول</h3><p class="muted">لم تُحمّل الآيات بعد.</p></section>`;
  }
  
  setTimeout(async () => {
    for (const v of window.currentVerses) {
      const el = document.getElementById(`dynamic-asbab-${v.s}-${v.a}`);
      if (el) {
        const txt = await window.getAsbabForAyah(v.s, v.a);
        if (txt && txt !== 'NOT_FOUND') {
          el.innerHTML = escSafe(txt) + '<br><br><small style="color:var(--gold)">(المصدر: صحيح أسباب النزول)</small>';
          el.style.color = 'var(--text)';
        } else {
          el.innerHTML = 'لا توجد رواية خاصة محفوظة لهذه الآية.<br><small>المرجع الأساسي: أسباب النزول — الواحدي</small>';
        }
      }
    }
  }, 50);

  return `<section class="study-panel"><h3 style="color:var(--gold)">🕊️ أسباب النزول</h3>
    <div class="study-source">المصدر الآلي: <b>صحيح أسباب النزول دراسة حديثية</b>. كتاب المكتبة الأصلي: <b>أسباب النزول — الواحدي</b>.</div>
    ${window.currentVerses.map(v=>`
      <div class="asbab-note">
        <div class="study-compare-ref">${escSafe(v.ref||'الآية')}</div>
        <p id="dynamic-asbab-${v.s}-${v.a}" style="color:var(--muted)">⏳ جاري البحث في قاعدة أسباب النزول...</p>
        <div class="row" style="margin-top:10px">
          <a class="action info" target="_blank" rel="noopener" href="${releaseUrl('asnz.pdf')}">📖 فتح كتاب الواحدي</a>
        </div>
      </div>
    `).join('')}
  </section>`;
};

// ==========================================
// 2. إصلاحات المكتبة (Content Library) 
// ==========================================
window.humanRateV2 = function(n,unit){
  n=Number(n||0); if(!Number.isFinite(n)||n<=0)return '—';
  if(unit==='جزء'){
    if(Math.abs(n-1)<.0001)return 'جزء واحد';
    if(Math.abs(n-.5)<.0001)return 'نصف جزء';
    if(Math.abs(n-.25)<.0001)return 'ربع جزء';
    return `${n.toFixed(2)} جزء`;
  }
  if(unit==='صفحة') return Math.abs(n-1)<.0001 ? 'صفحة واحدة' : `${n.toFixed(n%1?2:0)} صفحة`;
  if(unit==='آيات') return Math.abs(n-1)<.0001 ? 'آية واحدة' : `${n.toFixed(n%1?1:0)} آية`;
  return `${n.toFixed(2)} ${unit||''}`.trim();
};

function enhanceContentHub(){
  const host=q('allContentPanel');
  if(!host || host.dataset.masterReady==='1')return;
  host.dataset.masterReady='1';
  const items=Array.isArray(window.__RAFIQ_CONTENT_META)?window.__RAFIQ_CONTENT_META:[];
  if(!items.length) return;

  const bySection={};
  items.forEach(x=>{const sec=x.seriesTitle||x.section||'محتوى';(bySection[sec]??=[]).push(x)});
  const sectionOrder=['ما لا يسع المسلم جهله','العلم الشرعي','الفقه الميسر','الحديث','السيرة','التفسير وعلوم القرآن','التجويد','التزكية','الآداب والحياة','كتب للتوسع','التلاوات'];
  const sections=sectionOrder.filter(s=>bySection[s]).concat(Object.keys(bySection).filter(s=>!sectionOrder.includes(s)));
  
  const header=document.createElement('section');
  header.className='content-master-summary';
  header.innerHTML=`<div class="content-master-top"><div><div class="badge gold">📚 مكتبة رفيق</div><h2>المحتوى الحقيقي — كتبك وتلاواتك</h2><p>المحتوى يُدار من إصدار GitHub: فتح مباشر، تنزيل اختياري، والعمل Offline.</p></div></div>
  <div class="content-master-actions"><button class="action info" id="openAsbabBookV2">🕊️ فتح أسباب النزول — الواحدي</button><button class="action" id="downloadAllV2">⬇️ مساعدة التنزيل</button></div>`;
  host.prepend(header);
  
  const grid=document.createElement('div');grid.className='content-master-grid';
  sections.forEach(sec=>{
    const arr=bySection[sec]||[];
    const article=document.createElement('section');article.className='content-master-section';
    article.innerHTML=`<div class="content-master-section-head"><div><b>${escSafe(sec)}</b><small>${arr.length} عنصر</small></div><span>${sec==='التلاوات'?'🎧':'📚'}</span></div><div class="content-master-cards">${arr.map((x)=>{
      const isAudio=x.category==='audio'||/\.(rar|zip|mp3)$/i.test(x.name||'');
      const url=releaseUrl(x.name);
      return `<article class="content-master-card"><div class="cm-tag">${isAudio?'🎧 تلاوة':'📖 كتاب'}</div><h3>${escSafe(x.title||x.name)}</h3><div class="cm-actions"><a class="action info" target="_blank" rel="noopener" href="${url}">فتح / قراءة</a><a class="action" target="_blank" rel="noopener" download href="${url}">⬇️ تنزيل</a></div></article>`;
    }).join('')}</div>`;
    grid.appendChild(article);
  });
  host.appendChild(grid);
  
  q('openAsbabBookV2')?.addEventListener('click',()=>window.open(releaseUrl('asnz.pdf'),'_blank','noopener'));
  q('downloadAllV2')?.addEventListener('click',()=>toast('اختر الكتب والتلاوات التي تريدها واضغط "تنزيل" للاحتفاظ بها على جهازك.'));
}
document.addEventListener('DOMContentLoaded', ()=>setTimeout(enhanceContentHub, 1200));

})();
