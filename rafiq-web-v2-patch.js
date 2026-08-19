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
// 1. إخفاء العدادات وتعديلات الواجهة
// ==========================================
const style = document.createElement('style');
style.innerHTML = `
  .mission-grid { display: none !important; }
  .v80-book { background: linear-gradient(145deg, rgba(11, 40, 21, 0.66), rgba(7, 24, 13, 0.54)) !important; border: 1px solid rgba(177, 232, 196, 0.16) !important; color: #edfaf1 !important; box-shadow: 0 18px 52px rgba(4, 12, 7, 0.24) !important; backdrop-filter: blur(4px); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
  .v80-book h4 { color: var(--gold-bright); margin: 0; font-size: 17px; line-height: 1.4; }
  .v80-book .k { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); padding: 4px 12px; border-radius: 999px; font-size: 11px; color: var(--gold); align-self: flex-start; font-weight: bold; }
  .v80-book .desc { font-size: 13px; color: var(--muted); flex: 1; line-height: 1.6; }
  .v80-book .action { background: rgba(9, 32, 17, 0.52) !important; border: 1px solid rgba(177, 232, 196, 0.15) !important; border-radius: 12px; padding: 10px 14px; text-align: center; text-decoration: none; color: #e0f6e7 !important; font-weight: bold; transition: 0.3s; cursor: pointer; }
  .v80-book .action:hover { background: rgba(38, 131, 70, 0.2) !important; border-color: rgba(212, 175, 55, 0.4) !important; color: #ffe7a0 !important; }
  .ency-section h4 { color: #f0d77a; font-size: 18px; margin: 0 0 8px 0; font-family: Amiri, serif; }
  .ency-section p { font-size: 15px; line-height: 2; color: #c5d0ca; margin-bottom: 12px; }
`;
document.head.appendChild(style);

// ==========================================
// 2. إضافة قسم "أسماء الله الحسنى" للواجهة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const floatGrid = document.querySelector('.float-grid');
        if (floatGrid && !document.querySelector('[data-space="asmaa"]')) {
            const asmaaBtn = document.createElement('button');
            asmaaBtn.className = 'floating-card';
            asmaaBtn.setAttribute('data-space', 'asmaa');
            asmaaBtn.type = 'button';
            asmaaBtn.innerHTML = `
                <span class="ico">✨</span>
                <span class="floating-title">أسماء الله الحسنى</span>
                <span class="small">رحلة إيمانية مع معاني أسماء الله وأثرها</span>
                <span class="floating-book">📚 كتاب الباب: <b>لأنك الله</b></span>
            `;
            floatGrid.insertBefore(asmaaBtn, floatGrid.firstChild);
        }
        // المكتبة تُرسم الآن من قائمة الكتب المحلية المحددة في index.html.
    }, 800);
});

