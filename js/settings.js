(function(){
 const sel=document.getElementById('settingsReciterSelect'); if(!sel)return;
 const list=(typeof reciters!=='undefined')?reciters:[];
 sel.innerHTML='<option value="">اختر القارئ</option>'+list.map(r=>`<option value="${r.folder}">${r.name} · ${r.quality}</option>`).join('');
 sel.value=(typeof state!=='undefined'?(state.prefs?.reciter||''):'');
 sel.addEventListener('change',()=>{if(typeof state==='undefined')return;state.prefs=state.prefs||{};state.prefs.reciter=sel.value||null;save();if(typeof updateQuranReciterButton==='function')updateQuranReciterButton();toast(sel.value?'تم تثبيت القارئ المفضل ✅':'تمت إزالة التثبيت');});
})();
