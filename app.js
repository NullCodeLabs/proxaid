const DAY_MS = 24 * 60 * 60 * 1000;
const DB_NAME = "proxaid-offline-v1";
const DB_VERSION = 1;
const SHELL_CACHE_NAME = "proxaid-shell-v5";
const DEFAULT_CENTER = [46.4345, 16.9009];
const EMERGENCY_NUMBER = "112";

const CATEGORY_LABELS = {
  all: { hu: "Mind", en: "All" }, emergency_call: { hu: "Segélyhívó", en: "Emergency" },
  ambulance: { hu: "Mentő", en: "Ambulance" }, hospital_emergency: { hu: "Sürgősségi", en: "Emergency care" },
  hospital: { hu: "Kórház", en: "Hospital" }, urgent_care: { hu: "Ügyelet", en: "Urgent care" },
  clinic: { hu: "Klinika", en: "Clinic" }, doctor: { hu: "Orvos", en: "Doctor" },
  pharmacy: { hu: "Gyógyszertár", en: "Pharmacy" }, aed: { hu: "AED", en: "AED" },
  police: { hu: "Rendőrség", en: "Police" }, fire_station: { hu: "Tűzoltóság", en: "Fire station" },
  shelter: { hu: "Menedék", en: "Shelter" }, drinking_water: { hu: "Ivóvíz", en: "Drinking water" },
  toilets: { hu: "WC", en: "Toilet" }, accessible_toilets: { hu: "Akadálymentes WC", en: "Accessible toilet" },
  public_phone: { hu: "Nyilvános telefon", en: "Public phone" }
};
const FILTERS = ["all", "hospital_emergency", "hospital", "urgent_care", "doctor", "aed", "pharmacy", "drinking_water", "toilets", "public_phone", "shelter", "police", "fire_station"];

const UI = {
  hu: {
    online: "ONLINE // FRISSÍTHETŐ", offline: "OFFLINE // HELYI ADAT", results: "találat",
    noResults: "Nincs találat a letöltött rekordokban.", loaded: "LETÖLTVE", missing: "HIÁNYZIK",
    source: "FORRÁS ↗", show: "MUTASD", call: "HÍVÁS", details: "ÚTMUTATÓ",
    closestLoaded: "A legközelebbi betöltött rekordok távolság szerint.", micOn: "MIC ON", micListening: "FIGYELEK…"
  },
  en: {
    online: "ONLINE // UPDATE READY", offline: "OFFLINE // LOCAL DATA", results: "results",
    noResults: "No match in the downloaded records.", loaded: "DOWNLOADED", missing: "MISSING",
    source: "SOURCE ↗", show: "SHOW", call: "CALL", details: "GUIDE",
    closestLoaded: "Nearest downloaded records ordered by distance.", micOn: "MIC ON", micListening: "LISTENING…"
  }
};

const state = {
  db: null,
  memoryRecords: [],
  records: [],
  visibleRecords: [],
  category: "all",
  query: "",
  userLocation: null,
  catalog: null,
  firstAid: null,
  activeIntent: null,
  language: browserLanguage(),
  ttsEnabled: localStorage.getItem("proxaid-tts") !== "off",
  syncing: false,
  installPrompt: null,
  map: null,
  mapData: null,
  mapLayer: null,
  poiLayer: null,
  userLayer: null,
  recordMarkers: new Map(),
  cpr: { mode: null, running: false, count: 0, timer: null, audioContext: null, wakeLock: null }
};

const $ = (id) => document.getElementById(id);
const els = Object.fromEntries([
  "networkBadge", "themeButton", "languageSelect", "ttsButton", "searchInput", "clearSearch", "micButton",
  "categoryFilters", "firstAidSuggestion", "locateButton", "mapStatus", "zoomIn", "zoomOut", "resetMap",
  "recordCount", "lastSync", "readyScore", "shellState", "mapState", "recordState", "guideState",
  "storageWarning", "storageHelpButton", "syncButton", "syncMessage", "packInput", "packButton", "installButton",
  "resultsList", "resultCount", "handsOnlyButton", "breathsButton", "cprNow", "cprCounter", "cprSteps",
  "cprStartButton", "cprStopButton", "narratedAudioButton", "cprOnlineLink", "cprSource", "cprOfflineWarning", "cprAudio",
  "guideDialog", "guideTitle", "guideSummary", "guideSteps", "guideCprModes", "guideSources", "guideOfflineWarning", "guideSpeakButton",
  "callOptionsButton", "callDialog", "callOptions", "storageDialog", "storageInstructions", "nfcButton", "meshButton",
  "shareLocationButton", "deviceMessage", "nfcDialog", "nfcPayload", "nfcReadButton", "nfcWriteButton", "nfcShareButton", "nfcMessage",
  "installDialog", "installInstructions"
].map((id) => [id, $(id)]));

