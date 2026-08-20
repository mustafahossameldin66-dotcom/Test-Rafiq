
(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const storeKey='rafiq-fusion-state-v34';
let state=JSON.parse(localStorage.getItem(storeKey)||localStorage.getItem('rafiq-fusion-state-v31')||localStorage.getItem('rafiq-zero-state-v5')||null)||{plan:{},last:{s:1,a:1},athar:{note:'',action:''},prefs:{motion:true,ocean:true,light:false,style:'balanced',performance:'auto',fontSize:'normal',contrast:false},sessions:0,streak:0};
let quran=[]; let currentSurah=Math.max(1,state.last?.s||1);
window.isAudioPlaying=false;
const reciters=[
 {name:'محمود خليل الحصري',folder:'Husary_128kbps'},
 {name:'محمد صديق المنشاوي',folder:'Minshawy_Murattal_128kbps'},
 {name:'فارس عباد',folder:'Fares_Abbad_64kbps'}
];
const audioState={reciter:reciters[0],surah:1,verseIndex:0,active:false};
const qAudio=$('#quranAudio');
function audioUrl(reciter,surah,ayah){return `https://everyayah.com/data/${reciter.folder}/${String(surah).padStart(3,'0')}${String(ayah).padStart(3,'0')}.mp3`;}
function updatePlayer(){
  const s=quran[audioState.surah-1]; if(!s)return;
  const verse=s.verses[audioState.verseIndex];
  $('#playerTitle').textContent=`تلاوة سورة ${s.name}`;
  $('#playerSub').textContent=`${audioState.reciter.name} · الآية ${verse?.a||1}`;
  $('#playerToggle').textContent=qAudio.paused?'تشغيل':'إيقاف';
}
async function playRecitation(reciter, surah=currentSurah, verseIndex=0, resumeTime=0){
  if(!quran.length)return;
  audioState.reciter=reciter; audioState.surah=surah; audioState.verseIndex=Math.max(0,Math.min(verseIndex,(quran[surah-1]?.verses.length||1)-1)); audioState.active=true;
  const s=quran[surah-1], v=s.verses[audioState.verseIndex];
  qAudio.src=audioUrl(reciter,surah,v.a); qAudio.currentTime=Math.max(0,+resumeTime||0);
  state.audio={reciter:reciter.folder,surah,verseIndex:audioState.verseIndex,time:qAudio.currentTime,active:true}; save();
  try{await qAudio.play(); window.isAudioPlaying=true; document.body.dataset.audio='playing'; $('#floatingPlayer').classList.add('active'); updatePlayer(); toast(`بدأت تلاوة ${s.name} · ${reciter.name} ✨`);}catch(e){window.isAudioPlaying=false;document.body.dataset.audio='error';$('#floatingPlayer').classList.add('active');updatePlayer();toast('التلاوة تحتاج اتصالًا بالإنترنت.')}
}
qAudio.addEventListener('timeupdate',()=>{const p=qAudio.duration?Math.min(100,qAudio.currentTime/qAudio.duration*100):0;$('#playerProgress').style.width=p+'%'; if(audioState.active){state.audio={reciter:audioState.reciter.folder,surah:audioState.surah,verseIndex:audioState.verseIndex,time:qAudio.currentTime,active:true};save();}});
qAudio.addEventListener('ended',()=>{const s=quran[audioState.surah-1];if(audioState.verseIndex < s.verses.length-1){audioState.verseIndex++;qAudio.src=audioUrl(audioState.reciter,audioState.surah,s.verses[audioState.verseIndex].a);qAudio.play().then(updatePlayer).catch(stopRecitation);}else{stopRecitation(false);toast('انتهت تلاوة السورة ✨')}});
qAudio.addEventListener('error',()=>{document.body.dataset.audio='error';toast('تعذر تحميل التلاوة من المصدر الخارجي');});
function stopRecitation(hide=true){qAudio.pause();qAudio.removeAttribute('src');qAudio.load();window.isAudioPlaying=false;document.body.dataset.audio='';audioState.active=false;state.audio={...(state.audio||{}),active:false};save();$('#playerProgress').style.width='0%';if(hide)$('#floatingPlayer').classList.remove('active');updatePlayer();}

const atharPool=[
 {type:'آية',text:'وَقُل رَّبِّ زِدْنِي عِلْمًا',ref:'طه: 114'},
 {type:'آية',text:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',ref:'الشرح: 6'},
 {type:'آية',text:'فَاذْكُرُونِي أَذْكُرْكُمْ',ref:'البقرة: 152'},
 {type:'آية',text:'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَالَّذِينَ هُم مُّحْسِنُونَ',ref:'النحل: 128'},
 {type:'آية',text:'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',ref:'هود: 115'},
 {type:'حديث نبوي',text:'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.',ref:'صحيح البخاري وصحيح مسلم'},
 {type:'حديث نبوي',text:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.',ref:'صحيح البخاري وصحيح مسلم'},
 {type:'حديث نبوي',text:'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',ref:'صحيح البخاري وصحيح مسلم'},
 {type:'حديث نبوي',text:'المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.',ref:'صحيح البخاري وصحيح مسلم'},
 {type:'حديث نبوي',text:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',ref:'صحيح مسلم'},
 {type:'حديث نبوي',text:'يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا.',ref:'صحيح البخاري وصحيح مسلم'},
 {type:'حديث قدسي',text:'يَا عِبَادِي، إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي، وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا، فَلا تَظَالَمُوا.',ref:'صحيح مسلم'},
 {type:'حديث قدسي',text:'أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ حِينَ يَذْكُرُنِي.',ref:'صحيح البخاري وصحيح مسلم'},
 {type:'حديث قدسي',text:'مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ.',ref:'صحيح البخاري'},
 {type:'حديث قدسي',text:'يَا ابْنَ آدَمَ، إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلا أُبَالِي.',ref:'رواه الترمذي'}
];
const studyMeta=[
 {cat:'القرآن',title:'السراج في بيان غريب القرآن',desc:'مساعدة في معاني الكلمات القرآنية.',file:'5769.pdf'},
 {cat:'أسباب النزول',title:'أسباب النزول — الواحدي',desc:'مادة مرتبطة بأسباب نزول الآيات.',file:'asnz.pdf'},
 {cat:'التفسير وعلوم القرآن',title:'مباحث في علوم القرآن — مناع القطان',desc:'مدخل منظم إلى مباحث علوم القرآن.',file:'كتاب مباحث في علوم القرآن pdf لمناع القطان.pdf'},
 {cat:'التفسير',title:'التفسير الميسر',desc:'تفسير مختصر مناسب للمراجعة.',file:'التفسير الميسر_73731_Foulabook.com_.pdf'},
 {cat:'التجويد',title:'تحفة الأطفال والمواد المرتبطة',desc:'مواد للتجويد والتطبيق.',file:'ar_Tuhfat_Alatfal.pdf'},
 {cat:'التزكية',title:'مدارج السالكين',desc:'مادة موسعة في تزكية النفس.',file:'madarej_1.pdf'},
 {cat:'السيرة',title:'الرحيق المختوم',desc:'السيرة النبوية في مادة مرتبة.',file:'sealed_nectar.pdf'},
 {cat:'الآداب والحياة',title:'خلق المسلم',desc:'مادة في الأخلاق والآداب.',file:'الشيخ محمد الغزالي خلق المسلم.pdf'},
 {cat:'توسع',title:'لأنك الله',desc:'كتاب للتوسع والتأمل.',file:'lianak allah موقع جديد بدف.pdf'}
];
const audio=[
 {name:'الحصري',icon:'🎧',file:'Al-Quran_tilawat_Mahmoud_Al-Hosary-1.rar'},
 {name:'المنشاوي',icon:'🎙️',file:'MINSHAWY.1.rar'},
 {name:'فارس عباد',icon:'🎧',file:'FARES-ABBAD.rar'}
];
function save(){localStorage.setItem(storeKey,JSON.stringify(state));}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2300)}
function go(view){if(!view)return;document.body.dataset.view=view;const target=$('#view-'+view);$$('.view').forEach(x=>x.classList.remove('active','view-enter'));requestAnimationFrame(()=>{target?.classList.add('active','view-enter');setTimeout(()=>target?.classList.remove('view-enter'),380)});$$('[data-view]').forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});if(view==='quran')renderQuran();if(view==='study')renderStudy();if(view==='schedule')renderSchedule();if(view==='galaxy')renderHifz();updateHome();}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
function percent(){const p=state.plan;return p.goal&&p.days?Math.min(100,Math.round((Math.max(0,p.goal-(p.remaining||p.goal))/p.goal)*100)):0}
function updateHome(){
  const pct=percent();$('#homePct').textContent=pct+'%';$('#homeOrb').style.setProperty('--p',pct+'%');
  if(state.plan.daily) $('#statWard').textContent=`${state.plan.daily} ${state.plan.unit||''}`;
  else {$('#statWard').innerHTML='<button class="inline-cta" data-go="plan" type="button">حدد وردك اليوم</button>';$('#statWard .inline-cta')?.addEventListener('click',()=>go('plan'));}
  $('#statSessions').textContent=state.sessions||0;$('#statStreak').textContent=state.streak||0;
  $('#statLast').textContent=(quran.length&&state.last?.s)?`${quran[currentSurah-1]?.name||'غير محدد'} · آية ${state.last?.a||'—'}`:'غير محدد';
  $('#todayList').innerHTML=`<div class="today-row"><b>📖 الورد</b><span>اقرأ المقدار المحدد ثم سجّل جلستك.</span><em>${state.plan.daily?state.plan.daily+' '+state.plan.unit:'حدد وردك اليوم'}</em></div><div class="today-row"><b>🧠 الدراسة</b><span>اختَر مادة واحدة وركّز فيها اليوم.</span><em>خطوة واحدة تكفي</em></div><div class="today-row"><b>✨ الأثر</b><span>خُد فكرة واحدة وحوّلها لعمل.</span><em>قابل للتطبيق</em></div>`;
  const q=getDynamicAthar();$('#homeQuote').textContent=q.text;$('#homeQuoteRef').textContent=`${q.type} · ${q.ref}`;
}