// ==========================================
// 3. المحتوى الدسم لكل قسم (الموسوعة الحقيقية)
// ==========================================
const RAFIQ_RICH_META = {
    asmaa: { title: 'أسماء الله الحسنى', intro: 'رحلة في التعرف على الله عز وجل بأسمائه وصفاته، لتطمئن القلوب وتصلح الأعمال. (مستوحى من: لأنك الله، وعقيدة المؤمن).' },
    tazkiyah: { title: 'التزكية وأمراض القلوب', intro: 'معرفة أدواء القلوب وطرق علاجها، وكيف نستقيم على الطريق. (مستوحى من: الداء والدواء).' },
    knowledge: { title: 'العلم الشرعي والفقه', intro: 'الأساسيات التي لا غنى للمسلم عنها في عقيدته وطهارته وصلاته ومعاملاته. (مستوحى من: ما لا يسع المسلم جهله، والفقه الميسر، وفقه المعاملات).' },
    adhkar: { title: 'الأذكار والآداب', intro: 'هدي النبي ﷺ في يومه وليلته، وأخلاق المسلم في التعامل. (مستوحى من: رياض الصالحين، وخلق المسلم).' },
    prophets: { title: 'قصص الأنبياء والسيرة', intro: 'العبر والعظات من سير الأنبياء والمرسلين لتثبيت القلوب. (مستوحى من: قصص الأنبياء لابن كثير).' },
    tafsir: { title: 'التفسير وعلوم القرآن', intro: 'مداخل لفهم كلام الله عز وجل واستخراج الهدايات. (مستوحى من: التفسير الميسر ومباحث علوم القرآن).' },
    practice: { title: 'تدبر وعمل', intro: 'كيف نحول الآيات من حفظ في الصدور إلى واقع وعمل في الحياة. (مستوحى من: القرآن تدبر وعمل).' },
    duas: { title: 'جوامع الدعاء', intro: 'أدعية الأنبياء والصالحين من القرآن والسنة. (مستوحى من: الأربعون النووية ورياض الصالحين).' },
    asbab: { title: 'أسباب النزول', intro: 'معرفة السياق الذي نزلت فيه الآيات يعين على الفهم الصحيح لمراد الله عز وجل.' },
    words: { title: 'معاني الكلمات', intro: 'بيان غريب القرآن لفهم المعاني العميقة للألفاظ.' },
    friday: { title: 'الجمعة', intro: 'سنن يوم الجمعة وآدابها.' },
    seasons: { title: 'المواسم', intro: 'اغتنام مواسم الطاعات كرمضان وعشر ذي الحجة.' },
    resources: { title: 'موارد إضافية', intro: 'كتب ومقاطع للتوسع في العلم الشرعي.' },
    audio: { title: 'التلاوات', intro: 'الاستماع للقرآن الكريم بأصوات القراء المتقنين.' },
    tajweed: { title: 'التجويد', intro: 'علم إعطاء كل حرف حقه ومستحقه.' }
};

