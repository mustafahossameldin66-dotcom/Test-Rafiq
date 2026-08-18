/* Rafiq Quran — V79 core application. Legacy feature code is now private to a single module scope. */
(function(){
'use strict';


let surahs=[],dailyVerses=[],method=[],reminders=[],asbab={},wordMeanings={},tazkiyah=[],tajRules={},adhkar=[],TAZKIYAH_DAYS=[],DEEP={},ARCHIVE_META={},ARCHIVE_EXTRA={},STUDY_GUIDES={},CATALOG=[],DOORS=[],DOOR_FILTER={},courseTracks={};

'use strict';
const STORAGE='rafiq-state-v2';
let DB_READY=Promise.resolve();
const DEFAULT={name:'',age:'',role:'',theme:'dark',graphics:1,reciter:'Husary_128kbps',volume:.85,notify:false,notifyHour:20,soundEnabled:true,calcMethod:5,asrMethod:0,city:'أسيوط',lat:null,lon:null,goal:604,goalUnit:'صفحة',planMode:'auto',dailyPlan:2,planDays:30,reviewRatio:3,evalMode:'weekly',restDays:[5],streak:0,lastActive:'',firstDate:'',focusMin:0,dailyReviewTarget:3,dailyRepTarget:10,dailyFocusTarget:20,entries:[],dailyLog:{},mistakes:[],prayers:{},dhikr:{},selectedEntryId:null,planStart:'',lastPrayerDate:'',lastDailyBoundary:'',season:'',studyCache:{},ambient:false};
let state=structuredClone(DEFAULT),chartMonth=new Date(),timer=null,timeLeft=0,focusStarted=0,recording=null,recordUrl=null,noise=null,deferredInstall=null,currentStudy=null,currentStudyTab='all',currentVerses=[],currentPrayer=null,oceanSound=null,oceanSoundGain=null,oceanSoundSource=null;
const $=id=>document.getElementById(id);const esc=s=>{const d=document.createElement('div');d.textContent=s??'';return d.innerHTML};const fmt=n=>Number(n||0).toLocaleString('en-US');
;
;
;
;
;
;
;
;
;
const $DAY_CACHE='rafiq-day-cache-v1';
function deepMerge(a,b){const o=structuredClone(a);for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&typeof o[k]==='object'&&o[k]&&!Array.isArray(o[k]))o[k]=deepMerge(o[k],b[k]);else o[k]=b[k]}return o}
async function load(){try{const raw=await window.RafiqDB.get('kv',STORAGE);state=raw?deepMerge(DEFAULT,raw):structuredClone(DEFAULT)}catch{state=structuredClone(DEFAULT)}if(!state.firstDate&&state.entries.length)state.firstDate=state.entries.map(e=>e.date).sort()[0]||dayKey();await save()}
function save(){return window.RafiqDB.set('kv',STORAGE,state)}
function dayKey(d=new Date()){const x=new Date(d);return new Date(x.getTime()-x.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function ritualKey(d=new Date()){const p=state.prayerToday?.Maghrib;const now=new Date(d);if(p){const [h,m]=String(p).split(':').map(Number);const mg=new Date(now);mg.setHours(h||0,m||0,0,0);if(now>=mg)return dayKey(addDays(now,1));}return dayKey(now)}
function requestNotifications(){if(!('Notification' in window))return toast('الإشعارات غير مدعومة في هذا المتصفح');Notification.requestPermission().then(p=>{state.notify=p==='granted';save();toast(p==='granted'?'تم تفعيل الإشعارات ✅':'لم يتم السماح بالإشعارات')}).catch(()=>toast('تعذر طلب الإذن'))}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function diffDays(a,b){return Math.floor((new Date(b)-new Date(a))/86400000)}
function hijri(d=new Date()){try{return new Intl.DateTimeFormat('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'}).format(d)}catch{return ''}}
function greeting(){const h=new Date().getHours(),n=state.name||'يا صديقي';if(h>=2&&h<5)return`وقت الخلوات يا ${n} 🌌`;if(h<6)return`صباح الهمة والبركة يا ${n} 🌅`;if(h<12)return`صباح الخير يا ${n} ☀️`;if(h<17)return`طاب يومك يا ${n} 🌤️`;if(h<22)return`مساء الهدوء يا ${n} 🌙`;return`ليلة مباركة يا ${n} 🌌`}
function setTimeGlow(){const h=new Date().getHours();const c=h<6?'rgba(92,133,86,.08)':h<12?'rgba(212,175,55,.10)':h<17?'rgba(220,155,70,.08)':h<21?'rgba(90,180,150,.08)':'rgba(51,82,55,.10)';document.documentElement.style.setProperty('--timeGlow',c)}
function applyGraphics(){
  const cores=navigator.hardwareConcurrency||8;
  const mem=navigator.deviceMemory||8;
  const compact=window.innerWidth<700;
  const coarse=matchMedia('(pointer:coarse)').matches;
  const lowPower=cores<=4 || mem<=4;
  document.body.classList.remove('mode-1','mode-2','mode-3');
  document.body.classList.add(`mode-${state.graphics}`);
  document.body.dataset.theme=state.theme;
  document.body.dataset.perf=(lowPower||state.graphics===1)?'lite':'full';
  document.body.classList.toggle('lite-mobile',compact||coarse||lowPower||state.graphics===1);
  document.body.dataset.graphics=String(state.graphics);
  createStars();
  createOceanBubbles();
  createGlobalOceanBubbles();
  const g=$('graphicsSelect');if(g)g.value=String(state.graphics);
  const t=$('themeSelect');if(t)t.value=state.theme;
}
function createStars(){const box=$('starsLayer');if(!box)return;box.innerHTML='';if(state.graphics===1)return;const n=state.graphics===3?(window.innerWidth>1400?28:window.innerWidth>1000?20:12):(window.innerWidth>1000?14:8);const f=document.createDocumentFragment();for(let i=0;i<n;i++){const s=document.createElement('span');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.setProperty('--dur',(20+Math.random()*18)+'s');s.style.setProperty('--dx',(-18+Math.random()*36)+'px');s.style.setProperty('--dy',(-18+Math.random()*36)+'px');f.appendChild(s)}box.appendChild(f)}
function toast(text){const t=document.createElement('div');t.textContent=text;t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10000;padding:10px 15px;border:1px solid var(--border);border-radius:999px;background:var(--surface2);color:var(--text);box-shadow:var(--shadow);font-weight:800';document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
function haptic(kind='light'){if(!navigator.vibrate)return;try{navigator.vibrate(kind==='done'?[12,25,12]:10)}catch{}}
function beep(kind='click'){if(!state.soundEnabled)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;window.__audio=window.__audio||new A();const c=window.__audio;if(c.state==='suspended')c.resume();const fs=kind==='shine'?[740,988,1319]:kind==='done'?[440,660,880]:kind==='ok'?[520,760]:[180];const type=kind==='shine'?'triangle':'sine';fs.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.value=.0001;g.gain.exponentialRampToValueAtTime(kind==='shine'?.055:.09,c.currentTime+.01+i*.06);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.13+i*.06);o.connect(g).connect(c.destination);o.start(c.currentTime+i*.06);o.stop(c.currentTime+.16+i*.06)})}
function particles(x,y){if(state.graphics===1)return;for(let i=0;i<10;i++){const p=document.createElement('span');p.className='particle';p.style.left=x+'px';p.style.top=y+'px';p.style.width=p.style.height=(4+Math.random()*5)+'px';p.style.background=Math.random()>.5?'var(--gold)':'var(--success)';const a=Math.random()*Math.PI*2,d=25+Math.random()*45;p.style.setProperty('--dx',Math.cos(a)*d+'px');p.style.setProperty('--dy',Math.sin(a)*d+'px');document.body.appendChild(p);setTimeout(()=>p.remove(),900)}}
function logActivity(k,n=1){const t=dayKey();state.dailyLog[t] ||= {save:0,review:0,rep:0,focus:0};state.dailyLog[t][k]=(state.dailyLog[t][k]||0)+n;save()}
function markActive(){const t=dayKey();if(state.lastActive===t)return;const old=state.streak||0;state.streak=!state.lastActive?1:(diffDays(state.lastActive,t)===1?old+1:1);state.lastActive=t;if(!state.firstDate)state.firstDate=t;if(state.streak>old&&state.streak%7===0)state.streakFreezes=Math.min(3,(state.streakFreezes||0)+1);save()}
function getDailyVerse(){return dailyVerses[Math.floor(Date.now()/86400000)%dailyVerses.length]}
function recitationUrl(){return ''}
function showDailySplash(force=false){if(!state.name)return;const key=ritualKey();if(!force&&state.lastDailyBoundary===key)return;const a=getDailyVerse();const ay=$('splashAyah'),ref=$('splashRef'),audio=$('splashAudio'),panel=$('dailySplash'),sg=$('splashGreeting'),sd=$('splashDate');if(!ay||!ref||!audio||!panel)return;if(sg)sg.textContent=greeting();if(sd)sd.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});ay.textContent=a.text;ref.textContent=`${a.ref} — بصوت ${a.name}`;audio.pause();audio.removeAttribute('src');audio.volume=Math.max(0,Math.min(1,state.volume||.85));audio.currentTime=0;panel.classList.add('show');const play=$('splashPlay');if(play)play.textContent='▶ تشغيل الآية';}
function closeSplash(mark=true){const a=$('splashAudio');if(a){a.pause();a.currentTime=0}$('dailySplash')?.classList.remove('show');if(mark){state.lastDailyBoundary=ritualKey();save()}}
function openModal(id){$(id)?.classList.add('show')};function closeModal(id){$(id)?.classList.remove('show')}
function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id)?.classList.add('active');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));document.body.classList.toggle('ocean-world',id==='spiritual');document.body.classList.toggle('view-spiritual',id==='spiritual');if($('globalZadOcean'))$('globalZadOcean').style.display=id==='spiritual'?'none':'block';if(id!=='spiritual')document.body.classList.remove('space-world');if(id==='spiritual'){const o=$('ocean'),s=$('spaceView');if(o){o.style.display='block';o.classList.remove('ocean-dive')}if(s)s.classList.remove('show')}window.scrollTo({top:0,behavior:'auto'});if(id==='home')renderHome();if(id==='planning')renderPlanning();if(id==='study')renderStudy();if(id==='mushaf')mushafInit();if(id==='spiritual'){renderSpiritual();createOceanBubbles();try{window.renderZadOverview?.()}catch{};try{window.renderV62?.()}catch{}}else if(oceanSound)stopOceanSound();if(id==='progress')renderProgress();if(id==='settings')renderSettings();if(id==='library'){try{window.renderV62?.();}catch{};try{window.__rafiqRenderReleaseForSpace?.(window.__rafiqCurrentSpaceKey||'knowledge');}catch{}}setTimeGlow()}
function profileSave(name,age){state.name=String(name||'').trim();state.age=age||'';save();}
function saveWelcome(){const n=$('welcomeName').value.trim();const age=+$('welcomeAge').value||'';if(!n)return toast('اكتب اسمك أولًا');if(age&& (age<3||age>110))return toast('العمر من 3 إلى 110 سنة');profileSave(n,age);const style=$('welcomeStyle').value;if(style==='lite'||style==='auto')state.graphics=1;else if(style==='balanced')state.graphics=2;else if(style==='ultra')state.graphics=3;applyGraphics();save();closeModal('welcomeModal');renderAll();setTimeout(()=>showDailySplash(false),180)}
function renderHome(){
  const greg=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const g=$('greeting'); if(g) g.textContent=greeting();
  const dl=$('dateLine'); if(dl) dl.textContent=greg;
  const hl=$('hijriLine'); if(hl) hl.textContent=`التاريخ الهجري: ${hijri()}`;
  const t=dayKey();const log=state.dailyLog[t]||{};const due=state.entries.filter(e=>e.nextReviewDate<=t&&e.hasBeenEvaluated);const fresh=state.entries.filter(e=>e.date===t&&!e.hasBeenEvaluated);const old=state.entries.filter(e=>e.date!==t);const pct=state.goal?Math.min(100,estimateProgress()/state.goal*100):0;$('heroPct').textContent=`${pct.toFixed(0)}%`;$('heroRing').style.setProperty('--pct',pct+'%');$('missionReviewText').textContent=`${log.review||0}/${state.dailyReviewTarget||3}`;$('missionRepText').textContent=`${log.rep||0}/${state.dailyRepTarget||10}`;$('missionFocusText').textContent=`${Math.round(log.focus||0)}/${state.dailyFocusTarget||20}د`;$('missionReviewBar').style.width=Math.min(100,(log.review||0)/(state.dailyReviewTarget||3)*100)+'%';$('missionRepBar').style.width=Math.min(100,(log.rep||0)/(state.dailyRepTarget||10)*100)+'%';$('missionFocusBar').style.width=Math.min(100,(log.focus||0)/(state.dailyFocusTarget||20)*100)+'%';$('homePriority').textContent=due.length?`ابدأ بـ ${due.length} مراجعة مستحقة الآن، ثم الحفظ الجديد، ثم 10 تكرارات غيبًا.`:fresh.length?`ابدأ بالحفظ الجديد: ${fresh.length} ورد، ثم أكمل 10 تكرارات غيبًا وسجّل تقييم اليوم.`:'لا توجد مراجعات طارئة الآن. نفّذ خطة اليوم أو أضف حفظًا جديدًا.';$('homeNewList').innerHTML=fresh.length?fresh.map(entryCard).join(''):'<div class="muted">لا يوجد حفظ جديد اليوم.</div>';$('homeDueList').innerHTML=due.length?due.map(entryCard).join(''):'<div class="muted">🎉 لا توجد مراجعات مستحقة الآن.</div>';$('homeOldSummary').textContent=old.length?`لديك ${old.length} وردًا محفوظًا سابقًا. المستحق الآن: ${old.filter(e=>e.nextReviewDate<=t).length}. خلال 7 أيام: ${old.filter(e=>e.nextReviewDate>t&&e.nextReviewDate<=dayKey(addDays(new Date(),7))).length}.`:'أضف محفوظك السابق مرة واحدة ليبني لك التطبيق مراجعاته.';$('homeOldList').innerHTML=old.slice(0,5).map(entryMini).join('')||'<div class="muted">لا يوجد محفوظ سابق مضاف بعد.</div>';$('homeSchedule').innerHTML=buildNextDays();$('homeMethod').innerHTML=method.slice(0,3).map(m=>`<div class="schedule-day"><strong>${m[0]} — ${m[1]}</strong><div class="small">${m[2]}</div></div>`).join('');$('todaySpiritualNote').textContent=tazkiyah[Math.floor(Date.now()/86400000)%tazkiyah.length];renderPrayerChecklist();const a=getDailyVerse();$('dailyVerseHome').textContent=a.text;$('dailyVerseRef').textContent=a.ref;}
function estimateProgress(){return state.entries.reduce((n,e)=>n+(e.hasBeenEvaluated?Math.max(0,e.baseUnits||1):0),0)}
function buildNextDays(){let h='';for(let i=0;i<7;i++){const d=addDays(new Date(),i),k=dayKey(d),due=state.entries.filter(e=>e.nextReviewDate<=k&&e.hasBeenEvaluated).length,newN=state.entries.filter(e=>e.date===k&&!e.hasBeenEvaluated).length;h+=`<div class="schedule-day"><strong>${d.toLocaleDateString('ar-EG',{weekday:'long'})}</strong><div class="small">${k} — مراجعة ${due} • جديد ${newN|| (i===0?state.dailyPlan:0)}</div></div>`}return h}
function entryCard(e){const t=dayKey(),due=e.hasBeenEvaluated&&e.nextReviewDate<=t,phase=e.phaseDays?.length||0,reps=e.sessionReps||0;const reviewButtons=phase<7?`<div class="qbtns"><button class="success" onclick="reviewEntry('${e.id}','pass')">✅ أتممت اليوم</button><button class="danger" onclick="reviewEntry('${e.id}','fail')">🔄 لم أتقن</button></div>`:state.evalMode==='weekly'?`<div class="qbtns"><button class="success" onclick="reviewEntry('${e.id}','pass')">✅ ممتازة — 7 أيام</button><button class="danger" onclick="reviewEntry('${e.id}','fail')">🔴 أعد غدًا</button></div>`:`<div class="qbtns"><button class="info" onclick="reviewEntry('${e.id}',4)">🔵 سهل</button><button class="success" onclick="reviewEntry('${e.id}',3)">🟢 تذكرته</button><button class="warning" onclick="reviewEntry('${e.id}',2)">🟡 بصعوبة</button><button class="danger" onclick="reviewEntry('${e.id}',1)">🔴 نسيت</button></div>`;return`<div class="item ${due?'due':''} ${e.intensive?'focus':''}"><div class="item-header"><div><div class="quran-title">${esc(e.label)} ${e.isExactLetters?'🎯':''}</div>${e.note?`<div class="note-txt">📌 ${esc(e.note)}</div>`:''}</div><div class="row"><button class="action info" onclick="openStudy('${e.id}')">✨</button><button class="action danger" onclick="openRecorder('${e.id}')">🎤</button><button class="action" onclick="deleteEntry('${e.id}')">✕</button></div></div><div class="item-meta"><div>${!e.hasBeenEvaluated?'✨ ورد جديد':due?'⏰ مستحق الآن':`📅 القادم ${e.nextReviewDate}`}</div><div class="phase"><span class="badge gold">${phase<7?`تثبيت ${phase}/7`:'استدامة'}</span>${phase<7?Array.from({length:7},(_,i)=>`<span class="dot ${i<phase?'on':''}"></span>`).join(''):''}</div></div><div class="links"><a href="https://quran.com/${smartPath(e.label)}" target="_blank" rel="noopener">📖 المصحف</a><button class="action" onclick="openStudy('${e.id}')">📚 دراسة الورد</button></div><div class="rep-box"><div class="rep-row"><b>${phase<7&&!e.hasBeenEvaluated?'هدف التثبيت: 10 تكرارات غيبًا':'تكرار إضافي'}</b><button class="rep-btn ${reps>=10?'done':''}" onclick="addRep('${e.id}',this)">📿 كررت (${reps})</button></div><div class="small">إجمالي التكرارات: ${e.totalReps||0}</div></div>${(!e.hasBeenEvaluated||due)?reviewButtons:''}</div>`}
function entryMini(e){return`<div class="old-row"><div><b>${esc(e.label)}</b><div class="small">${e.nextReviewDate<=dayKey()?'مستحق الآن':'المراجعة '+e.nextReviewDate}</div></div><span class="badge ${e.nextReviewDate<=dayKey()?'red':'gold'}">${e.nextReviewDate<=dayKey()?'⏰ مستحق':'📅 مجدول'}</span><button class="action" onclick="openStudy('${e.id}')">دراسة</button></div>`}
function smartPath(label){const m=label.match(/(?:صفحة|صفحه|ص)\s*(\d+)/);if(m)return`page/${m[1]}`;let s=-1;surahs.forEach((x,i)=>{if(s<0&&label.includes(x))s=i+1});const a=label.match(/(?:آية|ايه|آيه|اية)\s*(\d+)/);return s>0?(a?`${s}/${a[1]}`:`${s}`):`search?q=${encodeURIComponent(label)}`}
function saveEntry(label,note,intensive,baseLetters,old=false){const id=crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());const e={id,label,note,intensive:!!intensive,isExactLetters:false,date:dayKey(),nextReviewDate:dayKey(),hasBeenEvaluated:false,phaseDays:old?['old1','old2','old3','old4','old5','old6','old7']:[],reviewCount:0,reviewReads:0,manualReps:0,totalReps:0,sessionReps:0,lastRepDate:dayKey(),interval:old?7:0,ease:2.5,srsLevel:old?1:0,failCount:0,baseLetters,baseUnits:Math.max(.1,baseLetters/500)};state.entries.push(e);logActivity('save');markActive();save();window.RafiqHifz?.(old?'addArchive':'addNew')?.({label,baseLetters,date:e.date,nextReviewDate:e.nextReviewDate}).then(x=>{if(x){e.hifzId=x.id;e.hifzBucket=old?'archive':'new';return save()}}).catch(()=>{});renderAll();particles(innerWidth/2,innerHeight/2);beep('done');haptic('done')}
async function resolveLetters(label,count,unit){try{if(!quranBook)await loadQuranBook();const ref=parseRef(label);if(ref?.sura&&ref?.aya){const s=quranBook?.find(x=>x.s===ref.sura);const v=s?.verses?.find(x=>x.a===ref.aya);if(v){const n=v.text.replace(/[^\u0621-\u064A]/g,'').length;return n||count*unit}}if(ref?.page){const n=(quranBook||[]).flatMap(x=>x.verses||[]).filter(v=>String(v.global||'').startsWith('')).slice(0,0).length;void n}return count*unit}catch{return count*unit}}