function renderPlan(){const p=state.plan;$('#goalAmount').value=p.goal||'';$('#goalUnit').value=p.unit||'صفحة';$('#planDays').value=p.days||'';$('#planName').value=p.name||'';$('#planGoal').textContent=p.goal?`${p.goal} ${p.unit}`:'—';$('#planDaily').textContent=p.daily?`${p.daily} ${p.unit}`:'—';$('#planRemain').textContent=p.remaining!=null?`${p.remaining} ${p.unit}`:'—';$('#planDaysView').textContent=p.days?`${p.days} يوم`:'—';$('#planBar').style.width=percent()+'%';}
$('#savePlan').onclick=()=>{const goal=+$('#goalAmount').value,days=+$('#planDays').value,unit=$('#goalUnit').value,name=$('#planName').value.trim();if(!goal||!days)return toast('اكتب الهدف وعدد الأيام أولًا');const daily=Math.ceil((goal/days)*10)/10;state.plan={goal,days,unit,name,daily,remaining:goal,created:Date.now()};save();renderPlan();updateHome();$('#planResult').hidden=false;$('#planResult').textContent=`وردك اليومي المقترح: ${daily} ${unit}. عدّل المعدل حسب ظروفك؛ هذه تجربة شخصية قابلة للتعديل وليست قاعدة ثابتة.`;toast('تم حفظ الخطة ✅')};
$('#resetPlan').onclick=()=>{state.plan={};save();renderPlan();updateHome();toast('تمت إعادة ضبط الخطة')};
let atharIndex=0;
async function loadQuran(){try{quran=await (await fetch('quran-uthmani.json')).json();atharIndex=Math.floor(Date.now()/86400000)%Math.max(1,buildDynamicAthars().length);renderAthar(atharIndex);renderSurahGrid();renderQuran();updateHome();renderHifz();restoreAudioState();fillDailySplash();if(state.name)showDailySplash(false);}catch(e){toast('تعذر تحميل المصحف المحلي');if(state.name)showDailySplash(false)}}
function restoreAudioState(){const a=state.audio;if(!a||!a.active||!quran[a.surah-1])return;const r=reciters.find(x=>x.folder===a.reciter)||reciters[0];audioState.reciter=r;audioState.surah=a.surah;audioState.verseIndex=Math.max(0,Math.min(a.verseIndex||0,(quran[a.surah-1]?.verses.length||1)-1));updatePlayer();}
function renderSurahGrid(filter=''){const q=(filter||'').trim();$('#surahGrid').innerHTML=quran.map((s,i)=>({s,i})).filter(x=>!q||x.s.name.includes(q)||String(x.i+1)===q).map(x=>`<button class="surah-btn ${currentSurah===x.i+1?'active':''}" data-s="${x.i+1}"><b>${x.i+1}. ${x.s.name}</b><small>${x.s.type} · ${x.s.count} آيات</small></button>`).join('');$$('#surahGrid [data-s]').forEach(b=>b.onclick=()=>{currentSurah=+b.dataset.s;state.last={s:currentSurah,a:1};save();renderSurahGrid($('#surahSearch').value);renderQuran();updateHome();})}
function renderQuran(){if(!quran.length)return;const s=quran[currentSurah-1];$('#quranInfo').textContent=s.name;$('#surahTitle').textContent=s.name;$('#surahMeta').textContent=`${s.type} · ${s.count} آيات`;$('#ayahs').innerHTML=s.verses.map(v=>`<article class="quran-ayah"><div class="quran-text">${v.text}</div><div class="ayah-meta"><span>${s.name} · ${v.a}</span><span>آية رقم ${v.global}</span></div><div class="ayah-actions"><button class="icon-btn" data-mark="${v.a}">🔖 موضع</button><button class="icon-btn" data-athar="${v.a}">✨ أثر</button></div></article>`).join('');$$('[data-mark]').forEach(b=>b.onclick=()=>{state.last={s:currentSurah,a:+b.dataset.mark};state.sessions=(state.sessions||0)+1;save();updateHome();toast('تم حفظ الموضع ✅')});$$('[data-athar]').forEach(b=>b.onclick=()=>{state.last={s:currentSurah,a:+b.dataset.athar};save();go('athar');toast('تم اختيار الآية للأثر')});;updateSurahHifzControl()}
function updateSurahHifzControl(){
  const btn=$('#markSurahMemorized'), stateEl=$('#surahHifzState');
  if(!btn||!stateEl)return;
  const active=hifz.includes(currentSurah);
  btn.textContent=active?'✦ السورة محفوظة':'✦ حفظت السورة';
  btn.classList.toggle('primary',!active);
  stateEl.textContent=active?'نجمتها مضيئة في مجرة الحفظ':'لم تُعلّم كمحفوظة بعد';
  stateEl.classList.toggle('is-on',active);
}
$('#markSurahMemorized')?.addEventListener('click',()=>{
  const active=hifz.includes(currentSurah);
  if(active) hifz=hifz.filter(n=>n!==currentSurah); else hifz=[...hifz,currentSurah].sort((a,b)=>a-b);
  localStorage.setItem(hifzKey,JSON.stringify(hifz));
  updateSurahHifzControl(); renderHifz(); toast(active?'أُزيلت علامة حفظ السورة':'اكتمل حفظ السورة ✦ وأُضيئت نجمتها');
});
$('#surahSearch').addEventListener('input',e=>renderSurahGrid(e.target.value));$('#prevSurah').onclick=()=>{currentSurah=Math.max(1,currentSurah-1);state.last={s:currentSurah,a:1};save();renderSurahGrid($('#surahSearch').value);renderQuran();updateHome()};$('#nextSurah').onclick=()=>{currentSurah=Math.min(quran.length,currentSurah+1);state.last={s:currentSurah,a:1};save();renderSurahGrid($('#surahSearch').value);renderQuran();updateHome()};$('#goLast').onclick=()=>{currentSurah=state.last?.s||1;go('quran');renderQuran()};
function releaseUrl(file){return 'https://github.com/mustafahossameldin66-dotcom/Test-Rafiq/releases/latest/download/'+encodeURIComponent(file).replace(/%2F/g,'/')}
function renderStudy(filter=''){
  const q=(filter||'').trim();
  $('#studyGrid').innerHTML=studyMeta.filter(x=>!q||(x.title+x.desc+x.cat).includes(q)).map(x=>`<article class="study-card"><div class="cat">${x.cat}</div><h4>${x.title}</h4><p>${x.desc}</p><div class="study-actions"><button class="btn primary" data-open="${encodeURIComponent(x.file)}">فتح</button><button class="btn" data-rel="${encodeURIComponent(x.file)}">الإصدار</button></div></article>`).join('');
  $$('[data-open]').forEach(b=>b.onclick=()=>window.open(releaseUrl(decodeURIComponent(b.dataset.open)),'_blank','noopener'));
  $$('[data-rel]').forEach(b=>b.onclick=()=>window.open('https://github.com/mustafahossameldin66-dotcom/Test-Rafiq/releases','_blank','noopener'));
  $('#audioGrid').innerHTML=reciters.map((r,i)=>`<article class="card audio-live" style="position:relative"><div style="text-align:center"><div style="font-size:42px;margin-bottom:10px;text-shadow:0 0 24px var(--gold-glow)">🎧</div><h3 style="margin-bottom:6px">${r.name}</h3><p>تلاوة أونلاين حسب السورة والآيات، مع مشغل حي داخل التطبيق.</p><div class="hero-actions" style="justify-content:center;margin-top:18px"><button class="btn primary" data-play-reciter="${i}">استمع الآن</button><button class="btn" data-release="${encodeURIComponent(audio.find(a=>a.name.includes(r.name.split(' ')[0]))?.file||'')}">الإصدار</button></div></div></article>`).join('');
  $$('[data-play-reciter]').forEach(b=>b.onclick=()=>playRecitation(reciters[+b.dataset.playReciter],currentSurah,0));
  $$('[data-release]').forEach(b=>b.onclick=()=>{const f=decodeURIComponent(b.dataset.release||'');window.open(f?releaseUrl(f):'https://github.com/mustafahossameldin66-dotcom/Test-Rafiq/releases','_blank','noopener')});
}

