// src/service-worker.js
const CACHE_NAME = 'my-kiosk-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/index.js', // Vite가 생성하는 JS 번들 파일 경로
    '/assets/index.css', // Vite가 생성하는 CSS 번들 파일 경로
];

// 앱 설치 시, 주요 파일들을 캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('캐시가 열렸습니다.');
                return cache.addAll(urlsToCache);
            })
    );
});

// 네트워크 요청 시, 캐시에서 먼저 찾기
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 요청한 리소스가 있으면 캐시된 응답 반환
                if (response) {
                    return response;
                }
                // 없으면 네트워크 요청
                return fetch(event.request);
            })
    );
});