const RAFIQ_RICH_EXTRA = {
    asmaa: [
        { t: 'الصمد', p: 'هو الذي تصمد إليه الخلائق في حوائجها. كلما ضاقت بك السبل، وتخلت عنك الأسباب، تذكر أن لك رباً صمداً تقصده فيقضي حاجتك ويجبر كسرك. لا ملجأ إلا إليه، ولا اعتماد إلا عليه.' },
        { t: 'الودود', p: 'ليس فقط يرحمك، بل يتودد إليك بالنعم. الود هو الحب مع الإحسان والملاطفة. يخلق لك أسباب السعادة، ويرسل لك رسائل الطمأنينة، ليخبرك أنه قريب منك يحبك إذا تبت، ويفرح بعودتك.' },
        { t: 'الجبار', p: 'الجبار له معنيان عظيمان: الأول أنه يجبر القلوب المنكسرة، ويجبر الفقر بالغنى، ويجبر المرض بالصحة. والثاني أنه القاهر العظيم الذي يخضع له كل شيء. فإذا انكسر قلبك، اطلب الجبر من الجبار.' }
    ],
    tazkiyah: [
        { t: 'أضرار الذنوب على القلب', p: 'يقول ابن القيم في "الداء والدواء": من عقوبات الذنوب حرمان العلم، وحرمان الرزق، ووحشة يجدها العاصي في قلبه بينه وبين الله، ووحشة بينه وبين الناس. الذنوب تضعف إرادة القلب، وتطفئ نور البصيرة.' },
        { t: 'الدواء النافع', p: 'القرآن هو الشفاء التام من جميع الأدواء القلبية والبدنية. والدعاء من أنفع الأدوية، وهو عدو البلاء، يدافعه ويعالجه ويمنع نزوله، ويرفعه أو يخففه إذا نزل. والإلحاح في الدعاء من أعظم أسباب الشفاء.' },
        { t: 'تأثير المعاصي على الحفظ', p: 'العلم نور من الله، والنور لا يُهدى لعاصٍ. من وجد ثقلاً في حفظ القرآن أو نسياناً مستمراً، فليراجع قلبه وعمله، وليكثر من الاستغفار، فالتخلية (ترك الذنب) تسبق التحلية (نور القرآن).' }
    ],
    knowledge: [
        { t: 'أركان الإيمان', p: 'الإيمان ليس مجرد كلمة، بل هو اعتقاد بالقلب، وقول باللسان، وعمل بالجوارح. يجب الإيمان بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، والقدر خيره وشره. (كتاب التوحيد / عقيدة المؤمن).' },
        { t: 'شروط الصلاة وأهميتها', p: 'الصلاة عماد الدين. من شروطها: الإسلام، العقل، التمييز، رفع الحدث (الوضوء أو الغسل)، إزالة النجاسة، ستر العورة، دخول الوقت، واستقبال القبلة. لا تصح الصلاة إلا بها. (الفقه الميسر).' },
        { t: 'البيوع المحرمة', p: 'أحل الله البيع وحرم الربا. من قواعد فقه المعاملات أن الأصل في المعاملات الإباحة إلا ما ورد النص بتحريمه كالربا، والغرر (الجهالة والبيع المجهول)، والاحتكار، والغش. (فقه المعاملات المالية).' }
    ],
    adhkar: [
        { t: 'فضل الذكر', p: 'يقول النبي ﷺ: "مثل الذي يذكر ربه والذي لا يذكر ربه، مثل الحي والميت". الذكر يحيي القلوب، ويطرد الشيطان، ويجلب الرزق، ويكسو الوجه نوراً. (رياض الصالحين).' },
        { t: 'الصدق والأمانة', p: 'الأخلاق ليست قشرة، بل هي صميم الدين. المسلم من سلم المسلمون من لسانه ويده. الصدق طمأنينة، والكذب ريبة، والأمانة مفتاح الثقة في الأرض والقبول في السماء. (خلق المسلم).' },
        { t: 'أهمية النية', p: 'عن عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله ﷺ يقول: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى". النية الصالحة تحول العادة إلى عبادة، والنية الفاسدة تحبط العمل. (الأربعون النووية).' }
    ],
    prophets: [
        { t: 'نوح عليه السلام: اليقين والصبر', p: 'دعا قومه ألف سنة إلا خمسين عاماً، لم يكل ولم يمل، رغم السخرية والأذى. يعلمنا نوح أن الداعية عليه البلاغ وليس عليه هداية القلوب، وأن الثبات على الحق لا يقاس بعدد الأتباع. (قصص الأنبياء).' },
        { t: 'إبراهيم عليه السلام: التوكل التام', p: 'أُلقي في النار فقال: "حسبنا الله ونعم الوكيل"، فجعلها الله برداً وسلاماً. وترك زوجته وابنه في وادٍ غير ذي زرع امتثالاً لأمر الله، فجعل الله أفئدة من الناس تهوي إليهم. التوكل الحقيقي هو كمال الثقة بالله.' },
        { t: 'يوسف عليه السلام: العفة والتمكين', p: 'تعرض للظلم، والعبودية، والسجن، والفتنة، فاعتصم بالله وقال: "معاذ الله". فعوضه الله وجعله على خزائن الأرض. طريق التمكين يمر غالباً بابتلاءات تختبر الصدق والصبر.' }
    ],
    tafsir: [
        { t: 'أهمية السياق', p: 'فهم الآية يتطلب معرفة سياقها (الآيات التي قبلها وبعدها). قطع الآية عن سياقها قد يؤدي إلى فهم خاطئ لمراد الله عز وجل. (التفسير الميسر).' },
        { t: 'المكي والمدني', p: 'القرآن المكي يركز غالباً على العقيدة، والتوحيد، وقصص الأنبياء، وتثبيت القلوب. بينما القرآن المدني يركز على التشريعات، والأحكام، والحدود، وتنظيم المجتمع الإسلامي. (مباحث علوم القرآن).' }
    ],
    practice: [
        { t: 'كيف نتدبر؟', p: 'التدبر ليس حكراً على العلماء؛ هو أن تقرأ الآية وتسأل نفسك: ماذا يطلب الله مني هنا؟ وكيف أطبق ذلك في يومي؟ إذا قرأت {وَقُولُوا لِلنَّاسِ حُسْنًا} فطبقها فوراً مع أهلك وعملك. (القرآن تدبر وعمل).' },
        { t: 'الوقوف عند الآيات', p: 'كان النبي ﷺ إذا مر بآية رحمة سأل، وإذا مر بآية عذاب استعاذ. القراءة بقلب حي تتطلب التفاعل مع كلام الله، وليس مجرد الوصول إلى نهاية الصفحة.' }
    ],
    duas: [
        { t: 'دعاء يونس عليه السلام', p: '{لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ} لم يدعُ بها مكروب إلا فرّج الله عنه. جمعت بين التوحيد، وتنزيه الله، والاعتراف بالتقصير والذنب.' },
        { t: 'أدب الدعاء', p: 'ابدأ بحمد الله والثناء عليه، ثم الصلاة على النبي ﷺ، ثم ادعُ موقناً بالإجابة، وألحّ في الدعاء، وتحرّ أوقات الإجابة كساعة الجمعة، وثلث الليل الآخر، وفي السجود.' }
    ]
};

