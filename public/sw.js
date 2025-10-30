const CACHE_NAME = 'qms-app-v2';
const STATIC_CACHE_NAME = 'qms-static-v2';
const API_CACHE_NAME = 'qms-api-v2';
const IMAGE_CACHE_NAME = 'qms-images-v2';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/quilts',
  '/usage',
  '/seasonal',
  '/import',
  '/export',
];

// API endpoints to cache
const API_ENDPOINTS = ['/api/trpc/dashboard.getStats', '/api/trpc/quilts.list'];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_FILES);
      }),
      caches.open(API_CACHE_NAME),
      caches.open(IMAGE_CACHE_NAME),
    ])
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME &&
            cacheName !== IMAGE_CACHE_NAME &&
            cacheName !== CACHE_NAME
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/trpc/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
  ) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle static files
  if (STATIC_FILES.some(file => url.pathname === file || url.pathname.startsWith(file))) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(handleNetworkFirst(request));
});

// Network-first strategy for API requests with cache fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);

    // Fallback to cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Add offline indicator to cached responses
      const response = cachedResponse.clone();
      response.headers.set('X-Served-By', 'ServiceWorker-Cache');
      return response;
    }

    // Return offline page or error response
    return new Response(
      JSON.stringify({
        error: 'Offline - No cached data available',
        offline: true,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'X-Served-By': 'ServiceWorker-Offline',
        },
      }
    );
  }
}

// Cache-first strategy for images with size limits
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Only cache images smaller than 5MB
      const contentLength = networkResponse.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength, 10) : 0;

      if (size < 5 * 1024 * 1024) {
        // 5MB limit
        cache.put(request, networkResponse.clone());
      }
    }

    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch image:', request.url);

    // Return a placeholder image for failed image requests
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" font-family="system-ui" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">Image unavailable</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}

// Cache-first strategy for static files
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch static resource:', request.url);

    // Return a basic offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QMS - Offline</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                text-align: center; 
                padding: 2rem;
                background: #f5f5f5;
              }
              .offline-container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .offline-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="offline-container">
              <div class="offline-icon">📱</div>
              <h1>You're Offline</h1>
              <p>QMS is not available right now. Please check your internet connection and try again.</p>
              <button onclick="window.location.reload()">Try Again</button>
            </div>
          </body>
        </html>
      `,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    throw error;
  }
}

// Network-first strategy for other requests
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'dashboard-sync') {
    event.waitUntil(syncDashboardData());
  }
});

// Sync dashboard data when back online
async function syncDashboardData() {
  try {
    // Fetch fresh dashboard data
    const response = await fetch('/api/trpc/dashboard.getStats');

    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put('/api/trpc/dashboard.getStats', response.clone());

      // Notify clients about the update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DASHBOARD_SYNCED',
          timestamp: new Date().toISOString(),
        });
      });
    }
  } catch (error) {
    console.error('Failed to sync dashboard data:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_DASHBOARD':
      // Cache dashboard data proactively
      caches.open(API_CACHE_NAME).then(cache => {
        cache.put('/api/trpc/dashboard.getStats', new Response(JSON.stringify(data)));
      });
      break;

    case 'CLEAR_CACHE':
      // Clear all caches
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      });
      break;
  }
});

console.log('QMS Service Worker loaded');