function browserLanguage() {
  const language = String(navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  return language.startsWith("hu") ? "hu" : "en";
}

function text(value) {
  if (typeof value === "string") return value;
  return value?.[state.language] || value?.en || value?.hu || "";
}

function ui(key) { return UI[state.language]?.[key] || UI.en[key] || key; }
function categoryLabel(category) { return text(CATEGORY_LABELS[category]) || category; }
function normalize(value) { return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9+]+/g, " ").trim(); }
function safePhone(phone) { return String(phone ?? "").replace(/[^+\d,;*#]/g, ""); }
function safeUrl(url) { try { const parsed = new URL(url); return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : null; } catch { return null; } }
function formatDate(value) { if (!value) return state.language === "hu" ? "még nem történt" : "not yet"; try { return new Intl.DateTimeFormat(state.language === "hu" ? "hu-HU" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); } catch { return String(value); } }
function pointInBbox(point, bbox) { return point && bbox && point.lon >= bbox[0] && point.lat >= bbox[1] && point.lon <= bbox[2] && point.lat <= bbox[3]; }
function haversine(a, b) {
  if (!a || !b) return null;
  const rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else { dialog.setAttribute("open", ""); dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true"); }
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
}

function speak(message, { interrupt = true } = {}) {
  if (!state.ttsEnabled || !message || !("speechSynthesis" in window)) return;
  if (interrupt) speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(message));
  utterance.lang = state.language === "hu" ? "hu-HU" : "en-US";
  utterance.rate = .96;
  speechSynthesis.speak(utterance);
}

function setupSpeechOutput() {
  els.ttsButton.setAttribute("aria-pressed", String(state.ttsEnabled));
  els.ttsButton.textContent = state.ttsEnabled ? "🔊 HANG BE" : "🔇 HANG KI";
  els.ttsButton.addEventListener("click", () => {
    state.ttsEnabled = !state.ttsEnabled;
    localStorage.setItem("proxaid-tts", state.ttsEnabled ? "on" : "off");
    els.ttsButton.setAttribute("aria-pressed", String(state.ttsEnabled));
    els.ttsButton.textContent = state.ttsEnabled ? "🔊 HANG BE" : "🔇 HANG KI";
    if (state.ttsEnabled) speak(state.language === "hu" ? "Felolvasás bekapcsolva" : "Speech on");
    else window.speechSynthesis?.cancel();
  });
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target || !state.ttsEnabled || [els.ttsButton, els.micButton, els.guideSpeakButton].includes(target)) return;
    const label = target.dataset.speak || target.getAttribute("aria-label") || target.textContent.trim();
    if (label) speak(label.slice(0, 180));
  }, true);
}

function setupLanguage() {
  els.languageSelect.value = state.language;
  document.documentElement.lang = state.language;
  els.languageSelect.addEventListener("change", () => {
    state.language = els.languageSelect.value;
    document.documentElement.lang = state.language;
    localStorage.setItem("proxaid-language", state.language);
    setupFilters();
    updateNetworkStatus();
    applyFilters();
    if (state.cpr.mode) selectCprMode(state.cpr.mode, false);
    speak(state.language === "hu" ? "Magyar nyelv" : "English language");
  });
  const stored = localStorage.getItem("proxaid-language");
  if (["hu", "en"].includes(stored)) { state.language = stored; els.languageSelect.value = stored; document.documentElement.lang = stored; }
}

function setupTheme() {
  const saved = localStorage.getItem("proxaid-theme");
  const initial = saved || (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = initial;
  updateThemeColor(initial);
  els.themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("proxaid-theme", next);
    updateThemeColor(next);
  });
}
function updateThemeColor(theme) { document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#eff7f3" : "#061410"); }

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
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

function getMeta(key) {
  if (!state.db) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = state.db.transaction("meta", "readonly").objectStore("meta").get(key);
    request.onsuccess = () => resolve(request.result?.value ?? null);
    request.onerror = () => reject(request.error);
  });
}

