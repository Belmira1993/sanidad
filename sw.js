/* Belmira · avisos de la app (notificaciones). No guarda páginas en caché. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Belmira", {
    body: d.body || "Tienes un pendiente nuevo.",
    icon: "icono-192.png",
    badge: "icono-192.png",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const L = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of L) {
      if (c.url.startsWith(self.registration.scope) && "focus" in c) {
        try { await c.navigate(url); } catch (_) { c.postMessage({ belmira: "abrir", url }); }
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
