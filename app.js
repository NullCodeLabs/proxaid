const DAY_MS = 24 * 60 * 60 * 1000;
const DB_NAME = "proxaid-offline-v1";
const DB_VERSION = 1;
const SHELL_CACHE_NAME = "proxaid-shell-v4";
const CATEGORY_LABELS = {
  all: "Mind",
  emergency_call: "Segélyhívó",
  ambulance: "Mentő",
  hospital_emergency: "Sürgősségi",
  hospital: "Kórház",
  urgent_care: "Ügyelet",
  clinic: "Klinika",
  doctor: "Orvos",
  pharmacy: "Gyógyszertár",
  aed: "AED",
  police: "Rendőrség",
  fire_station: "Tűzoltóság",
  shelter: "Menedék",
  homeless_shelter: "Éjjeli szállás",
  warming_center: "Melegedő",
  cooling_center: "Hűsölő",
  alpine_hut: "Hegyi hajlék",
  wilderness_hut: "Erdei hajlék",
  drinking_water: "Ivóvíz",
  toilets: "WC",
  accessible_toilets: "Akadálymentes WC",
  baby_changing: "Pelenkázó",
  shower: "Zuhany",
  public_phone: "Nyilvános telefon",
  emergency_phone: "Segélytelefon",
  trail: "Túraút",
  guidepost: "Útjelző",
  assembly_point: "Gyülekezési pont",
  mountain_rescue: "Hegyi mentés",
  water_rescue: "Vízi mentés",
  lifeguard: "Vízimentő",
  first_aid: "Elsősegélypont",
  poison_control: "Mérgezési központ",
  crisis_hotline: "Krízisvonal",
  blood_bank: "Véradóhely",
  coast_guard: "Parti őrség",
  disaster_response: "Katasztrófavédelem",
  disaster_shelter: "Katasztrófamenedék",
  helipad: "Helikopter-leszálló",
  night_shelter: "Éjjeli menedék",
  food_assistance: "Élelmiszersegély",
  washing: "Mosakodás",
  laundry: "Mosoda",
  sanitary_dump: "Szaniter ürítő",
  information_map: "Tájékoztató térkép",
  emergency_access_point: "Vészhelyzeti megközelítési pont",
  internet_access: "Internetelérés",
  embassy: "Diplomáciai képviselet",
  fuel: "Üzemanyag",
  charging: "Töltőpont",
  transport_hub: "Közlekedési csomópont",
  evacuation_route: "Evakuációs útvonal"
};

const FILTERS = ["all", "hospital_emergency", "urgent_care", "doctor", "aed", "pharmacy", "shelter", "drinking_water", "toilets", "public_phone", "police"];

const state = {
  db: null,
  memoryRecords: [],
  records: [],
  visibleRecords: [],
  category: "all",
  query: "",
  userLocation: null,
  catalog: null,
  world: null,
  syncing: false,
  installPrompt: null,
  map: { zoom: 1, panX: 0, panY: 0, dragging: false, x: 0, y: 0, startX: 0, startY: 0, hits: [] },
};

