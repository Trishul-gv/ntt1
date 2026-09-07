/* Simple offline-first service worker for Nithesh Tours And Travels */
const CACHE = "ntt-v1";
const CORE = [
  "/index.html","/offline.html","/css/style.css","/css/animations.css","/css/responsive.css",
  "/js/main.js","/js/animations.js","/js/scroll.js","/js/gallery.js","/js/components.js",
  "/components/header.html","/components/footer.html","/components/floating-buttons.html",
  "/images/live/nithesh-logo.png","/images/live/homeimg2.jpg",
  "/images/live/mullayanagiri.webp","/images/live/hebbe-falls.jpg",
  "/images/live/kemmangundi.jpg","/images/live/hirekolale-lake.jpg",
  "/images/live/bhadra-tiger-safari.webp","/images/live/kudremukh.jpg",
  "/images/live/chennakeshava-temple-belur.jpg","/images/live/sringeri-sharada-temple.jpg",
  "/manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/offline.html"))));
    return;
  }
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      if (res.ok && new URL(req.url).origin === location.origin) caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