function setMeta(key, value) {
  if (!state.db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction("meta", "readwrite");
    tx.objectStore("meta").put({ key, value });
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
}

function readAllRecords() {
  if (!state.db) return Promise.resolve([...state.memoryRecords]);
  return new Promise((resolve, reject) => {
    const request = state.db.transaction("records", "readonly").objectStore("records").getAll();
    request.onsuccess = () => resolve(request.result || []); request.onerror = () => reject(request.error);
  });
}

function validRecord(record) {
  if (!record || !record.id || !record.name || !record.category) return false;
  if (!record.coordinates) return true;
  const { lat, lon } = record.coordinates;
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

async function storePack(pack) {
  if (!pack || pack.schemaVersion !== 1 || !pack.packId || !Array.isArray(pack.records)) throw new Error("Ismeretlen adatcsomag");
  const accepted = pack.records.filter(validRecord).map((record) => ({ ...record, _packId: pack.packId, _packVersion: pack.version, _storedAt: new Date().toISOString() }));
  if (!state.db) {
    state.memoryRecords = [...state.memoryRecords.filter((item) => item._packId !== pack.packId), ...accepted];
    return accepted.length;
  }
  await new Promise((resolve, reject) => {
    const tx = state.db.transaction("records", "readwrite"), store = tx.objectStore("records");
    const cursor = store.index("packId").openKeyCursor(IDBKeyRange.only(pack.packId));
    cursor.onsuccess = () => {
      if (cursor.result) { store.delete(cursor.result.primaryKey); cursor.result.continue(); }
      else accepted.forEach((record) => store.put(record));
    };
    cursor.onerror = () => tx.abort(); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
  return accepted.length;
}

async function fetchJson(path, preferNetwork = true) {
  const response = await fetch(new URL(path, document.baseURI), { cache: preferNetwork ? "no-store" : "default", credentials: "same-origin", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function syncData({ force = false, reason = "manual" } = {}) {
  if (state.syncing) return;
  const previousSync = await getMeta("lastSync").catch(() => null);
  if (!force && navigator.onLine && previousSync && Date.now() - new Date(previousSync).getTime() < DAY_MS) return;
  state.syncing = true; els.syncButton.disabled = true;
  els.syncMessage.textContent = state.language === "hu" ? "Adatok ellenőrzése…" : "Checking data…";
  try {
    state.catalog = await fetchJson("./data/catalog.json", navigator.onLine);
    const installed = new Set(await getMeta("installedPackIds").catch(() => []) || []);
    let total = 0;
    for (const descriptor of state.catalog.packs || []) {
      const inRegion = state.userLocation && pointInBbox(state.userLocation, descriptor.bbox);
      if (!(descriptor.required || descriptor.defaultInstall || installed.has(descriptor.id) || (descriptor.autoInstall && inRegion))) continue;
      const pack = await fetchJson(descriptor.url, navigator.onLine);
      total += await storePack(pack); installed.add(descriptor.id);
    }
    const now = new Date().toISOString();
    await setMeta("lastSync", now); await setMeta("lastSyncReason", reason); await setMeta("installedPackIds", [...installed]);
    state.records = await readAllRecords();
    els.syncMessage.textContent = state.language === "hu" ? `${total} helyi rekord használatra kész.` : `${total} local records ready.`;
    navigator.serviceWorker?.controller?.postMessage({ type: "SYNC_NOW" });
  } catch {
    els.syncMessage.textContent = state.records.length ? (state.language === "hu" ? "A korábbi helyi adatok használhatók." : "Existing local data is ready.") : (state.language === "hu" ? "Az induló adatcsomag nem tölthető be." : "The starter data pack could not be loaded.");
  } finally {
    state.syncing = false; els.syncButton.disabled = false; await updateStats(); applyFilters();
  }
}

function setupFilters() {
  const fragment = document.createDocumentFragment();
  FILTERS.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "filter-chip"; button.dataset.category = category;
    button.textContent = categoryLabel(category); button.setAttribute("aria-pressed", String(category === state.category));
    button.addEventListener("click", () => {
      state.category = category;
      [...els.categoryFilters.children].forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.category === category)));
      applyFilters();
    });
    fragment.append(button);
  });
  els.categoryFilters.replaceChildren(fragment);
}

function recordSearchText(record) {
  return normalize([record.name, record.category, categoryLabel(record.category), record.description, record.locality, record.region, record.country, record.operator, ...(record.tags || [])].join(" "));
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = saved;
    }
  }
  return row[b.length];
}

function fuzzyMatch(haystack, query) {
  if (!query || haystack.includes(query)) return true;
  const queryWords = query.split(" ").filter(Boolean), words = haystack.split(" ").filter(Boolean);
  return queryWords.every((queryWord) => words.some((word) => word.startsWith(queryWord) || queryWord.startsWith(word) || (queryWord.length >= 5 && editDistance(word, queryWord) <= 2)));
}

function detectIntent(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery || !state.firstAid) return null;
  let best = null;
  for (const intent of state.firstAid.intents || []) {
    let score = 0;
    for (const keyword of intent.keywords || []) {
      const normalizedKeyword = normalize(keyword);
      if (normalizedQuery.includes(normalizedKeyword)) score += 100 + normalizedKeyword.length;
      else if (fuzzyMatch(normalizedQuery, normalizedKeyword) || fuzzyMatch(normalizedKeyword, normalizedQuery)) score += 25;
    }
    if (score && (!best || score + intent.priority > best.score)) best = { intent, score: score + intent.priority };
  }
  return best?.intent || null;
}

function dedupeRecords(records) {
  const rank = { official_directory: 3, source_linked: 2, community_source: 1 };
  const kept = [];
  [...records].sort((a, b) => (rank[b.verification] || 0) - (rank[a.verification] || 0)).forEach((record) => {
    const duplicate = record.coordinates && kept.some((other) => {
      if (!other.coordinates || other.category !== record.category) return false;
      const distance = haversine(record.coordinates, other.coordinates);
      return distance != null && distance <= (record.category === "aed" ? .12 : .025)
        && (record.category === "aed" || normalize(record.name) === normalize(other.name));
    });
    if (!duplicate) kept.push(record);
  });
  return kept;
}

function renderIntentSuggestion(intent) {
  state.activeIntent = intent;
  if (!intent) { els.firstAidSuggestion.hidden = true; els.firstAidSuggestion.replaceChildren(); return; }
  const copy = document.createElement("div"), title = document.createElement("strong"), summary = document.createElement("span"), button = document.createElement("button");
  title.textContent = text(intent.title); summary.textContent = text(intent.summary); button.type = "button"; button.textContent = ui("details");
  button.addEventListener("click", () => openGuide(intent)); copy.append(title, summary); els.firstAidSuggestion.replaceChildren(copy, button); els.firstAidSuggestion.hidden = false;
}

function applyFilters() {
  const query = normalize(state.query), intent = detectIntent(state.query); renderIntentSuggestion(intent);
  state.visibleRecords = dedupeRecords(state.records)
    .filter((record) => state.category === "all" || record.category === state.category)
    .filter((record) => !query || fuzzyMatch(recordSearchText(record), query))
    .map((record) => ({ ...record, _distance: record.coordinates && state.userLocation ? haversine(state.userLocation, record.coordinates) : null }))
    .sort((a, b) => {
      if (a._distance != null && b._distance != null) return a._distance - b._distance;
      if (a._distance != null) return -1; if (b._distance != null) return 1;
      return a.name.localeCompare(b.name, state.language);
    });
  renderResults(state.visibleRecords); renderPoiLayer();
}

