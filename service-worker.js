const CACHE_NAME = "ctmd-v1";
const FILES_TO_CACHE = [
  "/index.html",
  "/manifest.json",
  "/service-worker.js"
];

// Install phase
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate phase
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch phase
self.addEventListener("fetch", (evt) => {
  evt.respondWith(caches.match(evt.request).then((resp) => resp || fetch(evt.request)));
});
