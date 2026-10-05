const CACHE_NAME = 'istighfar-cache-v4.2.0.49';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './tailwind.css',
  './styles.css',
  './script.js',
  './js/constants.js',
  './js/storage.js',
  './js/data/milestones.js',
  './js/data/names.js',
  './js/core/app-state.js',
  './js/core/persist.js',
  './js/core/dom.js',
  './js/core/dates.js',
  './js/core/audio.js',
  './js/core/guarded-tap.js',
  './js/core/counter.js',
  './js/ui/modals.js',
  './js/ui/focus-nav.js',
  './js/ui/settings.js',
  './js/features/badges.js',
  './js/features/analytics.js',
  './js/features/prayer-view.js',
  './js/features/name-of-day.js',
  './js/features/data-management.js',
  './js/services/haptics.js',
  './js/services/prayer.js',
  './vendor/adhan/Adhan.js',
  './vendor/adhan/Astronomical.js',
  './vendor/adhan/CalculationMethod.js',
  './vendor/adhan/CalculationParameters.js',
  './vendor/adhan/Coordinates.js',
  './vendor/adhan/DateUtils.js',
  './vendor/adhan/HighLatitudeRule.js',
  './vendor/adhan/Madhab.js',
  './vendor/adhan/MathUtils.js',
  './vendor/adhan/PolarCircleResolution.js',
  './vendor/adhan/Prayer.js',
  './vendor/adhan/PrayerTimes.js',
  './vendor/adhan/Qibla.js',
  './vendor/adhan/Rounding.js',
  './vendor/adhan/Shafaq.js',
  './vendor/adhan/SolarCoordinates.js',
  './vendor/adhan/SolarTime.js',
  './vendor/adhan/SunnahTimes.js',
  './vendor/adhan/TimeComponents.js',
  './vendor/adhan/TypeUtils.js',
  './lib/chart.umd.js',
  './assets/icon.png',
  './assets/fonts/Inter-Light.ttf',
  './assets/fonts/Inter-Regular.ttf',
  './assets/fonts/Inter-Medium.ttf',
  './assets/fonts/Inter-SemiBold.ttf',
  './assets/fonts/Inter-Bold.ttf',
  './assets/fonts/Inter-ExtraBold.ttf',
  './assets/fonts/NotoNaskhArabic-Variable.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // `cache: 'reload'` bypasses the HTTP cache so an install never
      // re-caches a stale copy of a file we just changed.
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) =>
            console.log('Cache failed for', url, err)
          )
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Markup and app code must never be served stale: a cached index.html paired
// with a cached script.js from an older build is what breaks new features.
function isAppCode(url) {
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('manifest.json')
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Network-first for HTML/JS/CSS, falling back to the cache when offline.
  if (request.mode === 'navigate' || isAppCode(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Fonts, images and vendored libraries: cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});
