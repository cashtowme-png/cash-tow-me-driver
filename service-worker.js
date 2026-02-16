const CACHE_NAME = "ctmd-v1";

const FILES_TO_CACHE = [
  "/driver.html",
  "/manifest.json"
];

// 1. Install Phase: Cache app files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app files");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. Activate Phase: Remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 3. Fetch Phase: Serve cached files when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
