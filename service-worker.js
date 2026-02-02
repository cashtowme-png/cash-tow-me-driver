const CACHE_NAME = "ctmd-v1";

// These must match your GitHub repository folder name exactly
const FILES_TO_CACHE = [
  "/cash-tow-me-driver/",
  "/cash-tow-me-driver/index.html",
  "/cash-tow-me-driver/manifest.json",
  "/cash-tow-me-driver/icons/icon-192.png",
  "/cash-tow-me-driver/icons/icon-512.png"
];

// 1. Install Phase: Saves the files to the iPhone's memory
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app assets");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. Activate Phase: Cleans up old versions of your app
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

// 3. Fetch Phase: Allows the app to work offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached file, or try to get it from the internet
      return response || fetch(event.request);
    })
  );
});
