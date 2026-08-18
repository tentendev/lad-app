const CACHE_NAME = "deep-space-ledger-__BUILD_ID__";
const APP_SHELL = [
  "/schedule",
  "/wallet",
  "/calculator",
  "/tracker",
  "/about",
  "/account",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/lad-bg.webp",
  "/mobile-bg.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      let buildAssets = [];
      try {
        const response = await fetch("/precache-manifest.json", { cache: "no-store" });
        const manifest = await response.json();
        if (Array.isArray(manifest.assets)) buildAssets = manifest.assets;
      } catch {
        // The app shell still remains available if a host omits the optional manifest.
      }
      await Promise.allSettled([...new Set([...APP_SHELL, ...buildAssets])].map((url) => cache.add(url)));
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith("deep-space-ledger-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (
          (await caches.match(request))
          || (await caches.match("/schedule"))
          || Response.error()
        )),
    );
    return;
  }

  if (!["style", "script", "image", "font"].includes(request.destination)) return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
