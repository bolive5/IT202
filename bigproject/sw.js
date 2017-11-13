self.addEventListener('install', function(e) {
e.waitUntil(
caches.open('bigproject').then(function(cache) {
return cache.addAll([
'./index.html',
'./scripts/main.min.js'
]);
})
);
});

self.addEventListener('fetch', function(event) {
    console.log("event.request.url");
    console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
    })
    );
});