$('#studySearch').addEventListener('input',e=>renderStudy(e.target.value));
$('#playerToggle')?.addEventListener('click',()=>{if(!audioState.active)return;if(qAudio.paused)qAudio.play().then(updatePlayer).catch(()=>{});else qAudio.pause();state.audio={reciter:audioState.reciter.folder,surah:audioState.surah,verseIndex:audioState.verseIndex,time:qAudio.currentTime,active:!qAudio.paused};save();updatePlayer();window.isAudioPlaying=!qAudio.paused;document.body.dataset.audio=qAudio.paused?'paused':'playing'});
$('#playerNext')?.addEventListener('click',()=>{if(!audioState.active)return;const s=quran[audioState.surah-1];if(audioState.verseIndex<s.verses.length-1){audioState.verseIndex++;qAudio.src=audioUrl(audioState.reciter,audioState.surah,s.verses[audioState.verseIndex].a);qAudio.play().then(updatePlayer).catch(()=>{});}else if(audioState.surah<quran.length){playRecitation(audioState.reciter,audioState.surah+1,0)}});
$('#playerPrev')?.addEventListener('click',()=>{if(!audioState.active)return;const s=quran[audioState.surah-1];if(audioState.verseIndex>0){audioState.verseIndex--;qAudio.src=audioUrl(audioState.reciter,audioState.surah,s.verses[audioState.verseIndex].a);qAudio.play().then(updatePlayer).catch(()=>{});}});
$('#closePlayerBtn')?.addEventListener('click',()=>stopRecitation(true));
$('#focusModeBtn')?.addEventListener('click',()=>{document.body.classList.add('focus-mode');$('#focusExitBtn').style.display='inline-flex';toast('بدأت الجلسة الهادئة ✨')});
$('#focusExitBtn')?.addEventListener('click',()=>{document.body.classList.remove('focus-mode');toast('انتهت الجلسة الهادئة')});

function buildDynamicAthars(){
  const verseItems=quran.map(s=>{const verses=s.verses||[];const v=verses[(Math.floor(Math.random()*Math.max(1,verses.length)))];return v?{type:'آية',text:v.text,ref:`${s.name} · آية ${v.a}`,source:'المصحف المحلي'}:null}).filter(Boolean);
  return [...atharPool,...verseItems];
}
let currentAthar={type:'آية',text:'وَقُلْ رَبِّ زِدْنِي عِلْمًا',ref:'طه · 114',source:'المصحف المحلي'};
let atharOnlineStep=0;
function getDynamicAthar(){return currentAthar||{type:'أثر',text:'—',ref:'—',source:'—'};}
function renderAthar(i=0){const pool=buildDynamicAthars();if(!currentAthar||currentAthar.type==='أثر'){currentAthar=pool[i%Math.max(1,pool.length)]||currentAthar;}renderAtharData(currentAthar,!!currentAthar.source)}
async function newAtharOnline(){const btn=$('#newAthar');if(btn){btn.disabled=true;btn.textContent='جاري الجلب…'};const kind=['ayah','hadith','qudsi'][atharOnlineStep++%3];try{const q=kind==='ayah'?await fetchOnlineAyah():kind==='hadith'?await fetchOnlineHadith():await fetchOnlineQudsi();currentAthar=q;state.athar.current=q;state.atharNonce=(state.atharNonce||0)+1;save();renderAtharData(q,true);updateHome();toast('تم جلب أثر جديد ✨')}catch(e){const pool=buildDynamicAthars();currentAthar=pool[Math.floor(Math.random()*Math.max(1,pool.length))]||currentAthar;renderAtharData(currentAthar,false);toast('تعذر الاتصال بالمصدر؛ عُرض أثر محلي')}finally{if(btn){btn.disabled=false;btn.textContent='أثر جديد'}}}
function renderAtharData(q,online){$('#atharText').textContent=q.text;$('#atharRef').textContent=q.ref;$('#atharType').textContent=q.type;$('#atharCount').textContent=online?'أثر مباشر من المصدر':'أثر محفوظ محليًا';$('#atharNote').value=state.athar.note||'';$('#atharAction').value=state.athar.action||'';const key=`${q.type||''}|${q.ref||''}|${q.text||''}`,done=state.athar.doneKey===key;const b=$('#markAthar');if(b){b.textContent=done?'✓ تم التطبيق':'تم تطبيقه';b.classList.toggle('primary',done)}$('#atharCard').classList.toggle('done',done)}
const ONLINE_ATHAR_SOURCES={ayah:'https://api.alquran.cloud/v1/ayah',hadith:'https://api.bonyanoss.org/hadith/random?book=bukhari',qudsi:'https://i-muslim.com/api/v1/translations/hadith/qudsi/ar'};
function onlineTimeout(ms=9000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return {signal:c.signal,clear:()=>clearTimeout(t)}}
function extractText(o){return o?.text||o?.arabic||o?.arabicText||o?.content||o?.hadith?.text||o?.result?.text||o?.data?.text||o?.data?.hadith?.text||''}
async function fetchOnlineAyah(){const req=onlineTimeout();try{const id=1+Math.floor(Math.random()*6236),r=await fetch(`${ONLINE_ATHAR_SOURCES.ayah}/${id}/quran-uthmani`,{signal:req.signal,cache:'no-store'}),j=await r.json(),d=j?.data;if(!d?.text)throw Error('empty');return {type:'آية',text:d.text,ref:`${d.surah?.name||'القرآن الكريم'} · آية ${d.numberInSurah||id}`,source:'Al Quran Cloud'}}finally{req.clear()}}
async function fetchOnlineHadith(){const req=onlineTimeout();try{const r=await fetch(ONLINE_ATHAR_SOURCES.hadith,{signal:req.signal,cache:'no-store'}),j=await r.json(),d=j?.data||j?.result||j,text=extractText(d);if(!text)throw Error('empty');return {type:'حديث نبوي',text,ref:`${d?.book?.name||d?.collection?.name||'صحيح البخاري'}${d?.number||d?.hadithNumber||d?.id?` · رقم ${d.number||d.hadithNumber||d.id}`:''}`,source:'Bonyan API'}}finally{req.clear()}}
async function fetchOnlineQudsi(){const req=onlineTimeout(11000);try{const r=await fetch(ONLINE_ATHAR_SOURCES.qudsi,{signal:req.signal,cache:'no-store'}),j=await r.json(),items=(j?.data?.items||j?.items||[]).filter(x=>x?.text);if(!items.length)throw Error('empty');const d=items[Math.floor(Math.random()*items.length)];return {type:'حديث قدسي',text:d.text,ref:`الأربعون القدسية${d.number||d.id?` · رقم ${d.number||d.id}`:''}`,source:'i-muslim'}}finally{req.clear()}}
$('#newAthar').onclick=newAtharOnline;$('#saveAthar').onclick=()=>{state.athar.note=$('#atharNote').value.trim();save();toast('تم حفظ الفكرة ✅')};$('#markAthar').onclick=()=>{state.athar.action=$('#atharAction').value.trim();state.athar.doneKey=`${currentAthar.type||''}|${currentAthar.ref||''}|${currentAthar.text||''}`;state.sessions=(state.sessions||0)+1;state.streak=Math.max(state.streak||0,1);save();renderAtharData(currentAthar,!!currentAthar.source);updateHome();toast('اتسجل التطبيق ✅')};$('#copyAthar').onclick=async()=>{const q=currentAthar,text=`${q.type}: ${q.text}\n${q.ref}`;try{await navigator.clipboard.writeText(text);toast('تم النسخ ✅')}catch{toast('تعذر النسخ في هذا المتصفح')}};$('#shareAthar').onclick=async()=>{const q=currentAthar,text=`${q.type}: ${q.text}\n${q.ref}`;if(navigator.share){try{await navigator.share({title:'الأثر · رفيق القرآن',text})}catch{}}else{try{await navigator.clipboard.writeText(text);toast('تم نسخ الأثر للمشاركة ✅')}catch{toast('المشاركة غير متاحة هنا')}}};