const $ = (id) => document.getElementById(id);
const els = {
  networkBadge: $("networkBadge"), themeButton: $("themeButton"), searchInput: $("searchInput"),
  clearSearch: $("clearSearch"), categoryFilters: $("categoryFilters"), locateButton: $("locateButton"),
  mapCanvas: $("mapCanvas"), mapFrame: $("mapFrame"), mapStatus: $("mapStatus"), zoomIn: $("zoomIn"),
  zoomOut: $("zoomOut"), resetMap: $("resetMap"), recordCount: $("recordCount"), lastSync: $("lastSync"),
  storageUse: $("storageUse"), readyScore: $("readyScore"), syncButton: $("syncButton"), syncMessage: $("syncMessage"),
  storagePolicy: $("storagePolicy"),
  packInput: $("packInput"), packButton: $("packButton"), installButton: $("installButton"), installDialog: $("installDialog"),
  closeInstallDialog: $("closeInstallDialog"), resultsList: $("resultsList"), resultCount: $("resultCount")
};

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatDate(value) {
  if (!value) return "még nem történt";
  try { return new Intl.DateTimeFormat("hu-HU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return String(value); }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "nem elérhető";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function haversine(a, b) {
  if (!a || !b) return null;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function safeUrl(url) {
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : null;
  } catch { return null; }
}

function safePhone(phone) {
  return String(phone ?? "").replace(/[^+\d,;*#]/g, "");
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB nem támogatott"));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("records")) {
        const records = db.createObjectStore("records", { keyPath: "id" });
        records.createIndex("packId", "_packId", { unique: false });
      }
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(store, mode, action) {
  return new Promise((resolve, reject) => {
    if (!state.db) return reject(new Error("Nincs helyi adatbázis"));
    const tx = state.db.transaction(store, mode);
    const objectStore = tx.objectStore(store);
    let result;
    try { result = action(objectStore); } catch (error) { reject(error); return; }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function getMeta(key) {
  if (!state.db) return null;
  return new Promise((resolve, reject) => {
    const request = state.db.transaction("meta", "readonly").objectStore("meta").get(key);
    request.onsuccess = () => resolve(request.result?.value ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function setMeta(key, value) {
  if (!state.db) return;
  await transaction("meta", "readwrite", (store) => store.put({ key, value }));
}

async function readAllRecords() {
  if (!state.db) return [...state.memoryRecords];
  return new Promise((resolve, reject) => {
    const request = state.db.transaction("records", "readonly").objectStore("records").getAll();
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

function validateRecord(record) {
  if (!record || typeof record !== "object" || !record.id || !record.name || !record.category) return false;
  if (record.coordinates) {
    const { lat, lon } = record.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;
  }
  return true;
}

async function storePack(pack) {
  if (!pack || pack.schemaVersion !== 1 || !pack.packId || !Array.isArray(pack.records)) throw new Error("Ismeretlen adatcsomag-formátum");
  const recordIds = new Set();
  for (const record of pack.records) {
    if (!validateRecord(record)) throw new Error("A csomag hibás rekordot tartalmaz");
    if (recordIds.has(record.id)) throw new Error(`Duplikált rekordazonosító a csomagban: ${record.id}`);
    recordIds.add(record.id);
  }
  const accepted = pack.records.filter(validateRecord).map((record) => ({
    ...record,
    _packId: pack.packId,
    _packVersion: pack.version ?? "unknown",
    _storedAt: new Date().toISOString()
  }));
  if (!state.db) {
    state.memoryRecords = [...state.memoryRecords.filter((item) => item._packId !== pack.packId), ...accepted];
    return accepted.length;
  }
  await new Promise((resolve, reject) => {
    const tx = state.db.transaction("records", "readwrite");
    const store = tx.objectStore("records");
    const cursorRequest = store.index("packId").openKeyCursor(IDBKeyRange.only(pack.packId));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        for (const record of accepted) store.put(record);
      }
    };
    cursorRequest.onerror = () => tx.abort();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error ?? new Error("Az adatcsomag nem írható a helyi adatbázisba"));
    tx.onabort = () => reject(tx.error ?? new Error("Az adatcsomag frissítése megszakadt"));
  });
  return accepted.length;
}

async function fetchJson(path, preferNetwork = true) {
  const url = new URL(path, document.baseURI);
  const response = await fetch(url, {
    cache: preferNetwork ? "no-store" : "default",
    credentials: "same-origin",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function syncData({ force = false, reason = "manual" } = {}) {
  if (state.syncing) return;
  const previousSync = await getMeta("lastSync").catch(() => null);
  if (!force && navigator.onLine && previousSync && Date.now() - new Date(previousSync).getTime() < DAY_MS) {
    els.syncMessage.textContent = "A napi adatellenőrzés már megtörtént.";
    return;
  }
  state.syncing = true;
  els.syncButton.disabled = true;
  els.syncMessage.textContent = navigator.onLine ? "Adatcsomagok ellenőrzése…" : "Offline mag betöltése…";
  try {
    const catalog = await fetchJson("./data/catalog.json", navigator.onLine);
    state.catalog = catalog;
    const installedPackIds = new Set(await getMeta("installedPackIds").catch(() => []) ?? []);
    const lastSyncLocation = await getMeta("lastSyncLocation").catch(() => null);
    const selectionLocation = state.userLocation ?? lastSyncLocation;
    let total = 0;
    const updatedPackIds = [];
    const warnings = [];
    for (const descriptor of catalog.packs) {
      const inCurrentRegion = Boolean(selectionLocation && descriptor.bbox && pointInBbox(selectionLocation, descriptor.bbox));
      const smallAutoPack = descriptor.autoInstall && Number(descriptor.estimatedBytes ?? 0) <= 5 * 1024 * 1024;
      const shouldInstall = descriptor.required || descriptor.defaultInstall || installedPackIds.has(descriptor.id) || (smallAutoPack && inCurrentRegion);
      if (!shouldInstall) continue;
      try {
        const pack = await fetchJson(descriptor.url, navigator.onLine);
        total += await storePack(pack);
        installedPackIds.add(descriptor.id);
        updatedPackIds.push(descriptor.id);
      } catch (error) {
        if (descriptor.required) throw error;
        warnings.push(descriptor.name ?? descriptor.id);
      }
    }
    const now = new Date().toISOString();
    await setMeta("lastSync", now);
    await setMeta("lastSyncReason", reason);
    await setMeta("installedPackIds", [...installedPackIds]);
    if (state.userLocation) await setMeta("lastSyncLocation", state.userLocation);
    state.records = await readAllRecords();
    els.syncMessage.textContent = warnings.length
      ? `${total} rekord frissült; ${warnings.join(", ")} most nem volt elérhető. A korábbi helyi adatok megmaradtak.`
      : `${total} rekord frissült (${updatedPackIds.length} csomag). Az adat nem minősül helyszíni validálásnak.`;
    navigator.serviceWorker?.controller?.postMessage({ type: "SYNC_NOW" });
  } catch (error) {
    els.syncMessage.textContent = state.records.length ? "A frissítés nem sikerült; a korábbi helyi adatok használhatók." : `Nem sikerült betölteni az offline magot: ${error.message}`;
    registerReconnectSync();
  } finally {
    state.syncing = false;
    els.syncButton.disabled = false;
    await updateStats();
    applyFilters();
  }
}

function pointInBbox(point, bbox) {
  return point.lon >= bbox[0] && point.lat >= bbox[1] && point.lon <= bbox[2] && point.lat <= bbox[3];
}

function setupFilters() {
  const fragment = document.createDocumentFragment();
  for (const category of FILTERS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.dataset.category = category;
    button.textContent = CATEGORY_LABELS[category] ?? category;
    button.setAttribute("aria-pressed", String(category === state.category));
    button.addEventListener("click", () => {
      state.category = category;
      for (const item of els.categoryFilters.children) item.setAttribute("aria-pressed", String(item.dataset.category === category));
      applyFilters();
    });
    fragment.appendChild(button);
  }
  els.categoryFilters.replaceChildren(fragment);
}

function searchText(record) {
  return normalize([
    record.name, record.category, CATEGORY_LABELS[record.category], record.description,
    record.locality, record.region, record.country, record.operator, ...(record.tags ?? [])
  ].join(" "));
}

function applyFilters() {
  const query = normalize(state.query);
  const records = state.records
    .filter((record) => state.category === "all" || record.category === state.category)
    .filter((record) => !query || searchText(record).includes(query))
    .map((record) => ({ ...record, _distance: record.coordinates && state.userLocation ? haversine(state.userLocation, record.coordinates) : null }))
    .sort((a, b) => {
      if (a._distance != null && b._distance != null) return a._distance - b._distance;
      if (a._distance != null) return -1;
      if (b._distance != null) return 1;
      return a.name.localeCompare(b.name, "hu");
    });
  state.visibleRecords = records;
  renderResults(records);
  drawMap();
}

function renderResults(records) {
  const fragment = document.createDocumentFragment();
  els.resultCount.textContent = `${records.length} találat`;
  if (!records.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nincs találat a telepített adatcsomagokban. Próbálj más kifejezést, frissíts vagy importálj területi csomagot.";
    fragment.appendChild(empty);
  }
  records.slice(0, 80).forEach((record, index) => fragment.appendChild(createResultCard(record, index)));
  els.resultsList.replaceChildren(fragment);
}

function createResultCard(record, index) {
  const article = document.createElement("article");
  article.className = "result-card";
  const rank = document.createElement("div");
  rank.className = "result-rank";
  rank.textContent = String(index + 1).padStart(2, "0");
  const body = document.createElement("div");
  body.className = "result-body";
  const titleRow = document.createElement("div");
  titleRow.className = "result-title-row";
  const title = document.createElement("h3");
  title.textContent = record.name;
  const tag = document.createElement("span");
  tag.className = `tag ${record.verification === "official_directory" ? "verified" : ""}`;
  tag.textContent = record.verification === "official_directory" ? "hivatalos" : "forrásjelölt";
  titleRow.append(title, tag);
  const description = document.createElement("p");
  description.textContent = record.description ?? CATEGORY_LABELS[record.category] ?? record.category;
  const meta = document.createElement("div");
  meta.className = "result-meta";
  const location = [record.locality, record.region, record.country].filter(Boolean).join(" · ");
  if (location) appendMeta(meta, `⌖ ${location}`);
  if (record._distance != null) appendMeta(meta, record._distance < 10 ? `${record._distance.toFixed(1)} km` : `${Math.round(record._distance)} km`);
  if (record.openingHours) appendMeta(meta, `◷ ${record.openingHours}`);
  const sourceDate = record.source?.retrievedAt;
  if (sourceDate) appendMeta(meta, `adat: ${sourceDate}`);
  const actions = document.createElement("div");
  actions.className = "result-actions";
  const phone = safePhone(record.phone);
  if (phone) {
    const call = document.createElement("a");
    call.className = "call";
    call.href = `tel:${phone}`;
    call.textContent = `HÍVÁS ${record.phone}`;
    actions.appendChild(call);
  }
  if (record.coordinates) {
    const focus = document.createElement("button");
    focus.type = "button";
    focus.textContent = "MUTASD";
    focus.addEventListener("click", () => {
      centerMapOn(record.coordinates, 7);
      els.mapFrame.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    actions.appendChild(focus);
  }
  const sourceUrl = safeUrl(record.source?.url ?? record.website);
  if (sourceUrl) {
    const source = document.createElement("a");
    source.href = sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "FORRÁS ↗";
    actions.appendChild(source);
  }
  body.append(titleRow, description, meta, actions);
  article.append(rank, body);
  return article;
}

function appendMeta(container, text) {
  const span = document.createElement("span");
  span.textContent = text;
  container.appendChild(span);
}

async function updateStats() {
  const lastSync = await getMeta("lastSync").catch(() => null);
  els.recordCount.textContent = String(state.records.length);
  els.lastSync.textContent = formatDate(lastSync);
  let storageText = "nem elérhető";
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate().catch(() => null);
    if (estimate) storageText = `${formatBytes(estimate.usage ?? 0)} / ${formatBytes(estimate.quota ?? 0)}`;
  }
  els.storageUse.textContent = storageText;
  let persistentText = "a böngésző kezeli";
  if (navigator.storage?.persisted) {
    const persisted = await navigator.storage.persisted().catch(() => false);
    persistentText = persisted ? "védett helyi tárhely" : "tárhelynyomásnál törölhető";
  }
  els.storagePolicy.textContent = persistentText;
  const cachedShell = "caches" in window ? await window.caches.has(SHELL_CACHE_NAME).catch(() => false) : false;
  const shellReady = Boolean(navigator.serviceWorker?.controller || cachedShell);
  els.readyScore.textContent = state.records.length && shellReady ? (lastSync ? "KÉSZ" : "HELYI") : "RÉSZ";
}

function updateNetworkStatus() {
  const online = navigator.onLine;
  els.networkBadge.textContent = online ? "ONLINE // SZINKRONKÉSZ" : "OFFLINE // HELYI MAG";
  els.networkBadge.classList.toggle("online", online);
  els.networkBadge.classList.toggle("offline", !online);
}

function setupTheme() {
  const saved = localStorage.getItem("proxaid-theme");
  const initial = saved ?? (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = initial;
  updateThemeColor(initial);
  els.themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("proxaid-theme", next);
    updateThemeColor(next);
    drawMap();
  });
}

function updateThemeColor(theme) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#eff7f3" : "#061410");
}

async function locateUser() {
  if (!("geolocation" in navigator)) {
    els.syncMessage.textContent = "Ezen az eszközön nincs böngészős helymeghatározás.";
    return;
  }
  els.locateButton.disabled = true;
  els.locateButton.textContent = "HELYZET KÉRÉSE…";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const next = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy };
    state.userLocation = next;
    centerMapOn(next, 7);
    applyFilters();
    const previous = await getMeta("lastSyncLocation").catch(() => null);
    const moved = previous ? haversine(previous, next) : Infinity;
    const movementThreshold = Number(state.catalog?.movementRefreshKm ?? 80);
    if (navigator.onLine && moved >= movementThreshold) await syncData({ force: true, reason: "location-change" });
    els.locateButton.disabled = false;
    els.locateButton.textContent = `⌖ ±${Math.round(next.accuracy)} m`;
  }, (error) => {
    els.syncMessage.textContent = error.code === 1 ? "A helymeghatározást nem engedélyezted; a keresés ettől még működik." : "A helyzet most nem állapítható meg.";
    els.locateButton.disabled = false;
    els.locateButton.textContent = "⌖ HELYZETEM";
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 });
}

function setupInstall() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    els.installButton.hidden = false;
  });
  if (ios && !standalone) els.installButton.hidden = false;
  els.installButton.addEventListener("click", async () => {
    if (state.installPrompt) {
      await state.installPrompt.prompt();
      state.installPrompt = null;
      els.installButton.hidden = true;
    } else {
      openInstallHelp();
    }
  });
  els.closeInstallDialog.addEventListener("click", () => {
    if (typeof els.installDialog.close === "function") els.installDialog.close();
    else els.installDialog.removeAttribute("open");
  });
}

function openInstallHelp() {
  if (typeof els.installDialog.showModal === "function") els.installDialog.showModal();
  else {
    els.installDialog.setAttribute("open", "");
    els.installDialog.setAttribute("role", "dialog");
    els.installDialog.setAttribute("aria-modal", "true");
    els.installDialog.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  try {
    const persisted = await navigator.storage.persisted?.();
    return persisted || await navigator.storage.persist();
  } catch {
    return false;
  }
}

async function setupServiceWorker() {
  if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
  try {
    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
    if ("periodicSync" in registration) {
      try { await registration.periodicSync.register("proxaid-daily-sync", { minInterval: DAY_MS }); } catch {}
    }
  } catch (error) {
    els.syncMessage.textContent = `Az offline alkalmazásmag nem aktiválható: ${error.message}`;
  }
}

async function registerReconnectSync() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    if ("sync" in registration) await registration.sync.register("proxaid-reconnect-sync");
  } catch {}
}

async function importPack(file) {
  if (!file || file.size > 50 * 1024 * 1024) throw new Error("A csomag legfeljebb 50 MB lehet ebben az importálóban");
  const text = await file.text();
  const pack = JSON.parse(text);
  const count = await storePack(pack);
  state.records = await readAllRecords();
  els.syncMessage.textContent = `${count} rekord importálva: ${pack.packId}.`;
  await updateStats();
  applyFilters();
}

function getMapMetrics() {
  const rect = els.mapCanvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  if (els.mapCanvas.width !== Math.round(rect.width * ratio) || els.mapCanvas.height !== Math.round(rect.height * ratio)) {
    els.mapCanvas.width = Math.round(rect.width * ratio);
    els.mapCanvas.height = Math.round(rect.height * ratio);
  }
  return { width: rect.width, height: rect.height, ratio, base: Math.min(rect.width / 360, rect.height / 180) };
}

function project(point, metrics) {
  return {
    x: metrics.width / 2 + point.lon * metrics.base * state.map.zoom + state.map.panX,
    y: metrics.height / 2 - point.lat * metrics.base * state.map.zoom + state.map.panY
  };
}

function drawMap() {
  const metrics = getMapMetrics();
  if (!metrics.width || !metrics.height) return;
  const context = els.mapCanvas.getContext("2d");
  if (!context) {
    els.mapStatus.textContent = "A vászonrajzolás nem érhető el; a keresési lista ettől még működik.";
    return;
  }
  context.setTransform(metrics.ratio, 0, 0, metrics.ratio, 0, 0);
  const light = document.documentElement.dataset.theme === "light";
  context.fillStyle = light ? "#dfeee7" : "#07130f";
  context.fillRect(0, 0, metrics.width, metrics.height);
  drawGrid(context, metrics, light);
  if (state.world?.features) drawWorld(context, metrics, light);
  state.map.hits = [];
  for (const record of state.visibleRecords) {
    if (!record.coordinates) continue;
    const point = project(record.coordinates, metrics);
    if (point.x < -20 || point.x > metrics.width + 20 || point.y < -20 || point.y > metrics.height + 20) continue;
    context.beginPath();
    context.arc(point.x, point.y, 5.5, 0, Math.PI * 2);
    context.fillStyle = "#ff4d67";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "#fff";
    context.stroke();
    state.map.hits.push({ x: point.x, y: point.y, record });
  }
  if (state.userLocation) {
    const point = project(state.userLocation, metrics);
    context.beginPath(); context.arc(point.x, point.y, 11, 0, Math.PI * 2); context.fillStyle = "rgba(105,186,255,.24)"; context.fill();
    context.beginPath(); context.arc(point.x, point.y, 4.5, 0, Math.PI * 2); context.fillStyle = "#69baff"; context.fill();
  }
  els.mapStatus.textContent = state.world ? `Helyi világnézet · ${state.map.hits.length} látható pont` : `Hálózatfüggetlen koordinátanézet · ${state.map.hits.length} pont`;
}

function drawGrid(context, metrics, light) {
  context.strokeStyle = light ? "rgba(26,83,62,.12)" : "rgba(73,148,118,.13)";
  context.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const a = project({ lon, lat: -90 }, metrics), b = project({ lon, lat: 90 }, metrics);
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const a = project({ lon: -180, lat }, metrics), b = project({ lon: 180, lat }, metrics);
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
  }
}

function drawWorld(context, metrics, light) {
  context.fillStyle = light ? "#bdd8cb" : "#15362b";
  context.strokeStyle = light ? "#8ab4a1" : "#2e6753";
  context.lineWidth = .7;
  for (const feature of state.world.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
    for (const polygon of polygons) {
      context.beginPath();
      for (const ring of polygon) {
        ring.forEach(([lon, lat], index) => {
          const point = project({ lon, lat }, metrics);
          if (index === 0) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
        });
        context.closePath();
      }
      context.fill("evenodd"); context.stroke();
    }
  }
}

function centerMapOn(point, zoom = 6) {
  const metrics = getMapMetrics();
  state.map.zoom = Math.max(1, Math.min(18, zoom));
  state.map.panX = -point.lon * metrics.base * state.map.zoom;
  state.map.panY = point.lat * metrics.base * state.map.zoom;
  drawMap();
}

function setupMapControls() {
  const adjustZoom = (factor) => {
    state.map.zoom = Math.max(1, Math.min(18, state.map.zoom * factor));
    drawMap();
  };
  els.zoomIn.addEventListener("click", () => adjustZoom(1.5));
  els.zoomOut.addEventListener("click", () => adjustZoom(1 / 1.5));
  els.resetMap.addEventListener("click", () => { state.map.zoom = 1; state.map.panX = 0; state.map.panY = 0; drawMap(); });
  els.mapCanvas.addEventListener("wheel", (event) => { event.preventDefault(); adjustZoom(event.deltaY < 0 ? 1.16 : 1 / 1.16); }, { passive: false });
  els.mapCanvas.addEventListener("pointerdown", (event) => {
    state.map.dragging = true;
    state.map.x = state.map.startX = event.clientX;
    state.map.y = state.map.startY = event.clientY;
    els.mapCanvas.setPointerCapture(event.pointerId);
  });
  els.mapCanvas.addEventListener("pointermove", (event) => {
    if (!state.map.dragging) return;
    state.map.panX += event.clientX - state.map.x; state.map.panY += event.clientY - state.map.y;
    state.map.x = event.clientX; state.map.y = event.clientY; drawMap();
  });
  els.mapCanvas.addEventListener("pointerup", (event) => {
    const moved = Math.hypot(event.clientX - state.map.startX, event.clientY - state.map.startY);
    state.map.dragging = false;
    if (moved < 5) {
      const rect = els.mapCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      const hit = state.map.hits.find((item) => Math.hypot(item.x - x, item.y - y) <= 14);
      if (hit) {
        state.query = hit.record.name;
        els.searchInput.value = hit.record.name;
        applyFilters();
        els.resultsList.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
  if ("ResizeObserver" in window) new ResizeObserver(drawMap).observe(els.mapFrame);
  else window.addEventListener("resize", drawMap);
}

async function loadWorld() {
  try { state.world = await fetchJson("./data/world-110m.geojson", false); }
  catch { state.world = null; }
  drawMap();
}

async function boot() {
  setupTheme();
  setupFilters();
  setupMapControls();
  setupInstall();
  updateNetworkStatus();
  window.addEventListener("online", () => { updateNetworkStatus(); syncData({ reason: "online" }); });
  window.addEventListener("offline", updateNetworkStatus);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && navigator.onLine) syncData({ reason: "resume" }); });
  els.searchInput.addEventListener("input", (event) => { state.query = event.target.value; applyFilters(); });
  els.clearSearch.addEventListener("click", () => { state.query = ""; els.searchInput.value = ""; els.searchInput.focus(); applyFilters(); });
  els.locateButton.addEventListener("click", locateUser);
  els.syncButton.addEventListener("click", async () => {
    await requestPersistentStorage();
    await syncData({ force: true, reason: "manual" });
  });
  els.packButton.addEventListener("click", () => els.packInput.click());
  els.packInput.addEventListener("change", async (event) => {
    try { await importPack(event.target.files?.[0]); }
    catch (error) { els.syncMessage.textContent = `Importálási hiba: ${error.message}`; }
    finally { event.target.value = ""; }
  });

  await Promise.all([setupServiceWorker(), loadWorld()]);
  try { state.db = await openDatabase(); }
  catch { els.syncMessage.textContent = "A tartós helyi adatbázis nem érhető el; az adatok csak ebben a munkamenetben élnek."; }
  state.records = await readAllRecords();
  await syncData({ force: state.records.length === 0, reason: "startup" });
  state.records = await readAllRecords();
  await updateStats();
  applyFilters();
}

boot().catch((error) => {
  updateNetworkStatus();
  els.syncMessage.textContent = `Az alkalmazás részben indult el: ${error.message}. Vészhelyzetben használd a hivatalos segélyhívót.`;
  els.mapStatus.textContent = "A térkép nem indítható; a segélyhívó gomb továbbra is használható.";
});