function renderResults(records) {
  els.resultCount.textContent = `${records.length} ${ui("results")}`;
  const fragment = document.createDocumentFragment();
  if (!records.length) { const empty = document.createElement("div"); empty.className = "empty-state"; empty.textContent = ui("noResults"); fragment.append(empty); }
  records.slice(0, 100).forEach((record) => fragment.append(createResultCard(record)));
  els.resultsList.replaceChildren(fragment);
}

function createResultCard(record) {
  const article = document.createElement("article"); article.className = "result-card";
  const titleRow = document.createElement("div"); titleRow.className = "result-title-row";
  const title = document.createElement("h3"); title.textContent = record.name;
  const tag = document.createElement("span"); tag.className = `tag ${record.verification === "official_directory" ? "verified" : ""}`; tag.textContent = record.verification === "official_directory" ? (state.language === "hu" ? "hivatalos" : "official") : (state.language === "hu" ? "forrásjelölt" : "source-linked");
  titleRow.append(title, tag);
  const description = document.createElement("p"); description.textContent = record.description || categoryLabel(record.category);
  const meta = document.createElement("div"); meta.className = "result-meta";
  const location = [record.locality, record.region, record.country].filter(Boolean).join(" · ");
  if (location) appendMeta(meta, `⌖ ${location}`); if (record._distance != null) appendMeta(meta, record._distance < 10 ? `${record._distance.toFixed(1)} km` : `${Math.round(record._distance)} km`);
  if (record.openingHours) appendMeta(meta, `◷ ${record.openingHours}`); if (record.source?.retrievedAt) appendMeta(meta, `${state.language === "hu" ? "adat" : "data"}: ${record.source.retrievedAt}`);
  const actions = document.createElement("div"); actions.className = "result-actions";
  const phone = safePhone(record.phone);
  if (phone) { const call = document.createElement("button"); call.type = "button"; call.className = `call ${phone === "1830" ? "lower-level" : ""}`; call.textContent = `${ui("call")} ${record.phone}`; call.addEventListener("click", () => openCallOptions(phone)); actions.append(call); }
  if (record.coordinates) { const show = document.createElement("button"); show.type = "button"; show.textContent = ui("show"); show.addEventListener("click", () => focusRecord(record)); actions.append(show); }
  const sourceUrl = safeUrl(record.source?.url || record.website);
  if (sourceUrl) { const source = document.createElement("a"); source.href = sourceUrl; source.target = "_blank"; source.rel = "noopener noreferrer"; source.textContent = ui("source"); actions.append(source); }
  article.append(titleRow, description, meta, actions); return article;
}
function appendMeta(container, value) { const span = document.createElement("span"); span.textContent = value; container.append(span); }

async function loadFirstAid() {
  try { state.firstAid = await fetchJson("./data/first-aid.json", false); els.guideState.textContent = ui("loaded"); els.guideState.className = "ready"; }
  catch { state.firstAid = null; els.guideState.textContent = ui("missing"); els.guideState.className = "missing"; }
}

