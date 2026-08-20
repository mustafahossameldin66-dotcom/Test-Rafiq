(function(){
  const host=document.getElementById('windRibbons');
  if(!host) return;
  const NS='http://www.w3.org/2000/svg';
  const rand=(a,b)=>Math.random()*(b-a)+a;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const w=1600,h=900;
  const dirs=[-1,1];
  const paths=[];
  const sideData=[];
  for(let i=0;i<12;i++){
    const dir=pick(dirs);
    const y0=rand(-80,h+80);
    const y3=y0+rand(-260,260);
    const x0=dir>0?rand(-420,-40):rand(w+40,w+420);
    const x3=dir>0?rand(w+40,w+420):rand(-420,-40);
    const dy=y3-y0;
    const bend1=rand(-260,260), bend2=rand(-260,260);
    const x1=x0+(x3-x0)*.28, x2=x0+(x3-x0)*.68;
    const y1=y0+dy*.25+bend1, y2=y0+dy*.68+bend2;
    const d=`M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${x1.toFixed(1)} ${y1.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}, ${x3.toFixed(1)} ${y3.toFixed(1)}`;
    const group=document.createElementNS(NS,'g');
    group.setAttribute('class','wisp');
    group.style.setProperty('--dur',`${rand(11,22).toFixed(2)}s`);
    group.style.setProperty('--dur2',`${rand(5.8,11).toFixed(2)}s`);
    group.style.setProperty('--dur3',`${rand(9,17).toFixed(2)}s`);
    group.style.setProperty('--op',rand(.11,.24).toFixed(2));
    group.style.setProperty('--core',rand(.32,.62).toFixed(2));
    group.style.setProperty('--glow',rand(.08,.16).toFixed(2));
    const body=document.createElementNS(NS,'path'); body.setAttribute('d',d); body.setAttribute('class','wisp-body'); body.style.strokeWidth=rand(18,32).toFixed(1);
    const glow=document.createElementNS(NS,'path'); glow.setAttribute('d',d); glow.setAttribute('class','wisp-glow');
    const core=document.createElementNS(NS,'path'); core.setAttribute('d',d); core.setAttribute('class','wisp-core');
    group.append(glow,body,core);
    const dots=2+Math.floor(Math.random()*3);
    for(let j=0;j<dots;j++){
      const c=document.createElementNS(NS,'circle'); c.setAttribute('r',String(rand(1.4,3.8).toFixed(1))); c.setAttribute('fill',pick(['#fff2bb','#9ff5d6','#f6df93'])); c.setAttribute('class','wisp-light');
      const motion=document.createElementNS(NS,'animateMotion'); motion.setAttribute('dur',`${rand(6,13).toFixed(2)}s`); motion.setAttribute('repeatCount','indefinite'); motion.setAttribute('begin',`${(-rand(0,10)).toFixed(2)}s`); motion.setAttribute('path',d);
      c.appendChild(motion); group.appendChild(c);
    }
    paths.push(group);
  }
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`); svg.setAttribute('preserveAspectRatio','none'); svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(NS,'defs');
  const fb=document.createElementNS(NS,'filter'); fb.setAttribute('id','wispBigBlur'); fb.innerHTML='<feGaussianBlur stdDeviation="14"/>';
  const f1=document.createElementNS(NS,'filter'); f1.setAttribute('id','wispBlur'); f1.innerHTML='<feGaussianBlur stdDeviation="6"/>';
  const f2=document.createElementNS(NS,'filter'); f2.setAttribute('id','wispSoft'); f2.innerHTML='<feGaussianBlur stdDeviation="1.7"/>';
  const grad=document.createElementNS(NS,'linearGradient'); grad.setAttribute('id','wispGlow'); grad.setAttribute('x1','0'); grad.setAttribute('y1','0'); grad.setAttribute('x2','1'); grad.setAttribute('y2','0');
  [['0','#9af4d4','0'],['.3','#fff0b0','.34'],['.5','#76ecc1','.22'],['.76','#f3d982','.20'],['1','#74efc5','0']].forEach(([o,c,op])=>{const s=document.createElementNS(NS,'stop');s.setAttribute('offset',o);s.setAttribute('stop-color',c);s.setAttribute('stop-opacity',op);grad.appendChild(s)});
  const gradCore=document.createElementNS(NS,'linearGradient'); gradCore.setAttribute('id','wispCore'); gradCore.setAttribute('x1','0'); gradCore.setAttribute('y1','0'); gradCore.setAttribute('x2','1'); gradCore.setAttribute('y2','0');
  [['0','#ffffff','0'],['.22','#ffeaa7','.65'],['.5','#9ff5d5','.55'],['.78','#f7dc8e','.5'],['1','#ffffff','0']].forEach(([o,c,op])=>{const s=document.createElementNS(NS,'stop');s.setAttribute('offset',o);s.setAttribute('stop-color',c);s.setAttribute('stop-opacity',op);gradCore.appendChild(s)});
  defs.append(fb,f1,f2,grad,gradCore); svg.appendChild(defs); paths.forEach(p=>svg.appendChild(p)); host.appendChild(svg);
  const refresh=()=>{ if(document.body.dataset.audio==='playing') host.style.opacity='1'; else host.style.opacity=''; };
  refresh();
  new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['data-audio']});
})();
