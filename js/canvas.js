(function() {
    const c = document.querySelector('#oceanCanvas');
    if (!c) return;
    const x = c.getContext('2d', { alpha: false });
    let w = 0, h = 0, t = 0, mx = .5, my = .5, running = true, last = 0, raf = 0;
    
    const rawPerf = (StorageManager.get('prefs') || {}).performance || 'auto'; 
    const perf = rawPerf === 'auto' ? (navigator.hardwareConcurrency <= 4 ? 'balanced' : 'high') : rawPerf;
    const counts = perf === 'lite' ? { stars: 70, gold: 8, motes: 12, comets: 1 } : perf === 'high' ? { stars: 110, gold: 14, motes: 18, comets: 2 } : { stars: 90, gold: 10, motes: 15, comets: 1 };
    
    const stars = Array.from({ length: counts.stars }, () => ({ x: Math.random(), y: Math.random() * .74, r: .35 + Math.random() * 1.15, a: .10 + Math.random() * .50, p: Math.random() * Math.PI * 2, depth: .3 + Math.random() * .7 }));
    const goldStars = Array.from({ length: counts.gold }, () => ({ x: Math.random(), y: .035 + Math.random() * .58, r: .55 + Math.random() * 1.7, p: Math.random() * Math.PI * 2, depth: .5 + Math.random() * .5 }));
    const motes = Array.from({ length: counts.motes }, () => ({ x: Math.random(), y: .12 + Math.random() * .72, r: .25 + Math.random() * .9, p: Math.random() * Math.PI * 2, v: .2 + Math.random() * .8 }));
    
    function resize() { w = innerWidth; h = innerHeight; const d = Math.min(window.devicePixelRatio || 1, 1); c.width = Math.floor(w * d); c.height = Math.floor(h * d); c.style.width = w + 'px'; c.style.height = h + 'px'; x.setTransform(d, 0, 0, d, 0, 0); }
    resize(); window.addEventListener('resize', resize, { passive: true });
    
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(loop); }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (document.body.dataset.motion !== 'off') start(); });
    document.addEventListener('rafiq-motion', e => { if (e.detail) start(); else stop(); });

    function loop(ts) {
        if (!running || document.hidden) return;
        raf = requestAnimationFrame(loop);
        if (ts - last < 48) return; 
        last = ts; t = ts * .001;
        
        const style = document.body.dataset.style || 'balanced';
        const intensity = { calm: .55, balanced: .82, vivid: 1.0, cinematic: 1.08 }[style] || .82;
        const top = style === 'cinematic' ? '#02110c' : style === 'vivid' ? '#03170f' : '#02120d';
        const mid = style === 'cinematic' ? '#073a2b' : style === 'vivid' ? '#063c2b' : '#062c20';
        
        x.clearRect(0, 0, w, h);
        const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, top); bg.addColorStop(.5, mid); bg.addColorStop(1, '#020f0b'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
        const parx = (mx - .5) * 12, pary = (my - .5) * 6;
        
        const glowLite = (cx, cy, r, inner, outer) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, inner); g.addColorStop(.45, outer); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); };
        glowLite(w * .22 + parx * .3, h * .34 + pary * .25, w * .28, 'rgba(50,210,157,.10)', 'rgba(25,122,90,.035)');
        glowLite(w * .74 + parx * .2, h * .18 + pary * .14, w * .30, 'rgba(246,222,140,.085)', 'rgba(70,207,158,.03)');
        
        x.save(); x.lineWidth = 1; x.globalAlpha = .38 * intensity;
        for (let r = 0; r < 3; r++) {
            const base = h * (.15 + r * .20); x.beginPath();
            for (let i = 0; i <= w; i += 24) { const yy = base + Math.sin(i / (250 + r * 70) + t * (.055 + r * .012) + r) * 14; if (i === 0) x.moveTo(i, yy); else x.lineTo(i, yy); }
            x.strokeStyle = r === 1 ? 'rgba(244,220,134,.09)' : 'rgba(75,220,167,.10)'; x.stroke();
        }
        x.restore();
        
        const starLimit = { calm: 46, balanced: 60, vivid: 76, cinematic: 88 }[style] || 60;
        for (let i = 0; i < Math.min(starLimit, stars.length); i++) {
            const st = stars[i], tw = .68 + .32 * Math.sin(t * (.42 + st.depth * .45) + st.p), a = Math.min(.68, st.a * tw * (style === 'calm' ? .72 : 1)), sx = st.x * w + parx * (.08 + st.depth * .18), sy = st.y * h + pary * (.06 + st.depth * .12), rr = st.r * (.85 + tw * .18);
            x.fillStyle = `rgba(218,231,222,${a})`; x.beginPath(); x.arc(sx, sy, rr, 0, Math.PI * 2); x.fill();
        }
        for (const m of motes) {
            const xx = (m.x + Math.sin(t * .035 * m.v + m.p) * .008) * w + parx * .10, yy = (m.y + Math.sin(t * .06 * m.v + m.p) * .012) * h + pary * .06;
            x.fillStyle = 'rgba(64,216,166,.045)'; x.beginPath(); x.arc(xx, yy, m.r, 0, Math.PI * 2); x.fill();
        }
        const horizon = x.createLinearGradient(0, h * .70, 0, h); horizon.addColorStop(0, 'rgba(5,48,36,.08)'); horizon.addColorStop(.55, 'rgba(2,27,19,.24)'); horizon.addColorStop(1, 'rgba(1,12,8,.78)'); x.fillStyle = horizon; x.fillRect(0, h * .66, w, h * .34);
    }
    raf = requestAnimationFrame(loop);
})();
