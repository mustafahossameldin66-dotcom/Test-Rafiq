/* HifzController — independent storage-backed engines for new/stabilization and archive/SRS review. */
(function(){
  'use strict';
  const STORE='hifz', NEW='new', ARCH='archive', PRO='protect';
  const DAY=86400000;
  const uid=()=>crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  async function list(bucket){return (await RafiqDB.get(STORE,bucket))||[]}
  async function save(bucket,value){return RafiqDB.set(STORE,bucket,value)}
  const intervalDays=n=>[1,2,4,7,14,30,60,120][Math.max(0,Math.min(7,Number(n||0)))];
  async function addNew(item){
    const arr=await list(NEW),x={id:uid(),createdAt:Date.now(),reps:0,targetReps:10,stabilityDays:7,completedDays:0,status:'new',nextReview:null,lastRepAt:null,lastStabilityDay:null,...item};
    arr.push(x);await save(NEW,arr);return x;
  }
  async function addArchive(item){
    const arr=await list(ARCH),x={id:uid(),createdAt:Date.now(),source:'archive',reviewCount:0,intervalDays:7,nextReview:Date.now(),lastReviewed:null,lastQuality:null,...item};
    arr.push(x);await save(ARCH,arr);return x;
  }
  async function recordNew(id,quality=4){
    const arr=await list(NEW),x=arr.find(v=>v.id===id);if(!x)return null;
    x.reps=Math.min(x.targetReps,(x.reps||0)+1);x.lastQuality=quality;x.lastRepAt=Date.now();x.status=x.reps>=x.targetReps?'ready':'new';
    await save(NEW,arr);return x;
  }
  async function completeNewDay(id,quality=4){
    const arr=await list(NEW),i=arr.findIndex(v=>v.id===id);if(i<0)return null;const x=arr[i],today=new Date();const key=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    x.lastQuality=quality;x.lastStabilityDay=key;x.completedDays=Math.min(x.stabilityDays||7,(x.completedDays||0)+1);x.reps=0;
    if(x.completedDays>=(x.stabilityDays||7)){
      arr.splice(i,1);const archive=await list(ARCH);archive.push({...x,source:'new',status:'archive',reviewCount:0,intervalDays:1,nextReview:Date.now()+DAY,lastReviewed:null});await save(NEW,arr);await save(ARCH,archive);return {...x,movedToArchive:true};
    }
    x.status='stabilizing';x.nextReview=Date.now()+DAY;await save(NEW,arr);return x;
  }
  async function review(id,quality=4){
    const arr=await list(ARCH),x=arr.find(v=>v.id===id);if(!x)return null;const now=Date.now();
    if(quality<=2){x.intervalDays=1;x.reviewCount=0}else{x.reviewCount=(x.reviewCount||0)+1;x.intervalDays=intervalDays(x.reviewCount)}
    x.nextReview=now+x.intervalDays*DAY;x.lastReviewed=now;x.lastQuality=quality;await save(ARCH,arr);return x;
  }
  async function due(date=Date.now()){
    const [n,a]=await Promise.all([list(NEW),list(ARCH)]);
    const newDue=n.filter(x=>x.status==='stabilizing'&&x.nextReview&&x.nextReview<=date);
    const archiveDue=a.filter(x=>!x.nextReview||x.nextReview<=date).sort((x,y)=>(x.nextReview||0)-(y.nextReview||0));
    return {newItems:n,newDue,dueReviews:archiveDue};
  }
  async function protectDay(day){
    const a=await list(ARCH),now=Date.now(),due=a.filter(x=>x.nextReview&&x.nextReview<=now).sort((x,y)=>(x.nextReview||0)-(y.nextReview||0));
    const shifted=[];for(const x of due.slice(0,5)){x.nextReview=now+DAY;shifted.push(x.id)}
    await save(ARCH,a);await save(PRO,{day,protectedAt:now,shifted,shiftedCount:shifted.length,kind:'no-zero-day'});return shifted.length;
  }
  async function remove(id,bucket){if(!id||!bucket)return false;const arr=await list(bucket),next=arr.filter(x=>x.id!==id);if(next.length===arr.length)return false;await save(bucket,next);return true}
  async function recordRecovery(day,reason='طاقتي صفر'){const history=await list(PRO);const next=Array.isArray(history)?history:[history].filter(Boolean);next.push({day,reason,at:Date.now(),kind:'recovery'});await save(PRO,next);return next.at(-1)}
  async function plan(date=Date.now()){
    const d=await due(date);return {newItems:d.newItems,newDue:d.newDue,dueReviews:d.dueReviews,newTarget:10,stabilityDays:7};
  }
  async function bootstrap(){await RafiqDB.open();window.RafiqHifz={addNew,addArchive,recordNew,completeNewDay,review,due,protectDay,recordRecovery,remove,plan,listNew:()=>list(NEW),listArchive:()=>list(ARCH)}}
  window.RafiqHifz={bootstrap};
})();