function applyStyle(style){
  const map={
    calm:{glow:.66,lantern:.64,ocean:.80,blur:12,sat:.90,contrast:.98,wind:.42},
    balanced:{glow:1,lantern:.92,ocean:1.05,blur:16,sat:1,contrast:1,wind:.72},
    vivid:{glow:1.32,lantern:1.08,ocean:1.28,blur:18,sat:1.12,contrast:1.05,wind:1.0},
    cinematic:{glow:1.58,lantern:1.18,ocean:1.38,blur:20,sat:1.08,contrast:1.08,wind:.86}
  };
  const v=map[style]||map.balanced;const root=document.documentElement;
  root.style.setProperty('--style-glow',v.glow);root.style.setProperty('--style-lantern',v.lantern);root.style.setProperty('--style-ocean',v.ocean);root.style.setProperty('--style-blur',v.blur+'px');root.style.setProperty('--style-sat',v.sat);root.style.setProperty('--style-contrast',v.contrast);root.style.setProperty('--style-wind',v.wind);document.body.dataset.style=style||'balanced';document.body.dataset.light=document.body.classList.contains('light')?'on':'off';document.body.dataset.visualLevel=style||'balanced';
  $$('.style-card').forEach(b=>b.classList.toggle('selected',b.dataset.styleChoice===(style||'balanced')));
}

function detectPerformanceTier(){
  const cores=navigator.hardwareConcurrency||4; const mem=navigator.deviceMemory||4;
  if(mem<=2||cores<=2) return 'lite';
  if(mem<=4||cores<=4) return 'balanced';
  return 'high';
}

function hydrateSettings(){
  const p=state.prefs||{};
  state.prefs={motion:p.motion!==false,ocean:p.ocean!==false,light:p.light===true,style:p.style||'balanced',performance:p.performance||detectPerformanceTier(),fontSize:p.fontSize||'normal',contrast:p.contrast===true};
  $('#motionToggle').checked=state.prefs.motion;$('#oceanToggle').checked=state.prefs.ocean;$('#lightToggle').checked=state.prefs.light;
  $('#contrastToggle').checked=state.prefs.contrast;
  document.body.classList.toggle('light',state.prefs.light);document.body.classList.toggle('a11y-contrast',state.prefs.contrast);
  document.body.dataset.light=state.prefs.light?'on':'off';document.body.dataset.fontSize=state.prefs.fontSize;
  document.documentElement.classList.toggle('no-motion',!state.prefs.motion);document.body.dataset.motion=state.prefs.motion?'on':'off';
  document.dispatchEvent(new CustomEvent('rafiq-motion',{detail:state.prefs.motion}));
  $('#oceanCanvas').style.display=state.prefs.ocean?'block':'none';
  $$('.lantern,.celestial-jewels,.emeralds,.sky-ornament').forEach(x=>x.style.display=state.prefs.ocean?'':'none');$$('.wind-streams,.light-wind-dust').forEach(x=>x.style.display='');
  applyStyle(state.prefs.style);
  $$('.a11y-btn').forEach(b=>b.classList.toggle('active',b.dataset.fontSize===state.prefs.fontSize));
  $$('.perf-btn').forEach(b=>b.classList.toggle('active',b.dataset.performance===state.prefs.performance));
}
$('#motionToggle').onchange=e=>{state.prefs.motion=e.target.checked;save();hydrateSettings();toast(e.target.checked?'الحركة مفعلة':'تم إيقاف الحركة')};
$('#oceanToggle').onchange=e=>{state.prefs.ocean=e.target.checked;save();hydrateSettings();toast(e.target.checked?'العالم البحري مفعّل 🌊':'العالم البحري متوقف')};
$('#lightToggle').onchange=e=>{state.prefs.light=e.target.checked;save();hydrateSettings();toast(e.target.checked?'الوضع الفاتح مفعل':'الوضع الليلي مفعل')};
$('#contrastToggle').onchange=e=>{state.prefs.contrast=e.target.checked;save();hydrateSettings();toast(e.target.checked?'تم رفع التباين':'عاد التباين المتوازن')};
$$('.a11y-btn').forEach(b=>b.onclick=()=>{state.prefs.fontSize=b.dataset.fontSize;save();hydrateSettings();toast('تم ضبط حجم النص')});
$$('.perf-btn').forEach(b=>b.onclick=()=>{state.prefs.performance=b.dataset.performance;save();hydrateSettings();toast('تم تغيير مستوى الأداء');setTimeout(()=>location.reload(),160)});

$$('.style-card').forEach(b=>b.onclick=()=>{state.prefs.style=b.dataset.styleChoice;save();applyStyle(state.prefs.style);toast(`تم تطبيق نمط ${b.querySelector('b').textContent} ✨`)});
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rafiq-backup.json';a.click();URL.revokeObjectURL(a.href)};$('#importDataBtn').onclick=()=>$('#importData').click();$('#importData').onchange=async e=>{try{const obj=JSON.parse(await e.target.files[0].text());state={...state,...obj};save();renderPlan();hydrateSettings();updateHome();toast('تم الاستيراد ✅')}catch{toast('ملف غير صالح')}};$('#clearData').onclick=()=>{if(confirm('مسح البيانات المحلية؟')){localStorage.removeItem(storeKey);location.reload()}};
$('#closeModal').onclick=()=>$('#modal').classList.remove('open');
function prayerDemo(){const list=[['الفجر','—'],['الشروق','—'],['الظهر','—'],['العصر','—'],['المغرب','—'],['العشاء','—']];return list}
function updateNetwork(){const b=$('#netBadge');b.textContent=navigator.onLine?'● متصل':'● أوفلاين';b.classList.toggle('online',navigator.onLine)}