// خريطة لربط كل قسم بالكتب الخاصة به للتحميل
const BOOK_MAP = {
    asmaa: ['lianak allah موقع جديد بدف.pdf'],
    tazkiyah: ['الداء والدواء - ت. أسامة العتيبي.pdf', 'madarej_1.pdf'],
    knowledge: ['ما_لا_يسع_المسلم_جهله.pdf', 'الفقه الميسر في ضوء الكتاب والسنة_48185_Foulabook.com_.pdf', 'فقه المعاملات المالية المعاصرة.pdf', 'كتاب_التوحيد_تأليف_الإمام_المجدد_محمد_بن_عبدالوهاب_النجدي.pdf', 'عقيدة المؤمن - نسخة مصورة_16583_Foulabook.com_.pdf'],
    adhkar: ['رياض الصالحين من كلام رسول الله سيد العارفين- النووي - ط دار المنهاج.pdf', 'الشيخ محمد الغزالي خلق المسلم.pdf', 'الأربعين النووية.pdf'],
    prophets: ['قصص_الأنبياء_ابن_كثير.pdf', 'sealed_nectar.pdf'],
    tafsir: ['التفسير الميسر_73731_Foulabook.com_.pdf', 'كتاب مباحث في علوم القرآن pdf لمناع القطان.pdf'],
    asbab: ['asnz.pdf'],
    words: ['5769.pdf'],
    practice: ['القرآن تدبر وعمل كاملا.pdf'],
    duas: ['رياض الصالحين من كلام رسول الله سيد العارفين- النووي - ط دار المنهاج.pdf'],
    friday: ['رياض الصالحين من كلام رسول الله سيد العارفين- النووي - ط دار المنهاج.pdf'],
    seasons: ['ما_لا_يسع_المسلم_جهله.pdf'],
    resources: ['lianak allah موقع جديد بدف.pdf'],
    audio: ['Al-Quran_tilawat_Mahmoud_Al-Hosary-1.rar', 'MINSHAWY.1.rar', 'FARES-ABBAD.rar'],
    tajweed: ['ar_Tuhfat_Alatfal.pdf']
};

// ==========================================
// 4. دالة عرض الأقسام الحقيقية (بمنع الكود القديم)
// ==========================================
document.addEventListener('click', (e) => {
    const c = e.target.closest('.floating-card');
    if (c) {
        e.preventDefault();
        e.stopImmediatePropagation(); // الأهم: إيقاف الدالة القديمة اللي بتبوظ الدنيا
        mySafeOpenSpace(c.dataset.space);
    }
}, true); // وضعية Capture Phase لتجاوز الملف الأصلي