function openGuide(intent) {
  state.activeIntent = intent; els.guideTitle.textContent = text(intent.title); els.guideSummary.textContent = text(intent.summary);
  els.guideSteps.replaceChildren(...(intent.steps?.[state.language] || intent.steps?.en || []).map((step) => { const li = document.createElement("li"); li.textContent = step; return li; }));
  const modeButtons = (intent.cprModes || []).map((modeId) => {
    const button = document.createElement("button"); button.type = "button"; button.className = "cpr-mode";
    const strong = document.createElement("strong"), span = document.createElement("span"); const mode = state.firstAid.cprModes[modeId];
    strong.textContent = text(mode.label); span.textContent = text(mode.when); button.append(strong, span);
    button.addEventListener("click", () => { closeDialog(els.guideDialog); selectCprMode(modeId, true); document.querySelector(".cpr-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }); });
    return button;
  });
  els.guideCprModes.replaceChildren(...modeButtons);
  const sourceLinks = (intent.sources || []).map((sourceId) => {
    const sourceData = state.firstAid.sources[sourceId], link = document.createElement("a"); link.textContent = sourceData?.name || sourceId;
    link.href = sourceData?.url || "#"; link.target = "_blank"; link.rel = "noopener noreferrer";
    if (!navigator.onLine) { link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); }
    return link;
  });
  const note = document.createElement("em"); note.textContent = `*${text(state.firstAid.sourceNote)}*`; els.guideSources.replaceChildren(note, ...sourceLinks);
  els.guideOfflineWarning.textContent = state.language === "hu" ? "*Ez a forrás offline nem érhető el. Elnézésed kérjük!" : "*This source is unavailable offline. Sorry!";
  els.guideOfflineWarning.hidden = navigator.onLine; openDialog(els.guideDialog);
  speak([text(intent.title), text(intent.summary), ...(intent.steps?.[state.language] || intent.steps?.en || [])].join(". "));
}

function setupGuides() {
  els.guideSpeakButton.addEventListener("click", () => {
    if (!state.activeIntent) return;
    speak([text(state.activeIntent.title), text(state.activeIntent.summary), ...(state.activeIntent.steps?.[state.language] || state.activeIntent.steps?.en || [])].join(". "));
  });
}

function selectCprMode(modeId, announce = true) {
  stopCpr(); state.cpr.mode = modeId;
  [els.handsOnlyButton, els.breathsButton].forEach((button) => button.classList.toggle("selected", button.dataset.mode === modeId));
  const mode = state.firstAid?.cprModes?.[modeId]; if (!mode) return;
  els.cprNow.hidden = false; els.cprCounter.textContent = state.language === "hu" ? "KÉSZ" : "READY";
  const ol = document.createElement("ol"); (mode.steps?.[state.language] || mode.steps?.en || []).forEach((step) => { const li = document.createElement("li"); li.textContent = step; ol.append(li); }); els.cprSteps.replaceChildren(ol);
  const online = mode.online?.[state.language] || mode.online?.en;
  if (online?.url) {
    els.cprOnlineLink.textContent = `${online.label} ↗`; els.cprOnlineLink.hidden = false;
    if (navigator.onLine) { els.cprOnlineLink.href = online.url; els.cprOnlineLink.removeAttribute("aria-disabled"); }
    else { els.cprOnlineLink.removeAttribute("href"); els.cprOnlineLink.setAttribute("aria-disabled", "true"); }
  } else els.cprOnlineLink.hidden = true;
  els.cprOfflineWarning.textContent = state.language === "hu" ? "*Ez az online tartalom offline nem érhető el. Elnézésed kérjük!" : "*This online content is unavailable offline. Sorry!";
  els.cprOfflineWarning.hidden = navigator.onLine;
  els.narratedAudioButton.hidden = !(modeId === "hands_only" && state.language === "hu");
  els.cprSource.textContent = `*${text(state.firstAid.sourceNote)}*`;
  if (announce) speak([text(mode.label), text(mode.when), ...(mode.steps?.[state.language] || mode.steps?.en || [])].join(". "));
}

async function startCpr() {
  if (!state.cpr.mode || state.cpr.running) return;
  els.cprAudio.pause(); state.cpr.running = true; state.cpr.count = 0;
  if ("wakeLock" in navigator) state.cpr.wakeLock = await navigator.wakeLock.request("screen").catch(() => null);
  scheduleBeat();
}

function scheduleBeat() {
  if (!state.cpr.running) return;
  playBeat(); state.cpr.count += 1;
  els.cprCounter.textContent = String(state.cpr.count); els.cprCounter.classList.add("beat"); setTimeout(() => els.cprCounter.classList.remove("beat"), 120);
  if (state.cpr.mode === "compressions_breaths" && state.cpr.count >= 30) {
    els.cprCounter.textContent = state.language === "hu" ? "2 BEFÚVÁS" : "2 BREATHS"; speak(els.cprCounter.textContent);
    state.cpr.count = 0; state.cpr.timer = setTimeout(scheduleBeat, 5000); return;
  }
  state.cpr.timer = setTimeout(scheduleBeat, 60000 / 110);
}

function playBeat() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    state.cpr.audioContext ||= new AudioContext();
    const context = state.cpr.audioContext, oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.frequency.value = state.cpr.count % 4 === 0 ? 720 : 560; gain.gain.setValueAtTime(.28, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .08);
    oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .09);
  } catch {}
  navigator.vibrate?.(45);
}

function stopCpr() {
  state.cpr.running = false; clearTimeout(state.cpr.timer); state.cpr.timer = null; state.cpr.count = 0;
  state.cpr.wakeLock?.release?.().catch(() => {}); state.cpr.wakeLock = null;
  els.cprAudio.pause(); if (els.cprCounter) els.cprCounter.textContent = state.language === "hu" ? "KÉSZ" : "READY";
}

function setupCpr() {
  els.handsOnlyButton.addEventListener("click", () => selectCprMode("hands_only"));
  els.breathsButton.addEventListener("click", () => selectCprMode("compressions_breaths"));
  els.cprStartButton.addEventListener("click", startCpr); els.cprStopButton.addEventListener("click", stopCpr);
  els.narratedAudioButton.addEventListener("click", async () => {
    stopCpr(); if (els.cprAudio.paused) { await els.cprAudio.play().catch(() => {}); els.narratedAudioButton.textContent = state.language === "hu" ? "NARRÁCIÓ SZÜNET" : "PAUSE AUDIO"; }
    else { els.cprAudio.pause(); els.narratedAudioButton.textContent = state.language === "hu" ? "MAGYAR NARRÁCIÓ" : "HUNGARIAN AUDIO"; }
  });
  els.cprAudio.addEventListener("ended", () => { els.narratedAudioButton.textContent = "MAGYAR NARRÁCIÓ"; });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && state.cpr.running && "wakeLock" in navigator) navigator.wakeLock.request("screen").then((lock) => { state.cpr.wakeLock = lock; }).catch(() => {}); });
}

function setupMicrophone() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  els.micButton.addEventListener("click", () => {
    if (!Recognition) { els.syncMessage.textContent = state.language === "hu" ? "A beszédbevitel itt nem érhető el; a gépelés működik." : "Speech input is unavailable here; typing works."; return; }
    const recognition = new Recognition(); recognition.lang = state.language === "hu" ? "hu-HU" : "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    els.micButton.classList.add("listening"); els.micButton.textContent = ui("micListening");
    speak(state.language === "hu" ? "Mikrofon bekapcsolva" : "Microphone on");
    setTimeout(() => recognition.start(), state.ttsEnabled ? 600 : 0);
    recognition.onresult = (event) => { const transcript = event.results?.[0]?.[0]?.transcript || ""; els.searchInput.value = transcript; state.query = transcript; applyFilters(); };
    recognition.onerror = () => { els.syncMessage.textContent = state.language === "hu" ? "A beszéd nem volt felismerhető." : "Speech was not recognised."; };
    recognition.onend = () => { els.micButton.classList.remove("listening"); els.micButton.textContent = ui("micOn"); };
  });
}

