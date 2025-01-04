const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const ASSETS_CACHE = 'assets-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './maskable_icon_x192.png',
  './maskable_icon_x512.png',
];

const THIRD_PARTY_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
];

// 캐시 크기 제한
const CACHE_SIZE_LIMIT = 50;

// 캐시 만료 시간 (24시간)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // 정적 에셋 캐싱
      caches.open(STATIC_CACHE).then(cache => 
        cache.addAll(STATIC_ASSETS)
      ),
      // 서드파티 에셋 캐싱
      caches.open(ASSETS_CACHE).then(cache => 
        cache.addAll(THIRD_PARTY_ASSETS)
      )
    ])
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, ASSETS_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // API 요청은 네트워크 우선
  if (request.url.includes('/api/') || request.url.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // 정적 에셋은 캐시 우선
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // 동적 컨텐츠는 네트워크 우선, 실패시 캐시
  event.respondWith(
    fetch(request)
      .then(response => {
        const clonedResponse = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(cache => {
            cache.put(request, clonedResponse);
            // 캐시 크기 제한 관리
            limitCacheSize(DYNAMIC_CACHE, CACHE_SIZE_LIMIT);
          });
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// 캐시 크기 제한 함수
async function limitCacheSize(cacheName, size) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > size) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, size);
  }
}

// 오래된 캐시 정리
async function cleanExpiredCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const cacheTime = new Date(dateHeader).getTime();
          if (now - cacheTime > CACHE_EXPIRATION) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}

// 주기적으로 캐시 정리 (12시간마다)
setInterval(cleanExpiredCache, CACHE_EXPIRATION / 2);

// 푸시 알림 수신
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: './maskable_icon_x192.png',
    badge: './maskable_icon_x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '앱 열기',
        icon: './maskable_icon_x72.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: './maskable_icon_x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Life Progress', options)
  );
}); 