/* Red de Autos · service worker: notificaciones del navegador para compradores */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'Red de Autos', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Red de Autos', {
    body: d.body || 'Tenés novedades en tu pedido.',
    icon: 'icono-192.png',
    badge: 'icono-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || './pedido.html' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || './pedido.html', self.registration.scope).href;
  e.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const t of tabs) {
      if (t.url.split('#')[0] === url.split('#')[0]) { await t.focus(); return t.navigate(url); }
    }
    return self.clients.openWindow(url);
  })());
});
