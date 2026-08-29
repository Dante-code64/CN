// Crydan — Service Worker de notificações push.
// Fica "dormindo" em segundo plano no navegador; quando o servidor
// manda um push, ele acorda só pra mostrar a notificação, mesmo com
// o site fechado.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Crydan', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Crydan';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { link: data.link || '/', notification_id: data.notification_id || null },
    tag: data.notification_id || undefined, // evita empilhar a mesma notificação duas vezes
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao clicar na notificação, foca a aba do Crydan já aberta (se tiver)
// ou abre uma nova.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
