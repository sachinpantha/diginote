self.addEventListener('push', e => {
  const { title, body } = e.data.json();
  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
