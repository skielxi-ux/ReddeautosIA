/* Red de Autos · avisos del comprador: link de seguimiento + notificaciones del navegador */
(function () {
  const URL_SB = 'https://ytuecptdgtmrbiddyzht.supabase.co';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dWVjcHRkZ3RtcmJpZGR5emh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MTMxNTMsImV4cCI6MjEwOTk4OTE1M30.H-Yi5dwDW8TvZfFWvP3dquHnCeQNtHTf8MO6i5v02VA';
  const H = { 'Content-Type': 'application/json', apikey: ANON, Authorization: 'Bearer ' + ANON };
  const rpc = (fn, args) => fetch(`${URL_SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H, body: JSON.stringify(args) })
    .then(async (r) => { const j = await r.json().catch(() => null); if (!r.ok) throw new Error((j && j.message) || 'Error'); return j; });
  const KEY = 'rda-pedidos';
  const base = () => location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');

  const lista = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  function guardar(t, txt) {
    try {
      const l = lista().filter((x) => x.t !== t);
      l.unshift({ t, txt: String(txt || 'Mi pedido').slice(0, 80), at: Date.now() });
      localStorage.setItem(KEY, JSON.stringify(l.slice(0, 15)));
    } catch {}
  }
  const b64ToU8 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };

  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone;
  /** 'ok' | 'sin_soporte' | 'ios_instalar' | 'bloqueado' | 'denegado' */
  function soporte() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return esIOS && !instalada ? 'ios_instalar' : 'sin_soporte';
    if (Notification.permission === 'denied') return 'bloqueado';
    return 'ok';
  }

  async function activar(token) {
    const s = soporte(); if (s !== 'ok') return s;
    const reg = await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return 'denegado';
    const { clave } = await fetch(`${URL_SB}/functions/v1/push`, { method: 'POST', headers: H, body: '{}' }).then((r) => r.json());
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(clave) });
    const j = sub.toJSON();
    const ok = await rpc('push_suscribir', { p_token: token, p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
    if (!ok) throw new Error('No pudimos activar los avisos.');
    try { localStorage.setItem('rda-push-' + token, '1'); } catch {}
    return 'ok';
  }
  const activos = (token) => { try { return localStorage.getItem('rda-push-' + token) === '1' && Notification.permission === 'granted'; } catch { return false; } };

  const MSG = {
    ios_instalar: 'En iPhone: tocá Compartir → "Agregar a inicio", abrí Red de Autos desde ese ícono y activá los avisos ahí.',
    sin_soporte: 'Este navegador no permite avisos. Guardá el link de tu pedido para revisarlo.',
    bloqueado: 'Bloqueaste los avisos de esta página. Activalos desde la configuración del navegador (ícono del candado).',
    denegado: 'No activaste los avisos. Podés volver a intentarlo cuando quieras.',
  };

  /** Pide el link de seguimiento de una búsqueda y lo deja guardado en este celular. */
  async function link(busquedaId, txt) {
    const t = await rpc('seguimiento_link', { p_busqueda_id: busquedaId });
    if (!t) return null;
    guardar(t, txt);
    return { token: t, url: `${base()}pedido.html#${t}` };
  }

  window.RDAvisos = { rpc, link, activar, activos, soporte, lista, guardar, MSG, base };
})();