function roadStyle(feature) {
  const layer = feature.properties?.layer, klass = feature.properties?.class;
  if (layer === "water") return { color: "#72b8dc", fillColor: "#acd7eb", fillOpacity: .72, weight: 1 };
  if (layer === "waterway") return { color: "#5aaad2", weight: klass === "river" ? 3 : 1.5, opacity: .85 };
  if (layer === "road") {
    const major = ["motorway", "trunk", "primary"].includes(klass), medium = ["secondary", "tertiary"].includes(klass), trail = ["path", "footway", "cycleway", "track"].includes(klass);
    return { color: trail ? "#9d9278" : major ? "#d87665" : medium ? "#e3ad65" : "#ffffff", weight: major ? 4 : medium ? 3 : trail ? 1 : 2, opacity: trail ? .75 : .95, dashArray: trail ? "4 4" : null };
  }
  return { color: "transparent", weight: 0, fillOpacity: 0 };
}

async function setupMap() {
  if (!window.L) { els.mapStatus.textContent = state.language === "hu" ? "A listanézet használható." : "List view is available."; els.mapState.textContent = ui("missing"); els.mapState.className = "missing"; return; }
  state.map = L.map("streetMap", { zoomControl: false, attributionControl: true, minZoom: 10, maxZoom: 19, preferCanvas: true, tap: true }).setView(DEFAULT_CENTER, 14);
  state.map.attributionControl.setPrefix(false); state.map.attributionControl.addAttribution("© OpenStreetMap contributors");
  els.zoomIn.addEventListener("click", () => state.map.zoomIn()); els.zoomOut.addEventListener("click", () => state.map.zoomOut()); els.resetMap.addEventListener("click", () => state.map.setView(DEFAULT_CENTER, 14));
  try {
    state.mapData = await fetchJson("./data/maps/hu-zala-south.geojson", false);
    state.mapLayer = L.geoJSON(state.mapData, {
      renderer: L.canvas({ padding: .4 }), style: roadStyle,
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: feature.properties?.class === "city" ? 4 : 2.5, color: "#31584a", fillColor: "#fff", fillOpacity: .8, weight: 1 }),
      onEachFeature: (feature, layer) => { if (feature.properties?.layer === "place" && feature.properties?.name) layer.bindTooltip(feature.properties.name, { direction: "top", opacity: .85 }); }
    }).addTo(state.map);
    els.mapStatus.textContent = state.language === "hu" ? `${state.mapData.features.length} helyi utca- és térképelem` : `${state.mapData.features.length} local street and map features`;
    els.mapState.textContent = ui("loaded"); els.mapState.className = "ready";
  } catch { els.mapStatus.textContent = state.language === "hu" ? "A listanézet használható." : "List view is available."; els.mapState.textContent = ui("missing"); els.mapState.className = "missing"; }
  state.poiLayer = L.layerGroup().addTo(state.map); renderPoiLayer(); setTimeout(() => state.map.invalidateSize(), 100);
}

function markerColor(category) { if (category === "aed") return "#e0002b"; if (["hospital", "hospital_emergency", "doctor", "clinic", "pharmacy"].includes(category)) return "#b500cf"; if (["drinking_water", "toilets", "accessible_toilets"].includes(category)) return "#087fbd"; return "#e1453b"; }

function renderPoiLayer() {
  if (!state.map || !state.poiLayer) return;
  state.poiLayer.clearLayers(); state.recordMarkers.clear();
  state.visibleRecords.forEach((record) => {
    if (!record.coordinates) return;
    const marker = L.circleMarker([record.coordinates.lat, record.coordinates.lon], { radius: record.category === "aed" ? 8 : 6, color: "#fff", weight: 2, fillColor: markerColor(record.category), fillOpacity: .95, pane: "markerPane" });
    marker.bindPopup(`<strong>${escapeHtml(record.name)}</strong><br>${escapeHtml(categoryLabel(record.category))}`); marker.addTo(state.poiLayer); state.recordMarkers.set(record.id, marker);
  });
}

function focusRecord(record) {
  if (!state.map || !record.coordinates) return;
  state.map.setView([record.coordinates.lat, record.coordinates.lon], 17, { animate: true }); state.recordMarkers.get(record.id)?.openPopup(); document.getElementById("mapFrame")?.scrollIntoView({ behavior: "smooth", block: "center" });
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }

function locateUser() {
  if (!("geolocation" in navigator)) { els.syncMessage.textContent = state.language === "hu" ? "A helymeghatározás nem érhető el." : "Location is unavailable."; return; }
  els.locateButton.disabled = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    state.userLocation = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy };
    if (state.map) {
      state.userLayer?.remove(); state.userLayer = L.layerGroup().addTo(state.map);
      L.circle([state.userLocation.lat, state.userLocation.lon], { radius: state.userLocation.accuracy, color: "#1479cf", fillColor: "#69baff", fillOpacity: .13, weight: 1 }).addTo(state.userLayer);
      L.circleMarker([state.userLocation.lat, state.userLocation.lon], { radius: 7, color: "#fff", fillColor: "#1479cf", fillOpacity: 1, weight: 2 }).addTo(state.userLayer);
      state.map.setView([state.userLocation.lat, state.userLocation.lon], 17, { animate: true });
    }
    els.locateButton.disabled = false; els.locateButton.textContent = `⌖ ±${Math.round(state.userLocation.accuracy)} m`; applyFilters();
    if (navigator.onLine) await syncData({ force: true, reason: "location" });
  }, () => { els.locateButton.disabled = false; els.locateButton.textContent = "⌖ HELYZETEM"; els.syncMessage.textContent = state.language === "hu" ? "A helyzet most nem állapítható meg." : "Location could not be determined."; }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 120000 });
}

