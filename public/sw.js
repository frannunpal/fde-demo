const CACHE_NAME = 'fde-desktop-v3';

// Detect development mode: check hostname (no access to window in Service Worker)
const isDev = () => {
  return self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
};

const log = (...args) => {
  if (isDev()) {
    console.log('[SW]', ...args);
  }
};

// URLs that should NEVER be cached (always fetch fresh from network)
const NEVER_CACHE = [
  '/index.html',
  '/',
  '/api/',
  // HTML documents should never be cached - they contain runtime flags
];

function shouldNeverCache(url) {
  const pathname = url.pathname;
  // Check explicit list
  if (NEVER_CACHE.some(path => pathname === path || pathname.startsWith(path))) {
    return true;
  }
  // Never cache HTML documents
  if (pathname.endsWith('.html') || pathname === '/' || pathname === '') {
    return true;
  }
  return false;
}

self.addEventListener('install', event => {
  log('Installing service worker v3');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  log('Activating service worker v3, cleaning old caches');
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache API requests - they must always be fresh
  // This prevents caching stale filesystem data and CORS errors from Docker sessions
  if (url.pathname.startsWith('/api/')) {
    log('Skipping cache for API request:', url.pathname);
    event.respondWith(fetch(event.request));
    return;
  }

  // Never cache HTML documents (including index.html)
  // This ensures runtime flags like __FDE_IN_DOCKER__ are always fresh
  if (shouldNeverCache(url)) {
    log('Skipping cache for HTML:', url.pathname);
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached ?? fetch(event.request)));
});
