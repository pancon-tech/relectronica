const CACHE_NAME = 'relectronica-v3';

// Archivos a guardar en caché para uso offline
const ARCHIVOS_CACHE = [
  './index.html',
  './arbol.html',
  './biblioteca.html',
  './calculadoras.html',
  './componentes.html',
  './escaner.html',
  './fallas.html',
  './notas.html',
  './osciloscopo.html',
  './recepcion.html',
  './simbologiacodigopcb.html',
  './hardware.html',
  './predictor.html',
  './inventario.html',
  './codigoserror.html',
  './multitester.html',
  './simulador.html',
  './logo.png',
  './manifest.json'
];

// Instalación: guarda todos los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando archivos de Relectrónica');
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: sirve desde caché si está disponible, si no desde red
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).catch(() => {
        // Si no hay red y no está en caché, muestra index como fallback
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
