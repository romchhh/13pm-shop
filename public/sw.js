// Mobile-optimized service worker for 13pm tactic
const CACHE_NAME = '13pm-tactic-mobile-v1';
const STATIC_CACHE = '13pm-tactic-static-v1';
const DYNAMIC_CACHE = '13pm-tactic-dynamic-v1';
const IMAGE_CACHE = '13pm-tactic-images-v1';
const API_CACHE = '13pm-tactic-api-v1';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/catalog',
  '/images/tg_image_3614117882.png',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE &&
              cacheName !== API_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with cache-first strategy for mobile speed
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Return cached immediately if available
          if (cachedResponse) {
            // Update in background (stale-while-revalidate)
            fetch(request).then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
            }).catch(() => {});
            
            return cachedResponse;
          }
          
          // No cache - fetch from network
          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Network failed - return error
            return new Response(JSON.stringify({ error: 'Network unavailable' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // Handle images and videos with mobile-optimized cache-first strategy
  if (url.pathname.startsWith('/images/') || 
      url.pathname.startsWith('/api/images/') ||
      request.destination === 'image' ||
      request.destination === 'video') {
    
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then((response) => {
            if (response.status === 200) {
              // Only cache smaller images on mobile to save storage
              const isMobile = request.headers.get('user-agent')?.includes('Mobile');
              const contentLength = response.headers.get('content-length');
              const fileSize = contentLength ? parseInt(contentLength) : 0;
              
              // Cache all images on desktop, only <2MB on mobile
              if (!isMobile || fileSize < 2 * 1024 * 1024) {
                cache.put(request, response.clone());
              }
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Handle static assets and pages with stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const cache = url.pathname.startsWith('/_next/') ? 
            caches.open(STATIC_CACHE) : 
            caches.open(DYNAMIC_CACHE);
          
          cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
      });

      // Return cached version immediately, update in background
      return cachedResponse || fetchPromise;
    })
  );
});