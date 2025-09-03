
const CACHE_NAME = 'pendor-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Ne pas cacher les requêtes API Supabase pour permettre les mises à jour en temps réel
  if (event.request.url.includes('supabase.co') || 
      event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Pour les autres ressources, utiliser la stratégie Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réseau réussit, mettre en cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, utiliser le cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Gestionnaire pour les messages du client (PWA notifications)
self.addEventListener('message', (event) => {
  console.log('Service worker message received:', event.data);
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, data } = event.data.payload;
    
    const options = {
      body: body || 'Nouvelle notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      image: data?.image || null,
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      silent: false,
      persistent: true,
      sticky: true,
      tag: 'pendor-notification-' + Date.now(),
      renotify: true,
      timestamp: Date.now(),
      dir: 'auto',
      lang: 'fr',
      data: {
        url: data?.url || '/',
        timestamp: Date.now(),
        notificationId: Date.now(),
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/icon-192.png'
        },
        {
          action: 'settings',
          title: 'Paramètres',
          icon: '/icon-192.png'
        },
        {
          action: 'dismiss', 
          title: 'Ignorer'
        }
      ]
    };
    
    self.registration.showNotification(title || 'Pendor', options);
  }
});

// Gestionnaire pour les notifications push
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      image: data.image || null,
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      silent: false,
      persistent: true,
      sticky: true,
      tag: 'pendor-notification-' + Date.now(),
      renotify: true,
      timestamp: Date.now(),
      data: {
        url: data.url || '/',
        notificationId: Date.now(),
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/icon-192.png'
        },
        {
          action: 'settings',
          title: 'Paramètres',
          icon: '/icon-192.png'
        },
        {
          action: 'dismiss',
          title: 'Ignorer'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Pendor', options)
    );
  }
});

// Gestionnaire pour les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  } else if (event.action === 'settings') {
    event.waitUntil(
      self.clients.openWindow('/settings')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click behavior (no action button clicked)
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});
