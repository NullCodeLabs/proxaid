const SHELL_CACHE = "proxaid-shell-v4";
const DATA_CACHE = "proxaid-data-v4";
const DB_NAME = "proxaid-offline-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./404.html",
  "./data/catalog.json",
  "./data/core.json",
  "./data/packs/hu-west.json",
  "./data/packs/hu-west-osm.json",
  "./data/regions.json",
  "./data/taxonomy.json",
  "./data/world-110m.geojson"
];

const scoped = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES.map(scoped))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, DATA_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, SHELL_CACHE, scoped("./index.html")));
    return;
  }
  if (url.pathname.includes("/data/")) {
    event.respondWith(networkFirst(event.request, DATA_CACHE));
    return;
  }
  event.respondWith(cacheFirst(event.request, SHELL_CACHE));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SYNC_NOW") event.waitUntil(refreshDataCache());
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "proxaid-daily-sync") event.waitUntil(refreshDataCache());
});

self.addEventListener("sync", (event) => {
  if (event.tag === "proxaid-reconnect-sync") event.waitUntil(refreshDataCache());
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function networkFirst(request, cacheName, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) || (fallbackUrl ? await caches.match(fallbackUrl) : null) || new Response("Offline", { status: 503 });
  }
}

async function refreshDataCache() {
  const cache = await caches.open(DATA_CACHE);
  const installedPackIds = await readInstalledPackIds();
  const catalogRequest = new Request(scoped("./data/catalog.json"), { cache: "no-store" });
  const catalogResponse = await fetch(catalogRequest);
  if (!catalogResponse.ok) throw new Error("Catalog refresh failed");
  await cache.put(scoped("./data/catalog.json"), catalogResponse.clone());
  const catalog = await catalogResponse.json();
  for (const pack of catalog.packs ?? []) {
    if (!(pack.required || pack.defaultInstall || installedPackIds.has(pack.id)) || Number(pack.estimatedBytes ?? 0) > 5 * 1024 * 1024) continue;
    const request = new Request(new URL(pack.url, self.registration.scope), { cache: "no-store" });
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response);
  }
}

async function readInstalledPackIds() {
  if (!("indexedDB" in self)) return new Set();
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME);
    request.onupgradeneeded = () => request.transaction?.abort();
    request.onerror = () => resolve(new Set());
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) {
        db.close();
        resolve(new Set());
        return;
      }
      const getRequest = db.transaction("meta", "readonly").objectStore("meta").get("installedPackIds");
      getRequest.onsuccess = () => {
        db.close();
        resolve(new Set(Array.isArray(getRequest.result?.value) ? getRequest.result.value : []));
      };
      getRequest.onerror = () => {
        db.close();
        resolve(new Set());
      };
    };
  });
}