function ocean(){
  const c=$('#oceanCanvas'),x=c.getContext('2d',{alpha:false});
  let w=0,h=0,t=0,mx=.5,my=.5,running=true,last=0,raf=0;
  const rawPerf=(JSON.parse(localStorage.getItem(storeKey)||'{}').prefs||{}).performance||'auto'; const perf=rawPerf==='auto'?detectPerformanceTier():rawPerf;
  const counts=perf==='lite'?{stars:105,gold:18,motes:34,comets:3,moving:22}:perf==='high'?{stars:175,gold:38,motes:58,comets:7,moving:55}:{stars:135,gold:26,motes:46,comets:5,moving:38};
  const stars=Array.from({length:counts.stars},(_,i)=>({x:Math.random(),y:Math.random()*.74,r:.35+Math.random()*1.15,a:.10+Math.random()*.50,p:Math.random()*Math.PI*2,depth:.3+Math.random()*.7}));
  const goldStars=Array.from({length:counts.gold},()=>({x:Math.random(),y:.035+Math.random()*.58,r:.55+Math.random()*1.7,p:Math.random()*Math.PI*2,depth:.5+Math.random()*.5}));
  const motes=Array.from({length:counts.motes},()=>({x:Math.random(),y:.12+Math.random()*.72,r:.25+Math.random()*.9,p:Math.random()*Math.PI*2,v:.2+Math.random()*.8}));
  const movingStars=Array.from({length:counts.moving},()=>({x:Math.random(),y:.10+Math.random()*.66,r:.45+Math.random()*1.0,p:Math.random()*Math.PI*2,v:.08+Math.random()*.18,drift:.008+Math.random()*.018,depth:.45+Math.random()*.55}));
  const comets=Array.from({length:counts.comets},()=>({x:Math.random(),y:.12+Math.random()*.42,s:.35+Math.random()*.7,p:Math.random()*Math.PI*2,delay:Math.random()*6}));
  function resize(){
    w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.2);
    c.width=Math.floor(w*d);c.height=Math.floor(h*d);c.style.width=w+'px';c.style.height=h+'px';x.setTransform(d,0,0,d,0,0);
  }
  resize(); addEventListener('resize',resize,{passive:true});
  function stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=0}
  function start(){if(running)return;running=true;raf=requestAnimationFrame(loop)}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(document.body.dataset.motion!=='off')start()});
  document.addEventListener('rafiq-motion',e=>{if(e.detail)start();else stop()});

  function glow(cx,cy,r,inner,mid,outer){
    const g=x.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,inner);g.addColorStop(.34,mid);g.addColorStop(1,outer);
    x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);
  }
  function loop(ts){
    raf=requestAnimationFrame(loop); if(!running||document.hidden)return;
    if(ts-last<30)return; last=ts; t=ts*.001;
    const style=document.body.dataset.style||'balanced';
    const intensity={calm:.62,balanced:1,vivid:1.22,cinematic:1.42}[style]||1;
    const top=style==='cinematic'?'#02110c':style==='vivid'?'#03170f':'#02120d';
    const mid=style==='cinematic'?'#073a2b':style==='vivid'?'#063c2b':'#062c20';
    const bot='#020f0b';
    x.clearRect(0,0,w,h);
    const bg=x.createLinearGradient(0,0,0,h);bg.addColorStop(0,top);bg.addColorStop(.50,mid);bg.addColorStop(1,bot);x.fillStyle=bg;x.fillRect(0,0,w,h);

    const parx=(mx-.5)*18, pary=(my-.5)*9;
    // Deep emerald nebulae.
    glow(w*.20+parx*.35,h*.34+pary*.25,w*.33,'rgba(50,210,157,.14)','rgba(25,122,90,.07)','rgba(0,0,0,0)');
    glow(w*.72+parx*.20,h*.18+pary*.14,w*.36,'rgba(246,222,140,.12)','rgba(70,207,158,.07)','rgba(0,0,0,0)');
    glow(w*.58,h*.78,w*.46,'rgba(22,146,108,.08)','rgba(17,95,71,.05)','rgba(0,0,0,0)');
    glow(w*.48,h*.24,w*.18,'rgba(255,238,169,.045)','rgba(244,218,128,.015)','rgba(0,0,0,0)');

    // Luminous wind ribbons: soft atmospheric motion with a few visible light currents.
    x.save();
    x.lineWidth=1.35; x.globalAlpha=.78*intensity;
    for(let r=0;r<4;r++){
      const base=h*(.12+r*.18);
      x.beginPath();
      for(let i=0;i<=w;i+=12){
        const yy=base+Math.sin(i/(230+r*66)+t*(.085+r*.022)+r)*20+Math.sin(i/455+t*(.05+r*.009)+r)*10;
        if(i===0)x.moveTo(i,yy);else x.lineTo(i,yy);
      }
      x.strokeStyle=r===1||r===3?'rgba(255,233,158,.16)':'rgba(84,227,171,.17)';
      x.shadowBlur=14; x.shadowColor=r===1||r===3?'rgba(255,229,151,.24)':'rgba(75,224,169,.18)'; x.stroke();
    }
    // Traveling light wisps riding the wind.
    for(let q=0;q<4;q++){
      const band=h*(.16+q*.18);
      const phase=(t*(.025+q*.006)+q*.27)%1;
      const sx=((phase*1.18-.09)*w);
      const sy=band+Math.sin(t*.32+q)*18+Math.sin(phase*6.28+q)*12;
      const len=80+q*22;
      const grad=x.createLinearGradient(sx-len,sy,sx+len*.25,sy);
      grad.addColorStop(0,'rgba(255,245,191,0)');
      grad.addColorStop(.48,'rgba(255,238,170,.08)');
      grad.addColorStop(.75,'rgba(130,244,205,.18)');
      grad.addColorStop(1,'rgba(255,245,191,0)');
      x.strokeStyle=grad; x.lineWidth=2; x.shadowBlur=18; x.shadowColor='rgba(116,232,187,.16)';
      x.beginPath(); x.moveTo(sx-len,sy); x.quadraticCurveTo(sx-len*.35,sy-5,sx+len*.25,sy); x.stroke();
      x.fillStyle='rgba(255,240,181,.55)'; x.shadowBlur=10; x.beginPath(); x.arc(sx+len*.08,sy,1.3,0,Math.PI*2); x.fill();
    }
    x.restore();

    // Fine orbital arcs.
    x.save(); x.translate(parx*.35,pary*.15); x.strokeStyle='rgba(87,214,168,.055)'; x.lineWidth=1;
    for(let k=0;k<5;k++){ x.beginPath(); x.ellipse(w*(.18+k*.12),h*(.42+(k%2)*.05),w*(.24+k*.035),h*(.12+k*.018),(-.18+k*.055),0,Math.PI*2); x.stroke(); }
    x.restore();

    // Stars — warm core + restrained emerald aura.
    const starLimit={calm:108,balanced:142,vivid:174,cinematic:190}[style]||142;
    for(let i=0;i<starLimit;i++){
      const s=stars[i], tw=.56+.44*Math.sin(t*(.65+s.depth*.85)+s.p);
      const a=Math.min(.82,s.a*tw*(style==='calm'?.72:1));
      const sx=s.x*w+parx*(.1+s.depth*.25), sy=s.y*h+pary*(.08+s.depth*.18), rr=s.r*(.82+tw*.25);
      x.fillStyle=`rgba(218,231,222,${a})`;x.beginPath();x.arc(sx,sy,rr,0,Math.PI*2);x.fill();
      if(tw>.88){x.fillStyle=`rgba(105,225,181,${.06*intensity})`;x.beginPath();x.arc(sx,sy,rr*4,0,Math.PI*2);x.fill();}
    }
    // A slightly richer layer of drifting stars: visible movement without a busy sky.
    const movingLimit={calm:14,balanced:26,vivid:38,cinematic:48}[style]||26;
    for(let i=0;i<movingLimit;i++){
      const s=movingStars[i];
      const drift=(t*s.v+s.p)%1;
      const sx=((s.x+drift*.16)%1)*w+parx*(.12+s.depth*.28);
      const sy=s.y*h+Math.sin(t*s.drift*22+s.p)*9+pary*(.10+s.depth*.14);
      const tw=.42+.58*(.5+.5*Math.sin(t*(1.1+s.depth)+s.p));
      const rr=s.r*(.72+.24*tw);
      x.fillStyle=`rgba(244,241,214,${.12+.20*tw})`;x.beginPath();x.arc(sx,sy,rr,0,Math.PI*2);x.fill();
      if(tw>.9){x.strokeStyle=`rgba(255,232,165,${.12+.12*tw})`;x.lineWidth=1;x.beginPath();x.moveTo(sx-5,sy);x.lineTo(sx+5,sy);x.moveTo(sx,sy-5);x.lineTo(sx,sy+5);x.stroke();}
    }

    const goldLimit={calm:12,balanced:20,vivid:28,cinematic:34}[style]||20;
    for(let i=0;i<goldLimit;i++){
      const s=goldStars[i],tw=.45+.55*(.5+.5*Math.sin(t*(.9+s.depth)+s.p));
      const sx=s.x*w+parx*.35,sy=s.y*h+pary*.18,rr=s.r*(.72+tw*.55);
      const gr=x.createRadialGradient(sx,sy,0,sx,sy,rr*7);
      gr.addColorStop(0,`rgba(255,235,159,${.16+.22*tw})`);gr.addColorStop(.35,`rgba(244,220,134,${.07+.07*tw})`);gr.addColorStop(1,'rgba(244,220,134,0)');
      x.fillStyle=gr;x.beginPath();x.arc(sx,sy,rr*7,0,Math.PI*2);x.fill();
      x.fillStyle=`rgba(255,233,158,${.40+.46*tw})`;x.beginPath();x.arc(sx,sy,rr,0,Math.PI*2);x.fill();
      if(tw>.86){x.strokeStyle=`rgba(255,236,163,${.10+.18*tw})`;x.lineWidth=1;x.beginPath();x.moveTo(sx-7,sy);x.lineTo(sx+7,sy);x.moveTo(sx,sy-7);x.lineTo(sx,sy+7);x.stroke();}
    }
    // Emerald motes create life without clutter.
    for(const m of motes){
      const xx=(m.x+Math.sin(t*.045*m.v+m.p)*.012)*w+parx*.12, yy=(m.y+Math.sin(t*.09*m.v+m.p)*.018)*h+pary*.08;
      const tw=.45+.55*Math.sin(t*.55+m.p);x.fillStyle=`rgba(64,216,166,${.035+.045*tw})`;x.beginPath();x.arc(xx,yy,m.r,0,Math.PI*2);x.fill();
    }
    // Occasional graceful comet sweep.
    for(const cmt of comets){
      const phase=((t*.018*cmt.s+cmt.delay)%1), cx=(cmt.x+phase*.9)%1, cy=cmt.y+Math.sin(phase*6.28+cmt.p)*.05;
      if(phase<.14||phase>.94)continue;
      const sx=cx*w, sy=cy*h, len=34*cmt.s;
      x.strokeStyle='rgba(247,224,142,.12)';x.lineWidth=1;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx-len,sy+len*.18);x.stroke();
      x.fillStyle='rgba(255,238,165,.60)';x.beginPath();x.arc(sx,sy,1.2,0,Math.PI*2);x.fill();
    }

    // A deep lower horizon: the sea is implied, never pasted over the sky.
    const horizon=x.createLinearGradient(0,h*.68,0,h);horizon.addColorStop(0,'rgba(5,48,36,.10)');horizon.addColorStop(.55,'rgba(2,27,19,.28)');horizon.addColorStop(1,'rgba(1,12,8,.82)');x.fillStyle=horizon;x.fillRect(0,h*.66,w,h*.34);
    const haze=x.createRadialGradient(w*.50,h*.76,0,w*.50,h*.76,w*.56);haze.addColorStop(0,'rgba(45,176,130,.06)');haze.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=haze;x.fillRect(0,h*.48,w,h*.52);
  }
  raf=requestAnimationFrame(loop);
}


