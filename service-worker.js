self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('qr-form-cache').then(cache => {
            return cache.addAll([
                '/form-obra/',
                '/form-obra/index.html',
                '/form-obra/script.js',
                '/form-obra/manifest.json',
                '/form-obra/icon.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});