async function updateStats() {
  const lastSync = await getMeta("lastSync").catch(() => null); els.recordCount.textContent = String(state.records.length); els.lastSync.textContent = formatDate(lastSync);
  const shellReady = Boolean(navigator.serviceWorker?.controller || ("caches" in window && await caches.has(SHELL_CACHE_NAME).catch(() => false)));
  els.shellState.textContent = shellReady ? ui("loaded") : ui("missing"); els.shellState.className = shellReady ? "ready" : "missing";
  els.recordState.textContent = state.records.length ? ui("loaded") : ui("missing"); els.recordState.className = state.records.length ? "ready" : "missing";
  const ready = [shellReady, Boolean(state.mapData), Boolean(state.records.length), Boolean(state.firstAid)].filter(Boolean).length; els.readyScore.textContent = ready === 4 ? (state.language === "hu" ? "KÉSZ" : "READY") : `${ready}/4`;
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate().catch(() => null), remaining = estimate ? (estimate.quota || 0) - (estimate.usage || 0) : Infinity, ratio = estimate?.quota ? remaining / estimate.quota : 1;
    els.storageWarning.hidden = !(remaining < 50 * 1024 * 1024 || ratio < .1);
  }
}

function updateNetworkStatus() { const online = navigator.onLine; els.networkBadge.textContent = online ? ui("online") : ui("offline"); els.networkBadge.classList.toggle("online", online); els.networkBadge.classList.toggle("offline", !online); if (state.cpr.mode) selectCprMode(state.cpr.mode, false); }

function openStorageHelp() {
  const ua = navigator.userAgent.toLowerCase(); let html;
  if (/iphone|ipad|ipod/.test(ua)) html = "<p><strong>iPhone / iPad:</strong> Beállítások → Általános → iPhone/iPad tárhely. Töröld a nem szükséges letöltéseket vagy alkalmazásokat.</p>";
  else if (/android/.test(ua)) html = '<p><a class="secondary-link" href="intent:#Intent;action=android.settings.INTERNAL_STORAGE_SETTINGS;end">BEÁLLÍTÁSOK MEGNYITÁSA</a></p><p><strong>Android:</strong> Beállítások → Tárhely, vagy Alkalmazások → böngésző → Tárhely.</p>';
  else if (/windows/.test(ua)) html = "<p><strong>Windows:</strong> Beállítások → Rendszer → Tárterület.</p>";
  else if (/mac/.test(ua)) html = "<p><strong>macOS:</strong> Rendszerbeállítások → Általános → Tárhely.</p>";
  else html = "<p><strong>Linux:</strong> Nyisd meg a rendszer tárhely- vagy lemezkezelőjét, és szabadíts fel helyet.</p>";
  els.storageInstructions.innerHTML = html; openDialog(els.storageDialog);
}

function callOptions(number) {
  return [
    { id: "tel", label: state.language === "hu" ? "Telefon" : "Phone", href: `tel:${number}`, primary: true },
    { id: "skype", label: "Skype — Próba/Megnyitás", href: `skype:${number}?call` },
    { id: "viber", label: "Viber — Próba/Megnyitás", href: `viber://contact?number=${encodeURIComponent(number)}` },
    { id: "callto", label: state.language === "hu" ? "Más hívóapp — Próba/Megnyitás" : "Other calling app — Try/Open", href: `callto:${number}` }
  ];
}

function openCallOptions(number = EMERGENCY_NUMBER) {
  const confirmed = localStorage.getItem("proxaid-call-handler");
  const options = callOptions(number).sort((a, b) => Number(b.id === confirmed) - Number(a.id === confirmed) || Number(b.primary) - Number(a.primary));
  const nodes = options.map((option) => {
    const row = document.createElement("div"); row.className = `call-option ${option.id === confirmed ? "confirmed" : ""}`;
    const link = document.createElement("a"); link.href = option.href; link.textContent = option.label;
    const confirm = document.createElement("button"); confirm.type = "button"; confirm.textContent = state.language === "hu" ? "MŰKÖDÖTT" : "WORKED";
    confirm.addEventListener("click", () => { localStorage.setItem("proxaid-call-handler", option.id); openCallOptions(number); }); row.append(link, confirm); return row;
  });
  els.callOptions.replaceChildren(...nodes); openDialog(els.callDialog);
}

function emergencyPayload() {
  const location = state.userLocation ? `geo:${state.userLocation.lat},${state.userLocation.lon}?z=17` : (state.language === "hu" ? "helyzet nincs megadva" : "location unavailable");
  return `PROXAID SOS\n${new Date().toISOString()}\n${location}\nEmergency: ${EMERGENCY_NUMBER}`;
}

async function sharePayload(payload = emergencyPayload()) {
  if (navigator.share) { await navigator.share({ title: "PROXAID SOS", text: payload }).catch(() => {}); return; }
  await navigator.clipboard?.writeText(payload).catch(() => {}); els.deviceMessage.textContent = state.language === "hu" ? "A segélycsomag a vágólapra került." : "Emergency payload copied.";
}

