/* RafiqPrayer — local astronomical calculation. No network. */
(function(){
  'use strict';
  const RAD=Math.PI/180,DEG=180/Math.PI;
  const METHODS={0:{fajr:18,isha:17},1:{fajr:18,isha:18},2:{fajr:18.2,isha:18.2},3:{fajr:18,isha:18},4:{fajr:18,isha:17},5:{fajr:19.5,isha:17.5},7:{fajr:18,isha:18},8:{fajr:18,isha:18},9:{fajr:18,isha:18},10:{fajr:18,isha:18}};
  const norm=x=>{x%=360;return x<0?x+360:x};
  const jd=date=>date.getTime()/86400000+2440587.5;
  function solar(date,lon){const n=jd(date)-2451545+0.0008,Jstar=n-lon/360,M=norm(357.5291+0.98560028*Jstar)*RAD,C=1.9148*Math.sin(M)+.02*Math.sin(2*M)+.0003*Math.sin(3*M),lam=norm(M*DEG+102.9372+C+180)*RAD,Jtrans=2451545+Jstar+.0053*Math.sin(M)-.0069*Math.sin(2*lam),delta=Math.asin(Math.sin(23.44*RAD)*Math.sin(lam));return{Jtrans,delta}}
  function ha(lat,delta,alt){const phi=lat*RAD,a=alt*RAD,c=(Math.sin(a)-Math.sin(phi)*Math.sin(delta))/(Math.cos(phi)*Math.cos(delta));if(c<=-1)return 180;if(c>=1)return 0;return Math.acos(c)*DEG}
  function localHours(J,offset){let h=((J-2440587.5)*24+offset)%24;return h<0?h+24:h}
  function hhmm(h){const hh=Math.floor(h),mm=Math.round((h-hh)*60),H=(hh+(mm===60?1:0))%24,M=mm===60?0:mm;return `${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}`}
  function mins(v){const [h,m]=String(v).split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null}
  function calc(date,lat,lon,method=5,school=0){
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
    const offset=-date.getTimezoneOffset()/60,s=solar(date,lon),noon=localHours(s.Jtrans,offset),cfg=METHODS[method]||METHODS[5];
    const fajr=localHours(s.Jtrans-ha(lat,s.delta,-cfg.fajr)/360,offset),sunrise=localHours(s.Jtrans-ha(lat,s.delta,-.833)/360,offset),sunset=localHours(s.Jtrans+ha(lat,s.delta,-.833)/360,offset);
    const asrFactor=school===1?2:1,alt=Math.atan(1/(asrFactor+Math.tan(Math.abs(lat*RAD-s.delta))))*DEG,asr=localHours(s.Jtrans+ha(lat,s.delta,alt)/360,offset);
    let isha=localHours(s.Jtrans+ha(lat,s.delta,-cfg.isha)/360,offset);if(method===4)isha=(sunset+1.5)%24;
    const out={Fajr:hhmm(fajr),Sunrise:hhmm(sunrise),Dhuhr:hhmm(noon),Asr:hhmm(asr),Maghrib:hhmm(sunset),Sunset:hhmm(sunset),Isha:hhmm(isha)};
    // Derived night markers from the same local calculation; no external API required.
    const next=calc(new Date(date.getTime()+86400000),lat,lon,method,school);
    const mag=mins(out.Maghrib),nextF=mins(next?.Fajr);if(mag!==null&&nextF!==null){const night=(1440-mag)+nextF;out.Midnight=hhmm(((mag+night/2)%1440)/60);out.Firstthird=hhmm(((mag+night/3)%1440)/60);out.Lastthird=hhmm(((mag+night*2/3)%1440)/60)}
    out.__source='حساب فلكي محلي — دون اتصال';out.__timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'';return out;
  }
  function localKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function religiousDay(date,lat,lon,method=5,school=0){const d=new Date(date||Date.now()),today=calc(d,lat,lon,method,school),m=mins(today?.Maghrib);if(m!==null&&d.getHours()*60+d.getMinutes()>=m){const next=new Date(d.getTime()+86400000);return localKey(next)}return localKey(d)}
  window.RafiqPrayer={calculate:calc,religiousDay,timezone:()=>Intl.DateTimeFormat().resolvedOptions().timeZone||''};
})();