// V23 interaction layer
function setTimeMood(){const h=new Date().getHours();const mood=h>=5&&h<9?'dawn':h>=17&&h<21?'dusk':'night';document.body.dataset.time=mood}
setTimeMood();setInterval(setTimeMood,300000);

const charityDone=$('#charityDone'); const charityShare=$('#charityShare');
charityDone?.addEventListener('click',()=>{state.charity=state.charity||{};state.charity.last=Date.now();state.sessions=(state.sessions||0)+1;save();charityDone.textContent='✓ تم تسجيل دعاء اليوم';toast('ربنا يفرّج عنه ويحفظ والديك 🤍')});
charityShare?.addEventListener('click',async()=>{const txt='اللهم فرّج عن أخي الكرب والهم، واحفظ والديّ، وأدم عليهم العافية والسكينة والبركة.';if(navigator.share){try{await navigator.share({title:'دعاء لأخي ولوالديّ',text:txt})}catch{}}else{try{await navigator.clipboard.writeText(txt);toast('تم نسخ الدعاء 🤍')}catch{toast('تعذر النسخ هنا')}}});

function startSession(){if(state.prefs.session)return;state.prefs.session=true;state.prefs.sessionPrevMotion=state.prefs.motion!==false;state.prefs.motion=false;save();document.body.classList.add('session-mode-active','focus-mode');$('#sessionMode').classList.add('open');$('#sessionMode').setAttribute('aria-hidden','false');hydrateSettings()}
function endSession(){state.prefs.motion=state.prefs.sessionPrevMotion!==false;state.prefs.session=false;delete state.prefs.sessionPrevMotion;save();document.body.classList.remove('session-mode-active','focus-mode');$('#sessionMode').classList.remove('open');$('#sessionMode').setAttribute('aria-hidden','true');hydrateSettings()}
$('#startSession')?.addEventListener('click',startSession);$('#sessionExit')?.addEventListener('click',endSession);$('#sessionOpenQuran')?.addEventListener('click',()=>{endSession();go('quran')});

