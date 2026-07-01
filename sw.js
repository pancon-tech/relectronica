// ─── VERSIÓN DEL CACHÉ ───────────────────────────────────────────────────────
// Cada vez que subas archivos nuevos a GitHub, cambia el número de versión
// (ej: v2 → v3 → v4). Eso fuerza al navegador a descargar todo de nuevo.
const CACHE_NAME = 'relectronica-v2';

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
  './logo.png',
  './manifest.json',
  './sw.js'
];

// Instalación: guarda todos los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando archivos de Relectrónica', CACHE_NAME);
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: elimina cachés viejas automáticamente
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Eliminando caché viejo:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch: red primero, caché como respaldo
// Así siempre sirve la versión más nueva si hay conexión
self.addEventListener('fetch', e => {
  // Solo interceptar peticiones del mismo origen
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Si la red respondió bien, actualizar el caché y devolver
        if (response && response.status === 200) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
        }
        return response;
      })
      .catch(() => {
        // Sin red: servir desde caché
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Fallback a index.html para navegación
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