function parseRef(label){const page=label.match(/(?:صفحة|صفحه|ص)\s*(\d+)/);if(page)return{page:+page[1]};let s=-1;surahs.forEach((x,i)=>{if(s<0&&label.includes(x))s=i+1});const a=label.match(/(?:آية|ايه|آيه|اية)\s*(\d+)/);return s>0&&a?{sura:s,aya:+a[1]}:null}
async function addNew(){const label=$('newLabel').value.trim();if(!label)return toast('اكتب الورد أولًا');const count=+$('newUnitCount').value||1,unit=+$('newUnit').value||500;$('saveNewBtn').disabled=true;const letters=await resolveLetters(label,count,unit);saveEntry(label,$('newNote').value.trim(),$('intensiveCheck').checked,letters,false);closeModal('addNewModal');$('newLabel').value='';$('newNote').value='';$('intensiveCheck').checked=false;$('saveNewBtn').disabled=false}
async function addOld(){const label=$('oldLabel').value.trim();if(!label)return toast('اكتب اسم المحفوظ');const count=+$('oldCount').value||1,unit=+$('oldUnit').value||500;const letters=await resolveLetters(label,count,unit);saveEntry(label,'',false,letters,true);closeModal('addOldModal');$('oldLabel').value=''}
function deleteEntry(id){const e=state.entries.find(x=>x.id===id);if(!e)return;if(!confirm(`حذف «${e.label}»؟`))return;state.entries=state.entries.filter(x=>x.id!==id);save();if(e.hifzId&&e.hifzBucket)window.RafiqHifz?.remove?.(e.hifzId,e.hifzBucket).then(()=>window.syncHifzSnapshot?.()).catch(()=>{});renderAll()}
function addRep(id,btn){const e=state.entries.find(x=>x.id===id);if(!e)return;if(e.lastRepDate!==dayKey())e.sessionReps=0;e.sessionReps++;e.manualReps++;e.totalReps=e.manualReps+e.reviewReads;e.lastRepDate=dayKey();logActivity('rep');markActive();save();if(e.hifzId&&e.hifzBucket==='new')window.RafiqHifz?.recordNew?.(e.hifzId,4).then(()=>window.syncHifzSnapshot?.()).catch(()=>{});renderAll();if(btn){const r=btn.getBoundingClientRect();particles(r.left+r.width/2,r.top+r.height/2)}beep(e.sessionReps>=10?'done':'click');haptic(e.sessionReps>=10?'done':'light')}
function reviewEntry(id,q){const e=state.entries.find(x=>x.id===id);if(!e)return;const t=dayKey();const phase=e.phaseDays?.length||0;if(phase<7){if((e.sessionReps||0)<10&&q==='pass'&&!confirm('لم تكمل 10 تكرارات. هل تريد التقييم الآن؟'))return;if(q==='pass'){if(e.phaseDays.includes(t))return toast('سجلت مراجعة اليوم بالفعل');if(e.phaseDays.length&&e.phaseDays.at(-1).match(/^\d{4}-\d{2}-\d{2}$/)&&diffDays(e.phaseDays.at(-1),t)>1)e.phaseDays=[];e.phaseDays.push(t);e.interval=1}else{e.phaseDays=[];e.interval=1;e.failCount++}}else{if(state.evalMode==='weekly')e.interval=q==='pass'?7:1;else if(q===4){e.srsLevel++;e.ease+=.15;e.interval=e.srsLevel===1?4:Math.max(1,Math.round((e.interval||1)*e.ease*1.3))}else if(q===3){e.srsLevel++;e.interval=e.srsLevel===1?1:Math.max(1,Math.round((e.interval||1)*e.ease))}else if(q===2){e.ease=Math.max(1.3,e.ease-.15);e.interval=Math.max(1,Math.round((e.interval||1)*1.2))}else{e.srsLevel=0;e.interval=1;e.failCount++}}e.hasBeenEvaluated=true;e.reviewCount++;e.reviewReads++;e.totalReps=e.manualReps+e.reviewReads;e.sessionReps=0;const d=addDays(new Date(),e.interval);e.nextReviewDate=dayKey(d);logActivity('review');markActive();save();if(e.hifzId){const qv=q==='pass'?4:Number(q);if(e.hifzBucket==='new')window.RafiqHifz?.completeNewDay?.(e.hifzId,qv).then(()=>window.syncHifzSnapshot?.()).catch(()=>{});else window.RafiqHifz?.review?.(e.hifzId,qv).then(()=>window.syncHifzSnapshot?.()).catch(()=>{})}renderAll();beep((q==='pass'||q===3||q===4||e.phaseDays.length>=7)?'done':'click');haptic((q==='pass'||q===3||q===4)?'done':'light')}
function renderPlanning(){const t=dayKey();$('weeklyPlan').innerHTML=buildPlan(7);$('monthlyPlan').innerHTML=buildPlan(30);const arr=[...state.entries].sort((a,b)=>a.nextReviewDate.localeCompare(b.nextReviewDate));$('poolList').innerHTML=arr.length?arr.map(entryCard).join(''):'<div class="muted">لم تضف أورادًا بعد.</div>';const f=state.entries.filter(e=>e.intensive);$('focusList').innerHTML=f.length?f.map(entryCard).join(''):'<div class="muted">لا توجد أوراد في المتابعة المكثفة.</div>';renderPlanPreview()}
function buildPlan(days){let h='';for(let i=0;i<days;i++){const d=addDays(new Date(),i),k=dayKey(d),due=state.entries.filter(e=>e.hasBeenEvaluated&&e.nextReviewDate<=k).length,newN=i===0?state.dailyPlan:state.dailyPlan;h+=`<div class="schedule-day"><strong>${d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'short'})}</strong><div class="small">جديد: ${newN} ${state.goalUnit} • مراجعة: ${due}</div></div>`}return h}
function renderPlanPreview(){const d=state.planDays||30,qty=state.planMode==='auto'?Math.max(1,Math.ceil((state.goal||604)/d)):state.dailyPlan;$('planPreview').innerHTML=`الخطة الحالية: <b>${qty}</b> ${state.goalUnit} يوميًا لمدة <b>${d}</b> يومًا، مع مراجعة تقارب <b>${state.reviewRatio}</b> وحدات مراجعة لكل وحدة جديد.`}
function savePlan(){state.planMode=$('planMode').value;state.dailyPlan=Math.max(1,Math.round(+$('planDaily').value||state.dailyPlan||2));state.planDays=Math.max(1,Math.round(+$('planDays').value||state.planDays||30));state.reviewRatio=Math.max(1,Math.min(20,Math.round(+$('planReviewRatio').value||3)));if(state.planMode==='auto')state.dailyPlan=Math.max(1,Math.ceil((state.goal||604)/state.planDays));state.planStart=dayKey();save();renderAll();toast('تم حفظ خطة الحفظ والمراجعة ✅')}
function calculateReverse(){const n=+$('reverseAmount').value;const d=$('reverseDate').value;if(!n||!d)return toast('أدخل البيانات');const days=Math.max(1,diffDays(dayKey(),d));const per=n/days;$('reverseResult').innerHTML=`تحتاج تقريبًا إلى <b>${per.toFixed(2)}</b> ${esc($('reverseUnit').value)} يوميًا لمدة <b>${days}</b> يومًا.`}
function prayerCacheKey(){return `prayer-v2:${dayKey()}:${state.city}:${state.lat||''}:${state.lon||''}:${state.calcMethod}:${state.asrMethod}`}
function normalizePrayerTime(v,tz){if(!v)return'';const str=String(v);if(/T\d{2}:\d{2}/.test(str)){const d=new Date(str);if(!Number.isNaN(d.getTime())){try{return new Intl.DateTimeFormat('en-GB',{timeZone:tz||undefined,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d)}catch{return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d)}}}const hm=str.match(/^(\d{1,2}:\d{2})/);return hm?hm[1].padStart(5,'0'):str}
async function prayerTimes(){const key=prayerCacheKey();try{const local=await window.RafiqDB.get('prayer',key);if(local)return local}catch{}const d=new Date();const data=window.RafiqPrayer?.calculate(d,state.lat,state.lon,state.calcMethod||5,state.asrMethod||0)||null;if(data){await window.RafiqDB.set('prayer',key,data);return data}return null}