const hifzKey='rafiq-hifz-fusion-v34'; let hifz=JSON.parse(localStorage.getItem(hifzKey)||localStorage.getItem('rafiq-hifz-fusion-v31')||localStorage.getItem('rafiq-hifz-v1')||localStorage.getItem('rafiq-hifz-v2')||'[]');
const SURAH_META=[{"number":1,"name":"الفاتحة","type":"مكية","count":7},{"number":2,"name":"البقرة","type":"مدنية","count":286},{"number":3,"name":"آل عمران","type":"مدنية","count":200},{"number":4,"name":"النساء","type":"مدنية","count":176},{"number":5,"name":"المائدة","type":"مدنية","count":120},{"number":6,"name":"الأنعام","type":"مكية","count":165},{"number":7,"name":"الأعراف","type":"مكية","count":206},{"number":8,"name":"الأنفال","type":"مدنية","count":75},{"number":9,"name":"التوبة","type":"مدنية","count":129},{"number":10,"name":"يونس","type":"مكية","count":109},{"number":11,"name":"هود","type":"مكية","count":123},{"number":12,"name":"يوسف","type":"مكية","count":111},{"number":13,"name":"الرعد","type":"مدنية","count":43},{"number":14,"name":"إبراهيم","type":"مكية","count":52},{"number":15,"name":"الحجر","type":"مكية","count":99},{"number":16,"name":"النحل","type":"مكية","count":128},{"number":17,"name":"الإسراء","type":"مكية","count":111},{"number":18,"name":"الكهف","type":"مكية","count":110},{"number":19,"name":"مريم","type":"مكية","count":98},{"number":20,"name":"طه","type":"مكية","count":135},{"number":21,"name":"الأنبياء","type":"مكية","count":112},{"number":22,"name":"الحج","type":"مدنية","count":78},{"number":23,"name":"المؤمنون","type":"مكية","count":118},{"number":24,"name":"النور","type":"مدنية","count":64},{"number":25,"name":"الفرقان","type":"مكية","count":77},{"number":26,"name":"الشعراء","type":"مكية","count":227},{"number":27,"name":"النمل","type":"مكية","count":93},{"number":28,"name":"القصص","type":"مكية","count":88},{"number":29,"name":"العنكبوت","type":"مكية","count":69},{"number":30,"name":"الروم","type":"مكية","count":60},{"number":31,"name":"لقمان","type":"مكية","count":34},{"number":32,"name":"السجدة","type":"مكية","count":30},{"number":33,"name":"الأحزاب","type":"مدنية","count":73},{"number":34,"name":"سبأ","type":"مكية","count":54},{"number":35,"name":"فاطر","type":"مكية","count":45},{"number":36,"name":"يس","type":"مكية","count":83},{"number":37,"name":"الصافات","type":"مكية","count":182},{"number":38,"name":"ص","type":"مكية","count":88},{"number":39,"name":"الزمر","type":"مكية","count":75},{"number":40,"name":"غافر","type":"مكية","count":85},{"number":41,"name":"فصلت","type":"مكية","count":54},{"number":42,"name":"الشورى","type":"مكية","count":53},{"number":43,"name":"الزخرف","type":"مكية","count":89},{"number":44,"name":"الدخان","type":"مكية","count":59},{"number":45,"name":"الجاثية","type":"مكية","count":37},{"number":46,"name":"الأحقاف","type":"مكية","count":35},{"number":47,"name":"محمد","type":"مدنية","count":38},{"number":48,"name":"الفتح","type":"مدنية","count":29},{"number":49,"name":"الحجرات","type":"مدنية","count":18},{"number":50,"name":"ق","type":"مكية","count":45},{"number":51,"name":"الذاريات","type":"مكية","count":60},{"number":52,"name":"الطور","type":"مكية","count":49},{"number":53,"name":"النجم","type":"مكية","count":62},{"number":54,"name":"القمر","type":"مكية","count":55},{"number":55,"name":"الرحمن","type":"مدنية","count":78},{"number":56,"name":"الواقعة","type":"مكية","count":96},{"number":57,"name":"الحديد","type":"مدنية","count":29},{"number":58,"name":"المجادلة","type":"مدنية","count":22},{"number":59,"name":"الحشر","type":"مدنية","count":24},{"number":60,"name":"الممتحنة","type":"مدنية","count":13},{"number":61,"name":"الصف","type":"مدنية","count":14},{"number":62,"name":"الجمعة","type":"مدنية","count":11},{"number":63,"name":"المنافقون","type":"مدنية","count":11},{"number":64,"name":"التغابن","type":"مدنية","count":18},{"number":65,"name":"الطلاق","type":"مدنية","count":12},{"number":66,"name":"التحريم","type":"مدنية","count":12},{"number":67,"name":"الملك","type":"مكية","count":30},{"number":68,"name":"القلم","type":"مكية","count":52},{"number":69,"name":"الحاقة","type":"مكية","count":52},{"number":70,"name":"المعارج","type":"مكية","count":44},{"number":71,"name":"نوح","type":"مكية","count":28},{"number":72,"name":"الجن","type":"مكية","count":28},{"number":73,"name":"المزمل","type":"مكية","count":20},{"number":74,"name":"المدثر","type":"مكية","count":56},{"number":75,"name":"القيامة","type":"مكية","count":40},{"number":76,"name":"الإنسان","type":"مدنية","count":31},{"number":77,"name":"المرسلات","type":"مكية","count":50},{"number":78,"name":"النبأ","type":"مكية","count":40},{"number":79,"name":"النازعات","type":"مكية","count":46},{"number":80,"name":"عبس","type":"مكية","count":42},{"number":81,"name":"التكوير","type":"مكية","count":29},{"number":82,"name":"الانفطار","type":"مكية","count":19},{"number":83,"name":"المطففين","type":"مكية","count":36},{"number":84,"name":"الانشقاق","type":"مكية","count":25},{"number":85,"name":"البروج","type":"مكية","count":22},{"number":86,"name":"الطارق","type":"مكية","count":17},{"number":87,"name":"الأعلى","type":"مكية","count":19},{"number":88,"name":"الغاشية","type":"مكية","count":26},{"number":89,"name":"الفجر","type":"مكية","count":30},{"number":90,"name":"البلد","type":"مكية","count":20},{"number":91,"name":"الشمس","type":"مكية","count":15},{"number":92,"name":"الليل","type":"مكية","count":21},{"number":93,"name":"الضحى","type":"مكية","count":11},{"number":94,"name":"الشرح","type":"مكية","count":8},{"number":95,"name":"التين","type":"مكية","count":8},{"number":96,"name":"العلق","type":"مكية","count":19},{"number":97,"name":"القدر","type":"مكية","count":5},{"number":98,"name":"البينة","type":"مدنية","count":8},{"number":99,"name":"الزلزلة","type":"مدنية","count":8},{"number":100,"name":"العاديات","type":"مكية","count":11},{"number":101,"name":"القارعة","type":"مكية","count":11},{"number":102,"name":"التكاثر","type":"مكية","count":8},{"number":103,"name":"العصر","type":"مكية","count":3},{"number":104,"name":"الهمزة","type":"مكية","count":9},{"number":105,"name":"الفيل","type":"مكية","count":5},{"number":106,"name":"قريش","type":"مكية","count":4},{"number":107,"name":"الماعون","type":"مكية","count":7},{"number":108,"name":"الكوثر","type":"مكية","count":3},{"number":109,"name":"الكافرون","type":"مكية","count":6},{"number":110,"name":"النصر","type":"مدنية","count":3},{"number":111,"name":"المسد","type":"مكية","count":5},{"number":112,"name":"الإخلاص","type":"مكية","count":4},{"number":113,"name":"الفلق","type":"مكية","count":5},{"number":114,"name":"الناس","type":"مكية","count":6}];
function renderHifz(){
  const sky=$('#hifzSky'); if(!sky)return;
  const source=(quran&&quran.length?quran:SURAH_META).slice(0,114);
  const rings=[6,12,18,24,30,24],radii=[9,15.5,22.5,30,38.5,47.5],rosette=[];
  rings.forEach((count,ring)=>{for(let j=0;j<count;j++){const theta=(j/count)*Math.PI*2+ring*.095,petal=1+.15*Math.cos(theta*6),r=radii[ring]*petal;rosette.push({x:50+Math.cos(theta)*r,y:50+Math.sin(theta)*r*.72,spin:theta*180/Math.PI%360})}});
  sky.innerHTML=source.map((item,i)=>{const p=rosette[i],active=hifz.includes(i+1),name=item?.name||`سورة ${i+1}`;const living=(i%2===0||i%7===0);return `<button class="hifz-star ${active?'active':''} ${living?'living':''}" type="button" aria-label="${name}" aria-pressed="${active}" data-hifz="${i+1}" style="left:${Math.max(5,Math.min(95,p.x))}%;top:${Math.max(8,Math.min(92,p.y))}%;--delay:${((i%19)*-.22).toFixed(2)}s;--spin:${p.spin.toFixed(1)}deg;--scale:${(.84+(i%7)*.035).toFixed(2)}"><span aria-hidden="true"></span></button>`}).join('');
  sky.querySelectorAll('[data-hifz]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.hifz,on=!hifz.includes(n);hifz=on?[...hifz,n].sort((a,b)=>a-b):hifz.filter(x=>x!==n);localStorage.setItem(hifzKey,JSON.stringify(hifz));renderHifz();renderQuran();toast(on?'أضيئت نجمة السورة ✦':'أُطفئت نجمة السورة')}));
  $('#hifzProgress').textContent=`${hifz.length} / 114 محفوظة`;$('#galaxyMeter').textContent=`${Math.round(hifz.length/114*100)}%`;
}

// ambient cursor light: subtle premium parallax, no heavy DOM work.
addEventListener('pointermove',e=>{
  const px=(e.clientX/innerWidth)*100, py=(e.clientY/innerHeight)*100;
  document.documentElement.style.setProperty('--cursor-x',px.toFixed(2)+'%');
  document.documentElement.style.setProperty('--cursor-y',py.toFixed(2)+'%');
},{passive:true});

function renderSchedule(){const s=state.schedule||[['ورد القرآن','صباحًا'],['مراجعة','مساءً']];if(!$('#scheduleList')||!$('#reminderList'))return;$('#scheduleList').innerHTML=s.map((x,i)=>`<div class="schedule-item"><div><b>${x[0]}</b><small>${x[1]}</small></div><button data-del-s="${i}">حذف</button></div>`).join('');$('#reminderList').innerHTML=(state.reminders||[]).map((x,i)=>`<div class="schedule-item"><div><b>${x.title}</b><small>${x.time||'وقت مرن'}</small></div><button data-del-r="${i}">حذف</button></div>`).join('')||'<div class="muted">لا توجد تذكيرات بعد.</div>'; $$('[data-del-s]').forEach(b=>b.onclick=()=>{state.schedule.splice(+b.dataset.delS,1);save();renderSchedule()}); $$('[data-del-r]').forEach(b=>b.onclick=()=>{state.reminders.splice(+b.dataset.delR,1);save();renderSchedule()})}
$('#addSchedule')?.addEventListener('click',()=>{const title=prompt('اسم المحطة؟');if(!title)return;const time=prompt('الوقت أو الوصف؟','بعد الفجر');state.schedule=state.schedule||[];state.schedule.push([title,time||'مرن']);save();renderSchedule();toast('تمت إضافة المحطة')});
$('#addReminder')?.addEventListener('click',()=>{const title=prompt('عنوان التذكير؟');if(!title)return;const time=prompt('الوقت؟','20:00');state.reminders=state.reminders||[];state.reminders.push({title,time});save();renderSchedule();toast('تمت إضافة التذكير')});
$('#notifyPermission')?.addEventListener('click',async()=>{if(!('Notification' in window))return toast('الإشعارات غير مدعومة هنا');const p=await Notification.requestPermission();toast(p==='granted'?'الإشعارات مفعلة ✅':'لم يتم منح الإذن')});

// lightweight view hooks
const originalGo=go; go=function(view){originalGo(view); if(view==='galaxy')renderHifz(); if(view==='schedule')renderSchedule();};
renderHifz();renderSchedule();


// نظام الترحيب النهائي: إعداد أول مرة + تحية يومية عند بداية اليوم الشرعي.
const welcomeKey='rafiq-welcome-ritual-v51',welcomeReleaseKey='rafiq-welcome-release-v51';
let welcomeFlowStarted=false,locationHint=state.location||null;
function saveProfile(name,age){state.name=name;state.age=age||null;save()}
function hijriParts(date){try{return new Intl.DateTimeFormat('en-u-ca-islamic',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).reduce((o,p)=>(o[p.type]=p.value,o),{})}catch{return {year:String(date.getFullYear()),month:String(date.getMonth()+1).padStart(2,'0'),day:String(date.getDate()).padStart(2,'0')}}}
function hijriLabel(date){try{return new Intl.DateTimeFormat('ar-SA-u-ca-islamic',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date)}catch{return new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date)}}
function dayOfYearLocal(date){const start=new Date(date.getFullYear(),0,0);return Math.floor((date-start)/86400000)}
function sunsetMinutes(date,lat,lon){const N=dayOfYearLocal(date),lngHour=lon/15,t=N+((18-lngHour)/24),M=.9856*t-3.289;let L=M+1.916*Math.sin(M*Math.PI/180)+.020*Math.sin(2*M*Math.PI/180)+282.634;L=(L+360)%360;let RA=Math.atan(.91764*Math.tan(L*Math.PI/180))*180/Math.PI;RA=(RA+360)%360;const lq=Math.floor(L/90)*90,raq=Math.floor(RA/90)*90;RA=(RA+lq-raq)/15;const sd=.39782*Math.sin(L*Math.PI/180),cd=Math.cos(Math.asin(sd)),latR=lat*Math.PI/180,cosH=(Math.cos(90.8333*Math.PI/180)-sd*Math.sin(latR))/(cd*Math.cos(latR));if(cosH>1||cosH<-1)return 1080;const H=(360-Math.acos(cosH)*180/Math.PI)/15,T=H+RA-.06571*t-6.622,UT=(T-lngHour+24)%24,off=-date.getTimezoneOffset()/60;return Math.round(((UT+off+24)%24)*60)}
function boundaryMinutes(){return locationHint&&Number.isFinite(locationHint.lat)&&Number.isFinite(locationHint.lon)?sunsetMinutes(new Date(),locationHint.lat,locationHint.lon):(state.maghribMinutes||1080)}
function ritualMoment(date=new Date()){return date.getHours()*60+date.getMinutes()>=boundaryMinutes()?new Date(date):new Date(date.getTime()-86400000)}
function ritualKey(){const p=hijriParts(ritualMoment());return `hijri-${p.year}-${p.month}-${p.day}`}
function ritualLabel(){return hijriLabel(ritualMoment())}
function greeting(){const h=new Date().getHours();return h<5?'ليلة هادئة مع رفيق القرآن':h<12?'صباح الخير، جعل الله يومك نورًا':'مساء الخير، جعل الله ليلتك سكينة'}
function dailyVerse(){if(!quran.length)return {text:'وَقُلْ رَبِّ زِدْنِي عِلْمًا',ref:'طه · 114',s:20,a:114,name:reciters[0]?.name||'الحصري'};const k=ritualKey().split('').reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7),s=quran[k%quran.length],v=s.verses[k%(s.verses.length||1)];return {text:v.text,ref:`${s.name} · آية ${v.a}`,s:s.number||quran.indexOf(s)+1,a:v.a,name:reciters[0]?.name||'الحصري'}}
function fillDailySplash(){const a=dailyVerse();$('#splashGreeting').textContent=`${greeting()}${state.name?`، ${state.name}`:''}`;$('#splashDate').textContent=ritualLabel();$('#splashAyah').textContent=a.text;$('#splashRef').textContent=`${a.ref} · بصوت ${a.name}`}
function lockWelcome(){document.body.classList.add('welcome-lock');document.documentElement.classList.add('welcome-active')}
function unlockWelcome(){document.body.classList.remove('welcome-lock');document.documentElement.classList.remove('welcome-active')}
function closeSplash(mark=true){$('#dailySplash')?.classList.remove('show');$('#dailySplash')?.setAttribute('aria-hidden','true');unlockWelcome();if(mark){localStorage.setItem(welcomeKey,ritualKey());localStorage.setItem(welcomeReleaseKey,'1')}}
function showDailySplash(force=false){const key=ritualKey();if(!force&&localStorage.getItem(welcomeKey)===key)return;fillDailySplash();const panel=$('#dailySplash');if(!panel)return;panel.classList.add('show');panel.setAttribute('aria-hidden','false');lockWelcome()}
function closeFirstWelcome(){$('#welcomeModal')?.classList.remove('show');$('#welcomeModal')?.setAttribute('aria-hidden','true');unlockWelcome()}
function openFirstWelcome(){const panel=$('#welcomeModal');if(!panel)return;panel.classList.add('show');panel.setAttribute('aria-hidden','false');lockWelcome();setTimeout(()=>$('#welcomeName')?.focus(),120)}
function saveWelcome(){const name=$('#welcomeName')?.value.trim()||'',age=+($('#welcomeAge')?.value||0);if(!name)return toast('اكتب اسمك أولًا');if(age&&(age<3||age>110))return toast('العمر من 3 إلى 110 سنة');saveProfile(name,age||null);const style=$('#welcomeStyle')?.value||'auto',mapped=style==='lite'?'calm':style==='ultra'?'cinematic':'balanced';state.prefs=state.prefs||{};state.prefs.style=mapped;state.prefs.performance=style==='lite'?'lite':style==='ultra'?'high':state.prefs.performance||detectPerformanceTier();save();hydrateSettings();closeFirstWelcome();setTimeout(()=>showDailySplash(true),180)}
function startWelcomeFlow(){if(welcomeFlowStarted)return;welcomeFlowStarted=true;const qp=new URLSearchParams(location.search);if(qp.get('welcome')==='1'){openFirstWelcome();return}if(qp.get('splash')==='1'){showDailySplash(true);return}if(!state.name){openFirstWelcome();return}if(localStorage.getItem(welcomeReleaseKey)!=='1'){showDailySplash(true);return}showDailySplash(false)}
$('#welcomeStartBtn')?.addEventListener('click',saveWelcome);$('#splashClose')?.addEventListener('click',()=>closeSplash(true));$('#splashPlay')?.addEventListener('click',()=>$('#splashAudio')?.play().catch(()=>toast('اضغط تشغيل مرة أخرى من مشغل الصوت')));$('#splashStudy')?.addEventListener('click',()=>{closeSplash(false);go('study')});$('#welcomeModal')?.addEventListener('click',e=>{if(e.target===$('#welcomeModal'))closeFirstWelcome()});$('#dailySplash')?.addEventListener('click',e=>{if(e.target===$('#dailySplash'))closeSplash(true)});window.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#welcomeModal')?.classList.contains('show'))closeFirstWelcome();else if($('#dailySplash')?.classList.contains('show'))closeSplash(true)})
function requestLocationOnce(){if(state.location||!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(pos=>{state.location={lat:pos.coords.latitude,lon:pos.coords.longitude};save()},()=>{},{enableHighAccuracy:false,maximumAge:86400000,timeout:3500})}
function checkRitualBoundary(){const key=ritualKey();if(state.lastRitualKey!==key){state.lastRitualKey=key;save();if(state.name)showDailySplash(false)}}
const tapGlow=$('#tapGlow');document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,a,[data-go],[data-view],.style-card,.hifz-star');if(!el||el.matches('input,textarea,select'))return;if(tapGlow){tapGlow.style.left=e.clientX+'px';tapGlow.style.top=e.clientY+'px';tapGlow.classList.remove('show');void tapGlow.offsetWidth;tapGlow.classList.add('show');}});
document.body.dataset.view='home';renderAthar(atharIndex);renderPlan();hydrateSettings();updateHome();updateNetwork();addEventListener('online',updateNetwork);addEventListener('offline',updateNetwork);ocean();updatePlayer();requestLocationOnce();loadQuran();requestAnimationFrame(()=>setTimeout(startWelcomeFlow,120));window.addEventListener('pageshow',()=>setTimeout(startWelcomeFlow,80));setInterval(checkRitualBoundary,60000);
})();
