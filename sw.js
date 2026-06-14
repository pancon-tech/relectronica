// ==================== SERVICE WORKER PARA PWA ====================
// Nombre de la caché (actualizar para forzar nueva versión)
const CACHE_NAME = 'relectronica-v1.0.0';

// Archivos a cachear para funcionar offline
const urlsToCache = [
  './',
  './biblioteca.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('⚡ Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Network First (intenta red, luego caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, la clona y guarda en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intenta obtener de caché
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no está en caché y es una página HTML, muestra página offline personalizada
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./offline.html');
            }
            return new Response('Contenido no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Manejo de notificaciones push (opcional)
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: 'icon-192.png',
    badge: 'icon-96.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification('Relectrónica', options)
  );
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('./biblioteca.html')
    );
  }
});