function renderPrayerChecklist(){const names=['الفجر','الظهر','العصر','المغرب','العشاء'];const t=dayKey();const box=$('prayerChecklist');box.innerHTML=names.map(n=>`<label class="schedule-day"><span class="row"><input type="checkbox" data-prayer="${n}" style="width:18px" ${state.prayers[t]?.[n]?'checked':''}><strong>${n}</strong></span></label>`).join('');box.querySelectorAll('input').forEach(i=>i.onchange=()=>{state.prayers[t] ||= {};state.prayers[t][i.dataset.prayer]=i.checked;save();});const times=state.prayerToday;$('nextReminder').textContent=nextReminderText(times)}
function nextReminderText(times){if(!times)return'فعّل تحديد موقعك للحصول على مواقيت الصلاة حسب موقعك.';const now=new Date();const order=[['Fajr','الفجر'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];for(const [k,n] of order){const tt=times[k];if(!tt)continue;const [h,m]=tt.split(':').map(Number);const d=new Date();d.setHours(h,m,0,0);if(d>now)return`القادم: ${n} الساعة ${tt}`;}return'بعد العشاء: الشفع والوتر، ثم بعد منتصف الليل تذكير بقيام الليل والاستغفار والدعاء.'}
async function refreshPrayer(){const p=await prayerTimes();state.prayerToday=p;save();renderHome();if(p)toast('تم تحديث مواقيت الصلاة ✅')}
function renderSettings(){if(state.reciter!=='Husary_128kbps')state.reciter='Husary_128kbps';$('graphicsSelect').value=state.graphics;$('themeSelect').value=state.theme;$('profileName').value=state.name;$('profileAge').value=state.age;$('reciterSelect').value=state.reciter;$('volumeRange').value=state.volume;$('notifyToggle').checked=state.notify;$('notifyHour').value=state.notifyHour;$('calcMethod').value=state.calcMethod;$('asrMethod').value=state.asrMethod;$('cityInput').value=state.city;$('prayerSettingsStatus').textContent=state.prayerToday?`المصدر: ${state.prayerToday.__source||'الموقع'}${state.prayerToday.__timezone?` — المنطقة الزمنية: ${state.prayerToday.__timezone}`:''}`:'لم تحفظ مواقيت اليوم بعد. سيتم استخدام GPS عند السماح به، وإلا المدينة المحددة.';$('installStatus').textContent=deferredInstall?'التثبيت متاح الآن.':'يمكن التثبيت من قائمة المتصفح إذا لم يظهر الزر.'}
function personalizedTazkiyah(){const role=state.role||state.v62?.profile?.role||'';const tips={
'طالب':'اجعل جلسة المذاكرة أمانة: ابدأ بنية طلب العلم، ثم راجع وردك ولو بقدر يسير.',
'طالب جامعي':'قاوم التأجيل بخطوة صغيرة: 15 دقيقة دراسة مركزة ثم آية واحدة مع عملها.',
'صيدلي':'الإتقان والأمانة جزء من تزكية المهنة؛ حافظ على ورد ثابت حتى في أيام التدريب.',
'طبيب':'الضغط لا يعني يومًا صفرًا؛ اجعل لك حدًا أدنى من القرآن والذكر لا يسقط.',
'مهندس':'خطط لورد يناسب اليوم المزدحم، وراجع قبل أن تزيد الجديد.',
'معلم':'ما تتعلمه يَظهر في أسلوب تعليمك؛ اجعل الرفق والدقة جزءًا من وردك اليومي.',
'محفّظ':'زد المتابعة وقلّل العجلة؛ التثبيت قبل التكثير يحفظ أثر العلم.',
'أب':'اجعل أبناءك يرون منك الاستمرار العملي لا كثرة الكلام.',
'أم':'اصنعي حدًا أدنى واقعيًا يحفظ لك صلتك بالقرآن وسط مسؤوليات البيت.'};return tips[role]||tazkiyah[Math.floor(Date.now()/86400000)%tazkiyah.length]||'ابدأ بخطوة صغيرة ثابتة اليوم.'}
function renderSpiritual(){const el=$('tazkiyahText');if(el)el.textContent=personalizedTazkiyah()}
function dayScore(k){const l=state.dailyLog[k]||{};return(l.save||0)*3+(l.review||0)*2+(l.rep||0)*.12+(l.focus||0)*.05}
function renderProgress(){const ev=state.entries.filter(e=>e.hasBeenEvaluated).length;const letters=state.entries.reduce((n,e)=>n+(e.baseLetters||0)*(e.totalReps||0),0);$('pStreak').textContent=state.streak;$('pEntries').textContent=state.entries.length;$('pReviews').textContent=state.entries.reduce((n,e)=>n+(e.reviewCount||0),0);$('pLetters').textContent=fmt(letters);const pct=state.goal?Math.min(100,ev/state.goal*100):0;$('goalProgress').style.width=pct+'%';$('goalText').textContent=`إنجاز ${ev} من ${state.goal} ${state.goalUnit} (${pct.toFixed(1)}%)`;renderCalendar();drawChart();renderHeatmap();renderConstellation();renderAnalytics();renderMistakes()}
function renderCalendar(){const y=chartMonth.getFullYear(),m=chartMonth.getMonth();$('calTitle').textContent=new Date(y,m,1).toLocaleDateString('ar-EG',{month:'long',year:'numeric'});const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();let h='<div class="cal">';['أحد','اثن','ثلا','أرب','خمي','جمع','سبت'].forEach(x=>h+=`<div class="calcell calhead">${x}</div>`);for(let i=0;i<first;i++)h+='<div class="calcell"></div>';for(let d=1;d<=days;d++){const k=dayKey(new Date(y,m,d)),s=dayScore(k),cls=s>=6?'dg':s>0?'dy':k<dayKey()?'dr':'';h+=`<div class="calcell ${cls}"><b>${d}</b><span>${s.toFixed(1)}</span></div>`}h+='</div>';$('calendar').innerHTML=h}
function drawChart(){const c=$('activityChart'),r=c.getBoundingClientRect(),w=Math.max(320,r.width),h=260,dpr=devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;const ctx=c.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);const vals=[];for(let i=29;i>=0;i--)vals.push(dayScore(dayKey(addDays(new Date(),-i))));const max=Math.max(8,...vals);ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--gold');ctx.lineWidth=3;ctx.beginPath();vals.forEach((v,i)=>{const x=18+i*(w-36)/29,y=h-25-(v/max)*(h-45);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
function renderHeatmap(){const box=$('heatmap');box.innerHTML='';for(let i=363;i>=0;i--){const s=dayScore(dayKey(addDays(new Date(),-i))),d=document.createElement('div');d.className='heat '+(s>=10?'l4':s>=6?'l3':s>=2?'l2':s>0?'l1':'');d.title=dayKey(addDays(new Date(),-i));box.appendChild(d)}}
function renderConstellation(){const done=new Set();state.entries.forEach(e=>{if(!e.hasBeenEvaluated)return;surahs.forEach((s,i)=>{if(e.label.includes(s))done.add(i)})});$('constellation').innerHTML=surahs.map((s,i)=>`<div class="cstar ${done.has(i)?'on':''}" title="${s}">★</div>`).join('')}
function renderAnalytics(){const days=Object.keys(state.dailyLog),reviews=days.reduce((n,k)=>n+(state.dailyLog[k]?.review||0),0),focus=state.focusMin||0;$('analytics').innerHTML=`<div class="schedule-day">متوسط التركيز لكل ورد<br><b>${(focus/Math.max(1,state.entries.length)).toFixed(1)} دقيقة</b></div><div class="schedule-day">إجمالي المراجعات<br><b>${reviews}</b></div><div class="schedule-day">أيام النشاط<br><b>${days.length}</b></div><div class="schedule-day">أفضل سلسلة<br><b>${state.streak} يوم</b></div>`}
function renderMistakes(){const list=state.mistakes||[];$('mistakesList').innerHTML=list.length?list.map((m,i)=>`<div class="schedule-day"><div class="row" style="justify-content:space-between"><strong>${esc(m.title)}</strong><button class="action danger" onclick="deleteMistake(${i})">✕</button></div><div class="small">${esc(m.text)}</div></div>`).join(''):'<div class="muted">لا توجد ملاحظات بعد.</div>';$('mistakeFormList').innerHTML=list.map((m,i)=>`<div class="schedule-day"><strong>${esc(m.title)}</strong><div class="small">${esc(m.text)}</div></div>`).join('')}
function deleteMistake(i){state.mistakes.splice(i,1);save();renderProgress()}
function saveMistake(){const t=$('mistakeTitle').value.trim(),x=$('mistakeText').value.trim();if(!t||!x)return toast('اكتب العنوان والملاحظة');state.mistakes.unshift({title:t,text:x,type:'ملاحظة',date:dayKey()});save();$('mistakeTitle').value='';$('mistakeText').value='';renderMistakes()}
async function fetchStudyVerses(refs){if(!quranBook)await loadQuranBook();const out=[];for(const ref of refs||[]){if(ref.sura&&ref.aya){const s=quranBook?.find(x=>x.s===ref.sura);const v=s?.verses?.find(x=>x.a===ref.aya);if(v)out.push({sura:ref.sura,aya:ref.aya,text:v.text,ref:`${s?.name||surahs[ref.sura-1]||'السورة'} — ${ref.aya}`})}else if(ref.page){const flat=(quranBook||[]).flatMap(x=>x.verses||[]);const perPage=Math.ceil(flat.length/604);const idx=Math.max(0,(ref.page-1)*perPage);flat.slice(idx,idx+Math.min(perPage,30)).forEach(v=>out.push({...v,sura:flat.find(x=>x===v)?.s||0,aya:v.a,ref:v.ref||''}))}}return out}

function parseStudyRefs(label){const s=label.replace(/[أإآ]/g,'ا');let sura=-1;surahs.forEach((x,i)=>{if(sura<0&&s.includes(x.replace(/[أإآ]/g,'ا')))sura=i+1});const range=s.match(/(?:آيات|ايات|اية|آية)\s*(\d+)\s*(?:-|–|—|الى|إلى)\s*(\d+)/);if(range)return Array.from({length:Math.min(12,Math.abs(+range[2]-+range[1])+1)},(_,i)=>({sura,aya:Math.min(+range[1],+range[2])+i}));const one=s.match(/(?:آية|اية|آيه|ايه)\s*(\d+)/);if(one&&sura>0)return[{sura,aya:+one[1]}];const page=s.match(/(?:صفحة|صفحه|ص)\s*(\d+)/);if(page)return[{page:+page[1]}];return sura>0?[{sura,aya:1}]:[]}
const LTR='ءابةتثجحخدذرزسشصضطظعغفقكلمنهويٱ';const heavy=new Set('خصضغطقظ'.split(''));const qalq=new Set('قطبجد'.split(''));function splitGraphemes(text){const out=[];let cur=null;for(const ch of String(text||'')){if(/[ء-يٱ]/.test(ch)){cur={b:ch,m:[],raw:ch};out.push(cur)}else if(/[ًٌٍَُِّْٰ]/.test(ch)&&cur){cur.m.push(ch);cur.raw+=ch}else if(/\s/.test(ch))out.push({space:true,raw:ch});else out.push({punct:true,raw:ch})}return out}
function prevG(t,i){for(let j=i-1;j>=0;j--)if(!t[j].space&&!t[j].punct)return j;return -1}function nextG(t,i){for(let j=i+1;j<t.length;j++)if(!t[j].space&&!t[j].punct)return j;return -1}
function haraka(m){
if(m.includes('َ'))return'فتحة — صوت قصير «ـَ»';
if(m.includes('ُ'))return'ضمة — صوت قصير «ـُ»';
if(m.includes('ِ'))return'كسرة — صوت قصير «ـِ»';
if(m.includes('ْ'))return'سكون — لا حركة بعد الحرف';
if(m.includes('ّ'))return'شدة — الحرف يُنطق قويًا/مكرر البنية';
if(m.includes('ٰ'))return'علامة ألف صغيرة فوق الحرف — مدّ صوت الألف في النطق';
if(m.includes('ً'))return'تنوين فتح — صوت «ـً» في الوصل';
if(m.includes('ٌ'))return'تنوين ضم — صوت «ـٌ» في الوصل';
if(m.includes('ٍ'))return'تنوين كسر — صوت «ـٍ» في الوصل';
return'لا حركة مكتوبة على هذا الحرف';}

function firstNonSpace(t,start){for(let j=start;j<t.length;j++)if(!t[j].space&&!t[j].punct)return j;return-1}
function nextWordStart(t,i){let seen=false;for(let j=i+1;j<t.length;j++){if(t[j].space){seen=true;continue}if(t[j].punct)continue;if(seen)return j;}return-1}
function wordRanges(text){const t=splitGraphemes(text),ranges=[];let s=-1;for(let i=0;i<t.length;i++){if(t[i].space||t[i].punct){if(s>=0){ranges.push([s,i-1]);s=-1}}else if(s<0)s=i}if(s>=0)ranges.push([s,t.length-1]);return{t,ranges}}
function connectedRule(prevWord,lastIndex,nextWord,firstIndex,t){const rules=[];const add=x=>{if(!rules.includes(x))rules.push(x)};const a=t[lastIndex],b=t[firstIndex];if(!a||!b)return rules;const nb=b.b;const isTan=a.m.some(x=>['ً','ٌ','ٍ'].includes(x));
if(a.b==='ن'&&(a.m.includes('ْ')||isTan)){if('ءأإٱهـعحغخ'.includes(nb))add('الإظهار الحلقي');else if('ينمو'.includes(nb))add('الإدغام بغنة');else if('لر'.includes(nb))add('الإدغام بغير غنة');else if(nb==='ب')add('الإقلاب');else if('تثجدذزسشصضطظفقك'.includes(nb))add('الإخفاء الحقيقي')}
if(a.b==='م'&&a.m.includes('ْ')){if(nb==='ب')add('الإخفاء الشفوي');else if(nb==='م')add('الإدغام الشفوي');else add('الإظهار الشفوي')}
if(nb==='ٱ')add('همزة الوصل');
if(a.b==='ه'&&/[ُِ]/.test(a.m) && !a.m.includes('ْ'))add('صلة هاء الضمير — تحقق من شروط الصلة في هذا الموضع');
return rules}
function simpleLetterInstruction(g,rules){
const base=g.b;const h=haraka(g.m);let action=`انطق «${base}» مع ${h}.`;
if(g.m.includes('ّ'))action+=' الشدة تعني أن الحرف أقوى وفيه تكرار بنيوي للحرف، فلا تفكك النطق إلى حرفين منفصلين.';
if(g.m.includes('ٰ'))action+=' لا تقل «ألف خنجرية» أثناء القراءة؛ هذه فقط اسم العلامة. اقرأ صوت الألف الطويل كما تسمعه في التلاوة.';
if(rules.includes('غنة النون المشددة')||rules.includes('غنة الميم المشددة'))action+=' هنا يوجد صوت غنة من الخيشوم بمقدار حركتين.';
if(rules.includes('القلقلة'))action+=' أظهر ارتداد الحرف الساكن من غير إضافة حركة جديدة.';
if(rules.some(r=>r.includes('مد')))action+=' اجعل المد ممتدًا بالقدر الخاص بالحكم، وتعلّم المقدار بالسماع والتلقي.';
return action}
function simpleConnectionInstruction(word,nextWord,rules){
if(!nextWord)return`لا توجد كلمة بعدها داخل هذا المقطع. عند الوقف هنا: اقرأ نهاية الكلمة بحسب علامة الوقف وحكم الوقف.`;
if(!rules.length)return`عند الوصل: أكمل آخر صوت من «${word}» إلى أول صوت من «${nextWord}» من غير قطع بين الكلمتين. اسمع النموذج ثم قلده ببطء مرة، ثم بسرعة طبيعية.`;
return`عند الوصل بين «${word}» و«${nextWord}»: ${rules.map(r=>tajRules[r]||r).join(' ')} اسمع الكلمتين معًا، ثم قلدهما ببطء، ثم أعدهما بالنطق الطبيعي.`}
function renderBeginnerWordStudy(text){const {t,ranges}=wordRanges(text);let inspector='';const rows=ranges.map((rg,wi)=>{const word=t.slice(rg[0],rg[1]+1).map(x=>x.raw).join('');const nextRg=ranges[wi+1];const nextWord=nextRg?t.slice(nextRg[0],nextRg[1]+1).map(x=>x.raw).join(''):'';const bridge=nextRg?connectedRule(word,rg[1],nextWord,nextRg[0],t):[];const letters=t.slice(rg[0],rg[1]+1);let chips=letters.map((g,li)=>{const idx=rg[0]+li;const rs=tajweedFor(t,idx);const data=`data-gidx="${idx}" data-word-index="${wi}" data-next-word="${esc(nextWord)}" data-letter="${esc(g.b)}" data-haraka="${esc(haraka(g.m))}" data-rules="${esc(rs.join('، '))}"`;return`<button type="button" class="taj-letter-chip" ${data}>${esc(g.raw)}</button>`}).join('');return`<div class="taj-word-line"><div class="taj-word-main">${esc(word)}<small>اضغط على أي حرف داخل الكلمة</small></div><div class="taj-word-explain"><div><b>النطق كلمةً كلمة:</b> ابدأ من أول حرف بالحركة الموجودة عليه، ثم أكمل بقية الحروف كما تظهر أمامك.</div><div class="taj-letter-grid">${chips}</div>${nextWord?`<div class="connection"><b>الوصل مع الكلمة التالية «${esc(nextWord)}»:</b><br>${esc(simpleConnectionInstruction(word,nextWord,bridge))}</div>`:''}</div></div>`}).join('');return `<div class="taj-word-study">${rows}</div><div id="tajInspector" class="taj-inspector-panel"><h4>👂 شرح الحرف والنطق</h4><div class="muted">اضغط على حرف من أي كلمة، وسيظهر هنا: ما هو الحرف، حركته، كيف تنطقه ببساطة، وما الحكم التجويدي الذي رصده محلل التطبيق.</div></div>`}
function tajweedFor(t,i){const g=t[i],rules=[];if(!g||g.space||g.punct)return rules;const p=prevG(t,i),n=nextG(t,i),nb=n>=0?t[n].b:'';const add=x=>{if(!rules.includes(x))rules.push(x)};if(g.b==='ن'&&(g.m.includes('ْ')||g.m.some(x=>['ً','ٌ','ٍ'].includes(x)))){if('ءأإٱهـعحغخ'.includes(nb))add('الإظهار الحلقي');else if('ينمو'.includes(nb))add('الإدغام بغنة');else if('لر'.includes(nb))add('الإدغام بغير غنة');else if(nb==='ب')add('الإقلاب');else if('تثجدذزسشصضطظفقك'.includes(nb))add('الإخفاء الحقيقي')}
if(g.b==='م'&&g.m.includes('ْ')){if(nb==='ب')add('الإخفاء الشفوي');else if(nb==='م')add('الإدغام الشفوي');else add('الإظهار الشفوي')}
if(g.b==='ن'&&g.m.includes('ّ'))add('غنة النون المشددة');if(g.b==='م'&&g.m.includes('ّ'))add('غنة الميم المشددة');if(qalq.has(g.b)&&g.m.includes('ْ'))add('القلقلة');if(g.b==='ل'&&p<0){}if(heavy.has(g.b))add('تفخيم حروف الاستعلاء');if(g.b==='ٱ')add('همزة الوصل');if('أإؤئ'.includes(g.b))add('همزة القطع');if(g.m.includes('ٰ'))add('الألف الخنجرية');if(g.b==='و'||g.b==='ي'){if(g.m.includes('ْ')&&p>=0&&t[p].m.includes('َ'))add('مد اللين');if(g.b==='و'&&p>=0&&t[p].m.includes('ُ'))add('المد الطبيعي');if(g.b==='ي'&&p>=0&&t[p].m.includes('ِ'))add('المد الطبيعي')}if(g.b==='ا'&&p>=0&&t[p].m.includes('َ'))add('المد الطبيعي');if(g.b==='ر'){if(g.m.includes('ِ'))add('ترقيق الراء');else if(g.m.includes('َ')||g.m.includes('ُ'))add('تفخيم الراء')}return rules}
function renderStudy(){if(!currentStudy)return;const byTab=currentStudyTab;const tabs=[['all','✨ الكل'],['tajweed','🎙️ جوّد حفظك'],['tafsir','📖 التفسير'],['words','🔎 الكلمات'],['asbab','🕊️ أسباب النزول']];let html=`<div class="study-panel"><b style="color:var(--gold)">${esc(currentStudy.label)}</b><div class="muted">اختر أي حرف أو كلمة للتفصيل. التحليل الآلي إرشادي، ولا يغني عن التلقي الصحيح.</div></div>`;if(byTab==='all'||byTab==='tajweed')html+=renderTajweedHTML();if(byTab==='all'||byTab==='tafsir')html+=renderTafsirHTML();if(byTab==='all'||byTab==='words')html+=renderWordsHTML();if(byTab==='all'||byTab==='asbab')html+=renderAsbabHTML();html+=renderRecitationHTML();$('studyBody').innerHTML=html;bindTajweedClicks()}
function renderTajweedHTML(){if(!currentVerses.length)return'';const all=new Set();const verseHTML=currentVerses.map(v=>{const t=splitGraphemes(v.text);let h='';t.forEach((g,i)=>{if(g.space||g.punct){h+=esc(g.raw);return}const rules=tajweedFor(t,i);rules.forEach(r=>all.add(r));const next=nextG(t,i),m=haraka(g.m);h+=`<span class="taj-letter" data-gidx="${i}" data-char="${esc(g.b)}" data-h="${esc(m)}" data-pron="${esc(simpleLetterInstruction(g,rules))}" data-rules="${esc(rules.join('، '))}">${esc(g.raw)}</span>`});return`<div class="study-panel"><div class="study-compare-ref">${esc(v.ref)}</div><div class="taj-character-verse">${h}</div><div style="margin-top:12px"><b style="color:var(--gold)">الكلمات والوصلة بينها</b>${renderBeginnerWordStudy(v.text)}</div></div>`}).join('');return`<section class="study-panel"><h3 style="color:var(--gold)">🎙️ تعلّم التجويد خطوة بخطوة</h3><div class="taj-beginner-guide"><h4>نبدأ من الصفر — من الحرف إلى الآية</h4><p>لا تحتاج أن تعرف أسماء القواعد مسبقًا. اضغط على الحرف لتعرف <b>الحركة → طريقة النطق → الحكم → ماذا تفعل بصوتك</b>.</p><div class="taj-flow"><div class="taj-flow-step"><b>١ — الحرف</b><span>انظر للحرف وحده ومعه حركته، وقل صوته ببطء.</span></div><div class="taj-flow-step"><b>٢ — الكلمة</b><span>اضغط أحرف الكلمة بالترتيب، ثم اقرأ الكلمة كاملة بلا تقطيع.</span></div><div class="taj-flow-step"><b>٣ — الوصل</b><span>اقرأ الكلمة مع التي بعدها؛ التطبيق يوضح الحكم عند نقطة الانتقال بينهما.</span></div></div><div class="taj-source-line">تنبيه: التحليل الآلي يساعدك على رؤية المواضع، لكنه لا يثبت صحة الأداء وحده. التجويد علم أداء، وأصل التلقي فيه المشافهة والسماع من قارئ متقن.</div></div>${verseHTML}<div class="study-panel" style="margin-top:10px"><h3 style="color:var(--gold)">📚 ماذا رأيت في هذه الآية؟</h3><div class="study-rule-grid">${[...all].map(r=>`<div class="taj-rule-card"><b>${esc(r)}</b><p>${esc(tajRules[r]||'شرح مبسط متاح لهذا الحكم.')}</p></div>`).join('')||'<div class="muted">لم يظهر حكم آلي إضافي في هذا المقطع.</div>'}</div></div></section>`}

function showTajInspector(el){const idx=Number(el.dataset.gidx||-1);const p=el.closest('.study-panel');const verseEl=el.closest('.taj-character-verse');const text=currentVerses.find(v=>verseEl?.parentElement?.querySelector('.study-compare-ref')?.textContent?.includes(v.ref))?.text||'';const t=splitGraphemes(text);const g=t[idx];if(!g)return;const rules=tajweedFor(t,idx);const nextWordIdx=nextWordStart(t,idx);let nextWord='';if(nextWordIdx>=0){const arr=[];for(let j=nextWordIdx;j<t.length&&!t[j].space&&!t[j].punct;j++)arr.push(t[j].raw);nextWord=arr.join('')}let wordStart=0;for(let j=idx;j>=0;j--){if(t[j]?.space||t[j]?.punct){wordStart=j+1;break}}let wordEnd=idx;while(wordEnd+1<t.length&&!t[wordEnd+1].space&&!t[wordEnd+1].punct)wordEnd++;const word=t.slice(wordStart,wordEnd+1).map(x=>x.raw).join('');const bridge=nextWord?connectedRule(word,wordEnd,nextWord,nextWordIdx,t):[];const box=p?.querySelector('#tajInspector');if(!box)return;box.replaceChildren();const addLine=(label,value,cls='simple')=>{const row=document.createElement('div');row.className=cls;const b=document.createElement('b');b.textContent=label;row.appendChild(b);row.appendChild(document.createTextNode(' '+(value||'')));box.appendChild(row)};const h=document.createElement('h4');h.textContent=`👂 حرف «${g.raw}»`;box.appendChild(h);const big=document.createElement('div');big.className='big';big.textContent=g.raw;box.appendChild(big);addLine('الحركة:',haraka(g.m));addLine('كيف تنطقه؟',simpleLetterInstruction(g,rules));addLine('الحكم الذي ظهر هنا:',rules.join('، ')||'لا يظهر حكم إضافي واضح من التحليل الآلي');if(rules.length)addLine('شرح بسيط:',rules.map(r=>tajRules[r]||r).join(' '),'connection');if(nextWord)addLine(`وعند الوصل بـ «${nextWord}»:`,simpleConnectionInstruction(word,nextWord,bridge),'connection');p.querySelectorAll('.taj-letter,.taj-letter-chip').forEach(x=>x.classList.remove('selected','active'));el.classList.add(el.classList.contains('taj-letter-chip')?'active':'selected')}
function bindTajweedClicks(){document.querySelectorAll('.taj-letter').forEach(el=>el.onclick=()=>showTajInspector(el));document.querySelectorAll('.taj-letter-chip').forEach(el=>el.onclick=()=>showTajInspector(el));document.querySelectorAll('.study-tab').forEach(b=>b.onclick=()=>{currentStudyTab=b.dataset.tab;renderStudy();})}

function recommend(){const feel=$('feelSelect')?.value||'أحتاج دافعًا',age=$('ageGroup')?.value||'بالغ',role=$('roleSelect')?.value||'مستخدم';const map={'أشعر بالتشتت':'ابدأ بجلسة تركيز 15 دقيقة + آية واحدة + مراجعة ورد واحد فقط.','متأخر وأريد الاستدراك':'ابدأ من اليوم؛ لا تنتظر الإجازة. خفّف مقدار الجديد وارفع جودة المراجعة.','أحتاج تثبيت الحفظ':'ارجع إلى 10 تكرارات غيبًا + التثبيت اليومي 7 أيام + كشكول المتشابهات.','أريد أن أتعلم التجويد':'ابدأ بالإظهار والإدغام والإخفاء والقلقلة والمد الطبيعي، ثم طبّق على وردك حرفًا حرفًا.','أريد فقهًا أساسيًا':'ابدأ بما لا يسع المسلم جهله وفقه الطهارة والصلاة وحقوق الناس.','أحتاج دافعًا':'لا تحاول أن تحفظ صفحة كاملة في جلسة واحدة؛ آية ثابتة كل يوم خير من خطة مثالية متروكة.'};const box=$('recommendation');if(!box)return;const title=document.createElement('b');title.textContent=`مناسب لك كـ${age} ${role}`;const body=document.createElement('p');body.textContent=map[feel]||map['أحتاج دافعًا'];const hint=document.createElement('div');hint.className='small';hint.textContent=`اقتراح بحث: ${feel} القرآن حفظ ${role}`;box.replaceChildren(title,body,hint)}
function playAmbient(){toast('تشغيل التلاوة سيُفعّل عند توفر حزمة صوتية تشغيلية للحصري على الجهاز.');}
function stopAmbient(){const a=$('splashAudio');a.pause();a.loop=false;state.ambient=false;save();$('ambientQuranBtn').textContent='▶ قرآن هادئ'}
function noiseStart(type){if(noise){noise.close();noise=null;return}const A=window.AudioContext||window.webkitAudioContext;if(!A)return;noise=new A();const b=noise.createBuffer(1,noise.sampleRate*2,noise.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=type==='brown'?last+.06*w:w;d[i]=type==='brown'?last*.45:w*.16}const s=noise.createBufferSource();s.buffer=b;s.loop=true;const f=noise.createBiquadFilter();f.type='lowpass';f.frequency.value=type==='brown'?500:1800;const g=noise.createGain();g.gain.value=type==='brown'?.06:.025;s.connect(f).connect(g).connect(noise.destination);s.start()}
function startFocus(){if(timeLeft<=0)return toast('اختر مدة أولًا');$('breathBox').style.display='block';$('timerBox').style.display='none';$('breatheCircle').style.animation='breatheIn 2s forwards';$('breathText').textContent='شهيق…';setTimeout(()=>{$('breatheCircle').style.animation='breatheOut 2s forwards';$('breathText').textContent='زفير…'},2000);setTimeout(()=>{$('breathText').textContent='استعن بالله';setTimeout(()=>{$('breathBox').style.display='none';$('timerBox').style.display='block';runTimer()},3500)},4000)}
function runTimer(){clearInterval(timer);focusStarted=Date.now();timer=setInterval(()=>{timeLeft--;renderTimer();if(timeLeft<=0){clearInterval(timer);const mins=Math.max(1,Math.round((Date.now()-focusStarted)/60000));state.focusMin+=mins;logActivity('focus',mins);markActive();save();beep('done');haptic('done');toast('انتهت جلسة التركيز ✅');closeModal('focusModal')}},1000);}
function renderTimer(){$('timer').textContent=`${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`}
function shareImage(){const c=$('shareCanvas'),ctx=c.getContext('2d');c.width=1200;c.height=760;const g=ctx.createLinearGradient(0,0,1200,760);g.addColorStop(0,'#07100b');g.addColorStop(1,'#193025');ctx.fillStyle=g;ctx.fillRect(0,0,1200,760);ctx.fillStyle='#d4af37';ctx.textAlign='center';ctx.font='700 58px Tajawal';ctx.fillText('فضل الله عليّ',600,120);ctx.fillStyle='#fff';ctx.font='700 46px Tajawal';ctx.fillText(state.name||'رفيق القرآن',600,210);ctx.fillText(`🔥 ${state.streak} يوم التزام`,600,320);ctx.fillText(`📖 ${fmt(state.entries.reduce((n,e)=>n+(e.baseLetters||0)*(e.totalReps||0),0))} حرف مقروء`,600,400);ctx.fillStyle='#9aa99c';ctx.font='30px Tajawal';ctx.fillText('رحلة مستمرة مع كتاب الله',600,520);ctx.fillStyle='#d4af37';ctx.font='700 28px Tajawal';ctx.fillText('رفيق القرآن',600,660);openModal('shareModal')}
function downloadShare(){const a=document.createElement('a');a.href=$('shareCanvas').toDataURL('image/png');a.download=`Rafiq_${dayKey()}.png`;a.click()}
async function nativeShare(){if(!navigator.share)return downloadShare();try{const b=await new Promise(r=>$('shareCanvas').toBlob(r,'image/png'));await navigator.share({title:'رفيق القرآن',text:'فضل الله عليّ 🤲',files:[new File([b],`Rafiq_${dayKey()}.png`,{type:'image/png'})]})}catch{}}
function printReport(){const pct=state.goal?Math.min(100,estimateProgress()/state.goal*100):0;const stars=[...Array(36)].map((_,i)=>`<span class="paper-star" style="left:${(i*37)%96}%;top:${(i*53)%92}%;font-size:${8+(i%4)*2}px">✦</span>`).join('');const entries=state.entries.slice(0,40).map(e=>`<div class="paper-werd"><div><b style="color:#f0d77a">${esc(e.label)}</b><div style="color:#93a097;font-size:10px">التالي: ${esc(e.nextReviewDate)}</div></div><div class="paper-mini">تكرارات ${e.totalReps||0}</div><div class="paper-mini">مراجعات ${e.reviewCount||0}</div></div>`).join('')||'<div class="small">لا توجد أوراد.</div>';$('printSheet').innerHTML=`<div class="paper-bg">${stars}<div class="paper-mist" style="width:440px;height:440px;right:-100px;top:-130px;background:radial-gradient(circle,rgba(212,175,55,.14),transparent 68%)"></div><div class="paper-mist" style="width:360px;height:360px;left:-100px;bottom:-120px;background:radial-gradient(circle,rgba(73,167,92,.08),transparent 68%)"></div><div class="paper-lamp" style="right:7%;top:-3%"><span class="wire"></span><span class="body">💡</span><span class="light"></span></div><div class="paper-lamp" style="left:10%;top:6%;transform:scale(.7);opacity:.55"><span class="wire"></span><span class="body">💡</span><span class="light"></span></div></div><div class="paper-page"><div class="paper-title">رفيق القرآن</div><div class="paper-subtitle">نسخة ورقية ثابتة بنفس الهوية البصرية</div><div class="paper-user">${esc(state.name||'مستخدم رفيق القرآن')}</div><div class="paper-section"><h3>🎯 الهدف</h3><div class="grid2"><div><div class="paper-grid"><div class="paper-stat"><b>${state.streak}</b>🔥 يوم</div><div class="paper-stat"><b>${state.entries.length}</b>📋 ورد</div><div class="paper-stat"><b>${state.entries.reduce((n,e)=>n+(e.reviewCount||0),0)}</b>✅ مراجعة</div><div class="paper-stat"><b>${fmt(state.entries.reduce((n,e)=>n+(e.baseLetters||0)*(e.totalReps||0),0))}</b>📖 حرف</div></div><div style="margin-top:10px">الهدف: <b style="color:#e8d37b">${state.goal} ${esc(state.goalUnit)}</b></div></div><div><div class="paper-ring" style="--pct:${pct}%"><span>${pct.toFixed(0)}%</span></div></div></div></div><div class="paper-section"><h3>📋 قائمة اليوم</h3><div class="paper-checks"><div class="paper-check">□ مراجعات مستحقة اليوم</div><div class="paper-check">□ الحفظ الجديد</div><div class="paper-check">□ 10 تكرارات غيبًا</div><div class="paper-check">□ تثبيت اليوم</div><div class="paper-check">□ فهم المعنى والتفسير</div><div class="paper-check">□ التسميع والمقارنة</div></div></div><div class="paper-section"><h3>📚 سجل الأوراد</h3>${entries}</div><div class="paper-section"><h3>🌿 المنهجية</h3><div class="paper-method">${method.map(m=>`<div><strong>${m[0]} — ${m[1]}</strong><p>${m[2]}</p></div>`).join('')}</div></div><div class="paper-section"><h3>🕌 اليوم الإيماني</h3><div class="paper-checks"><div class="paper-check">□ الفجر</div><div class="paper-check">□ الظهر</div><div class="paper-check">□ العصر</div><div class="paper-check">□ المغرب</div><div class="paper-check">□ العشاء</div><div class="paper-check">□ الشفع والوتر</div><div class="paper-check">□ قيام الليل / الاستغفار</div><div class="paper-check">□ دعاء وخلوة مع القرآن</div></div></div><div class="paper-section"><h3>🧩 المتشابهات والزلات</h3>${state.mistakes.length?state.mistakes.map(m=>`<div class="paper-check"><b>${esc(m.title)}</b><br>${esc(m.text)}</div>`).join(''):'لا توجد ملاحظات محفوظة.'}</div><div class="paper-footer">هذا الإصدار الورقي مصمم للاستخدام اليدوي. الأرقام الخاصة بالحروف والحسنات تقديرية للتحفيز، والقبول والأجر عند الله والله أعلم بهما.</div></div>`;window.print()}
function openRecorder(id){const e=state.entries.find(x=>x.id===id);if(!e)return;$('recordTarget').textContent=e.label;$('recordPlayback').style.display='none';$('recordStatus').textContent='اضغط للبدء';$('recordBtn').textContent='🎤';openModal('recorderModal')}
async function toggleRecorder(){if(recording?.state==='recording'){recording.stop();return}if(!navigator.mediaDevices?.getUserMedia)return toast('التسجيل يحتاج HTTPS أو localhost');try{const s=await navigator.mediaDevices.getUserMedia({audio:true});recording=new MediaRecorder(s);const chunks=[];recording.ondataavailable=e=>e.data.size&&chunks.push(e.data);recording.onstop=()=>{const b=new Blob(chunks,{type:recording.mimeType||'audio/webm'});if(recordUrl)URL.revokeObjectURL(recordUrl);recordUrl=URL.createObjectURL(b);$('recordPlayback').src=recordUrl;$('recordPlayback').style.display='block';$('recordStatus').textContent='استمع لتسجيلك ثم قارن بالمصحف';s.getTracks().forEach(t=>t.stop());$('recordBtn').textContent='🎤'};recording.start();$('recordBtn').textContent='⏹';$('recordStatus').textContent='جارٍ التسجيل…'}catch{toast('اسمح للمتصفح باستخدام الميكروفون')}
}
function exportJSON(){const a=document.createElement('a');a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state));a.download=`Rafiq_Backup_${dayKey()}.json`;a.click();toast('تم أخذ النسخة الاحتياطية ✅')}
function importJSON(file){const r=new FileReader();r.onload=e=>{try{state=deepMerge(DEFAULT,JSON.parse(e.target.result));save();location.reload()}catch{toast('ملف غير صالح')}};r.readAsText(file)}
async function resetApp(){if(prompt('اكتب مسح للتأكيد:')!=='مسح')return;await window.RafiqDB.clearAll();location.reload()}
async function locate(silent=false){if(!navigator.geolocation){if(!silent)toast('الموقع غير مدعوم');return false}return new Promise(resolve=>{navigator.geolocation.getCurrentPosition(p=>{state.lat=Number(p.coords.latitude.toFixed(6));state.lon=Number(p.coords.longitude.toFixed(6));state.city='موقعك الحالي';save();refreshPrayer().finally(()=>{renderSettings();if(!silent)toast('تم تحديد موقعك وحساب المواقيت ✅')});resolve(true)},()=>{if(!silent)toast('تعذر الحصول على موقعك — استخدم المدينة يدويًا');resolve(false)},{enableHighAccuracy:true,maximumAge:300000,timeout:12000})})}

/* V26 — Full Mushaf engine: bundled Uthmani text, cached tafsir/word meanings, verse study */
let quranBook=null, mushafSura=1, mushafSelected=null, mushafTab='overview';
const quranCache={tafseer:{},words:{}};
const QURAN_BASE='quran-uthmani.json';
const QURAN_KEY='book-full';
async function quranDbGet(){try{return await window.RafiqDB.get('quran',QURAN_KEY)}catch{return null}}
async function quranDbPut(book){try{await window.RafiqDB.set('quran',QURAN_KEY,book)}catch{}}
function setMushafStatus(text,show=true){const el=$('mushafLoading');if(!el)return;el.textContent=text;el.style.display=show?'block':'none'}
function normalizeQuranPayload(j){
  const arr=j?.data?.surahs||j?.surahs||[];
  if(!Array.isArray(arr)||!arr.length)return null;
  return arr.map((s,i)=>({s:Number(s.number||i+1),name:s.name||surahs[i]||`السورة ${i+1}`,type:s.revelationType==='Meccan'?'مكية':s.revelationType==='Medinan'?'مدنية':(s.type||'—'),count:Number(s.numberOfAyahs||s.ayahs?.length||0),verses:(s.ayahs||[]).map(a=>({a:Number(a.numberInSurah||a.ayah||0),global:Number(a.number||a.global_id||0),text:String(a.text||a.text_ar||'')}))})).filter(x=>x.verses.length);
}
async function loadQuranBook(){
  if(quranBook)return quranBook;
  setMushafStatus('⏳ جاري تجهيز المصحف…',true);
  const cached=await quranDbGet();
  if(Array.isArray(cached)&&cached.length){quranBook=cached;setMushafStatus('✓ المصحف محفوظ محليًا — يعمل أوفلاين.',false);return quranBook}
  const localCandidates=[QURAN_BASE, window.RafiqContent?.url?.('quran-uthmani.json')].filter(Boolean);
  for(const url of localCandidates){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)continue;const raw=await r.json();const local=Array.isArray(raw)?raw:normalizeQuranPayload(raw)||raw;if(Array.isArray(local)&&local.length){quranBook=local;await quranDbPut(local);setMushafStatus('✓ تم حفظ المصحف للعمل أوفلاين.',false);return quranBook}}catch{}}
  setMushafStatus(navigator.onLine?'⚠️ ملف المصحف غير متاح في Core أو في حزمة المحتوى الحالية.':'⚠️ المصحف الكامل غير محفوظ على هذا الجهاز بعد.',true);return null;
}
function quranStorageKey(type,s,a){return `rq-${type}-${s}-${a}`}
async function loadCache(type,s,a){try{return (await window.RafiqDB.get('quran',quranStorageKey(type,s,a)))||''}catch{return ''}}
function saveCache(type,s,a,text){return window.RafiqDB.set('quran',quranStorageKey(type,s,a),text)}
function tajweedRulesForText(text){const t=splitGraphemes(text),out=[];for(let i=0;i<t.length;i++){if(t[i].space||t[i].punct){out.push([]);continue}out.push(tajweedFor(t,i))}return {graphemes:t,rules:out}}
function tajRuleDetail(r){return tajRules[r]||'حكم تجويدي يحتاج إلى ضبط الموضع وسياق الحرف، ويُفضّل سماعه من قارئ متقن.'}
function mushafSurahButton(s){return `<button class="mushaf-surah-btn ${mushafSura===s.s?'active':''}" data-sura="${s.s}"><span class="mushaf-surah-num">${s.s}</span><span class="mushaf-surah-name">${esc(s.name)}</span><span class="mushaf-surah-meta">${s.type} • ${s.count}</span></button>`}
function bindLocalStudyButtons(){document.querySelectorAll('[data-local-study]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.onclick=()=>{const s=Number(b.dataset.s||0),a=Number(b.dataset.a||0);const v=(quranBook?.[s-1]?.verses||[]).find(x=>x.a===a)||{s,a,text:''};openAyahStudy(v);setTimeout(()=>{const tab=b.dataset.localStudy;document.querySelectorAll('.study-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));currentStudyTab=tab;renderStudy();},50);};});}
async function renderMushafList(){const b=await loadQuranBook();if(!b)return;const q=($('mushafSearch')?.value||'').trim();const list=b.filter(s=>!q||s.name.includes(q)||String(s.s)===q);$('mushafSurahList').innerHTML=list.map(mushafSurahButton).join('');document.querySelectorAll('.mushaf-surah-btn').forEach(x=>x.onclick=()=>{mushafSura=+x.dataset.sura;renderMushafList();renderMushafSurah();bindLocalStudyButtons()})}
function mushafSourceLinks(s,a){return `<div class=\"source-badges\"><button class=\"action\" type=\"button\" data-local-study=\"tafsir\" data-s=\"${s}\" data-a=\"${a}\">📖 التفسير الميسر</button><button class=\"action\" type=\"button\" data-local-study=\"words\" data-s=\"${s}\" data-a=\"${a}\">🔎 معاني الكلمات</button><button class=\"action\" type=\"button\" data-local-study=\"asbab\" data-s=\"${s}\" data-a=\"${a}\">🕊️ أسباب النزول</button></div>`}
function resetAdhkar(){
  if(!confirm('هل تريد تصفير عدادات الأذكار لليوم فقط؟'))return;
  const day=dayKey();
  state.dhikr ||= {};
  state.dhikr[day]={};
  save(); renderAdhkar(); toast('تم تصفير عدادات الأذكار ✅');
}
function versesForRef(ref){
  if(!ref)return[];
  if(ref.sura&&ref.aya){
    const s=quranBook?.find(x=>x.s===ref.sura);
    const v=s?.verses?.find(x=>x.a===ref.aya);
    if(v)return[{...v,ref:`${s.name}: ${v.a}`}];
  }
  return[];
}
async function openStudy(id){
  const e=state.entries.find(x=>x.id===id); if(!e)return;
  currentStudy=e; currentStudyTab='all';
  const ref=parseRef(e.label);
  if(!quranBook)await loadQuranBook();
  currentVerses=ref?.page?await fetchStudyVerses([{page:ref.page}]):versesForRef(ref);
  switchView('study'); renderStudy();
}
async function openDailyStudy(){
  const a=getDailyVerse();
  currentStudy={label:`آية اليوم — ${a.ref}`}; currentStudyTab='all'; currentVerses=[];
  if(!quranBook)await loadQuranBook();
  currentVerses=versesForRef({sura:a.s,aya:a.a});
  switchView('study'); renderStudy();
}
async function installApp(){
  if(!deferredInstall){return toast('التثبيت متاح من قائمة المتصفح إذا لم يظهر زر التثبيت.')}
  try{
    const promptEvent=deferredInstall;
    deferredInstall=null;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    renderSettings();
  }catch{toast('تعذر بدء التثبيت من المتصفح')}
}

