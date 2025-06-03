// src/service-worker.js
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 3,
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return `${request.url}?timestamp=${Date.now()}`;
      },
    }],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response.status === 200 ? response : null;
      },
    }],
  })
);
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Enhanced Push notification
self.addEventListener('push', function(event) {
  let notificationData = {
    title: 'Story App',
    body: 'Anda memiliki notifikasi baru!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'story-notification',
    requireInteraction: true,
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: '👀 Lihat',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '❌ Tutup'
      }
    ]
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
    
      if (pushData.title) {
        notificationData.title = pushData.title;
      }
      
      if (pushData.options) {
        if (pushData.options.body) {
          notificationData.body = pushData.options.body;
        }
        if (pushData.options.icon) {
          notificationData.icon = pushData.options.icon;
        }
        if (pushData.options.data) {
          notificationData.data = pushData.options.data;
        }
      }
      
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
}