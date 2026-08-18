/* RafiqPrayer: offline solar prayer calculation with no network dependency. */
(function(){
  const RAD=Math.PI/180, DEG=180/Math.PI;
  const METHODS={
    0:{fajr:18,isha:17},1:{fajr:18,isha:18},2:{fajr:18.2,isha:18.2},3:{fajr:18,isha:18},4:{fajr:18,isha:17},5:{fajr:19.5,isha:17.5},7:{fajr:18,isha:18},8:{fajr:18,isha:18},9:{fajr:18,isha:18},10:{fajr:18,isha:18}
  };
  function norm(x){x%=360;return x<0?x+360:x}
  function jd(date){return date.getTime()/86400000+2440587.5}
  function solar(date,lon){
    const n=jd(date)-2451545+0.0008, Jstar=n-lon/360;
    const M=norm(357.5291+0.98560028*Jstar)*RAD;
    const C=1.9148*Math.sin(M)+0.0200*Math.sin(2*M)+0.0003*Math.sin(3*M);
    const lam=(norm(M*DEG+102.9372+C+180))*RAD;
    const Jtrans=2451545+Jstar+0.0053*Math.sin(M)-0.0069*Math.sin(2*lam);
    const delta=Math.asin(Math.sin(23.44*RAD)*Math.sin(lam));
    return {Jtrans,delta};
  }
  function hourAngle(lat,delta,alt){
    const phi=lat*RAD,a=alt*RAD;
    const c=(Math.sin(a)-Math.sin(phi)*Math.sin(delta))/(Math.cos(phi)*Math.cos(delta));
    if(c<=-1)return 180;if(c>=1)return 0;return Math.acos(c)*DEG;
  }
  function localHours(J,offset){let h=((J-2440587.5)*24+offset)%24;return h<0?h+24:h}
  function hhmm(h){const hh=Math.floor(h);const mm=Math.round((h-hh)*60);const H=(hh+(mm===60?1:0))%24;const M=mm===60?0:mm;return `${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}`}
  function calc(date,lat,lon,method=5,school=0){
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
    const offset=-date.getTimezoneOffset()/60; const s=solar(date,lon); const eqNoon=localHours(s.Jtrans,offset); const noon=eqNoon;
    const cfg=METHODS[method]||METHODS[5];
    const fajr=localHours(s.Jtrans-hourAngle(lat,s.delta,-cfg.fajr)/360,offset);
    const sunrise=localHours(s.Jtrans-hourAngle(lat,s.delta,-0.833)/360,offset);
    const sunset=localHours(s.Jtrans+hourAngle(lat,s.delta,-0.833)/360,offset);
    const asrFactor=school===1?2:1; const alt=Math.atan(1/(asrFactor+Math.tan(Math.abs(lat*RAD-s.delta))))*DEG; const asr=localHours(s.Jtrans+hourAngle(lat,s.delta,alt)/360,offset);
    let isha=localHours(s.Jtrans+hourAngle(lat,s.delta,-cfg.isha)/360,offset);
    if(method===4)isha=(sunset+90/60)%24;
    const out={Fajr:hhmm(fajr),Sunrise:hhmm(sunrise),Dhuhr:hhmm(noon),Asr:hhmm(asr),Maghrib:hhmm(sunset),Sunset:hhmm(sunset),Isha:hhmm(isha)};
    out.__source='حساب فلكي محلي — دون اتصال'; out.__timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
    return out;
  }
  window.RafiqPrayer={calculate:calc};
})();