function setupEvents(){
  const bind=(id,event,fn)=>{const el=$(id);if(el)el[event]=fn;};
  document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
  bind('welcomeStartBtn','onclick',saveWelcome);
  bind('themeBtn','onclick',()=>{state.theme=state.theme==='dark'?'light':state.theme==='light'?'sepia':'dark';save();applyGraphics();renderAll()});
  bind('methodBtn','onclick',()=>{renderMethod();openModal('methodModal')});
  bind('openMethod2','onclick',()=>{renderMethod();openModal('methodModal')});
  bind('addNewBtn','onclick',()=>openModal('addNewModal'));
  bind('addOldBtn','onclick',()=>openModal('addOldModal'));
  bind('saveNewBtn','onclick',addNew);
  bind('saveOldBtn','onclick',addOld);
  bind('reverseBtn','onclick',()=>openModal('reverseModal'));
  bind('calcReverseBtn','onclick',calculateReverse);
  bind('savePlanBtn','onclick',savePlan);
  bind('startTodayBtn','onclick',()=>{const e=state.entries.find(x=>(x.nextReviewDate<=dayKey()&&x.hasBeenEvaluated)||!x.hasBeenEvaluated);if(e)openFocus(e.label);else openModal('addNewModal')});
  document.querySelector('#focusModal .focus-actions')?.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>{timeLeft=+b.dataset.min*60;renderTimer()});
  bind('customMinBtn','onclick',()=>{const m=+$('customMin').value;if(m>0){timeLeft=m*60;renderTimer()}});
  bind('startFocusBtn','onclick',startFocus);
  bind('stopFocusBtn','onclick',()=>closeModal('focusModal'));
  bind('rainBtn','onclick',()=>noiseStart('rain'));
  bind('brownBtn','onclick',()=>noiseStart('brown'));
  bind('sadaqahFab','onclick',()=>{renderAdhkar();openModal('sadaqahModal')});
  bind('resetAdhkarBtn','onclick',resetAdhkar);
  bind('splashClose','onclick',()=>closeSplash(true));
  bind('splashPlay','onclick',()=>$('splashAudio')?.play().catch(()=>{}));
  bind('splashStudy','onclick',()=>{closeSplash(false);openDailyStudy()});
  bind('playDailyVerseBtn','onclick',()=>toast('تشغيل التلاوة سيُفعّل عند توفر حزمة صوتية تشغيلية للحصري على الجهاز.'));
  bind('studyDailyVerseBtn','onclick',openDailyStudy);
  bind('themeSelect','onchange',e=>{state.theme=e.target.value;save();applyGraphics()});
  bind('graphicsSelect','onchange',e=>{state.graphics=Math.max(1,Math.min(3,+e.target.value||1));save();applyGraphics();renderAll();toast(`الجرافيك: المستوى ${state.graphics} ✅`)});
  bind('saveProfileBtn','onclick',()=>{const age=+$('profileAge')?.value||'';if(age&&(age<3||age>110))return toast('العمر من 3 إلى 110 سنة');profileSave($('profileName')?.value||'',age);toast('تم حفظ الملف ✅');renderAll()});
  bind('reciterSelect','onchange',e=>{state.reciter=e.target.value;save()});
  bind('volumeRange','oninput',e=>{state.volume=+e.target.value;save()});
  bind('ambientQuranBtn','onclick',()=>state.ambient?stopAmbient():playAmbient());
  bind('testSoundBtn','onclick',()=>beep('shine'));
  bind('notifyToggle','onchange',e=>{state.notify=e.target.checked;save()});
  bind('saveNotifyBtn','onclick',()=>{state.notifyHour=Math.max(0,Math.min(23,+$('notifyHour')?.value||20));save();requestNotifications()});
  bind('locBtn','onclick',locate);
  bind('calcMethod','onchange',e=>{state.calcMethod=+e.target.value;save();refreshPrayer()});
  bind('asrMethod','onchange',e=>{state.asrMethod=+e.target.value;save();refreshPrayer()});
  bind('cityInput','onchange',e=>{state.city=e.target.value.trim()||'أسيوط';state.lat=null;state.lon=null;save();refreshPrayer()});
  bind('backupBtn','onclick',exportJSON);
  bind('restoreInput','onchange',e=>e.target.files[0]&&importJSON(e.target.files[0]));
  bind('resetBtn','onclick',resetApp);
  bind('installBtn','onclick',()=>installApp());
  bind('shareBtn','onclick',shareImage);
  bind('downloadShareBtn','onclick',downloadShare);
  bind('nativeShareBtn','onclick',nativeShare);
  bind('printBtn','onclick',printReport);
  bind('prevMonth','onclick',()=>{chartMonth.setMonth(chartMonth.getMonth()-1);renderProgress()});
  bind('nextMonth','onclick',()=>{chartMonth.setMonth(chartMonth.getMonth()+1);renderProgress()});
  bind('recommendBtn','onclick',recommend);
  bind('saveMistakeBtn','onclick',saveMistake);
  document.addEventListener('click',e=>{const c=e.target.closest('.floating-card');if(!c)return;e.preventDefault();e.stopPropagation();openSpace(c.dataset.space)},{passive:false});
  bind('backToOcean','onclick',ev=>{ev?.preventDefault();ev?.stopPropagation();const tr=$('sceneTransition');tr?.classList.remove('play');void tr?.offsetWidth;tr?.classList.add('play');document.body.classList.remove('space-world');document.body.classList.add('ocean-world');$('spaceView')?.classList.remove('show');const o=$('ocean');if(o){o.style.display='block';o.classList.remove('ocean-dive');void o.offsetWidth}window.scrollTo({top:0,behavior:'auto'})});
  bind('recordBtn','onclick',toggleRecorder);
  document.querySelectorAll('.modal,.splash').forEach(m=>m.addEventListener('click',e=>{if(e.target===m&&m!==$('dailySplash'))m.classList.remove('show')}));
}
function createOceanBubbles(){const box=$('oceanBubbles');if(!box)return;if(document.body.dataset.perf==='lite'||state.graphics===1){box.innerHTML='';return}box.innerHTML='';const count=state.graphics>=3?(window.innerWidth>1100?14:9):(state.graphics===2?7:0);for(let i=0;i<count;i++){const b=document.createElement('span');b.className='bubble';const size=(3+Math.random()*10).toFixed(1)+'px';b.style.setProperty('--size',size);b.style.left=(Math.random()*100).toFixed(2)+'%';b.style.setProperty('--dur',(9+Math.random()*13).toFixed(2)+'s');b.style.setProperty('--delay',(-Math.random()*12).toFixed(2)+'s');b.style.setProperty('--drift',(Math.random()*90-45).toFixed(1)+'px');box.appendChild(b)}}
function createGlobalOceanBubbles(){const box=$('globalOceanBubbles');if(!box)return;if(document.body.dataset.perf==='lite'||state.graphics===1){box.innerHTML='';return}box.innerHTML='';const count=state.graphics>=3?(innerWidth>1200?16:10):(innerWidth>900?9:6);for(let i=0;i<count;i++){const b=document.createElement('span');b.style.left=(Math.random()*100).toFixed(2)+'%';b.style.setProperty('--sz',(3+Math.random()*9).toFixed(1)+'px');b.style.setProperty('--dur',(9+Math.random()*12).toFixed(1)+'s');b.style.setProperty('--delay',(-Math.random()*10).toFixed(1)+'s');b.style.setProperty('--dx',(Math.random()*90-45).toFixed(1)+'px');box.appendChild(b)}}
function initGlobalOcean(){createGlobalOceanBubbles();const btn=$('globalOceanSoundBtn');if(btn)btn.onclick=()=>oceanSound?stopOceanSound():startOceanSound();}
function startOceanSound(){if(oceanSound)return;const A=window.AudioContext||window.webkitAudioContext;if(!A){toast('الصوت غير مدعوم في هذا المتصفح');return}oceanSound=new A();if(oceanSound.state==='suspended')oceanSound.resume();const sr=oceanSound.sampleRate;const buffer=oceanSound.createBuffer(1,sr*3,sr);const d=buffer.getChannelData(0);let brown=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;brown=brown*.985+w*.15;d[i]=brown*.30+w*.035}oceanSoundSource=oceanSound.createBufferSource();oceanSoundSource.buffer=buffer;oceanSoundSource.loop=true;const low=oceanSound.createBiquadFilter();low.type='lowpass';low.frequency.value=900;const band=oceanSound.createBiquadFilter();band.type='bandpass';band.frequency.value=650;band.Q.value=.55;oceanSoundGain=oceanSound.createGain();oceanSoundGain.gain.value=.0001;oceanSoundSource.connect(low).connect(band).connect(oceanSoundGain).connect(oceanSound.destination);const lfo=oceanSound.createOscillator(),lg=oceanSound.createGain();lfo.frequency.value=.085;lg.gain.value=.018;lfo.connect(lg).connect(oceanSoundGain.gain);lfo.start();oceanSoundSource.start();oceanSound.__rafiqLfo=lfo;$('oceanStatusText')&&($('oceanStatusText').textContent='صوت البحر يعمل — استمتع بالهدوء');const btn=$('oceanSoundBtn');if(btn){btn.textContent='🌊 صوت البحر يعمل';btn.classList.add('ambient-playing')}}
function stopOceanSound(){if(!oceanSound)return;try{oceanSound.__rafiqLfo?.stop();oceanSoundSource?.stop();oceanSound.close()}catch{}oceanSound=null;oceanSoundGain=null;oceanSoundSource=null;const t=$('oceanStatusText');if(t)t.textContent='المشهد حي — الصوت اختياري';const btn=$('oceanSoundBtn');if(btn){btn.textContent='🌊 تشغيل صوت البحر';btn.classList.remove('ambient-playing')}}
function initOceanExplorer(){createOceanBubbles();const sound=$('oceanSoundBtn'),silence=$('oceanSilenceBtn');if(sound)sound.onclick=()=>oceanSound?stopOceanSound():startOceanSound();if(silence)silence.onclick=stopOceanSound;document.querySelectorAll('.floating-card').forEach(card=>{card.onclick=()=>{const key=card.dataset.space;if(key)openSpace(key)};card.addEventListener('pointerenter',()=>{if(state.soundEnabled)beep('shine')},{passive:true});card.addEventListener('pointermove',e=>{if(window.matchMedia('(max-width:800px)').matches||state.graphics<3)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--mx',(x*8).toFixed(1)+'px');card.style.setProperty('--my',(y*6).toFixed(1)+'px')},{passive:true});card.addEventListener('pointerleave',()=>{card.style.setProperty('--mx','0px');card.style.setProperty('--my','0px')},{passive:true})})}
  const portal=$('spiritual')?.querySelector('[data-open-explore="true"]');if(portal)portal.onclick=()=>switchView('explore');
  const scene=$('ocean'); if(scene){scene.addEventListener('pointermove',e=>{if(state.graphics<3||window.matchMedia('(max-width:800px)').matches)return;const r=scene.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;scene.style.setProperty('--sceneX',(px*18).toFixed(1)+'px');scene.style.setProperty('--sceneY',(py*14).toFixed(1)+'px')},{passive:true});scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--sceneX','0px');scene.style.setProperty('--sceneY','0px')},{passive:true})}

;
function ritualDayIndex(){const first=state.firstActiveBoundary||dayKey();return Math.max(1,diffDays(first,dayKey())+1)}

;

;
;
;
async function openSpace(key){
  try{await window.RafiqDeep?.ensure?.();const d=window.RafiqData||{};DEEP=d.DEEP||DEEP;ARCHIVE_META=d.ARCHIVE_META||ARCHIVE_META;ARCHIVE_EXTRA=d.ARCHIVE_EXTRA||ARCHIVE_EXTRA;STUDY_GUIDES=d.STUDY_GUIDES||STUDY_GUIDES}catch{}
  window.__rafiqCurrentSpaceKey=key;
  const meta=ARCHIVE_META[key]||ARCHIVE_META.resources;
  const base=DEEP[key]||{intro:'',sections:[]};
  const extras=(ARCHIVE_EXTRA[key]||[]).map(x=>({t:x[0],p:x[1],note:x[2],list:x[3]?[x[3]]:[]}));
  const mergedSections=[...extras,...(base.sections||[])];
  const isTazkiyah=key==='tazkiyah';
  const coreStudy=['tafsir','asbab','words','practice'].includes(key);
  const topics=mergedSections.map((c,i)=>({idx:i,title:c.t,kicker:i<extras.length?'باب موسوعي':(coreStudy?'قسم متقدم':'قسم تأسيسي'),data:c}));
  $('spaceTitle').textContent=`${meta.icon} ${meta.title}`;
  $('spaceIntro').textContent=meta.intro;
  const chapterCount=topics.length;
  const sources=[
    ['القرآن الكريم — Quran.com','https://quran.com/','النص القرآني وقراءة السور والآيات.'],
    ['التفسير الميسر — QuranEnc','https://quranenc.com/ar/browse/arabic_moyassar/','نقطة دخول لفهم المعنى الإجمالي للآية.'],
    ['الموسوعة الحديثية — الدرر السنية','#hadith','التحقق من تخريج الحديث وحكم المحدثين.'],
    ['Sunnah.com — كتب الحديث','https://sunnah.com/','الوصول إلى كتب الحديث المترجمة/المفهرسة.'],
    ['التحليل اللغوي المحلي','local:words','معاني الكلمات وتحليلها من المصادر المحفوظة داخل التطبيق.'],
    ['إسلام ويب — الفقه والفتاوى','https://www.islamweb.net/ar/fatwa/','مراجعة المسائل الفقهية والفتاوى المنشورة.'],
    ['المكتبة الشاملة','https://shamela.ws/','الكتب التراثية والمصادر الموسعة للبحث.']
  ];
  const sourceFor=title=>{
    const t=title.toLowerCase();
    if(t.includes('لغة')||t.includes('كلمة')||t.includes('جذر')||t.includes('إعراب'))return sources.filter((_,i)=>[0,1,4,6].includes(i));
    if(t.includes('حديث')||t.includes('ذكر')||t.includes('جمعة')||t.includes('الفطرة'))return sources.filter((_,i)=>[0,2,3].includes(i));
    if(t.includes('فقه')||t.includes('طهارة')||t.includes('حقوق'))return sources.filter((_,i)=>[0,2,5,6].includes(i));
    return sources.filter((_,i)=>[0,1,2,3,6].includes(i));
  };
  const daily= isTazkiyah ? TAZKIYAH_DAYS[(ritualDayIndex()-1)%TAZKIYAH_DAYS.length] : null;
  function renderArticle(index){
    const item=topics[index]||topics[0]; if(!item)return;
    const d=item.data||{};
    const details=[];
    details.push(`<section class="ency-section lead-study"><div class="ency-section-head"><span>🎓</span><div><b>ماذا ستتعلم في هذا الباب؟</b><small>خريطة دراسة مختصرة</small></div></div><p>هذا الباب ليس مجرد معلومة عابرة. اقرأ الشرح، ثم الدليل، ثم التطبيق، ثم ارجع إلى المراجع عند الحاجة. وفي المسائل الفقهية والعقدية والخلافية لا تتعامل مع هذا العرض المختصر بوصفه فتوى شخصية.</p></section>`);
    if(d.p)details.push(`<section class="ency-section"><div class="ency-section-head"><span>📖</span><div><b>الشرح التفصيلي</b><small>المفهوم، السياق، وما الذي ينبغي فهمه</small></div></div><p>${esc(d.p)}</p></section>`);
    if(d.list?.length)details.push(`<section class="ency-section"><div class="ency-section-head"><span>🧭</span><div><b>منهج الدراسة والعمل</b><small>حوّل المعرفة إلى خطوات</small></div></div><ol>${d.list.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>`);
    if(d.note)details.push(`<section class="ency-section highlight"><div class="ency-section-head"><span>💡</span><div><b>تطبيق عملي</b><small>شيء يمكن فعله اليوم</small></div></div><p>${esc(d.note)}</p></section>`);
    if(d.q)details.push(`<section class="ency-section evidence"><div class="ency-section-head"><span>📜</span><div><b>الدليل أو النص</b><small>نص مختصر مرتبط بالباب</small></div></div><div class="ency-quote">${esc(d.q)}</div></section>`);
    const src=sourceFor(item.title).map(a=>`<a href="${a[1]}" target="_blank" rel="noopener"><b>🔗 ${esc(a[0])}</b><span>${esc(a[2])}</span></a>`).join('');
    const related=topics.map((t,i)=>i===index?'':`<button type="button" data-rel="${i}">${esc(t.title)}</button>`).join('');
    const guide=STUDY_GUIDES[key]||STUDY_GUIDES.resources;
    const discipline=`<section class="ency-section study-method"><div class="ency-section-head"><span>🧠</span><div><b>${esc(guide.label)}</b><small>${esc(guide.intro)}</small></div></div><ol>${guide.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="method-outcome"><b>🎯 ناتج الدراسة</b><p>${esc(guide.output)}</p></div></section>`;
    const closing=(key==='knowledge')?`<section class="ency-section final-note"><div class="ency-section-head"><span>⚠️</span><div><b>تنبيه منهجي مهم</b><small>هذا الباب بداية وليس نهاية</small></div></div><p>هذه الموسوعة <b>مدخل تأسيسي</b> يساعدك على معرفة ما تحتاج إلى تعلمه وترتيب الطريق، لكنها لا تغني عن طلب العلم الشرعي ولا عن دراسة القرآن والسنة والفقه والعقيدة على أيدي أهل العلم، ولا تجعل من المستخدم مفتيًا لمجرد أنه قرأ ملخصًا هنا. تعلّم، واسأل، وتثبّت، واعرف حدود علمك.</p></section>`:'';
    $('spaceArticle').innerHTML=`
      <div class="ency-breadcrumb">${meta.icon} ${esc(meta.title)} <span>›</span> <b>${esc(item.title)}</b></div>
      <div class="ency-title-row"><div><div class="ency-kicker">${esc(item.kicker)}</div><h3>${esc(item.title)}</h3><p class="ency-intro">تدرّج في القراءة: تمهيد → شرح → دليل → تطبيق → مراجع → أبواب مرتبطة.</p></div><div class="ency-counter">الباب ${index+1} من ${chapterCount}</div></div>
      <div class="ency-progress"><div style="width:${((index+1)/chapterCount*100).toFixed(1)}%"></div></div>
      ${details.join('')}
      ${discipline}
      ${closing}
      <section class="ency-section sources"><div class="ency-section-head"><span>📚</span><div><b>مراجع الباب</b><small>المعلومة معروضة هنا أولًا، وهذه المراجع للتثبت والتوسع</small></div></div><div class="source-list">${src}</div></section>
      <section class="ency-related"><div class="ency-related-title">أبواب مرتبطة داخل هذه الموسوعة</div><div class="ency-related-list">${related}</div></section>`;
    $('spaceArticle').querySelectorAll('[data-rel]').forEach(b=>b.onclick=()=>renderArticle(+b.dataset.rel));
    document.querySelectorAll('.space-topic-btn').forEach(b=>b.classList.toggle('active',+b.dataset.idx===index));
    $('spaceArticle').scrollIntoView({behavior:'auto',block:'start'});
  }
  const dailyHtml=isTazkiyah?`<section class="daily-tazkiyah"><div class="daily-kicker">🌱 رحلة التزكية اليومية</div><h3>اليوم ${daily.day}: ${esc(daily.title)}</h3><div class="daily-grid"><div><b>خواطر اليوم</b><p>${esc(daily.reflection)}</p></div><div><b>تطبيق اليوم</b><p>${esc(daily.action)}</p></div><div><b>سؤال للنفس</b><p>${esc(daily.question)}</p></div><div><b>آية اليوم</b><p class="quran daily-ayah">${esc(daily.ayah)}</p></div></div><div class="daily-archive">${TAZKIYAH_DAYS.map(x=>`<button type="button" class="daily-pill ${x.day===daily.day?'active':''}" data-day="${x.day}">اليوم ${x.day}</button>`).join('')}</div></section>`:'';
  const buttons=topics.map((t,i)=>`<button type="button" class="space-topic-btn ${i===0?'active':''}" data-idx="${i}"><span class="topic-num">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(t.title)}</strong><small>${esc(t.kicker)}</small></span></button>`).join('');
  const generalNote=coreStudy?`<section class="ency-disclaimer"><b>📚 تنبيه منهجي:</b> هذا الباب جزء أساسي من دراسة القرآن في التطبيق، لذلك نوسّع فيه قدر الإمكان. ومع ذلك فالمادة الرقمية ليست بديلًا عن كتب العلم الأصلية ولا عن سؤال أهل الاختصاص في المسائل الدقيقة أو المختلف فيها.</section>`:`<section class="ency-disclaimer"><b>📚 تنبيه علمي:</b> هذا الباب مدخل منظم ومبسّط لبناء الطريق، وليس منهجًا كاملًا يغني عن كتب العلم أو أهل الاختصاص. عند المسائل الدقيقة أو الخلافية ارجع إلى مصدر معتبر أو عالم موثوق.</section>`;
  $('spaceContent').innerHTML=`<div class="archive-head ${coreStudy?'core-study':''}"><div><div class="archive-icon">${meta.icon}</div><div><div class="archive-label">🗂️ ${coreStudy?'موسوعة قرآنية أساسية':'أرشيف موسوعي'}</div><h2>${esc(meta.title)}</h2><p>${esc(meta.intro)}</p>${coreStudy?'<span class="core-badge">📚 قسم أساسي في رحلة حفظ القرآن — دراسة موسعة</span>':''}</div></div><button type="button" class="space-internal-back" id="internalBackBtn">🌊 العودة إلى البحر</button></div>${dailyHtml}${generalNote}<div class="archive-shell"><aside class="archive-index"><div class="archive-index-title">فهرس الأبواب (${chapterCount})</div><div class="archive-index-list">${buttons}</div></aside><div id="spaceArticle" class="archive-article" role="region" aria-label="محتوى المقال"></div></div>`;
  document.querySelectorAll('.space-topic-btn').forEach(b=>b.onclick=()=>renderArticle(+b.dataset.idx));
  $('internalBackBtn')?.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(typeof switchView==='function'){switchView('spiritual')}else{$('spaceView')?.classList.remove('show');$('ocean')?.style.setProperty('display','block');document.body.classList.remove('space-world');document.body.classList.add('ocean-world')}});
  document.querySelectorAll('.daily-pill').forEach(b=>b.onclick=()=>{const day=+b.dataset.day;const x=TAZKIYAH_DAYS.find(d=>d.day===day);if(!x)return;toast(`اليوم ${x.day}: ${x.title} — ${x.action}`)});
  renderArticle(0); window.__rafiqCurrentSpaceKey=key; if(window.__rafiqRenderReleaseForSpace)window.__rafiqRenderReleaseForSpace(key);
  const ocean=$('ocean');if(!ocean)return;const tr=$('sceneTransition');tr?.classList.remove('play');void tr?.offsetWidth;tr?.classList.add('play');ocean.classList.remove('ocean-dive');void ocean.offsetWidth;ocean.classList.add('ocean-dive');setTimeout(()=>{ocean.style.display='none';$('spaceView').classList.add('show');$('spaceView').scrollIntoView({block:'start',behavior:'auto'})},360);
}
function renderAll(){
  renderHome();
  const active=document.querySelector('.view.active')?.id;
  if(active==='schedule') renderPlanning();
  if(active==='spiritual') renderSpiritual();
  if(active==='progress') renderProgress();
  if(active==='settings') renderSettings();
  if(active==='explore' && typeof renderExplore==='function') renderExplore();
  renderAdhkar();
}
async function bootCore(){
  await load();
  setTimeGlow();
  try{applyGraphics()}catch(e){console.error('[Rafiq] graphics boot',e)}
  try{initGlobalOcean()}catch(e){console.error('[Rafiq] ocean boot',e)}
  try{setupEvents()}catch(e){console.error('[Rafiq] event binding failed',e)}
  try{initOceanExplorer()}catch(e){console.error('[Rafiq] explorer boot',e)}
  try{renderAll()}catch(e){console.error('[Rafiq] initial render failed',e)}
  try{if(!state.name)openModal('welcomeModal')}catch{}
  try{refreshPrayer().then(()=>{if(state.name)showDailySplash(false)}).catch(()=>{if(state.name)showDailySplash(false)})}catch{}
  if(!Number.isFinite(state.lat)||!Number.isFinite(state.lon))setTimeout(()=>{try{locate(true)}catch{}},900);
  if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js?v=87',{updateViaCache:'none'}).catch(()=>{});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;try{renderSettings()}catch{}});
  let resizeRaf=0,lastLayoutBucket=Math.floor(window.innerWidth/120);
  window.addEventListener('resize',()=>{if(resizeRaf)return;resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;const bucket=Math.floor(window.innerWidth/120);if(bucket!==lastLayoutBucket){lastLayoutBucket=bucket;try{applyGraphics()}catch{}if($('spiritual')?.classList.contains('active')){createOceanBubbles();createGlobalOceanBubbles();}}if($('progress')?.classList.contains('active')){try{drawChart()}catch{}}})},{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(()=>{try{applyGraphics();createGlobalOceanBubbles()}catch{}},180),{passive:true});
  window.addEventListener('online',()=>{document.body.dataset.net='online';try{refreshPrayer()}catch{};toast('عاد الاتصال بالإنترنت ✅')});
  window.addEventListener('offline',()=>{document.body.dataset.net='offline';toast('أنت أوفلاين — البيانات المحلية متاحة ✅')});
  setInterval(()=>{setTimeGlow();const g=$('greeting');if(g&&state.name)g.textContent=greeting();try{checkBoundaryAndSplash()}catch{}},60000)
}
function checkBoundaryAndSplash(){const key=ritualKey();if(state.lastDailyBoundary!==key){state.lastDailyBoundary=key;save();if(state.name)showDailySplash(false)}}

(function(){
  const portal=document.querySelector('[data-open-explore="true"]');
  if(portal){
    const open=()=>{ if(typeof switchView==='function') switchView('explore'); };
    portal.addEventListener('click',open);
    portal.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  }
})();


/* V43: hydrate the exact ZAD ocean shell on every page. */
(function(){
  function seedPageBubbles(){
    document.querySelectorAll('.page-bubbles').forEach((box)=>{
      if(box.children.length) return;
      const frag=document.createDocumentFragment();
      for(let i=0;i<10;i++){
        const b=document.createElement('span');
        b.className='bubble';
        b.style.left=(Math.random()*100)+'%';
        b.style.setProperty('--size',(4+Math.random()*13)+'px');
        b.style.setProperty('--dur',(12+Math.random()*14)+'s');
        b.style.setProperty('--delay',(-Math.random()*18)+'s');
        frag.appendChild(b);
      }
      box.appendChild(frag);
    });
  }
  function syncDepth(){
    const views=['home','planning','mushaf','study','progress','explore','settings'];
    views.forEach((id,i)=>document.getElementById(id)?.style.setProperty('--zad-depth-index',i));
  }
  document.addEventListener('DOMContentLoaded',()=>{seedPageBubbles();syncDepth()});
})();



'use strict';
(function(){
  const V='rafiq-v60-core-v1';
  const storageKey='rafiq-v60-profile';
  const tz=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'Africa/Cairo';
  const q=id=>document.getElementById(id);
  const escV=s=>{const d=document.createElement('div');d.textContent=s??'';return d.innerHTML};
  const now=()=>new Date();
  const toDateKey=(d=new Date(),zone=tz())=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const m={};p.forEach(x=>m[x.type]=x.value);return `${m.year}-${m.month}-${m.day}`};
  const addDaysV=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
  const monthKey=d=>{const k=toDateKey(d);return k.slice(0,7)};
  const BLOCKED_KEYS=new Set(['__proto__','prototype','constructor']);
  const mergeV=(a,b)=>{if(!b||typeof b!=='object'||Array.isArray(b))return a;for(const k of Object.keys(b)){if(BLOCKED_KEYS.has(k))continue;const bv=b[k],av=a[k];if(bv&&typeof bv==='object'&&!Array.isArray(bv)&&av&&typeof av==='object'&&!Array.isArray(av))mergeV(av,bv);else a[k]=bv}return a};
  const getV=()=>{state.v60=state.v60&&typeof state.v60==='object'?state.v60:{};const d={profile:{name:state.name||'',age:state.age||'',role:'',study:''},plan:{mode:'auto',goalAmount:1,goalUnit:'جزء',days:null,dailyNew:0,reviewMode:'balanced',reviewDaily:0,goalDate:'',startDate:'',targetLabel:''},prayer:{timezone:tz(),lastSync:'',months:{},source:'حساب فلكي محلي',city:state.city||'أسيوط',locationKey:''},reminders:{enabled:true},worship:{},lamp:{level:0,missedDays:0,lastActivity:''},lastReligiousDay:'',focusSound:'rain',offline:{lastOnline:''},content:{dailyIndex:0},...state.v60};state.v60=mergeV(d,state.v60||{});state.v60.profile={...d.profile,...(state.v60.profile||{})};delete state.v60.profile.dialect;state.v60.plan={...d.plan,...(state.v60.plan||{})};state.v60.prayer={...d.prayer,...(state.v60.prayer||{})};state.v60.reminders={...d.reminders,...(state.v60.reminders||{})};state.v60.worship={...d.worship,...(state.v60.worship||{})};state.v60.lamp={...d.lamp,...(state.v60.lamp||{})};state.v60.content={...d.content,...(state.v60.content||{})};return state.v60;};
  const saveV=()=>save();

  const ROLES={
    'صيدلي':'يا صيدلي، الأمانة في علمك وعملك قبل أي لقب.',
    'طبيب':'يا طبيب، الإتقان في عملك عبادة وأمانة.',
    'مهندس':'يا مهندس، ابنِ يومك بإتقان كما تبني عملك.',
    'معلم':'يا معلم، تعليم الناس أمانة وأثر.',
    'محفّظ':'يا محفظ، ضبطك وحلمك ورفقك من زاد الرسالة.',
    'طالب':'يا طالب، مذاكرتك عملك اليوم فأتقنها.',
    'طالب جامعي':'يا طالب الجامعة، العلم الدنيوي والشرعي لا يتعارضان؛ لكل منهما حقه.',
    'ربة منزل':'يا أم البيت، ما تفعلينه كل يوم من رعاية وإتقان له وزن وأثر.',
    'أب':'يا أب، قدوتك في البيت جزء من تربيتك.',
    'أم':'يا أم، تعبك في الرعاية والتعليم ليس شيئًا صغيرًا.',
    'جد':'يا جد، ما فات ليس نهاية؛ كل يوم باب جديد.',
    'جدة':'يا جدة، خبرتك وذكرك وأثرك زاد لمن حولك.',
    'طفل':'يا بطل، آية واحدة اليوم أحسن من خطة كبيرة لا تبدأ.',
    'شيخ':'يا شيخ، العلم أمانة والرفق أثر.',
    'عام':'يا رفيق القرآن، لقبك لا يغنيك عن العلم والعمل والأخلاق.'
  };
  const dailyContent=[
    {title:'لا تؤجل البداية',short:'آية واحدة اليوم خير من خطة مثالية لا تبدأ.',action:'اختر أصغر ورد ممكن ونفذه الآن.',source:'رفيق القرآن — مبدأ No Zero Days'},
    {title:'منهج الاستدراك',short:'الفوات لا يعني أن الطريق انتهى.',action:'لا تعاقب نفسك بتحميل يوم واحد ما يفوق طاقتك؛ استأنف بخطوة قابلة للاستمرار.',source:'مبدأ تربوي للتدرج والاستمرار'},
    {title:'القرآن للعمل',short:'لا تجعل الحفظ نهاية الآية.',action:'بعد كل ورد اسأل: ما الذي يمكن أن أعمل به اليوم؟',source:'القرآن والسنة — العمل بالعلم'},
    {title:'الوقت الميت',short:'المواصلات والانتظار فرص للاستماع والمراجعة.',action:'أنشئ قائمة صوتية قصيرة تعمل دون شبكة.',source:'تطبيق عملي'},
    {title:'اطلب العلم',short:'ما تحتاجه في عبادتك لا ينبغي أن تتركه للصدفة.',action:'ابدأ بباب واحد من العلم الشرعي وتعلمه من مصدر موثوق.',source:'منهج التعليم التدريجي'},
    {title:'الإتقان',short:'الطالب له عمل، والعامل له عمل، وكل له مسؤوليته.',action:'اختر مهمة دراسية/عملية واحدة اليوم وأتقنها.',source:'مبدأ الأمانة والإحسان'},
    {title:'اللسان',short:'ليس كل موضوع يستحق أن تدخل فيه.',action:'قبل الكلام اسأل: هل في كلامي خير؟',source:'أدب الكلام وحفظ اللسان'},
    {title:'التسويف',short:'المشكلة غالبًا ليست في قلة الرغبة بل في كِبر الخطوة.',action:'صغّر المهمة حتى تصبح بدايتها سهلة.',source:'استراتيجية سلوكية عملية'},
    {title:'الرياضة',short:'ابدأ بالممكن: مشي أو تمارين بسيطة.',action:'10–20 دقيقة حركة اليوم تكفي كبداية.',source:'الصحة والإعانة على الطاعة'},
    {title:'النظافة',short:'النظافة ليست زينة فقط؛ هي عادة يومية واحترام للناس.',action:'اختر عادة نظافة واحدة وثبتها.',source:'أبواب الطهارة والفطرة'},
    {title:'الحسنات ليست رقمًا فقط',short:'عداد الحروف أداة تحفيز وليس حكمًا على القبول.',action:'ركز على القراءة والفهم والعمل، والفضل والقبول عند الله.',source:'تنبيه منهجي'},
    {title:'لا تتكلم بلا علم',short:'عدم معرفة الجواب ليس عيبًا؛ الفتوى بلا علم هي المشكلة.',action:'اكتب السؤال وارجع لمصدر موثوق.',source:'أدب طلب العلم'}
  ];
  const RECS=[
    {need:'مشتت',title:'جلسة حفظ قصيرة + صوت هادئ',kind:'روتين',desc:'ابدأ بـ10 دقائق فقط، ثم أكمل إن وجدت طاقة.',tags:['تركيز','حفظ','No Zero Days']},
    {need:'متأخر وأريد الاستدراك',title:'خطة استئناف من الصفر الصغير',kind:'خطة',desc:'أقل مقدار ثابت لثلاثة أيام ثم زد تدريجيًا.',tags:['استدراك','تسويف']},
    {need:'أحتاج تثبيت الحفظ',title:'قريب + بعيد',kind:'مراجعة',desc:'راجع ورد اليوم ثم ضع مراجعة بعيدة من المخزون القديم.',tags:['مراجعة','تثبيت']},
    {need:'أريد أن أتعلم التجويد',title:'التجويد من الحرف إلى الكلمة',kind:'علم',desc:'ابدأ بالمد والحركات ثم الأحكام مع أمثلة صوتية.',tags:['تجويد','مبتدئ']},
    {need:'أحتاج دافعًا',title:'الأثر وليس الأرقام',kind:'تزكية',desc:'سجل ماذا تعلمت وماذا عملت به اليوم.',tags:['تزكية','أثر']}
  ];
  const HUB=[
    {cat:'القرآن',icon:'📖',items:[
      {t:'العمل بالآية',d:'بعد الحفظ اسأل: ماذا أستطيع أن أعمل به اليوم؟',src:'القرآن الكريم وتدبره'},
      {t:'آية اليوم',d:'آية مستقلة عن جود حفظك: نصها، تفسيرها، أسباب نزولها عند الثبوت، والتجويد الحرفي.',src:'المصادر المحفوظة داخل التطبيق'},
      {t:'آيات المواقف',d:'مجموعات موضوعية عن الصبر والتوبة والابتلاء والإنفاق وغيرها، مع التفريق بين المناسبة وسبب النزول.',src:'المصادر المحفوظة داخل التطبيق'}
    ]},
    {cat:'التزكية',icon:'🌱',items:[
      {t:'الاستدراك',d:'الانقطاع لا يلغي الطريق؛ ابدأ بأصغر خطوة قابلة للاستمرار.',src:'مبدأ تربوي'},
      {t:'ترك الكمالية',d:'لا تجعل الصفحة المثالية سببًا لترك الآية الممكنة.',src:'No Zero Days'},
      {t:'اللسان',d:'اسأل قبل الكلام: هل هذا خير؟ وهل أحتاج أن أدخل في هذا الموضوع أصلًا؟',src:'آداب الكلام'}
    ]},
    {cat:'العلم الشرعي',icon:'📚',items:[
      {t:'ما لا يسع المسلم جهله',d:'مسار يومي يبدأ بما يحتاجه المسلم في الاعتقاد والطهارة والصلاة وغيرها، ثم يتوسع.',src:'مادة تعليمية مختارة'},
      {t:'الفقه الميسر',d:'بعد الأساسيات ينتقل المستخدم إلى أبواب الفقه التي يحتاجها في حياته.',src:'مراجع فقهية موثوقة'},
      {t:'تمييز الأحكام',d:'الفرض والواجب والسنة والمستحب والمكروه والحرام، مع توضيح أن بعض الاصطلاحات تختلف باختلاف المذهب.',src:'مراجع الفقه المقارن'}
    ]},
    {cat:'الطهارة والنظافة',icon:'🧼',items:[
      {t:'الوضوء',d:'تعلم الأركان والسنن والنواقض بطريقة تناسب المبتدئ مع الإحالة للمذهب والمصدر.',src:'مراجع الفقه'},
      {t:'الغسل',d:'شرح مبسط للغسل ومتى يجب وماذا يلزم مع التفريق بين الواجب والمستحب.',src:'مراجع الفقه'},
      {t:'النظافة الشخصية',d:'الفطرة والعناية بالأظافر والشعر والبدن والمظهر العام دون مبالغة أو تعقيد.',src:'السنة الصحيحة ومراجع الفقه'}
    ]},
    {cat:'السيرة والقصص',icon:'🕌',items:[
      {t:'الأنبياء',d:'بطاقات مختصرة: من هو؟ ما أبرز ما ورد عنه؟ وما الدرس العملي؟',src:'القرآن والسنة الصحيحة'},
      {t:'الصحابة',d:'شخصيات مختارة مع مواقفهم وأعمالهم والدروس العملية منها.',src:'مصادر السيرة والتراجم'},
      {t:'المواقف القرآنية',d:'مثل الذين خلفوا ومن المؤمنين رجال ومن يشري نفسه ابتغاء مرضاة الله، مع توثيق السياق.',src:'القرآن وكتب التفسير'}
    ]},
    {cat:'الحياة والعمل والدراسة',icon:'🎓',items:[
      {t:'إتقان الدراسة',d:'الطالب له عمل: المذاكرة وإتقانها جزء من الأمانة، وليست منافسة للعبادة.',src:'مبدأ الأمانة'},
      {t:'إتقان العمل',d:'لا تجعل انشغالك الديني ذريعة لإهمال عملك أو مسؤولياتك.',src:'مبدأ الإحسان والأمانة'},
      {t:'الأوقات الميتة',d:'المواصلات والانتظار والأعمال المتكررة تتحول إلى فرص للاستماع والمراجعة والعلم.',src:'إرشاد عملي'}
    ]},
    {cat:'الجسد والحركة',icon:'🏃',items:[
      {t:'ابدأ بالأبسط',d:'مشي وتمارين بسيطة ثم جيم حسب القدرة؛ الهدف الاستمرار والاستعانة على الخير.',src:'إرشاد صحي عام'},
      {t:'الرياضة ليست عبادة آلية',d:'النية والسلوك والاعتدال مهمان؛ لا تجعل الأرقام غاية في نفسها.',src:'إرشاد تربوي'}
    ]},
    {cat:'العادات',icon:'🔁',items:[
      {t:'التسويف',d:'صغّر المهمة، اربطها بوقت ثابت، وابدأ قبل أن تشعر بأنك جاهز.',src:'استراتيجيات سلوكية عامة'},
      {t:'عادات مؤذية',d:'صفحات ترشيح لكتب وأساليب مساعدة مع تنبيه أن الأدبيات المتاحة ليست متساوية في قوتها العلمية.',src:'مراجع خارجية متعددة'},
      {t:'No Zero Days',d:'حتى يوم الانقطاع له حد أدنى: آية أو مراجعة قصيرة أو ذكر ثابت.',src:'تصميم سلوكي للتطبيق'}
    ]},
    {cat:'المواسم',icon:'🌙',items:[
      {t:'رمضان',d:'مسار عبادة قابل للقياس دون تحويل العبادة إلى سباق أرقام.',src:'القرآن والسنة'},
      {t:'العشر الأواخر وليلة القدر',d:'قيام وقرآن ودعاء واستغفار وصدقة بحسب الاستطاعة.',src:'القرآن والسنة'},
      {t:'عشر ذي الحجة وعرفة والتروية والنحر',d:'المسار يفرق بين أحكام الحاج وغير الحاج ويعرض ما يخص كل حال.',src:'مصادر الفقه والسنة'},
      {t:'الأشهر الحرم',d:'تعظيم حرمة الزمان والحرص على ترك الظلم والمعاصي.',src:'القرآن والسنة'}
    ]},
    {cat:'الدعاء',icon:'🤲',items:[
      {t:'أدعية القرآن',d:'مجموعة قابلة للحفظ والاستخدام في المواقف المختلفة.',src:'القرآن الكريم'},
      {t:'أدعية الأنبياء الصحيحة',d:'اختيار أدعية ثابتة مع المصدر ودرجة الحديث عند الحاجة.',src:'الحديث الصحيح وكتب الأدعية'},
      {t:'للمستضعفين',d:'دعاء عام للمسلمين والمسلمات في فلسطين وغزة والسودان وسائر المستضعفين دون تحويل القسم إلى مادة سياسية.',src:'دعاء عام'}
    ]},
    {cat:'كتب',icon:'📚',items:[
      {t:'ما لا يسع المسلم جهله',d:'ورد تأسيسي يومي؛ المختصر أولًا ثم التوسع بمصدر الكتاب.',src:'كتاب/مادة المؤلف'},
      {t:'الفقه الميسر',d:'المسار التالي بعد التأسيس.',src:'مراجع فقهية'},
      {t:'لأنك الله',d:'كتاب ترشيح للقراءة والتأمل وليس مرجعًا فقهيًا أو عقديًا.',src:'كتاب — للتوسع الأدبي'}
    ]}
  ];

  function profileRole(){const p=getV().profile;return p.role||'عام'}
  function greetingV(){const p=getV().profile,n=p.name||'يا رفيق القرآن',role=p.role||'عام',h=now().getHours();const roleText=ROLES[role]||ROLES['عام'];let base=h<6?'وقت الخلوات والهدوء':h<12?'صباح الهمة والبركة':h<17?'طاب يومك':h<22?'مساء الهدوء':'ليلة مباركة';return `${base} يا ${n} 🌙 — ${roleText}`}

  function injectOnboarding(){const box=q('welcomeModal')?.querySelector('.box');if(!box||box.dataset.v60Done)return;if(!q('welcomeRole')){const ref=q('welcomeStyle');const wrap=document.createElement('div');wrap.className='v60-grid2';wrap.style.marginTop='8px';wrap.innerHTML=`<select id="welcomeRole"><option value="">المهنة/الدور</option><option>طالب</option><option>طالب جامعي</option><option>صيدلي</option><option>طبيب</option><option>مهندس</option><option>معلم</option><option>محفّظ</option><option>ربة منزل</option><option>أب</option><option>أم</option><option>جد</option><option>جدة</option><option>طفل</option><option>شيخ</option></select><input id="welcomeStudy" placeholder="الدراسة/التخصص (اختياري)" autocomplete="organization-title"/></div>`;ref?.insertAdjacentElement('afterend',wrap);}box.dataset.v60Done='1'}

  function patchWelcomeSave(){if(!q('welcomeStartBtn'))return;q('welcomeStartBtn').onclick=()=>{const n=q('welcomeName')?.value.trim();const age=+q('welcomeAge')?.value||'';if(!n)return toast('اكتب اسمك أولًا');if(age&&(age<3||age>110))return toast('العمر من 3 إلى 110 سنة');profileSave(n,age);const v=getV();v.profile.name=n;v.profile.age=age;v.profile.role=q('welcomeRole')?.value||'';v.profile.study=q('welcomeStudy')?.value.trim()||'';const style=q('welcomeStyle')?.value;if(style==='lite'||style==='auto')state.graphics=1;else if(style==='balanced')state.graphics=2;else if(style==='ultra')state.graphics=3;v.lamp.level=Math.max(v.lamp.level||0,.08);v.lamp.lastActivity=Date.now();saveV();applyGraphics?.();q('welcomeModal')?.classList.remove('show');renderAll?.();setTimeout(()=>RafiqV60.showSplash(),220);setTimeout(()=>RafiqV60.syncLocationAndPrayer(false),650)}}

  function localizeRoleUi(){if(q('greeting'))q('greeting').textContent=greetingV();const p=getV().profile;const label=q('dateLine');if(label)label.title=`${p.study||''} ${p.role||''}`.trim()}

  function setGlow(n=1){const v=getV();v.lamp.level=Math.min(1,(v.lamp.level||0)+n);v.lamp.lastActivity=Date.now();saveV();document.documentElement.style.setProperty('--v60-glow',String(v.lamp.level));document.documentElement.style.setProperty('--v60-lamp',String(v.lamp.level));document.body.classList.remove('v60-glow-active');void document.body.offsetWidth;document.body.classList.add('v60-glow-active')}
  function updateLamp(){const v=getV();const t=toDateKey();const last=v.lamp.lastActivity?toDateKey(new Date(v.lamp.lastActivity)):'';if(last&&last!==t){const lastMs=new Date(v.lamp.lastActivity).getTime();const days=Math.max(0,Math.floor((Date.now()-lastMs)/86400000));v.lamp.missedDays=days;if(days>=1)v.lamp.level=Math.max(.06,v.lamp.level*.84)}document.documentElement.style.setProperty('--v60-glow',String(v.lamp.level||0));document.documentElement.style.setProperty('--v60-lamp',String(v.lamp.level||0));saveV()}

  function monthUrl(){return ''}
  function normalizeMonthPayload(){return {}}
  async function fetchMonth(y,m){const v=getV();v.prayer.timezone=window.RafiqPrayer?.timezone?.()||tz();v.prayer.months=v.prayer.months||{};const key=`${y}-${String(m).padStart(2,'0')}`;if(v.prayer.months[key]&&Object.keys(v.prayer.months[key]).length)return v.prayer.months[key];const out={};const days=new Date(y,m,0).getDate();for(let day=1;day<=days;day++){const d=new Date(y,m-1,day,12,0,0);const p=window.RafiqPrayer?.calculate(d,state.lat,state.lon,state.calcMethod||5,state.asrMethod||0);if(p)out[toDateKey(d)]={...p};}if(Object.keys(out).length){v.prayer.months[key]=out;v.prayer.lastSync=Date.now();v.prayer.source='حساب فلكي محلي';saveV();return out}return null}
  function getMonthDay(k){const key=k.slice(0,7);return getV().prayer.months[key]?.[k]||null}
  async function ensurePrayerForDate(k){let d=getMonthDay(k);if(d)return d;const date=new Date(k+'T12:00:00');await fetchMonth(date.getFullYear(),date.getMonth()+1);return getMonthDay(k)}
  async function syncPrayer(){const k=toDateKey();await fetchMonth(new Date(k+'T12:00:00').getFullYear(),new Date(k+'T12:00:00').getMonth()+1);if(new Date(k+'T12:00:00').getDate()>=25){const n=addDaysV(new Date(k+'T12:00:00'),10);await fetchMonth(n.getFullYear(),n.getMonth()+1)}const d=await ensurePrayerForDate(k);if(d){state.prayerToday={Fajr:d.Fajr,Sunrise:d.Sunrise,Dhuhr:d.Dhuhr,Asr:d.Asr,Maghrib:d.Maghrib,Isha:d.Isha,Midnight:d.Midnight,Firstthird:d.Firstthird,Lastthird:d.Lastthird};state.city=state.city||'أسيوط';saveV();save();q('prayerSettingsStatus')&&(q('prayerSettingsStatus').textContent=`مواقيت ${k} — مصدر ${getV().prayer.source} — ${getV().prayer.timezone}`);renderV60();return true}renderV60();return false}
  async function syncLocationAndPrayer(show=true){const v=getV();v.prayer.timezone=tz();if(navigator.geolocation){try{const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:12000,maximumAge:5*60*1000}));state.lat=pos.coords.latitude;state.lon=pos.coords.longitude;saveV();save()}catch(e){}}const ok=await syncPrayer();if(show&&ok)toast('تم تحديث مواقيت الصلاة ✅');return ok}

  function parseTime(k){if(!k)return null;const m=String(k).match(/^(\d{1,2}):(\d{2})$/);if(!m)return null;return +m[1]*60 + +m[2]}
  function minutesFromNow(label){const t=parseTime(label);if(t===null)return null;const n=new Date();return t*60000 - (n.getHours()*60+n.getMinutes())*60000 - n.getSeconds()*1000}
  function religiousDay(){const today=toDateKey();const d=getMonthDay(today);const mag=parseTime(d?.Maghrib);const n=new Date();const mins=n.getHours()*60+n.getMinutes();if(mag!==null&&mins>=mag)return toDateKey(addDaysV(n,1));return today}
  async function religiousContext(){const rd=religiousDay();const today=toDateKey();const cur=await ensurePrayerForDate(today);const next=await ensurePrayerForDate(toDateKey(addDaysV(new Date(today+'T12:00:00'),1)));const actualDay=rd===today?cur:next;const end=rd===today?next:await ensurePrayerForDate(toDateKey(addDaysV(new Date(today+'T12:00:00'),2)));return {religiousDate:rd,cur:actualDay,next:end}}

  function nightInfo(rd){const start=getMonthDay(toDateKey(addDaysV(new Date(rd+'T12:00:00'),-1)))?.Maghrib||getMonthDay(rd)?.Maghrib;const fajr=getMonthDay(rd)?.Fajr;const a=parseTime(start),b=parseTime(fajr);if(a===null||b===null)return null;const nightMins=(1440-a)+b;const begin=(a+Math.round(nightMins*2/3))%1440;return {start,fajr,begin,nightMins}}
  function prayerReminders(rd,ctx){const d=getMonthDay(rd);if(!d)return[];const out=[];['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(k=>{if(d[k])out.push({kind:'prayer',time:d[k],title:`هل صليت ${k==='Fajr'?'الفجر':k==='Dhuhr'?'الظهر':k==='Asr'?'العصر':k==='Maghrib'?'المغرب':'العشاء'}؟`,detail:'سجّل صلاتك من هنا.'})});const nextFajr=ctx?.next?.Fajr||d.Fajr;const ninfo=nightInfo(rd);if(d.Isha)out.push({kind:'witr',time:d.Isha,title:'بعد العشاء: الشفع والوتر',detail:'تذكير لطيف لصلاة الشفع والوتر.'});out.push({kind:'qiyam',time:'00:00',title:'بعد منتصف الليل: قيام الليل والاستغفار والدعاء',detail:'الوقت مستمر إلى الفجر.'});if(ninfo){const h=Math.floor(ninfo.begin/60),m=ninfo.begin%60;out.push({kind:'lastthird',time:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,title:'بدأ الثلث الأخير من الليل',detail:`حتى الفجر تقريبًا: ${nextFajr}.`})}if(new Date().getDay()===5){out.push({kind:'friday',time:d.Asr,title:'الجمعة: نافذة دعاء بعد العصر',detail:'تذكير بساعة الإجابة مع مراعاة اختلاف أقوال أهل العلم في تعيينها.'})}return out}

  function renderV60(){
    injectOnboarding();patchWelcomeSave();localizeRoleUi();updateLamp();ensureHomeUI();ensurePlanningUI();ensureExploreUI();ensureWorshipUI();renderHomeV60();renderPlanningV60();renderWorshipV60();renderOffline();renderLamp();
  }
  function ensureHomeUI(){const home=q('home'),shell=home?.querySelector('.zad-page-shell');if(!shell||q('v60HomeCore'))return;const root=document.createElement('div');root.id='v60HomeCore';root.className='v60-wrap';root.innerHTML=`
    <div class="v60-card"><div class="v60-grid2"><div><div class="v60-kicker">المحور الأساسي للتطبيق</div><h3 id="v60RoleGreeting">اليوم مع رفيق القرآن</h3><div class="v60-muted">كل ما تحتاجه للحفظ والمراجعة يظهر هنا أولًا.</div><div id="v60ReligiousLine" style="margin-top:8px"></div></div><div><div class="v60-lamp" id="v60Lamp"></div><div class="v60-muted" style="text-align:center">نور الاستمرار</div></div></div><div id="v60Offline" style="margin-top:10px"></div></div>
    <div class="v60-card"><h3>🧭 ماذا تفعل الآن؟</h3><div id="v60TodayTasks" class="v60-timeline"></div><div class="v60-actions"><button class="main" id="v60DoNext">ابدأ المهمة التالية</button><button class="action" id="v60MarkLearned">سجّلت ماذا تعلمت</button><button class="action" id="v60NoZero">✅ لا يوم صفر</button></div></div>
    <div class="v60-grid3"><div class="v60-stat"><b id="v60GoalPct">—</b><span>اقترابك من الهدف</span></div><div class="v60-stat"><b id="v60Eta">—</b><span>موعد الهدف المتوقع</span></div><div class="v60-stat"><b id="v60ReviewLoad">0</b><span>مراجعات مستحقة</span></div></div>
    <div class="v60-card"><h3>📅 اليوم / غدًا / الأسبوع</h3><div id="v60WeekPlan" class="v60-timeline"></div></div>
    <div class="v60-grid2"><div class="v60-card"><h3>🕌 الصلاة والليل</h3><div id="v60PrayerBox"></div></div><div class="v60-card"><h3>📖 زاد اليوم</h3><div id="v60DailyKnowledge"></div></div></div>
    <div class="v60-card"><h3>🎯 خطتك الحالية</h3><div id="v60PlanSummary"></div><div class="v60-actions"><button class="action" id="v60EditPlan">تخصيص الخطة</button><button class="action" id="v60OpenRecs">ترشيحات مناسبة لي</button></div></div>
    <div class="v60-card"><h3>🤍 الأثر اليوم</h3><div class="v60-grid3"><div class="v60-stat"><b id="v60Learned">0</b><span>تعلمت</span></div><div class="v60-stat"><b id="v60Applied">0</b><span>طبّقت</span></div><div class="v60-stat"><b id="v60Clean">0</b><span>عادات/مهام</span></div></div><div id="v60Reflection" class="v60-modal-note">اكتب سطرًا واحدًا: ماذا تعلمت؟ ماذا طبقت؟</div></div>
  `;const target=shell.querySelector('.hero');target?target.insertAdjacentElement('beforebegin',root):shell.insertAdjacentElement('afterbegin',root);
    q('v60EditPlan').onclick=()=>openV60Plan();q('v60DoNext').onclick=()=>doNextTask();q('v60NoZero').onclick=()=>markNoZero();q('v60MarkLearned').onclick=()=>captureReflection();q('v60OpenRecs').onclick=()=>{switchView?.('explore');setTimeout(()=>q('v60RecoCard')?.scrollIntoView({behavior:'smooth'}),120)};
  }
  function ensurePlanningUI(){const v=q('planning'),shell=v?.querySelector('.zad-page-shell');if(!shell||q('v60PlanUI'))return;const root=document.createElement('div');root.id='v60PlanUI';root.className='v60-wrap';root.innerHTML=`<div class="v60-card"><h3>🎯 صمّم الخطة على مقاسك</h3><div class="v60-grid2"><div><label class="small">الهدف</label><input id="v60GoalAmount" type="number" min="1" step="0.1" placeholder="مثال: 1"><select id="v60GoalUnit"><option>جزء</option><option>حزب</option><option>ربع حزب</option><option>صفحة</option><option>آيات</option></select></div><div><label class="small">طريقة الخطة</label><select id="v60PlanMode"><option value="auto">التطبيق يحدد المعدل</option><option value="manual">أنا أحدد المعدل</option><option value="deadline">عندي موعد نهائي</option></select><label class="small">المقدار الجديد يوميًا</label><input id="v60DailyNew" type="number" min="0" step="0.1" placeholder="مثال: 0.25"></div></div><div class="v60-grid2"><div><label class="small">المراجعة</label><select id="v60ReviewMode"><option value="balanced">متوازنة مع الجديد</option><option value="fixed">مقدار ثابت يوميًا</option><option value="adaptive">تتكيف مع قوة المحفوظ</option></select></div><div><label class="small">موعد الهدف (اختياري)</label><input id="v60GoalDate" type="date"></div></div><input id="v60TargetLabel" placeholder="مثال: البقرة 255–260 أو جزء عم"><button class="main" id="v60SavePlan" style="width:100%;margin-top:8px">حفظ الخطة</button><div id="v60PlanPreview" class="v60-modal-note"></div></div>`;shell.insertAdjacentElement('afterbegin',root);q('v60SavePlan').onclick=savePlanV60}
  function ensureExploreUI(){const v=q('explore'),shell=v?.querySelector('.zad-page-shell');if(!shell||q('v60RecoCard'))return;const root=document.createElement('div');root.id='v60RecoCard';root.className='v60-wrap';root.innerHTML=`<div class="v60-card"><h3>✨ ترشيحات على مقاسك</h3><div class="v60-grid3"><select id="v60Feel"><option>أشعر بالتشتت</option><option>متأخر وأريد الاستدراك</option><option>أحتاج تثبيت الحفظ</option><option>أريد أن أتعلم التجويد</option><option>أحتاج دافعًا</option></select><select id="v60Need">${Object.keys(ROLES).map(x=>`<option>${escV(x)}</option>`).join('')}</select><select id="v60Age"><option>طفل</option><option>شاب</option><option>بالغ</option><option>كبير سن</option></select></div><div class="v60-actions"><button class="main" id="v60Recommend">رشّح لي</button></div><div id="v60RecoResults" class="v60-reco"></div></div><div class="v60-card"><h3>🗝️ كلمات بحث جاهزة</h3><div id="v60Keywords"></div></div>`;shell.insertAdjacentElement('afterbegin',root);q('v60Recommend').onclick=renderRecommendations;q('v60Feel').onchange=renderKeywords;renderKeywords()}
  function ensureWorshipUI(){const v=q('home');if(!v||q('v60WorshipCard'))return;const shell=v.querySelector('.zad-page-shell');const c=document.createElement('div');c.id='v60WorshipCard';c.className='v60-card';c.style.margin='0 0 18px';c.innerHTML=`<h3>🕌 عبادات اليوم</h3><div class="v60-grid3"><label class="v60-pill"><input type="checkbox" data-v60-prayer="Fajr"> الفجر</label><label class="v60-pill"><input type="checkbox" data-v60-prayer="Dhuhr"> الظهر</label><label class="v60-pill"><input type="checkbox" data-v60-prayer="Asr"> العصر</label><label class="v60-pill"><input type="checkbox" data-v60-prayer="Maghrib"> المغرب</label><label class="v60-pill"><input type="checkbox" data-v60-prayer="Isha"> العشاء</label><label class="v60-pill"><input type="checkbox" data-v60-prayer="Witr"> الشفع والوتر</label></div><div id="v60WorshipNote" class="v60-modal-note"></div>`;const target=shell.querySelector('.v60-wrap');target?.insertAdjacentElement('afterend',c);c.querySelectorAll('[data-v60-prayer]').forEach(x=>x.onchange=()=>toggleWorship(x.dataset.v60Prayer,x.checked))}

  function goalEquivalent(){const v=getV(),g=v.plan.goalAmount;const unit=v.plan.goalUnit;const conv={جزء:1,حزب:.5,'ربع حزب':.125,صفحة:1/20,آيات:1/600};return (g||0)*(conv[unit]||1)}
  function currentProgress(){const v=getV();if(!v.plan.goalAmount)return 0;const total=goalEquivalent();const done=state.entries.reduce((s,e)=>s+(e.hasBeenEvaluated?Math.max(.02,((e.baseUnits||1)/20)):0),0);return Math.min(1,total?done/total:0)}
  function estimateGoalDate(){const v=getV();if(v.plan.goalDate)return v.plan.goalDate;if(!v.plan.goalAmount||!v.plan.dailyNew)return 'غير محدد';const days=Math.ceil(v.plan.goalAmount/Math.max(.01,v.plan.dailyNew));return toDateKey(addDaysV(new Date(),days-1))}
  function taskList(){const snap=window.__RafiqHifzPlan;const due=snap?.dueReviews?.slice?.(0,5)||state.entries.filter(e=>e.hasBeenEvaluated&&e.nextReviewDate<=toDateKey()).slice(0,5);const fresh=snap?.newDue?.slice?.(0,5)||state.entries.filter(e=>e.date===toDateKey()&&!e.hasBeenEvaluated).slice(0,5);const t=[];due.forEach(e=>t.push({ico:'🔁',title:`مراجعة: ${e.label}`,detail:'مراجعة مستحقة اليوم بحسب سجل التباعد.',type:'review',entry:e}));fresh.forEach(e=>t.push({ico:'📖',title:`تثبيت الجديد: ${e.label}`,detail:'أكمل 10 تكرارات ثم أكمل أيام التثبيت.',type:'new',entry:e}));if(!t.length&&getV().plan.dailyNew)t.push({ico:'📚',title:'نفّذ مقدار الحفظ الجديد',detail:`المعدل المقترح اليوم: ${getV().plan.dailyNew} ${getV().plan.goalUnit}.`,type:'plan'});const dc=dailyContent[getV().content.dailyIndex%dailyContent.length];if(dc)t.push({ico:'🧠',title:dc.title,detail:'زاد اليوم — اقرأ المختصر ثم طبّق خطوة واحدة.',type:'learn'});return t.slice(0,6)}
  function renderHomeV60(){localizeRoleUi();const p=getV().profile,rd=religiousDay(),d=getMonthDay(rd)||state.prayerToday;const greet=q('v60RoleGreeting');if(greet)greet.textContent=greetingV();const rl=q('v60ReligiousLine');if(rl)rl.innerHTML=`<span class="v60-pill gold">🌙 اليوم الشرعي: ${escV(rd)}</span><span class="v60-pill">هجري: ${escV(d?.hijri||hijri?.()||'—')}</span>`;const tasks=taskList(),box=q('v60TodayTasks');if(box)box.innerHTML=tasks.map((x,i)=>`<div class="v60-task"><div class="t-ico">${x.ico}</div><div class="t-main"><strong>${escV(x.title)}</strong><small>${escV(x.detail)}</small></div><span class="v60-pill ${i===0?'gold':''}">${i===0?'الآن':'اليوم'}</span></div>`).join('')||'<div class="v60-empty">لا توجد مهام بعد. صمّم خطتك أولًا.</div>';const pct=Math.round(currentProgress()*100);if(q('v60GoalPct'))q('v60GoalPct').textContent=v60Fmt(pct)+'%';if(q('v60Eta'))q('v60Eta').textContent=estimateGoalDate();if(q('v60ReviewLoad'))q('v60ReviewLoad').textContent=state.entries.filter(e=>e.hasBeenEvaluated&&e.nextReviewDate<=toDateKey()).length;const wp=q('v60WeekPlan');if(wp){const arr=[];for(let i=0;i<7;i++){const date=addDaysV(new Date(),i);const k=toDateKey(date);const due=state.entries.filter(e=>e.hasBeenEvaluated&&e.nextReviewDate<=k).length;const nw=state.entries.filter(e=>e.date===k&&!e.hasBeenEvaluated).length;arr.push(`<div class="v60-line"><b>${i===0?'اليوم':i===1?'غدًا':date.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric'})}</b><span>جديد ${nw} • مراجعة ${due}</span></div>`)}wp.innerHTML=arr.join('')}
    const pb=q('v60PrayerBox');if(pb){const rem=prayerReminders(rd,{next:getMonthDay(toDateKey(addDaysV(new Date(rd+'T12:00:00'),1)))});const next=rem.find(r=>{const min=parseTime(r.time);return min!==null&&minutesFromNow(r.time)>0})||rem[0];pb.innerHTML=`<div class="v60-offline"><span><span class="v60-dot"></span>${next?escV(next.title):'المواقيت غير متاحة محليًا بعد'}</span><b>${next?.time||'—'}</b></div><div class="v60-source">التاريخ الشرعي ينتهي عند المغرب ويبدأ يوم جديد بعده. الثلث الأخير محسوب تقريبًا من الليل حتى الفجر.</div>`}
    const dk=q('v60DailyKnowledge');if(dk){const c=dailyContent[getV().content.dailyIndex%dailyContent.length];dk.innerHTML=`<b style="color:var(--gold)">${escV(c.title)}</b><div style="margin-top:5px">${escV(c.short)}</div><div class="v60-actions"><button class="action" onclick="RafiqV60.showContent()">اقرأ المختصر والتطبيق</button></div><div class="v60-source">${escV(c.source)}</div>`}
    const ps=q('v60PlanSummary');if(ps){const v=getV();ps.innerHTML=`<div class="v60-grid3"><div class="v60-stat"><b>${escV(v.plan.goalAmount||'—')}</b><span>${escV(v.plan.goalUnit||'هدف')}</span></div><div class="v60-stat"><b>${escV(v.plan.dailyNew||'—')}</b><span>جديد/يوم</span></div><div class="v60-stat"><b>${escV(v.plan.reviewMode||'—')}</b><span>المراجعة</span></div></div><div class="v60-modal-note">الموعد المتوقع: <b>${escV(estimateGoalDate())}</b> • الخطة تتغير مع الالتزام، والتطبيق يستطيع تخفيف الجديد إذا تراكم القديم.</div>`}
    const refl=q('v60Reflection');if(refl)refl.innerHTML=`آخر أثر: <b>${escV(getV().worship.lastReflection||'لم تسجل بعد')}</b> <span class="v60-muted">— القبول والأجر عند الله.</span>`;renderLamp();renderWorshipV60();renderOffline();
  }
  const v60Fmt=n=>Number(n||0).toLocaleString('ar-EG');
  function renderPlanningV60(){const v=getV();const f=q('v60GoalAmount');if(f)f.value=v.plan.goalAmount||'';const u=q('v60GoalUnit');if(u)u.value=v.plan.goalUnit||'جزء';const m=q('v60PlanMode');if(m)m.value=v.plan.mode||'auto';const d=q('v60DailyNew');if(d)d.value=v.plan.dailyNew||'';const r=q('v60ReviewMode');if(r)r.value=v.plan.reviewMode||'balanced';const gd=q('v60GoalDate');if(gd)gd.value=v.plan.goalDate||'';const tl=q('v60TargetLabel');if(tl)tl.value=v.plan.targetLabel||'';const p=q('v60PlanPreview');if(p)p.textContent=`${v.plan.goalAmount||'—'} ${v.plan.goalUnit||''} — معدل ${v.plan.dailyNew||'تلقائي'} يوميًا — الموعد المتوقع ${estimateGoalDate()}`}
  function savePlanV60(){const v=getV();v.plan.mode=q('v60PlanMode').value;v.plan.goalAmount=Math.max(0,+q('v60GoalAmount').value||0);v.plan.goalUnit=q('v60GoalUnit').value;v.plan.dailyNew=Math.max(0,+q('v60DailyNew').value||0);v.plan.reviewMode=q('v60ReviewMode').value;v.plan.goalDate=q('v60GoalDate').value||'';v.plan.targetLabel=q('v60TargetLabel').value.trim();v.plan.startDate=toDateKey();if(v.plan.mode==='auto'&&v.plan.goalAmount){const days=v.plan.goalDate?Math.max(1,Math.ceil((new Date(v.plan.goalDate)-new Date(v.plan.startDate))/86400000)+1):30;v.plan.dailyNew=+(v.plan.goalAmount/days).toFixed(3)}saveV();setGlow(.05);renderPlanningV60();renderHomeV60();toast('تم حفظ الخطة المخصصة ✅')}
  function openV60Plan(){switchView?.('planning');setTimeout(()=>q('v60PlanUI')?.scrollIntoView({behavior:'smooth',block:'start'}),100)}

  function captureReflection(){const text=prompt('ماذا تعلمت أو طبقت اليوم؟');if(!text)return;const v=getV();v.worship.lastReflection=text.trim();v.worship.learned=(v.worship.learned||0)+1;saveV();setGlow(.04);renderHomeV60();toast('تم حفظ أثرك اليوم ✅')}
  function markNoZero(){const v=getV(),k=religiousDay();v.worship[`nozero:${k}`]=true;v.lamp.lastActivity=Date.now();v.lamp.level=Math.min(1,(v.lamp.level||0)+.12);saveV();window.RafiqHifz?.protectDay?.(ritualKey()).then(()=>window.RafiqHifz?.recordRecovery?.(ritualKey())).then(()=>window.syncHifzSnapshot?.()).catch(()=>{});setGlow(.08);renderHomeV60();toast('لا يوم صفر ✅ — خطوة صغيرة اليوم تكفي للاستمرار')}
  function toggleWorship(key,checked){const v=getV(),rd=religiousDay();v.worship[`${rd}:${key}`]=checked;saveV();if(checked)setGlow(.03);renderWorshipV60()}
  function renderWorshipV60(){const c=q('v60WorshipCard');if(!c)return;const rd=religiousDay();c.querySelectorAll('[data-v60-prayer]').forEach(x=>{x.checked=!!getV().worship[`${rd}:${x.dataset.v60Prayer}`]});const n=q('v60WorshipNote');if(n)n.innerHTML=`اليوم الشرعي: <b>${escV(rd)}</b> • بعد العشاء تذكير بالشفع والوتر • بعد منتصف الليل تذكير بقيام الليل والاستغفار والدعاء.`}
  function renderLamp(){const l=q('v60Lamp');if(l){const v=getV();l.title=v.lamp.missedDays?`خف نور المصباح بعد ${v.lamp.missedDays} يومًا من الانقطاع. الرجوع يعيد النور.`:'كل حفظ ومراجعة واستمرار يزيد نور المصباح.'}}

  function renderRecommendations(){const feel=q('v60Feel')?.value||'أشعر بالتشتت';const role=q('v60Need')?.value||profileRole();const age=q('v60Age')?.value||'بالغ';const recs=RECS.filter(x=>x.need===feel).concat(RECS.filter(x=>x.need!==feel)).slice(0,3);q('v60RecoResults').innerHTML=recs.map(r=>`<div class="v60-reco-item"><div class="v60-kicker">${escV(r.kind)} • ${escV(age)} • ${escV(role)}</div><h4>${escV(r.title)}</h4><div>${escV(r.desc)}</div><div style="margin-top:7px">${r.tags.map(t=>`<span class="v60-pill">${escV(t)}</span>`).join('')}</div></div>`).join('')}
  function renderKeywords(){const feel=q('v60Feel')?.value||'أشعر بالتشتت';const keys={"أشعر بالتشتت":['حفظ قرآن مع التشتت','روتين 10 دقائق','تركيز في المواصلات'],"متأخر وأريد الاستدراك":['استدراك حفظ القرآن','No Zero Days','خطة رجوع بعد الانقطاع'],"أحتاج تثبيت الحفظ":['مراجعة قريبة وبعيدة','تثبيت القرآن','ربط الآيات'],"أريد أن أتعلم التجويد":['التجويد للمبتدئين','مقدار حركتين','أحكام النون الساكنة'],"أحتاج دافعًا":['تزكية النفس','استمرارية القرآن','الأثر والعمل بالآية']}[feel]||[];const c=q('v60Keywords');if(c)c.innerHTML=keys.map(x=>`<button class="action" style="margin:3px">${escV(x)}</button>`).join('')}

  function showContent(){const c=dailyContent[getV().content.dailyIndex%dailyContent.length];openModal('methodModal');if(q('methodModal')?.querySelector('.box'))q('methodModal').querySelector('.box').innerHTML=`<button class="close" data-close="methodModal" onclick="closeModal('methodModal')">✕</button><h2 style="color:var(--gold)">🌱 ${escV(c.title)}</h2><p>${escV(c.short)}</p><div class="v60-modal-note"><b>تطبيق اليوم:</b> ${escV(c.action)}</div><div class="v60-source">المصدر/المنهج: ${escV(c.source)}</div>`}
  function doNextTask(){const t=taskList()[0];if(!t)return toast('لا توجد مهمة الآن');setGlow(.06);if(t.entry){if(t.type==='review')openModal('focusModal');else if(t.type==='new')openModal('focusModal');}else if(t.type==='learn')showContent();else openV60Plan()}

  function renderOffline(){const c=q('v60Offline');if(!c)return;const ok=navigator.onLine;const v=getV();c.innerHTML=`<div class="v60-offline"><span><span class="v60-dot ${ok?'':'off'}"></span>${ok?'متصل — يمكن تحديث المحتوى':'أوفلاين — الوظائف المحلية تعمل'}</span><span class="v60-muted">آخر مزامنة: ${v.prayer.lastSync?new Date(v.prayer.lastSync).toLocaleString('ar-EG'):'لم تتم بعد'}</span></div>`}

  function ensureHubUI(){const v=q('explore')?.querySelector('.zad-page-shell');if(!v||q('v60Hub'))return;const c=document.createElement('div');c.id='v60Hub';c.className='v60-wrap';c.innerHTML=`<div class="v60-card"><h3>🌌 موسوعة رفيق القرآن</h3><div class="v60-muted">اختر موضوعًا؛ المختصر أولًا، ثم التفاصيل والمصدر.</div><div class="v60-grid3" id="v60HubCats" style="margin-top:10px"></div><div id="v60HubDetail" style="margin-top:10px"></div></div>`;v.insertAdjacentElement('afterbegin',c);const cats=q('v60HubCats');cats.innerHTML=HUB.map((x,i)=>`<button class="action" data-hub="${i}">${x.icon} ${escV(x.cat)}</button>`).join('');cats.querySelectorAll('[data-hub]').forEach(b=>b.onclick=()=>renderHub(+b.dataset.hub));renderHub(0)}
  function renderHub(i){const x=HUB[i];if(!x)return;const box=q('v60HubDetail');if(!box)return;box.innerHTML=`<div class="v60-reco">${x.items.map(it=>`<div class="v60-reco-item"><h4>${escV(it.t)}</h4><div>${escV(it.d)}</div><div class="v60-source">المصدر/الإحالة: ${escV(it.src)}</div></div>`).join('')}</div>`}
  function ensureSplashUI(){const box=q('dailySplash')?.querySelector('.box');if(!box||box.dataset.v60Splash)return;const badge=box.querySelector('.badge');const g=document.createElement('div');g.id='v60SplashGreeting';g.style.cssText='font:700 24px/1.6 Amiri,serif;color:var(--gold);margin:8px 0 4px';g.textContent=greetingV();badge?.insertAdjacentElement('afterend',g);const note=document.createElement('div');note.className='v60-modal-note';note.textContent='آية اليوم مستقلة عن «جوّد حفظك»: لكل واحدة مسارها الخاص.';box.querySelector('#splashAyah')?.insertAdjacentElement('beforebegin',note);box.dataset.v60Splash='1'}
  function patchSplashAudio(){const a=q('splashAudio');if(!a||a.dataset.v60End)return;a.dataset.v60End='1';a.addEventListener('ended',()=>{try{closeSplash(true)}catch{}})}
  
  function installOfflineBridge(){if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js?v=87',{updateViaCache:'none'}).catch(()=>{});window.addEventListener('online',()=>{renderOffline();syncPrayer();toast('عاد الاتصال — يتم تحديث البيانات ✅')});window.addEventListener('offline',()=>{renderOffline();toast('أوفلاين — التطبيق سيستمر بالبيانات المحفوظة ✅')});}
  function addSoundUI(){const settings=q('settings')?.querySelector('.zad-page-shell');if(!settings||q('v60SoundCard'))return;const c=document.createElement('div');c.id='v60SoundCard';c.className='v60-card';c.innerHTML=`<h3>🎧 صوت هادئ</h3><div class="v60-actions"><button class="action" id="v60Rain">🌧️ مطر</button><button class="action" id="v60Brown">🤎 Brown noise</button><button class="action" id="v60Wind">🌬️ رياح</button><button class="action" id="v60StopSound">⏹ إيقاف</button></div><div class="v60-modal-note">الصوت يُولّد محليًا داخل الجهاز ولا يحتاج إنترنت. تشغيل القرآن نفسه يحتاج ملف التلاوة محليًا أو تنزيل القارئ مسبقًا.</div>`;settings.appendChild(c);q('v60Rain').onclick=()=>noiseStart('rain');q('v60Brown').onclick=()=>noiseStart('brown');q('v60Wind').onclick=()=>noiseStartV60('wind');q('v60StopSound').onclick=()=>{try{if(typeof noise!=='undefined'&&noise){noise.close();noise=null}}catch{}if(window.__v60Noise){window.__v60Noise.close();window.__v60Noise=null}}}
  function noiseStartV60(type){if(window.__v60Noise){window.__v60Noise.close();window.__v60Noise=null;return}const A=window.AudioContext||window.webkitAudioContext;if(!A)return toast('الصوت غير مدعوم');const ac=new A();window.__v60Noise=ac;const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(type==='wind')last=.96*last+.14*w;else last=.99*last+.05*w;d[i]=last}const s=ac.createBufferSource();s.buffer=b;s.loop=true;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=type==='wind'?900:520;const g=ac.createGain();g.gain.value=.035;s.connect(f).connect(g).connect(ac.destination);s.start()}

  const RafiqV60={boot(){getV();injectOnboarding();patchWelcomeSave();addSoundUI();installOfflineBridge();ensureHubUI();ensureSplashUI();renderV60();renderRecommendations();setTimeout(()=>{ensureSplashUI();patchSplashAudio()},420);setTimeout(()=>syncLocationAndPrayer(false),900);setInterval(()=>{renderHomeV60();if(getV().reminders.enabled)checkReminder();},30000);setInterval(()=>{dailyRotate();},60000)},showSplash(){if(!state.name)return;try{ensureSplashUI();patchSplashAudio();if(q('v60SplashGreeting'))q('v60SplashGreeting').textContent=greetingV();window.showDailySplash?.(false)}catch{}},syncLocationAndPrayer,showContent,openPlan:openV60Plan};
  function dailyRotate(){const v=getV();const k=religiousDay();if(v.lastReligiousDay!==k){v.lastReligiousDay=k;v.content.dailyIndex=(v.content.dailyIndex||0)+1;saveV();renderV60();if(state.name)RafiqV60.showSplash()}}
  function checkReminder(){const rd=religiousDay();const d=getMonthDay(rd);if(!d)return;const n=new Date();const cur=`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;const rem=prayerReminders(rd,{next:getMonthDay(toDateKey(addDaysV(new Date(rd+'T12:00:00'),1)))});const exact=rem.find(x=>x.time===cur);if(exact){const key=`${rd}:${exact.kind}:${cur}`;if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');toast(`🔔 ${exact.title}`)}}}
  window.RafiqV60=RafiqV60;
  document.addEventListener('click',e=>{const t=e.target.closest('button,.action,.main,.nav-item');if(t)setGlow(.008)},{passive:true});
})();



'use strict';
(function(){
  const q=id=>document.getElementById(id);
  const deep=()=>{state.v62=state.v62&&typeof state.v62==='object'?state.v62:{};state.v62.profile=state.v62.profile||{};state.v62.learning=state.v62.learning||{};state.v62.tazkiyah=state.v62.tazkiyah||{};state.v62.tadabbur=state.v62.tadabbur||{};state.v62.audio=state.v62.audio||{noise:'rain',playing:false};state.v62.contentPacks=state.v62.contentPacks||{};return state.v62};
  const V=deep();
  const v62esc=s=>{const d=document.createElement('div');d.textContent=s??'';return d.innerHTML};
  const day=()=>typeof ritualKey==='function'?ritualKey():new Date().toISOString().slice(0,10);
  const now=new Date();
  const SERIES=[
    {id:'mlaysam',order:1,title:'ما لا يسع المسلم جهله',kind:'المسار التأسيسي الأول',desc:'ورد يومي من الكتاب كاملًا، ثم إتمام المسار قبل الانتقال إلى الفقه الميسر.',status:'pack',source:'كتاب كامل — ما لا يسع المسلم جهله.'},
    {id:'fiqh',order:2,title:'الفقه الميسر',kind:'المسار الفقهي التالي',desc:'ورد يومي من الكتاب كاملًا بعد إتمام المسار التأسيسي.',status:'pack',source:'كتاب كامل — الفقه الميسر في ضوء الكتاب والسنة.'},
    {id:'muamalat',order:3,title:'فقه المعاملات المالية المعاصرة',kind:'توسع فقهي',desc:'مسار يأتي بعد الأساسيات والفقه الميسر، للانتقال إلى المعاملات المالية.',status:'pack',source:'كتاب كامل — فقه المعاملات المالية المعاصرة.'},
    {id:'usulmuamalat',order:4,title:'القواعد الأصولية للمعاملات المالية المعاصرة',kind:'توسع متقدم',desc:'مادة أعمق لمن يريد فهم الأصول والقواعد التي تُبنى عليها مسائل المعاملات.',status:'pack',source:'كتاب كامل — القواعد الأصولية للمعاملات المالية المعاصرة.'},
    {id:'hadith',order:5,title:'الحديث',kind:'مسار علمي',desc:'الأربعون النووية، رياض الصالحين، الأدب المفرد، ثم تيسير مصطلح الحديث.',status:'pack',source:'كتب كاملة ضمن باب الحديث.'},
    {id:'seerah',order:6,title:'السيرة والأنبياء والصحابة',kind:'مسار علمي',desc:'السيرة النبوية، قصص الأنبياء، وحياة الصحابة من الكتب التي اعتمدتها للمسار.',status:'pack',source:'كتب كاملة ضمن باب السيرة.'},
    {id:'tafsir',order:7,title:'التفسير وعلوم القرآن',kind:'مسار علمي',desc:'التفسير الميسر، علوم القرآن، والسياق وأسباب الفهم المرتبطة بالورد.',status:'pack',source:'كتب كاملة ضمن باب التفسير وعلوم القرآن.'},
    {id:'tajweed',order:8,title:'التجويد',kind:'مسار مهاري',desc:'المقدمة الجزرية وتحفة الأطفال والمواد المساندة، مع التطبيق على الورد.',status:'pack',source:'مواد كاملة ضمن باب التجويد.'},
    {id:'tazkiyah',order:9,title:'التزكية',kind:'علم + عمل',desc:'محتوى معرفي من كتب التزكية مع تطبيق عملي يومي ومتابعة الأثر.',status:'pack',source:'كتب كاملة + تطبيقات يومية.'},
    {id:'adab',order:10,title:'الآداب والحياة',kind:'مسار عملي',desc:'اللسان، بر الوالدين، الأخلاق، الأمانة، الدراسة والعمل، النظافة، والمهارات اليومية.',status:'pack',source:'كتب كاملة + محتوى عملي.'}
  ];
  const TOPICS=[
    ['🎓','الدراسة والعمل','خطّة عملية للمذاكرة والعمل مع المحافظة على الورد والصلوات، دون تحميل اليوم فوق طاقته.'],
    ['🧼','النظافة والعناية','عادات النظافة والعناية الشخصية والبيئة مع إحالة الحكم الشرعي إلى مصدره عند الحاجة.'],
    ['🏃','الجسد والحركة','خطوات بسيطة للحركة والرياضة والنوم والعناية بالجسد بما يناسب القدرة والوقت.'],
    ['🤲','الدعاء والمواسم','أدعية القرآن والأنبياء، وأعمال الجمعة ورمضان والعشر الأواخر وعرفة والمواسم المشروعة.'],
    ['🗣️','اللسان','الغيبة والنميمة والخصومة وحسن الكلام، مع تحويل المعرفة إلى تدريب يومي صغير.'],
    ['🧭','الاستدراك','إذا فاتك يوم أو أكثر، ارجع بخطوة قابلة للاستمرار بدل خطة تعويض مرهقة.'],
    ['📚','طلب العلم','تعلم ما تحتاجه أولًا، واعرف حدود ما تعلمه، وارجع للمصادر وأهل العلم في المسائل الدقيقة.'],
    ['🌍','المواقف القرآنية','قصص ومواقف قرآنية موثقة، ثم سؤال: ماذا تعلّمت؟ وما الذي أطبقه اليوم؟']
  ];
  const TZ=[
    {t:'لا تؤجل البداية',know:'الكمالية قد تجعل الخطوة الممكنة تبدو قليلة، فيترك الإنسان العمل كله.',act:'احفظ أو راجع آية واحدة الآن قبل أي مهمة كبيرة.',q:'آية واحدة اليوم خير من خطة مثالية لا تبدأ.',source:'No Zero Days — مبدأ عملي'},
    {t:'الاستدراك',know:'فوات أيام أو سنين لا يعني أن الطريق انتهى.',act:'احذف من الخطة ما يتجاوز قدرتك، وابدأ من أصغر ورد قابل للاستمرار.',q:'البداية لا تحتاج إلى يوم مثالي.',source:'مبدأ تربوي'},
    {t:'اللسان',know:'ليس كل ما يمكن قوله ينبغي قوله.',act:'امتنع اليوم عن موضوع واحد تعرف أنه قد يفتح باب غيبة أو خصومة.',q:'هل هذا الكلام خير؟',source:'آداب الكلام'},
    {t:'الأمانة',know:'المسؤوليات الدنيوية ليست عكس الدين.',act:'اختر مهمة دراسية أو مهنية واحدة وأتقنها بصدق.',q:'إتقان المسؤولية جزء من الأمانة.',source:'مبدأ تربوي'},
    {t:'الأوقات الميتة',know:'المواصلات والانتظار يمكن أن تتحول إلى وقت قرآن أو علم.',act:'جهز وردًا صوتيًا قصيرًا يمكن تشغيله دون شبكة.',q:'الوقت القليل المتكرر يصنع أثرًا.',source:'تطبيق عملي'},
    {t:'الابتسامة والرفق',know:'الطاعة ليست فقط أعمالًا كبيرة مخططة.',act:'ابدأ اليوم بابتسامة أو كلمة طيبة لشخص أمامك.',q:'اجعل الخلق الحسن جزءًا من برنامج اليوم.',source:'أدب ومعاملة'},
    {t:'طلب العلم',know:'الجهل في مسائل يحتاجها المسلم ليس قدرًا ثابتًا.',act:'أكمل ورد العلم اليوم ثم اكتب سؤالًا واحدًا تريد فهمه.',q:'تعلم ما تحتاجه قبل أن تتكلم فيه.',source:'أدب طلب العلم'},
    {t:'العمل بالقرآن',know:'الحفظ وسيلة للعيش بالآية، وليس مجرد زيادة عداد.',act:'اختر أثرًا سلوكيًا واحدًا من وردك ونفذه قبل النوم.',q:'ماذا غيرت فيك الآية؟',source:'تدبر وعمل'}
  ];
  const noise=['🌧️ مطر','🌊 بحر','🌬️ رياح','🤍 White Noise'];
  const audioCtx={ctx:null,source:null,gain:null};
  function profileHydrate(){V.profile={name:state.name||'',age:state.age||'',role:state.role||'',study:V.profile.study||''};return V.profile}
  function ensureWelcomeFields(){const box=q('welcomeModal')?.querySelector('.box'); if(!box||q('welcomeRole'))return;const btn=q('welcomeStartBtn');const div=document.createElement('div');div.innerHTML=`<select id="welcomeRole" aria-label="المهنة أو الدور"><option value="">المهنة/الدور (اختياري)</option><option>طالب</option><option>طالب جامعي</option><option>صيدلي</option><option>طبيب</option><option>مهندس</option><option>معلم</option><option>محفّظ</option><option>أب</option><option>أم</option><option>جد</option><option>جدة</option><option>طفل</option><option>شيخ</option></select><input id="welcomeStudy" placeholder="الدراسة/التخصص (اختياري)"/>`;box.insertBefore(div,btn);profileHydrate();q('welcomeRole').value=V.profile.role||state.role||'';q('welcomeStudy').value=V.profile.study||''}
  function saveProfileV(){profileHydrate();V.profile.role=q('welcomeRole')?.value||V.profile.role||state.role||'';V.profile.study=q('welcomeStudy')?.value||V.profile.study||'';state.role=V.profile.role;V.profile.name=state.name;V.profile.age=state.age;save()}
  function showNetwork(){const b=q('v62NetBadge');if(!b)return;const on=navigator.onLine;b.className='v62-offline '+(on?'on':'off');b.textContent=on?'🟢 متصل — يمكن تنزيل الحزم':'🟠 أوفلاين — الـCore المحلي شغال'}
  function renderV62ReligiousTitle(){const k=day();const h=typeof hijri==='function'?hijri(new Date()):'';q('v62ReligiousTitle').textContent=`اليوم الشرعي: ${h||k}`;q('v62ReligiousSub').textContent='بداية اليوم الشرعي عند المغرب، وبداية الليلة لليوم الهجري التالي. مواقيت الصلاة المخزنة هي المرجع المحلي للتذكيرات.'}
  function currentSeries(){const idx=Math.min(SERIES.length-1,Number(V.learning.seriesIndex||0));return SERIES[idx]}
  function renderTrack(){const box=q('v62CurriculumTrack');if(!box)return;const idx=Number(V.learning.seriesIndex||0);box.innerHTML=SERIES.map((s,i)=>`<div class="v62-track-item ${i===idx?'active':''}" data-v62-series="${i}"><span class="v62-track-no">${s.order}</span><div class="grow"><b>${v62esc(s.title)}</b><small>${v62esc(s.kind)} • ${v62esc(s.desc)}</small></div><span class="v62-badge ${s.status==='local'?'local':s.status==='mixed'?'online':'pack'}">${s.status==='local'?'محلي':s.status==='mixed'?'مختلط':'حزمة كتاب'}</span></div>`).join('');box.querySelectorAll('[data-v62-series]').forEach(x=>x.onclick=()=>{V.learning.seriesIndex=+x.dataset.v62Series;V.learning.lesson=0;save();renderV62()})}
  function lessonFor(s){
    try{
      const aa=window.rafiqRelease?.assets?.()||[];
      const wanted=[s.id,s.title,s.track].filter(Boolean).map(v=>String(v).toLowerCase());
      const a=aa.find(x=>wanted.some(v=>String(x.catalog?.track||x.catalog?.title||x.title||x.name||'').toLowerCase().includes(v)));
      if(a)return {title:a._title||a.title||s.title,text:'الكتاب الكامل مرتبط بهذا المسار. ابدأ بورد اليوم، ثم واصل من آخر موضع وصلت إليه.',summary:'اقرأ من الكتاب الأصلي وسجّل ما تعلمته وما ستطبقه اليوم.',source:a._title||a.title||a.name,assetId:a.id};
    }catch{}
    return {title:s.title,text:'المحتوى الأساسي لهذا المسار ظاهر داخل زاد الحافظ، ويمكن تنزيل الكتاب عند توفر حزمة المحتوى.',summary:s.desc,source:s.source,actions:['افتح الباب','نزّل المصدر','ابدأ القراءة']};
  }
  function renderLesson(){
    const s=currentSeries();q('v62ActiveSeriesTitle').textContent=s.title;
    const badge=q('v62ActiveSeriesBadge');badge.textContent='مسار';badge.className='v62-badge local';
    const l=lessonFor(s);
    q('v62ActiveLesson').innerHTML=`<div class="v62-lesson"><div class="v62-badge">ورد العلم</div><h3 style="color:var(--gold);margin:9px 0 5px">${v62esc(l.title||'المصدر')}</h3><div class="v62-muted">${v62esc(l.text||l.summary||'')}</div>${l.summary?`<div class="command" style="margin-top:10px"><b>كيف تستخدمه اليوم؟</b><p>${v62esc(l.summary)}</p></div>`:''}<div class="v62-muted">${l.source?`المصدر: ${v62esc(l.source)}`:''}</div><div class="v62-lesson-actions">${l.assetId?`<button type="button" class="main" id="v62OpenCurrentBook">📖 افتح الكتاب</button>`:`<button type="button" class="main" id="v62OpenLibrary">📚 افتح باب العلم</button>`}</div></div>`;
    const openBook=q('v62OpenCurrentBook');
    if(openBook)openBook.onclick=()=>window.rafiqRelease?.open?.(l.assetId);
    const openLib=q('v62OpenLibrary');
    if(openLib)openLib.onclick=()=>{window.switchView?.('spiritual');window.setTimeout?.(()=>window.openSpace?.('knowledge'),0)};
  }
  function renderTazkiyah(){const i=Math.floor(Date.now()/86400000)%TZ.length;const key=`${day()}:${i}`,x=TZ[i],done=!!V.tazkiyah[key];q('v62TazkiyahBody').innerHTML=`<div class="v62-badge">${v62esc(x.t)}</div><h3 style="margin-top:9px">المعرفة</h3><p class="v62-muted">${v62esc(x.know)}</p><h3>التطبيق اليوم</h3><div class="v62-check"><input id="v62TazAction" type="checkbox" ${done?'checked':''}><div><b>${v62esc(x.act)}</b><div class="v62-muted" style="margin-top:4px">${v62esc(x.q)}</div></div></div><div class="v62-muted" style="margin-top:9px">المصدر/التصنيف: ${v62esc(x.source)}</div>`;q('v62TazAction').onchange=e=>{V.tazkiyah[key]=e.target.checked;save();if(e.target.checked)lampBoost(1);toast(e.target.checked?'تم تسجيل العمل ✅':'أزيلت علامة الإنجاز')};q('v62TodayTazkiyah').textContent=x.t;q('v62TodayTazkiyahSub').textContent=x.act}
  function renderNoise(){q('v62NoiseGrid').innerHTML=noise.map((n,i)=>`<button class="v62-noise ${V.audio.noise===String(i)?'active':''}" data-noise="${i}">${n}</button>`).join('');q('v62NoiseGrid').querySelectorAll('[data-noise]').forEach(b=>b.onclick=()=>toggleNoise(+b.dataset.noise))}
  function toggleNoise(i){V.audio.noise=String(i);V.audio.playing=!V.audio.playing;save();if(!V.audio.playing){stopNoise();toast('تم إيقاف الصوت');return}startNoise(i);renderNoise();}
  function stopNoise(){try{audioCtx.source?.stop()}catch{};audioCtx.source=null;audioCtx.gain=null}
  function startNoise(i){stopNoise();const A=window.AudioContext||window.webkitAudioContext;if(!A)return toast('هذا المتصفح لا يدعم الصوت المحلي');const c=audioCtx.ctx||new A();audioCtx.ctx=c;if(c.state==='suspended')c.resume();const gain=c.createGain();gain.gain.value=.035;const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=buf.getChannelData(0);for(let j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*.65;const src=c.createBufferSource();src.buffer=buf;src.loop=true;const filter=c.createBiquadFilter();filter.type=i===0?'lowpass':i===1?'lowpass':i===2?'bandpass':'highpass';filter.frequency.value=i===3?1400:i===2?650:i===1?900:700;src.connect(filter).connect(gain).connect(c.destination);src.start();audioCtx.source=src;audioCtx.gain=gain}
  async function packImport(file){try{const obj=JSON.parse(await file.text());if(obj.type!=='rafiq-book-pack'||!obj.id||!Array.isArray(obj.lessons))throw new Error('صيغة الحزمة غير صحيحة');V.contentPacks[obj.id]={...obj,importedAt:new Date().toISOString()};save();q('v62PackStatus').innerHTML=`<span class="v62-badge local">تم حفظ: ${v62esc(obj.title||obj.id)} (${obj.lessons.length} درس) ✅</span>`;toast('تم استيراد حزمة المحتوى أوفلاين ✅');renderV62()}catch(e){toast('تعذر استيراد الحزمة: '+(e.message||'ملف غير صحيح'))}}
  function renderTopics(){q('v62TopicCards').innerHTML=TOPICS.map(x=>`<div class="v62-card v62-tap"><div style="font-size:28px">${x[0]}</div><b style="color:var(--gold)">${v62esc(x[1])}</b><div class="v62-muted" style="margin-top:6px">${v62esc(x[2])}</div></div>`).join('')}
  function renderTadabbur(){const active=V.tadabbur.active;const a=active?.text||'';q('v62TadabburAyah').textContent=a||'افتح آية من المصحف لإدخال تدبرك وعملك.';q('v62TadabburRef').textContent=active?.ref||'';q('v62TadabburNote').value=active?(V.tadabbur.notes?.[active.key]||''):''}
  function bindTadabbur(){q('v62SaveTadabbur').onclick=()=>{if(!V.tadabbur.active)return toast('افتح آية من المصحف أولًا');V.tadabbur.notes=V.tadabbur.notes||{};V.tadabbur.notes[V.tadabbur.active.key]=q('v62TadabburNote').value.trim();save();lampBoost(1);toast('حُفظ التدبر ✅')};q('v62MarkAction').onclick=()=>{if(!V.tadabbur.active)return toast('افتح آية من المصحف أولًا');V.tadabbur.actions=V.tadabbur.actions||{};V.tadabbur.actions[V.tadabbur.active.key]=true;save();lampBoost(2);toast('تم تسجيل العمل بالآية ✅')}}
  function lampBoost(n){try{state.v60=state.v60||{};state.v60.lamp=state.v60.lamp||{level:0,missedDays:0,lastActivity:''};state.v60.lamp.level=Math.min(100,(state.v60.lamp.level||0)+n);state.v60.lamp.lastActivity=new Date().toISOString();save()}catch{}}
  function dailyStudy(){const s=currentSeries();let title=s.title,sub='الورد اليومي من هذا المسار.';try{const a=window.rafiqRelease?.seriesAsset?.(s.id);if(a){title=a._title||a.title||title;sub='اقرأ من الكتاب، ثم سجّل ما تعلمته وما ستطبقه اليوم.'}}catch{}q('v62TodayStudy').textContent=title;q('v62TodayStudySub').textContent=sub;q('v62TodayQuran').textContent=state.dailyPlan?`جديد: ${state.dailyPlan} ${state.goalUnit||'وحدة'}`:'حسب خطتك';q('v62TodayQuranSub').textContent='مع مراجعة القريب والبعيد والتثبيت والتربيط والمتشابهات حسب حالتك.'}
  function renderV62(){deep();profileHydrate();showNetwork();renderV62ReligiousTitle();renderTrack();renderLesson();renderTazkiyah();renderNoise();renderTopics();renderTadabbur();bindTadabbur();dailyStudy()}
  function addNav(){return}
  function hookMushaf(){
  const old=window.openAyahStudy;
  const wrapper=function(s,a){
    try{
      const key=`${s}:${a}`;
      const text=document.querySelector(`.mushaf-ayah[data-ayah="${a}"] .mushaf-ayah-text`)?.textContent||'';
      V.tadabbur.active={key,text,ref:`${surahs[s-1]||'السورة'}: ${a}`};
      saveV();
      renderTadabbur();
    }catch{}
    if(typeof old==='function')return old(s,a);
  };
  window.openAyahStudy=wrapper;
  window.__rafiqStudyAyah=wrapper;
}
function hookPrayer(){const old=window.renderPrayerChecklist; if(typeof old==='function'){window.renderPrayerChecklist=function(){old(); showNetwork(); const p=state.prayerToday; if(!p)return; const f=p.Fajr,m=p.Maghrib,i=p.Isha; const now=new Date(); const msg=[]; if(i){const ih=+i.split(':')[0],im=+i.split(':')[1]; if(now.getHours()>ih || (now.getHours()===ih&&now.getMinutes()>=im))msg.push('🕯️ بعد العشاء: الشفع والوتر');} if(now.getHours()>=0&&now.getHours()<12)msg.push('🌌 بعد منتصف الليل: قيام الليل والاستغفار والدعاء'); if(m&&f)msg.push('🌓 الثلث الأخير يُحسب من المغرب إلى الفجر حسب المواقيت المخزنة'); const el=q('nextReminder');if(el&&msg.length)el.textContent=msg.join(' • ');}}
  }
  function hookProfile(){ensureWelcomeFields();const start=q('welcomeStartBtn');if(start&&!start.dataset.v62Hook){start.dataset.v62Hook='1';start.addEventListener('click',()=>setTimeout(saveProfileV,30));}}
  function bootCurriculum(){addNav();ensureWelcomeFields();hookProfile();hookMushaf();hookPrayer();renderV62();
  try{const fg=document.querySelector('#ocean .float-grid');if(fg&&!fg.querySelector('[data-space="tajweed"]')){fg.insertAdjacentHTML('beforeend',`<button type="button" aria-label="التجويد" class="floating-card" data-space="tajweed"><span class="ico">🎙️</span><span class="floating-title">التجويد</span><span class="small">تعلم ثم طبّق على وردك</span></button><button type="button" aria-label="التلاوات" class="floating-card" data-space="audio"><span class="ico">🎧</span><span class="floating-title">التلاوات</span><span class="small">الحصري والحزم المتاحة</span></button>`);}}catch{}if(q('v62PackBtn'))q('v62PackBtn').onclick=()=>q('v62PackInput')?.click();if(q('v62PackInput'))q('v62PackInput').onchange=e=>e.target.files?.[0]&&packImport(e.target.files[0]);if(q('v62PackListBtn'))q('v62PackListBtn').onclick=()=>{const ks=Object.values(V.contentPacks||{});toast(ks.length?`محفوظة على الجهاز: ${ks.map(x=>x.title||x.id).join('، ')}`:'لا توجد حزم محلية بعد')};window.addEventListener('online',showNetwork);window.addEventListener('offline',showNetwork);window.renderV62=renderV62; window.__rafiqReleaseState={getAssets:()=>assets,refresh:loadAssets,download,open:openBook,isCached};}

})();











(function(){
'use strict';
const escText=s=>{const d=document.createElement('div');d.textContent=s??'';return d.innerHTML};
const reciters=[['Husary_128kbps','الحصري']];
function refKey(v){return v?.s&&v?.a?`${v.s}:${v.a}`:''}
function renderTafsirHTML(){
  if(!currentVerses.length)return '<section class="study-panel"><h3 style="color:var(--gold)">📖 التفسير</h3><p class="muted">لم تُحمّل آيات هذا الورد بعد.</p></section>';
  return `<section class="study-panel"><h3 style="color:var(--gold)">📖 التفسير</h3><div class="study-source">التفسير الميسر هو طبقة الدخول؛ لا تُحوّل البطاقة إلى فتوى شخصية، والمواضع الدقيقة تُراجع في المصدر الكامل.</div>${currentVerses.map(v=>{const key=refKey(v);return `<div class="study-compare-row"><div class="study-compare-ref">${escText(v.ref||'الآية')}</div><p>اقرأ الآية في سياقها، ثم ارجع إلى التفسير الميسر لفهم المعنى الإجمالي. عند الحاجة يمكن التوسع في علوم القرآن والسياق وأقوال المفسرين من المصادر المربوطة.</p><div class="row" style="margin-top:8px"><a class="action" href="#" target="_blank" rel="noopener">📚 التفسير الميسر</a><a class="action" href="#" target="_blank" rel="noopener">🔎 التوسع في التفسير</a>${key?`<span class="v69-pill">${escText(key)}</span>`:''}</div></div>`}).join('')}</section>`;
}
function renderWordsHTML(){
  if(!currentVerses.length)return '<section class="study-panel"><h3 style="color:var(--gold)">🔎 معاني الكلمات</h3><p class="muted">لم تُحمّل الآيات بعد.</p></section>';
  return `<section class="study-panel"><h3 style="color:var(--gold)">🔎 معاني الكلمات</h3><div class="study-source">المعنى يُفهم من الكلمة في سياقها، لا من الجذر وحده.</div>${currentVerses.map(v=>{const key=refKey(v);const wm=wordMeanings[key];return `<div class="study-compare-row"><div class="study-compare-ref">${escText(v.ref||'الآية')}</div><p>${escText(wm||'لا توجد بطاقة كلمات محلية لهذه الآية بعد. يمكنك فتح السراج في غريب القرآن ومعجم الاستعمال القرآني للتوسع.')}</p><div class="row" style="margin-top:8px"><a class="action" href="#" target="_blank" rel="noopener">🔤 التحليل اللغوي</a>${wm?'':'<span class="v69-pill">المادة المحلية غير متاحة لهذه الآية</span>'}</div></div>`}).join('')}</section>`;
}
function renderAsbabHTML(){
  if(!currentVerses.length)return '<section class="study-panel"><h3 style="color:var(--gold)">🕊️ أسباب النزول</h3><p class="muted">لم تُحمّل الآيات بعد.</p></section>';
  return `<section class="study-panel"><h3 style="color:var(--gold)">🕊️ أسباب النزول</h3><div class="study-source">لا نثبت سبب نزول خاصًا إلا بمصدر معتبر؛ وقد تكون الرواية تفسيرًا أو سياقًا لا سببًا صريحًا.</div>${currentVerses.map(v=>{const key=refKey(v);return `<div class="asbab-note"><div class="study-compare-ref">${escText(v.ref||'الآية')}</div><p>${escText(asbab[key]||'لا توجد رواية خاصة محفوظة محليًا لهذه الآية. يُرجع إلى مصادر أسباب النزول والتخريج عند الحاجة.')}</p><div class="row"><a class="action" href="#" target="_blank" rel="noopener">📚 مصادر التفسير وأسباب النزول</a><a class="action" href="#" target="_blank" rel="noopener">🔎 التحقق من الروايات</a></div></div>`}).join('')}</section>`;
}
function renderRecitationHTML(){
  if(!currentVerses.length)return '<section class="study-panel"><h3 style="color:var(--gold)">🎧 التلاوة</h3><p class="muted">لا توجد آية جاهزة للاستماع.</p></section>';
  const cards=currentVerses.map(v=>`<div class="study-compare-row"><div class="study-compare-ref">${escText(v.ref||'الآية')}</div><div class="study-compare-audios">${reciters.map(([id,name])=>{const s=v.s||v.sura||0,a=v.a||v.aya||0;const url='';return `<div class="study-reciter-card"><b>🎙️ ${escText(name)}</b>${url?`<audio controls preload="none" src="${url}"></audio>`:'<div class="muted">لا يوجد مرجع آية صالح</div>'}<div class="small" style="margin-top:5px">التشغيل يحتاج اتصالًا ما لم تكن حزمة القارئ محفوظة على الجهاز.</div></div>`}).join('')}</div></div>`).join('');
  return `<section class="study-panel"><h3 style="color:var(--gold)">🎧 استمع ثم طبّق</h3><div class="study-source">الحصري — القارئ المتاح حاليًا في حزمة الصوت.</div>${cards}</section>`;
}
function renderMethod(){
  const box=q('methodModal')?.querySelector('.box'); if(!box)return;
  box.innerHTML=`<button class="close" data-close="methodModal" onclick="closeModal('methodModal')">✕</button><h2 style="color:var(--gold)">🌿 منهجية الحفظ والمراجعة</h2><p class="muted">منهج شخصي تنظيمي داخل التطبيق، قابل للتعديل حسب قدرتك، وليس قاعدة شرعية ولا حكمًا على طريقة حفظ واحدة.</p>${(Array.isArray(method)?method:[]).map(x=>`<div class="schedule-day" style="margin-top:9px"><div class="row"><span class="badge gold">${escText(x[0])}</span><b>${escText(x[1])}</b></div><p style="margin:7px 0 0">${escText(x[2])}</p></div>`).join('')}`;
}
function openFocus(label){
  const t=q('focusTarget');if(t)t.textContent=label||'جلسة التركيز';
  timeLeft=0;renderTimer?.();
  q('breathBox')&&(q('breathBox').style.display='none');q('timerBox')&&(q('timerBox').style.display='block');
  openModal('focusModal');
}
function renderExplore(){
  const t=q('tazkiyahText');if(t&&Array.isArray(tazkiyah)&&tazkiyah.length)t.textContent=tazkiyah[Math.floor(Date.now()/86400000)%tazkiyah.length];
  // Ensure legacy exploration content is visible without depending on a missing renderer.
  const shell=q('explore')?.querySelector('.zad-page-content');
  if(shell&&!shell.dataset.v71ExploreReady){
    shell.dataset.v71ExploreReady='1';
    const btn=q('recommendBtn'); if(btn && !btn.dataset.v71Bound && typeof recommend==='function'){btn.dataset.v71Bound='1';btn.onclick=()=>recommend();}
  }
}
window.renderTafsirHTML=renderTafsirHTML;
window.renderWordsHTML=renderWordsHTML;
window.renderAsbabHTML=renderAsbabHTML;
window.renderRecitationHTML=renderRecitationHTML;
window.renderMethod=renderMethod;
window.openFocus=openFocus;
window.renderExplore=renderExplore;
})();


function bindZadContentOverview(){const root=$('zadContentOverview');if(!root)return;const titleMap=new Map((window.__RAFIQ_CONTENT_META||[]).map(x=>[String(x.title||''),x]));root.querySelectorAll('[data-content-download-title],[data-content-open-title]').forEach(btn=>{if(btn.dataset.bound)return;btn.dataset.bound='1';btn.onclick=async()=>{const title=btn.dataset.contentDownloadTitle||btn.dataset.contentOpenTitle;const a=window.rafiqRelease?.seriesAsset?.(title)||titleMap.get(title);if(!a){toast('هذا المصدر غير مفهرس بعد.');return}if(btn.dataset.contentDownloadTitle)await window.rafiqRelease?.download?.(a);else await window.rafiqRelease?.open?.(a);};});}
function renderReleaseContentFromManager(){try{window.__rafiqRenderReleaseForSpace?.(window.__rafiqCurrentSpaceKey||'knowledge')}catch{};bindZadContentOverview()}
window.directAssetUrl=(name)=>window.RafiqContent?.direct?.(name)||'';
window.rafiqRelease={refresh:async()=>{const a=await window.RafiqContent?.refresh?.();renderReleaseContentFromManager();return a},assets:()=>window.RafiqContent?.all?.()||[],seriesAsset:(title)=>{const a=(window.RafiqContent?.all?.()||[]).find(x=>(x.title||x.catalog?.title)===title);return a||((window.__RAFIQ_CONTENT_META||[]).find(x=>x.title===title)||null)},isCached:(a)=>window.RafiqContent?.has?.(a),download:(a)=>window.RafiqContent?.install?.(a),open:(a)=>window.RafiqContent?.open?.(a)};
async function startApp(){
  const core=window.RafiqData||{};
  surahs=core.surahs||surahs; dailyVerses=core.dailyVerses||dailyVerses; method=core.method||method;
  reminders=core.reminders||reminders; asbab=core.asbab||asbab; wordMeanings=core.wordMeanings||wordMeanings; tazkiyah=core.tazkiyah||tazkiyah;
  tajRules=core.tajRules||tajRules; adhkar=core.adhkar||adhkar; TAZKIYAH_DAYS=core.TAZKIYAH_DAYS||TAZKIYAH_DAYS; DEEP=core.DEEP||DEEP; ARCHIVE_META=core.ARCHIVE_META||ARCHIVE_META; ARCHIVE_EXTRA=core.ARCHIVE_EXTRA||ARCHIVE_EXTRA; STUDY_GUIDES=core.STUDY_GUIDES||STUDY_GUIDES;
  if(core.CATALOG)window.__RAFIQ_CONTENT_CATALOG=core.CATALOG;
  window.__RAFIQ_CONTENT_META=core.contentMeta||window.__RAFIQ_CONTENT_META||[];
  try{await bootCore()}catch(err){console.error('[Rafiq] core boot failed',err)}
  try{await window.RafiqV60?.boot?.()}catch(err){console.error('[Rafiq] curriculum boot failed',err)}
  try{await syncHifzSnapshot()}catch{}
  try{applyUserContext()}catch{}
  try{initZeroEnergyMode()}catch{}
  try{initPersonalization()}catch{}
  try{window.renderZadOverview?.()}catch(err){console.error('[Rafiq] zad overview failed',err)}
  try{bindZadContentOverview();renderReleaseContentFromManager()}catch{}
}
function applyUserContext(){
  const role=state.role||state.v62?.profile?.role||'';
  document.body.dataset.userRole=role||'general';
  const roleCopy={
    'طالب':'اجعل وردك جزءًا من يوم طلب العلم؛ القليل الثابت خير من الخطة التي تزدحم بالمواعيد.',
    'طالب جامعي':'وازن بين الحفظ والمذاكرة: جلسة مركزة قصيرة، ثم مراجعة ثابتة، ثم ارجع لواجبك.',
    'صيدلي':'اجعل إتقانك للعلم والعمل والأمانة امتدادًا لخلق المسلم؛ لا تجعل ضيق التدريب سببًا في ترك وردك كله.',
    'طبيب':'القليل الثابت في القرآن مع حسن أداء الأمانة المهنية؛ لا تجعل ضغط المناوبات يومًا صفرًا.',
    'مهندس':'خطط لورد يمكن تنفيذه حتى في الأيام المزدحمة، ثم راقب الاستمرار بدل مطاردة الكمال.',
    'معلم':'تعلم ما تعلّمه لغيرك بإتقان، واجعل خلقك مع طلابك جزءًا من أثر القرآن.',
    'محفّظ':'التدرج والرفق والمتابعة أهم من تكثير المقدار على الطالب دون تثبيت.',
    'أب':'اجعل القدوة العملية في البيت جزءًا من وردك؛ خطوة يشاهدها أبناؤك قد تكون أبلغ من موعظة طويلة.',
    'أم':'وازن بين مسؤوليات البيت ووردك بحد أدنى واقعي لا يسقط في الأيام الثقيلة.'
  };
  const el=$('homePriority');
  if(el&&roleCopy[role]&&!String(el.textContent||'').trim().startsWith('جارٍ')){
    el.dataset.personalized='1';
  }
  const rec=$('recommendation');
  if(rec&&roleCopy[role] && !rec.dataset.personalized){const tip=document.createElement('div');tip.className='personalized-tip';const b=document.createElement('b');b.textContent='مناسب لك:';tip.append(b,document.createTextNode(' '+roleCopy[role]));rec.prepend(tip);rec.dataset.personalized='1';}
}
function initPersonalization(){
  const role=state.role||state.v62?.profile?.role||'';
  const select=$('roleSelect'); if(select&&role){const opt=[...select.options].find(o=>o.value===role||o.textContent===role);if(opt)select.value=opt.value;}
}
function initZeroEnergyMode(){
  if($('zeroEnergyPanel'))return;
  const panel=document.createElement('div'); panel.id='zeroEnergyPanel'; panel.className='zero-energy-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.innerHTML=`<div class="zero-energy-card"><div class="badge gold">🛟 طوق النجاة</div><div class="zero-energy-ayah" id="zeroEnergyAyah"></div><p>طاقتك اليوم قليلة؟ خذ أقل خطوة تحفظ بها استمراريتك.</p><button class="main" id="zeroEnergyDone" type="button">قرأت — أبدأ بخطوة واحدة</button><button class="action" id="zeroEnergyClose" type="button">العودة للتطبيق</button></div>`;
  document.body.appendChild(panel);
  $('zeroEnergyDone').onclick=()=>{try{window.RafiqV60?.markNoZero?.();}catch{};panel.classList.remove('show');document.body.classList.remove('zero-energy-active')};
  $('zeroEnergyClose').onclick=()=>{panel.classList.remove('show');document.body.classList.remove('zero-energy-active')};
  const btn=document.createElement('button');btn.id='zeroEnergyOpen';btn.className='action';btn.type='button';btn.textContent='🛟 طاقتي صفر';btn.setAttribute('aria-label','فتح وضع طوق النجاة');
  const host=document.querySelector('#home .premium-now'); if(host){host.appendChild(btn);btn.onclick=()=>{const dv=(window.RafiqData?.dailyVerses||[])[new Date().getDate()%(window.RafiqData?.dailyVerses?.length||1)];$('zeroEnergyAyah').textContent=dv?.text||'وَفِي اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ';panel.classList.add('show');document.body.classList.add('zero-energy-active');};}
}
// Expose only the APIs required by inline handlers and existing markup.
window.startOceanSound=startOceanSound;window.stopOceanSound=stopOceanSound;window.reviewEntry=reviewEntry;window.closeModal=closeModal;window.deleteEntry=deleteEntry;window.deleteMistake=deleteMistake;window.openRecorder=openRecorder;window.openStudy=openStudy;window.openAyahStudy=openAyahStudy;window.mushafInit=mushafInit;window.switchView=switchView;window.openSpace=openSpace;window.addRep=addRep;
async function syncHifzSnapshot(){try{const p=await window.RafiqHifz?.plan?.();window.__RafiqHifzPlan=p||null;return p}catch{return null}}
window.syncHifzSnapshot=syncHifzSnapshot;

window.RafiqUI={boot:startApp};

})();
