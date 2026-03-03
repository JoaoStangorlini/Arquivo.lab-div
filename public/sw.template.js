const BUILD_ID = 'self.__BUILD_ID__';
/**
 * Hub de Comunicação Científica - V3.0 Release Candidate
 * Estratégia de Cache Híbrida: Performance vs. Frescor de Dados
 */

const CACHE_NAME = `labdiv-hub-${BUILD_ID}`;

const ASSET_EXTENSIONS = ['.js', '.css', '.woff', '.woff2', '.ttf', '.otf'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

const BYPASS_ROUTES = [
    '/admin',
    '/api/admin',
    '/auth',
    '/login'
];

const OFFLINE_URL = '/offline';

try {
    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll([OFFLINE_URL, '/labdiv-logo.png']);
            })
        );
        self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
        event.waitUntil(
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
                );
            })
        );
        self.clients.claim();
    });

    self.addEventListener('fetch', (event) => {
        const { request } = event;
        const url = new URL(request.url);

        // 1. NETWORK-ONLY: Admin & API (With Offline Fallback for resilience)
        if (BYPASS_ROUTES.some(route => url.pathname.startsWith(route))) {
            if (request.mode === 'navigate') {
                event.respondWith(
                    fetch(request).catch(() => caches.match(OFFLINE_URL))
                );
            }
            return;
        }

        // 2. CACHE-FIRST: Assets (JS/CSS/Fonts)
        const isAsset = ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
        if (isAsset && request.method === 'GET') {
            event.respondWith(
                caches.match(request).then((cachedResponse) => {
                    const networkFetch = fetch(request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            const cacheCopy = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(request, cacheCopy));
                        }
                        return networkResponse;
                    });
                    return cachedResponse || networkFetch;
                })
            );
            return;
        }

        // 3. STALE-WHILE-REVALIDATE: Images & General GETs
        if (request.method === 'GET') {
            event.respondWith(
                caches.open(CACHE_NAME).then(async (cache) => {
                    const cachedResponse = await cache.match(request);

                    const networkFetch = fetch(request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch((err) => {
                        if (!cachedResponse && request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        throw err;
                    });

                    return cachedResponse || networkFetch;
                }).catch(() => fetch(request))
            );
        }
    });

} catch (error) {
    console.error('🔴 [V3.0 RC SW] ERRO CRÍTICO NA INICIALIZAÇÃO:', error);
}
