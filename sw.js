/**
 * Mercysweet Foods — sw.js v8
 * SAFE update lifecycle: installs silently, waits for user refresh.
 * No forced skipWaiting — notifies client instead.
 */

var CACHE_STATIC = 'ms-static-v8';
var CACHE_IMG    = 'ms-img-v8';

var PRECACHE = [
  '/',
  '/index.html',
  '/css/styles.v8.css',
  '/js/app.v8.js',
  '/assets/images/tomato-paste-food.avif',
  '/assets/images/tomato-paste-food.webp',
  '/assets/images/tomato-paste-food-480w.avif',
  '/assets/images/tomato-paste-food-480w.webp',
  '/assets/images/tomato-paste-food-768w.avif',
  '/assets/images/tomato-paste-food-768w.webp',
  '/assets/images/honey-bottles.avif',
  '/assets/images/honey-bottles.webp',
  '/assets/images/tomato-paste-jars.avif',
  '/assets/images/tomato-paste-jars.webp',
  '/assets/images/honey-ginger.avif',
  '/assets/images/honey-ginger.webp'
];

/* ── Install: pre-cache, then WAIT (do not skip waiting) ──────── */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(function (cache) {
        return cache.addAll(PRECACHE);
      })
    /* No self.skipWaiting() — new SW waits for old to release */
  );
});

/* ── Activate: clean old caches, claim clients ────────────────── */
self.addEventListener('activate', function (e) {
  var keep = [CACHE_STATIC, CACHE_IMG];
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) { return keep.indexOf(k) === -1; })
            .map(function (k)   { return caches.delete(k); })
        );
      })
      .then(function () {
        /* Claim after cleanup so new SW serves all open tabs */
        return self.clients.claim();
      })
  );
});

/* ── Message handler: client can trigger skip ─────────────────── */
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── Fetch ────────────────────────────────────────────────────── */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url;
  try { url = new URL(req.url); } catch (_) { return; }

  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  var path = url.pathname;

  /* Images: cache-first */
  if (/\.(avif|webp|jpe?g|png|gif|svg|ico)(\?.*)?$/i.test(path)) {
    e.respondWith(
      caches.open(CACHE_IMG).then(function (cache) {
        return cache.match(req).then(function (hit) {
          if (hit) return hit;
          return fetch(req).then(function (res) {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(function () {
            return caches.match('/assets/images/tomato-paste-food.jpg');
          });
        });
      })
    );
    return;
  }

  /* CSS / JS: cache-first (versioned filenames guarantee freshness) */
  if (/\.(css|js)(\?.*)?$/.test(path)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            caches.open(CACHE_STATIC)
              .then(function (c) { c.put(req, res.clone()); });
          }
          return res;
        });
      })
    );
    return;
  }

  /* HTML / navigation: network-first, fallback to cache */
  if (req.mode === 'navigate' ||
      (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          if (res && res.ok) {
            caches.open(CACHE_STATIC)
              .then(function (c) { c.put(req, res.clone()); });
          }
          return res;
        })
        .catch(function () {
          return caches.match(req)
            .then(function (hit) { return hit || caches.match('/index.html'); });
        })
    );
    return;
  }
});
