import { useEffect } from 'react';
import api from '../api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export default function usePushNotification() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker.register('/sw.js').then(async reg => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY),
      });

      await api.post('/push/subscribe', { subscription: sub });
    });
  }, []);
}
