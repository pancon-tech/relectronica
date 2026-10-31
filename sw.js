const CACHE_NAME = 'relectronica-v4';

const ARCHIVOS_CACHE = [
  './index.html',
  './arbol.html',
  './biblioteca.html',
  './calculadoras.html',
  './componentes.html',
  './escaner.html',
  './fallas.html',
  './notas.html',
  './recepcion.html',
  './simbologiacodigopcb.html',
  './hardware.html',
  './predictor.html',
  './codigoserror.html',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando archivos de Relectrónica simplificada');
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});