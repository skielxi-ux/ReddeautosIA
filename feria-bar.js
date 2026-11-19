/* Red de Autos · Barra de Feria Online (se muestra sola si hay una feria en curso o que empieza en menos de 7 días) */
(() => {
  const URL_SB = 'https://ytuecptdgtmrbiddyzht.supabase.co';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dWVjcHRkZ3RtcmJpZGR5emh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MTMxNTMsImV4cCI6MjEwOTk4OTE1M30.H-Yi5dwDW8TvZfFWvP3dquHnCeQNtHTf8MO6i5v02VA';
  const H = 40;
  const css = `
    #feriaBar{position:fixed;inset:0 0 auto 0;z-index:60;height:${H}px;display:flex;align-items:center;justify-content:center;gap:.75rem;padding:0 .9rem;
      background:#0b0b0c;color:#fff;font:500 13px/1 Inter,system-ui,sans-serif;text-decoration:none;transform:translateY(-100%);transition:transform .5s cubic-bezier(.2,.7,.2,1)}
    #feriaBar.on{transform:none}
    #feriaBar .fb-dot{width:8px;height:8px;border-radius:99px;background:#ef4444;flex:none;animation:fbdot 1.4s infinite}
    #feriaBar.prox .fb-dot{background:#d6f345;animation:none}
    @keyframes fbdot{0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}70%{box-shadow:0 0 0 7px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
    #feriaBar .fb-nom{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:34vw}
    #feriaBar .fb-t{font-family:"Space Grotesk",ui-monospace,monospace;font-weight:700;color:#d6f345;letter-spacing:.02em;white-space:nowrap}
    #feriaBar .fb-cta{flex:none;border-radius:99px;background:#d6f345;color:#0b0b0c;font-weight:700;padding:.42rem .8rem;white-space:nowrap;transition:background .2s,color .2s}
    #feriaBar:hover .fb-cta{background:#fff}
    #feriaBar .fb-lbl{color:#a1a1aa;white-space:nowrap}
    html.con-feria body{padding-top:${H}px}
    html.con-feria #hdr, html.con-feria header.sticky{top:${H}px !important}
    @media (max-width:640px){#feriaBar{font-size:12px;gap:.5rem;justify-content:space-between}#feriaBar .fb-nom{max-width:30vw}#feriaBar .fb-lbl{display:none}}
    @media (prefers-reduced-motion:reduce){#feriaBar{transition:none}#feriaBar .fb-dot{animation:none}}`;
  const enHome = !!document.getElementById('feria');
  const dos = (n) => String(Math.max(0, n)).padStart(2, '0');
  async function iniciar() {
    let f;
    try {
      const r = await fetch(`${URL_SB}/functions/v1/feria`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: 'Bearer ' + ANON }, body: JSON.stringify({ accion: 'actual' }) });
      f = (await r.json()).feria;
    } catch { return; }
    if (!f) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const a = document.createElement('a');
    a.id = 'feriaBar'; a.href = enHome ? '#feria' : './#feria';
    a.setAttribute('aria-label', `${f.nombre}: ver la feria`);
    a.innerHTML = `<span class="fb-dot"></span><span class="fb-nom"></span><span class="fb-lbl"></span><span class="fb-t">--</span><span class="fb-cta">Ver autos →</span>`;
    a.querySelector('.fb-nom').textContent = f.nombre;
    document.body.prepend(a);
    document.documentElement.classList.add('con-feria');
    requestAnimationFrame(() => a.classList.add('on'));
    if (enHome) a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById('feria'), hdr = document.getElementById('hdr');
      const off = (hdr ? hdr.getBoundingClientRect().bottom : H) + 8;
      const y = el.getBoundingClientRect().top + window.scrollY - off + 40;
      const L = typeof lenis !== 'undefined' ? lenis : null; // eslint-disable-line no-undef
      if (L && L.scrollTo) L.scrollTo(y); else window.scrollTo({ top: y, behavior: 'smooth' });
    });
    const tick = () => {
      const enCurso = new Date(f.inicio) <= new Date();
      const ms = new Date(enCurso ? f.fin : f.inicio) - Date.now();
      if (ms <= 0) { if (!enCurso) { f.inicio = new Date(0).toISOString(); return tick(); } a.remove(); document.documentElement.classList.remove('con-feria'); clearInterval(iv); return; }
      a.classList.toggle('prox', !enCurso);
      a.querySelector('.fb-lbl').textContent = enCurso ? 'En vivo · termina en' : 'Empieza en';
      a.querySelector('.fb-cta').textContent = enCurso ? 'Ver autos →' : 'Ver feria →';
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      a.querySelector('.fb-t').textContent = `${d ? d + 'd ' : ''}${dos(h)}:${dos(m)}:${dos(s)}`;
    };
    tick();
    const iv = setInterval(tick, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
