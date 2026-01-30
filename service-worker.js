const CACHE_NAME = "ctmd-v1";
const FILES = [
  "/cash-tow-me-driver/",
  "/cash-tow-me-driver/index.html",
  "/cash-tow-me-driver/manifest.json",
  "/cash-tow-me-driver/icons/icon-192.png",
  "/cash-tow-me-driver/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