function mySafeOpenSpace(spaceId) {
    const meta = RAFIQ_RICH_META[spaceId] || { title: 'الموسوعة', intro: 'هذا الباب قيد التطوير والمراجعة.' };
    const extra = RAFIQ_RICH_EXTRA[spaceId] || [{ t: 'مقتطف من الباب', p: 'سيتم إضافة الخلاصات قريباً بإذن الله.' }];
    
    let contentHtml = extra.map(e => `
        <div class="ency-section highlight" style="margin-top:16px; background:linear-gradient(145deg, rgba(77,194,107,0.1), rgba(0,0,0,0.2)); border:1px solid rgba(76,166,93,0.3); padding:18px; border-radius:18px;">
            <h4>✨ ${escSafe(e.t)}</h4>
            <p>${escSafe(e.p)}</p>
        </div>
    `).join('');

    const books = BOOK_MAP[spaceId] || [];
    let booksHtml = '';
    if (books.length > 0) {
        booksHtml = `
            <div style="margin-top:30px; padding:22px; background:rgba(11, 40, 21, 0.4); border-radius:18px; border:1px solid rgba(212, 175, 55, 0.3); text-align:center;">
                <h4 style="color:var(--gold-bright); margin-top:0; font-size:22px;">📚 المراجع والكتب للتحميل</h4>
                <p class="muted" style="font-size:14px; margin-bottom:16px;">للتوسع والاستزادة، يمكنك تحميل الكتب الأصلية لهذا الباب.</p>
                <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
                    ${books.map(b => {
                        const isAudio = /\.(rar|zip)$/i.test(b);
                        return `<a class="action" target="_blank" rel="noopener" download href="${releaseUrl(b)}" style="width:min(100%, 300px);">${isAudio ? '⬇️ تحميل الحزمة المضغوطة' : '⬇️ تحميل الكتاب'}</a>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    const html = `
        <div class="archive-article" style="padding: 26px; border-radius: 24px; background: linear-gradient(145deg, rgba(13,33,27,0.92), rgba(7,19,15,0.94)); border: 1px solid rgba(212,175,55,0.2);">
            <div class="ency-title-row">
                <div>
                    <span class="ency-kicker">📖 الورد العلمي المكتوب</span>
                    <h3 style="color:var(--gold-bright); font-size:28px; margin:8px 0;">${escSafe(meta.title)}</h3>
                    <p class="ency-intro" style="font-size:16px; color:#a9b8ac;">${escSafe(meta.intro)}</p>
                </div>
            </div>
            ${contentHtml}
            ${booksHtml}
        </div>
    `;

    const container = q('spaceContent');
    if(container) container.innerHTML = html;

    const st = q('spaceTitle'); if(st) st.textContent = meta.title;
    const si = q('spaceIntro'); if(si) si.textContent = 'اقرأ وردك العلمي המيسر هنا مباشرة، واستفد من خلاصة أمهات الكتب.';

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const sv = q('spaceView');
    if(sv) {
        sv.style.display = 'block';
        sv.classList.add('show');
        document.body.classList.add('space-world');
    }
}

// ==========================================
// 5. تحديث شكل المكتبة في الشاشة الرئيسية 
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
          <div class="desc">الاستماع متاح داخل المصحف. هذا الملف للتحميل كحزمة كاملة.</div>
          <a class="action" target="_blank" rel="noopener" download href="${url}">⬇️ تحميل الحزمة</a>
        </div>
      `;
    } else {
      return `
        <div class="v80-book">
          <span class="k">📚 كتاب PDF</span>
          <h4>${escSafe(x.title || x.name)}</h4>
          <div class="desc">${escSafe(x.seriesTitle || x.category)}</div>
          <a class="action" target="_blank" rel="noopener" download href="${url}">⬇️ تنزيل الكتاب</a>
        </div>
      `;
    }
  }).join('');
}

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
                 p.innerHTML = 'لم تُفهرس رواية محددة لهذه الآية في قاعدة البيانات الرقمية.<br><br><a href="' + releaseUrl('asnz.pdf') + '" download target="_blank" style="display:inline-block; margin-top:8px; padding:8px 14px; background:rgba(212,175,55,0.1); border:1px solid var(--gold); border-radius:12px; color:var(--gold); text-decoration:none;">⬇️ حمل كتاب الواحدي للتأكد</a>';
             }
         }
      });
    }, 150);
    return res;
  };
}

})();
