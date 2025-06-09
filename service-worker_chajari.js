const CACHE_NAME = 'chajari-reportes-cache-v1'; // Empieza con v1 para Chajarí

// ¡¡¡REVISA Y COMPLETA ESTA LISTA CON TODOS TUS ASSETS DE CHAJARÍ!!!
const urlsToCache = [
  './',                          // Raíz (sirve index.html)
  './index.html',                // Archivo HTML principal de Chajarí
  './manifest_chajari.json',     // Tu manifiesto
  // Archivos locales (si los tienes, si no, elimínalos o coméntalos)
  // './css/style_chajari.css',    // Ejemplo si tuvieras un CSS externo para Chajarí
  // './js/script_chajari.js',     // Ejemplo si tuvieras un JS externo para Chajarí
  
  // Iconos PWA (rutas relativas a la raíz)
  './icons/icon_chajari_192.png',
  './icons/icon_chajari_512.png',
  
  // Otras imágenes locales importantes (ej. el escudo del header)
  './img/escudo_chajari.png',     // Asegúrate que esta ruta sea correcta
  
  // CDNs y Librerías Externas que usa tu chajari.html
  'https://cdn.tailwindcss.com', // Quitar si da problemas CORS y prefieres que lo cachee el navegador
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',

  // Firebase SDKs (TODOS los que importas en tu <script type="module">)
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js',
  // Añade firebase-storage.js si Chajarí va a usar subida de imágenes
  // 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js', 
  // Añade firebase-auth.js si vas a implementar autenticación
  // 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js' 
];

self.addEventListener('install', event => {
  console.log('[SW Chajarí] Instalando v1...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW Chajarí] Cacheando app shell y assets estáticos (v1)');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('[SW Chajarí] Fallo en cache.addAll() durante la instalación (v1):', error);
            console.error('[SW Chajarí] URLs que se intentaron cachear:', urlsToCache);
          });
      })
      .catch(error => {
        console.error('[SW Chajarí] Fallo al abrir el caché (v1):', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW Chajarí] Activándose v1...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('chajari-reportes-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[SW Chajarí] Eliminando caché viejo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebasestorage.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          // Opcional: Cachear dinámicamente nuevas peticiones GET exitosas
          // if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension://')) {
          //   const responseToCache = networkResponse.clone();
          //   caches.open(CACHE_NAME).then(cache => {
          //     cache.put(event.request, responseToCache);
          //   });
          // }
          return networkResponse;
        });
      })
      .catch(error => {
        console.error('[SW Chajarí] Error en fetch:', error, event.request.url);
        // Podrías devolver una página offline.html genérica aquí
      })
  );
});