function setupDeviceActions() {
  els.callOptionsButton.addEventListener("click", () => openCallOptions());
  els.storageHelpButton.addEventListener("click", openStorageHelp);
  els.nfcButton.addEventListener("click", () => { els.nfcPayload.value = emergencyPayload(); openDialog(els.nfcDialog); });
  els.nfcReadButton.addEventListener("click", async () => {
    if (!("NDEFReader" in window)) { els.nfcMessage.textContent = state.language === "hu" ? "Használd a Megosztás gombot vagy QR-/fájlátvitelt." : "Use Share or QR/file transfer."; return; }
    try { const reader = new NDEFReader(); await reader.scan(); els.nfcMessage.textContent = state.language === "hu" ? "Érintsd az NFC-címkét a készülékhez." : "Hold the NFC tag near the device."; reader.onreading = (event) => { const decoder = new TextDecoder(); const record = [...event.message.records].find((item) => item.recordType === "text"); if (record) els.nfcPayload.value = decoder.decode(record.data); }; } catch { els.nfcMessage.textContent = state.language === "hu" ? "Az NFC-olvasás nem indult el." : "NFC reading did not start."; }
  });
  els.nfcWriteButton.addEventListener("click", async () => {
    if (!("NDEFReader" in window)) { els.nfcMessage.textContent = state.language === "hu" ? "Használd a Megosztás gombot vagy QR-/fájlátvitelt." : "Use Share or QR/file transfer."; return; }
    try { const writer = new NDEFReader(); await writer.write({ records: [{ recordType: "text", data: els.nfcPayload.value }] }); els.nfcMessage.textContent = state.language === "hu" ? "NFC-címke megírva." : "NFC tag written."; } catch { els.nfcMessage.textContent = state.language === "hu" ? "Az NFC-írás nem sikerült." : "NFC write failed."; }
  });
  els.nfcShareButton.addEventListener("click", () => sharePayload(els.nfcPayload.value));
  els.meshButton.addEventListener("click", () => { els.deviceMessage.textContent = state.language === "hu" ? "Válaszd a telepített MESH/Meshtastic vagy üzenetküldő alkalmazást." : "Choose an installed MESH/Meshtastic or messaging app."; sharePayload(); });
  els.shareLocationButton.addEventListener("click", () => sharePayload());
}

function setupInstall() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); state.installPrompt = event; els.installButton.hidden = false; });
  if (ios && !standalone) els.installButton.hidden = false;
  els.installButton.addEventListener("click", async () => {
    if (state.installPrompt) { await state.installPrompt.prompt(); state.installPrompt = null; return; }
    els.installInstructions.innerHTML = ios ? "<p>Safari → Megosztás → Főképernyőhöz adás.</p>" : "<p>Nyisd meg a böngésző menüjét, majd válaszd a Telepítés vagy Hozzáadás a kezdőképernyőhöz lehetőséget.</p>"; openDialog(els.installDialog);
  });
}

async function importPack(file) {
  if (!file || file.size > 50 * 1024 * 1024) throw new Error("A csomag túl nagy");
  const pack = JSON.parse(await file.text()), count = await storePack(pack); state.records = await readAllRecords(); applyFilters(); await updateStats(); els.syncMessage.textContent = `${count} rekord importálva.`;
}

async function setupServiceWorker() {
  if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
  try { const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" }); await navigator.serviceWorker.ready; if ("periodicSync" in registration) await registration.periodicSync.register("proxaid-daily-sync", { minInterval: DAY_MS }).catch(() => {}); } catch {}
}

function setupDialogClosers() {
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeDialog($(button.dataset.close))));
  document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog); }));
}

async function boot() {
  setupLanguage(); setupTheme(); setupSpeechOutput(); setupFilters(); setupGuides(); setupCpr(); setupMicrophone(); setupDeviceActions(); setupInstall(); setupDialogClosers(); updateNetworkStatus();
  els.searchInput.addEventListener("input", (event) => { state.query = event.target.value; applyFilters(); });
  els.clearSearch.addEventListener("click", () => { state.query = ""; els.searchInput.value = ""; els.searchInput.focus(); applyFilters(); });
  els.locateButton.addEventListener("click", locateUser);
  els.syncButton.addEventListener("click", async () => { if (navigator.storage?.persist) await navigator.storage.persist().catch(() => false); await syncData({ force: true, reason: "manual" }); });
  els.packButton.addEventListener("click", () => els.packInput.click());
  els.packInput.addEventListener("change", async (event) => { try { await importPack(event.target.files?.[0]); } catch (error) { els.syncMessage.textContent = error.message; } finally { event.target.value = ""; } });
  window.addEventListener("online", () => { updateNetworkStatus(); syncData({ reason: "online" }); }); window.addEventListener("offline", updateNetworkStatus);

  await Promise.all([setupServiceWorker(), loadFirstAid(), setupMap()]);
  try { state.db = await openDatabase(); } catch { state.db = null; }
  state.records = await readAllRecords(); await syncData({ force: state.records.length === 0, reason: "startup" }); state.records = await readAllRecords(); applyFilters(); await updateStats();
}

boot().catch(() => { updateNetworkStatus(); els.syncMessage.textContent = state.language === "hu" ? "A segélyhívó és a helyi tartalék nézet használható." : "Emergency calling and local fallback remain available."; });
