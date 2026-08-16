import qrcode from "./assets/vendor/qrcode.mjs";
import { stringToBytes as utf8ToBytes } from "./assets/vendor/qrcode_utf8.mjs";

qrcode.stringToBytes = utf8ToBytes;

const DAY_MS = 24 * 60 * 60 * 1000;
const DB_NAME = "proxaid-offline-v1";
const DB_VERSION = 2;
const SHELL_CACHE_NAME = "proxaid-shell-v10";
const DATA_REVISION = "2026-08-16.5";
const DEFAULT_CENTER = [46.4345, 16.9009];
const DEFAULT_EMERGENCY_NUMBER = "112";
const ONLINE_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const GLOBAL_SEARCH_RADIUS_M = 15000;
const GLOBAL_MAP_RADIUS_M = 12000;
const GLOBAL_CELL_SCALE = 20;

const CATEGORY_LABELS = {
  all: { hu: "Mind", en: "All" }, emergency_call: { hu: "Segélyhívó", en: "Emergency" },
  ambulance: { hu: "Mentő", en: "Ambulance" }, hospital_emergency: { hu: "Sürgősségi", en: "Emergency care" },
  hospital: { hu: "Kórház", en: "Hospital" }, urgent_care: { hu: "Ügyelet", en: "Urgent care" },
  clinic: { hu: "Klinika", en: "Clinic" }, doctor: { hu: "Orvos", en: "Doctor" },
  pharmacy: { hu: "Gyógyszertár", en: "Pharmacy" }, medical_supply: { hu: "Gyógyászati segédeszköz", en: "Medical supply" }, aed: { hu: "Defibrillátor (AED)", en: "Defibrillator (AED)" },
  police: { hu: "Rendőrség", en: "Police" }, fire_station: { hu: "Tűzoltóság", en: "Fire station" },
  shelter: { hu: "Menedék", en: "Shelter" }, drinking_water: { hu: "Ivóvíz", en: "Drinking water" },
  toilets: { hu: "WC", en: "Toilet" }, accessible_toilets: { hu: "Akadálymentes WC", en: "Accessible toilet" },
  public_phone: { hu: "Nyilvános telefon", en: "Public phone" },
  shower: { hu: "Tisztálkodás", en: "Shower" }, homeless_shelter: { hu: "Éjszakai menedék", en: "Night shelter" },
  washing: { hu: "Mosdás", en: "Washing" }, laundry: { hu: "Mosoda", en: "Laundry" }, baby_changing: { hu: "Pelenkázó", en: "Baby changing" },
  warming_center: { hu: "Melegedő", en: "Warming centre" }, cooling_center: { hu: "Hűsölőhely", en: "Cooling centre" }, food_assistance: { hu: "Élelmiszersegély", en: "Food assistance" },
  alpine_hut: { hu: "Hegyi hajlék", en: "Alpine hut" }, wilderness_hut: { hu: "Erdei hajlék", en: "Wilderness hut" },
  mountain_rescue: { hu: "Hegyi mentés", en: "Mountain rescue" }, water_rescue: { hu: "Vízi mentés", en: "Water rescue" },
  lifeguard: { hu: "Vízimentő", en: "Lifeguard" }, disaster_response: { hu: "Katasztrófavédelem", en: "Disaster response" },
  emergency_phone: { hu: "Segélytelefon", en: "Emergency phone" }, assembly_point: { hu: "Gyülekezési pont", en: "Assembly point" },
  first_aid: { hu: "Elsősegélypont", en: "First-aid point" }, internet_access: { hu: "Internetelérés", en: "Internet access" },
  fuel: { hu: "Benzinkút", en: "Fuel" }, charging: { hu: "Töltőpont", en: "Charging" }, embassy: { hu: "Külképviselet", en: "Embassy" }
};
const FILTERS = ["all", "urgent", "healthcare", "aed", "pharmacy", "water", "hygiene", "shelter", "rescue", "connection"];
const FILTER_LABELS = {
  all: { hu: "Mind", en: "All" }, urgent: { hu: "Sürgősségi + ügyelet", en: "Emergency + urgent" },
  healthcare: { hu: "Kórház + orvos", en: "Hospital + doctor" }, aed: CATEGORY_LABELS.aed,
  pharmacy: CATEGORY_LABELS.pharmacy, water: CATEGORY_LABELS.drinking_water,
  hygiene: { hu: "WC + tisztálkodás", en: "Toilet + hygiene" }, shelter: { hu: "Menedék + hajlék", en: "Shelter" },
  rescue: { hu: "Mentés + hatóság", en: "Rescue + services" }, connection: { hu: "Telefon + kapcsolat", en: "Phone + connection" }
};
const FILTER_MEMBERS = {
  urgent: ["emergency_call", "ambulance", "hospital_emergency", "urgent_care", "hospital", "clinic"],
  healthcare: ["hospital_emergency", "hospital", "urgent_care", "clinic", "doctor", "medical_supply"],
  aed: ["aed"], pharmacy: ["pharmacy"], water: ["drinking_water"],
  hygiene: ["toilets", "accessible_toilets", "shower", "washing", "baby_changing", "laundry", "sanitary_dump"],
  shelter: ["shelter", "homeless_shelter", "night_shelter", "warming_center", "cooling_center", "alpine_hut", "wilderness_hut", "food_assistance"],
  rescue: ["ambulance", "police", "fire_station", "mountain_rescue", "water_rescue", "lifeguard", "assembly_point", "disaster_response"],
  connection: ["public_phone", "emergency_phone", "internet_access"]
};

const UI = {
  hu: {
    online: "ONLINE // FRISSÍTHETŐ", offline: "OFFLINE // HELYI ADAT", results: "találat",
    noResults: "Nincs találat a letöltött rekordokban.", loaded: "LETÖLTVE", missing: "HIÁNYZIK",
    source: "FORRÁS ↗", website: "WEBOLDAL ↗", show: "MUTASD", route: "ÚTVONAL", call: "HÍVÁS", details: "ÚTMUTATÓ", recordDetails: "RÉSZLETEK",
    closestLoaded: "A legközelebbi betöltött rekordok távolság szerint.", micOn: "MIC ON", micListening: "FIGYELEK…", micStop: "MIK LEÁLLÍTÁSA",
    aiSearch: "ONLINE KERESÉSI PROMPT", copied: "Másolva"
  },
  en: {
    online: "ONLINE // UPDATE READY", offline: "OFFLINE // LOCAL DATA", results: "results",
    noResults: "No match in the downloaded records.", loaded: "DOWNLOADED", missing: "MISSING",
    source: "SOURCE ↗", website: "WEBSITE ↗", show: "SHOW", route: "ROUTE", call: "CALL", details: "GUIDE", recordDetails: "DETAILS",
    closestLoaded: "Nearest downloaded records ordered by distance.", micOn: "MIC ON", micListening: "LISTENING…", micStop: "STOP MIC",
    aiSearch: "ONLINE SEARCH PROMPT", copied: "Copied"
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
  ttsEnabled: readLocal("proxaid-tts") !== "off",
  emergencyNumber: safePhone(readLocal("proxaid-emergency-number")) || detectedEmergencyNumber(),
  region: detectedRegion(),
  syncing: false,
  installPrompt: null,
  map: null,
  mapData: null,
  mapLayer: null,
  mapCasingLayer: null,
  mapLabelLayer: null,
  onlineTileLayer: null,
  onlineTileReady: false,
  localMapLoaded: false,
  localMapBounds: null,
  localMapMinZoom: 2,
  activeMapDescriptor: null,
  poiLayer: null,
  userLayer: null,
  recordMarkers: new Map(),
  heroHubPayload: "",
  recognition: null,
  micSession: null,
  mapContextCache: new Map(),
  cpr: { mode: null, running: false, count: 0, timer: null, audioContext: null, wakeLock: null }
};

const $ = (id) => document.getElementById(id);
const els = Object.fromEntries([
  "networkBadge", "themeButton", "languageSelect", "ttsButton", "emergencyCall", "searchInput", "clearSearch", "micButton",
  "categoryFilters", "firstAidSuggestion", "locateButton", "mapStatus", "zoomIn", "zoomOut", "resetMap",
  "recordCount", "lastSync", "readyScore", "shellState", "mapState", "recordState", "guideState",
  "storageWarning", "storageHelpButton", "syncButton", "syncMessage", "packInput", "packButton", "installButton",
  "resultsList", "resultCount", "handsOnlyButton", "breathsButton", "cprNow", "cprCounter", "cprSteps",
  "cprStartButton", "cprStopButton", "narratedAudioButton", "cprOnlineLink", "cprSource", "cprOfflineWarning", "cprAudio",
  "guideDialog", "guideTitle", "guideSummary", "guideSteps", "guideCprModes", "guideSources", "guideOfflineWarning", "guideSpeakButton",
  "callOptionsButton", "callDialog", "callOptions", "callNumberLabel", "callNumberInput", "useCallNumberButton", "storageDialog", "storageInstructions", "nfcButton", "meshButton",
  "shareLocationButton", "deviceMessage", "nfcDialog", "nfcPayload", "nfcReadButton", "nfcWriteButton", "nfcShareButton", "nfcMessage",
  "installDialog", "installInstructions", "heroButton", "heroHubButton", "heroHubDialog", "heroHubForm", "hubLocation", "hubHazards",
  "hubTotal", "hubCritical", "hubBleeding", "hubTrapped", "hubNotes", "hubContact", "hubBuildButton", "hubClearButton", "heroHubQr",
  "heroHubPreview", "hubNfcButton", "hubShareButton", "hubCopyButton", "hubDownloadButton", "heroHubMessage", "docDialog", "docDialogTitle",
  "docContent", "readmeButton", "userGuideButton", "sourcesButton", "inviteButton", "callQr", "medicalCardButton", "medicalCardDialog",
  "medicalCardForm", "medicalName", "medicalBirthDate", "medicalBloodType", "medicalDonor", "medicalAllergies", "medicalMedications",
  "medicalConditions", "medicalImplants", "medicalContact", "medicalNotes", "medicalSaveButton", "medicalNfcButton", "medicalShareButton",
  "medicalClearButton", "medicalCardQr", "medicalCardPreview", "medicalCardMessage", "medicalCardTitle", "medicalCardRisk"
].map((id) => [id, $(id)]));

function readLocal(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writeLocal(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
function removeLocal(key) { try { localStorage.removeItem(key); } catch {} }
function readSession(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function writeSession(key, value) { try { sessionStorage.setItem(key, value); return true; } catch { return false; } }

function detectedRegion() {
  const locale = String(navigator.languages?.[0] || navigator.language || "").replace("_", "-");
  return locale.match(/-([A-Za-z]{2})(?:-|$)/)?.[1]?.toUpperCase() || "";
}

function detectedEmergencyNumber() {
  const region = detectedRegion();
  if (["US", "CA", "MX"].includes(region)) return "911";
  if (["GB", "GG", "IM", "JE"].includes(region)) return "999";
  if (region === "AU") return "000";
  if (region === "NZ") return "111";
  if (["JP", "KR"].includes(region)) return "119";
  return DEFAULT_EMERGENCY_NUMBER;
}

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
function filterLabel(filter) { return text(FILTER_LABELS[filter]) || categoryLabel(filter); }
function recordCategories(record) { return [...new Set([record.category, ...(record.categories || [])].filter(Boolean))]; }
function matchesFilter(record, filter) { return filter === "all" || recordCategories(record).some((category) => (FILTER_MEMBERS[filter] || [filter]).includes(category)); }
function recordApplicable(record) {
  if (record.coordinates || !record.country) return true;
  if (record.country === "EU") return ["AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"].includes(state.region);
  return !state.region || String(record.country).toUpperCase() === state.region;
}
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
  els.ttsButton.textContent = state.ttsEnabled ? (state.language === "hu" ? "🔊 HANG BE" : "🔊 SPEECH ON") : (state.language === "hu" ? "🔇 HANG KI" : "🔇 SPEECH OFF");
  els.ttsButton.addEventListener("click", () => {
    state.ttsEnabled = !state.ttsEnabled;
    writeLocal("proxaid-tts", state.ttsEnabled ? "on" : "off");
    els.ttsButton.setAttribute("aria-pressed", String(state.ttsEnabled));
    els.ttsButton.textContent = state.ttsEnabled ? (state.language === "hu" ? "🔊 HANG BE" : "🔊 SPEECH ON") : (state.language === "hu" ? "🔇 HANG KI" : "🔇 SPEECH OFF");
    if (state.ttsEnabled) speak(state.language === "hu" ? "Felolvasás bekapcsolva" : "Speech on");
    else window.speechSynthesis?.cancel();
  });
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    const activationSensitive = [els.ttsButton, els.micButton, els.guideSpeakButton, els.narratedAudioButton, els.cprStartButton, els.cprStopButton];
    if (!target || !state.ttsEnabled || target.dataset.noSpeak === "true" || activationSensitive.includes(target)) return;
    const label = target.dataset.speak || target.getAttribute("aria-label") || target.textContent.trim();
    if (label) speak(label.slice(0, 180));
  });
}

function setupLanguage() {
  els.languageSelect.value = state.language;
  document.documentElement.lang = state.language;
  els.languageSelect.addEventListener("change", () => {
    state.language = els.languageSelect.value;
    document.documentElement.lang = state.language;
    writeLocal("proxaid-language", state.language);
    setupFilters();
    applyStaticLanguage();
    updateNetworkStatus();
    applyFilters();
    if (state.cpr.mode) selectCprMode(state.cpr.mode, false);
    speak(state.language === "hu" ? "Magyar nyelv" : "English language");
  });
  const stored = readLocal("proxaid-language");
  if (["hu", "en"].includes(stored)) { state.language = stored; els.languageSelect.value = stored; document.documentElement.lang = stored; }
  applyStaticLanguage();
}

function applyStaticLanguage() {
  const hu = state.language === "hu";
  const set = (selector, huText, enText) => { const node = document.querySelector(selector); if (node) node.textContent = hu ? huText : enText; };
  const setLabel = (selector, huText, enText) => { const node = document.querySelector(selector); if (node?.firstChild?.nodeType === Node.TEXT_NODE) node.firstChild.nodeValue = hu ? huText : enText; };
  document.title = hu ? "PROXAID Offline" : "PROXAID Offline";
  set(".hero-pitch .eyebrow", "PROXAID // GLOBÁLIS OFF-GRID VÉSZHELYZETI RÉTEG", "PROXAID // GLOBAL OFF-GRID EMERGENCY LAYER");
  set("#heroPitchTitle", "Ha baj van, de nincs internet, esetleg telefon sem, GPS lefedettség sem! Nem csak adrenalin vadászok számára!", "When trouble hits but there is no internet — perhaps no phone or GPS coverage either. Not just for adrenaline seekers.");
  set(".hero-pitch > p:last-child", "Offline is működő vészhelyzeti térkép és elsősegélynyújtás támogatással.", "An offline-capable emergency map with first-aid support.");
  set(".emergency-strip .eyebrow", "AZONNALI ÉLETVESZÉLY", "IMMEDIATE DANGER");
  set(".emergency-strip h1", "Hívd a helyi segélyhívót, majd kövesd a segélyirányító utasításait.", "Call the local emergency number, then follow the dispatcher.");
  updateEmergencyNumberUi();
  els.callOptionsButton.textContent = hu ? "MÁS HÍVÁSI MÓD" : "OTHER CALLING METHOD";
  set(".command-panel .eyebrow", "HELYKERESÉS + ELSŐSEGÉLY", "PLACE SEARCH + FIRST AID");
  set("#searchTitle", "Mi történt, vagy mit keresel?", "What happened, or what do you need?");
  els.searchInput.placeholder = hu ? "Pl. félrenyelt, vérzés, defibrillátor (AED), gyógyszertár, WC…" : "E.g. choking, bleeding, defibrillator (AED), pharmacy, toilet…";
  els.ttsButton.textContent = state.ttsEnabled ? (hu ? "🔊 HANG BE" : "🔊 SPEECH ON") : (hu ? "🔇 HANG KI" : "🔇 SPEECH OFF");
  if (!state.userLocation) els.locateButton.textContent = hu ? "⌖ HELYZETEM" : "⌖ MY LOCATION";
  els.micButton.textContent = ui("micOn");
  set("#heroTitle", "HERO segítség + HeroHUB helyzetlap", "HERO help + HeroHUB incident card");
  set(".hero-panel .eyebrow", "⛑️ TÖMEGBALESET", "⛑️ MULTIPLE CASUALTIES");
  const heroActions = document.querySelectorAll(".hero-action");
  if (heroActions[0]) heroActions[0].querySelector("span").textContent = hu ? "Azonnali, felolvasott teendők több sérültnél" : "Immediate spoken actions for multiple casualties";
  if (heroActions[1]) heroActions[1].querySelector("span").textContent = hu ? "Helyzetadat rögzítése és átadása QR-rel, NFC-vel vagy megosztással" : "Record and hand over incident data by QR, NFC or sharing";
  set("#cprTitle", "Válaszd a megfelelő módot", "Choose the appropriate mode");
  set(".cpr-panel .eyebrow", "FELNŐTT ÚJRAÉLESZTÉS", "ADULT CPR");
  els.handsOnlyButton.querySelector("strong").textContent = hu ? "CSAK MELLKASI NYOMÁS" : "HANDS-ONLY CPR";
  els.handsOnlyButton.querySelector("span").textContent = hu ? "Folyamatos kompresszió" : "Continuous compressions";
  els.breathsButton.querySelector("strong").textContent = hu ? "30 NYOMÁS + 2 BEFÚVÁS" : "30 COMPRESSIONS + 2 BREATHS";
  els.breathsButton.querySelector("span").textContent = hu ? "Képzett és kész segélynyújtónak" : "For a trained and willing rescuer";
  els.cprStartButton.textContent = hu ? "ÜTEM INDÍTÁSA" : "START RHYTHM"; els.cprStopButton.textContent = hu ? "LEÁLLÍTÁS" : "STOP";
  set("#dataTitle", "Letöltött elemek", "Downloaded items"); set("#resultsTitle", "Legközelebbi segítségpontok", "Nearest assistance points");
  set(".map-panel .eyebrow", "ONLINE + OFFLINE UTCATÉRKÉP", "ONLINE + OFFLINE STREET MAP");
  set(".data-panel .eyebrow", "OFFLINE KÉSZENLÉT", "OFFLINE READINESS");
  set(".results-panel .eyebrow", "BETÖLTÖTT REKORDOK", "STORED RECORDS");
  const readinessLabels = document.querySelectorAll(".readiness-list span");
  const readinessHu = ["Alkalmazás", "Utcatérkép", "Tárolt segítségpontok", "Elsősegély és hang"], readinessEn = ["Application", "Street map", "Stored assistance points", "First aid and audio"];
  readinessLabels.forEach((node, index) => { node.textContent = (hu ? readinessHu : readinessEn)[index] || node.textContent; });
  const statsLabels = document.querySelectorAll(".data-stats dt");
  if (statsLabels[0]) statsLabels[0].textContent = hu ? "Tárolt rekord" : "Stored records";
  if (statsLabels[1]) statsLabels[1].textContent = hu ? "Utolsó frissítés" : "Last refresh";
  els.syncButton.textContent = hu ? "↻ FRISSÍTÉS MOST" : "↻ REFRESH NOW"; els.packButton.textContent = hu ? "＋ ADAT- / TÉRKÉPCSOMAG IMPORTÁLÁSA" : "＋ IMPORT DATA / MAP PACK";
  els.installButton.textContent = hu ? "⇩ TELEPÍTÉS" : "⇩ INSTALL";
  els.medicalCardButton.textContent = hu ? "🩺 HELYI VÉSZKÁRTYA" : "🩺 LOCAL MEDICAL CARD";
  els.nfcButton.textContent = hu ? "NFC OLVASÁS / ÍRÁS" : "NFC READ / WRITE"; els.meshButton.textContent = hu ? "MESH SEGÉLYCSOMAG" : "MESH EMERGENCY PACKET"; els.shareLocationButton.textContent = hu ? "HELYZET MEGOSZTÁSA" : "SHARE LOCATION";
  set(".device-panel .eyebrow", "KÖZELI ADATCSERE", "NEARBY DATA HANDOFF"); set("#deviceTitle", "NFC és MESH", "NFC and MESH");
  const deviceNotes = document.querySelectorAll(".device-explain p");
  if (deviceNotes[0]) deviceNotes[0].innerHTML = hu ? "📳 <strong>NFC</strong> — a telefont egy kompatibilis címkéhez érintve vészkártyát olvas vagy ír. Gyors, néhány centiméteres adatátadásra való." : "📳 <strong>NFC</strong> — touch a compatible tag to read or write the emergency card. It is a short-range handoff measured in centimetres.";
  if (deviceNotes[1]) deviceNotes[1].innerHTML = hu ? "🛰️ <strong>MESH</strong> — az SOS- vagy HeroHUB-csomagot a készülék megosztási menüjén át egy telepített közeli/MESH alkalmazásnak adja. A fogadó alkalmazás továbbíthatja internet nélkül is, ha erre ténylegesen képes." : "🛰️ <strong>MESH</strong> — hands the SOS or HeroHUB packet to an installed nearby/MESH app through the system share sheet. A capable target app may relay it without internet.";
  els.inviteButton.textContent = hu ? "＋ MEGHÍVÁS" : "＋ INVITE";
  els.readmeButton.textContent = "README"; els.userGuideButton.textContent = hu ? "HASZNÁLATI ÚTMUTATÓ" : "USER GUIDE"; els.sourcesButton.textContent = hu ? "FORRÁSOK" : "SOURCES";
  set("footer > p:first-child", "PROXAID v1.0 // offline készenléti réteg", "PROXAID v1.0 // OFFLINE READINESS LAYER");
  set(".map-note", "Online globális OpenStreetMap; a Helyzetem vagy a Frissítés most a kiválasztott körzet utcáit offline-ra is menti. A Mutasd gomb utcaszintre visz.", "Global OpenStreetMap online; My Location or Refresh now also saves the selected area's streets for offline use. Show moves to street level.");
  set(".invite-note", "Egy felkészült telefon: még egy offline útmutató, térkép és lehetséges továbbító pont.", "One prepared phone: another offline guide, map and possible relay point.");
  const trustCards = document.querySelectorAll(".trust-grid article");
  if (trustCards[0]) { trustCards[0].querySelector("h3").textContent = hu ? "Vészhelyzeti használat" : "Emergency use"; trustCards[0].querySelector("p").textContent = hu ? "Vészhelyzetben hívd a helyi segélyhívót, és kövesd a segélyirányító utasításait. A hely-, nyitvatartási és hozzáférési adatok változhatnak." : "In an emergency call the local emergency number and follow the dispatcher. Place, opening and access data can change."; }
  if (trustCards[1]) { trustCards[1].querySelector("h3").textContent = hu ? "Helyi adatkezelés" : "Local data control"; trustCards[1].querySelector("p").textContent = hu ? "A keresés és a HeroHUB helyben marad. Online térkép/gyűjtéskor a kért terület az OpenStreetMap szolgáltatásaihoz kerül; nincs analitika vagy reklámkövetés." : "Search and HeroHUB stay local. Online map/discovery sends the requested area to OpenStreetMap services; there is no analytics or advertising tracking."; }
  if (trustCards[2]) { trustCards[2].querySelector("h3").textContent = hu ? "Szakmai alap" : "Guidance basis"; trustCards[2].querySelector("p").textContent = hu ? "A beépített elsősegély-logika WHO, IFRC és Resuscitation Council útmutatóra támaszkodik; a segélyirányító utasítása elsőbbséget élvez." : "Built-in first-aid logic is based on WHO, IFRC and Resuscitation Council guidance; dispatcher instructions take priority."; }
  els.hubBuildButton.textContent = hu ? "HELYZETLAP FRISSÍTÉSE" : "REFRESH INCIDENT CARD"; els.hubClearButton.textContent = hu ? "ÜRÍTÉS" : "CLEAR";
  els.hubCopyButton.textContent = hu ? "MÁSOLÁS" : "COPY"; els.hubDownloadButton.textContent = hu ? "JSON MENTÉS" : "SAVE JSON";
  set("#callDialogTitle", "Hívási lehetőségek", "Calling options"); set("#storageDialogTitle", "Tárhely felszabadítása", "Free storage"); set("#nfcDialogTitle", "NFC vészkártya", "NFC emergency card"); set("#installDialogTitle", "Telepítés", "Install");
  set("#medicalCardTitle", "Helyi vészkártya", "Local medical card");
  setLabel("#callNumberLabel", "Helyi segélyhívó száma", "Local emergency number"); els.useCallNumberButton.textContent = hu ? "SZÁM HASZNÁLATA" : "USE NUMBER";
  els.medicalCardRisk.textContent = hu ? "⚠️ Csak azt add meg, amit vészhelyzetben megmutatnál. A feloldott készülékhez, QR-kódhoz vagy megírt NFC-címkéhez hozzáférő személy elolvashatja. A böngészőadatok törlése a helyi kártyát is törölheti." : "⚠️ Enter only what you would disclose in an emergency. Anyone with access to the unlocked device, QR code or written NFC tag can read it. Clearing browser data may delete the local card.";
  const medicalLabels = document.querySelectorAll("#medicalCardForm label");
  const medicalHu = ["Név — opcionális", "Születési dátum — opcionális", "Vércsoport", "Donornyilatkozat", "Allergiák", "Gyógyszerek / véralvadásgátló", "Betegségek / fontos kórelőzmény", "Implantátum / beültetett eszköz", "Vészhelyzeti kapcsolat", "Egyéb fontos információ"];
  const medicalEn = ["Name — optional", "Date of birth — optional", "Blood type", "Donor declaration", "Allergies", "Medication / anticoagulant", "Conditions / relevant history", "Implant / implanted device", "Emergency contact", "Other critical information"];
  medicalLabels.forEach((node, index) => { if (node.firstChild?.nodeType === Node.TEXT_NODE) node.firstChild.nodeValue = (hu ? medicalHu : medicalEn)[index] || node.firstChild.nodeValue; });
  const bloodOptions = els.medicalBloodType.options; if (bloodOptions[0]) bloodOptions[0].textContent = hu ? "Ismeretlen" : "Unknown";
  const donorOptions = els.medicalDonor.options; if (donorOptions[0]) donorOptions[0].textContent = hu ? "Nincs megadva" : "Not specified"; if (donorOptions[1]) donorOptions[1].textContent = hu ? "Igen" : "Yes"; if (donorOptions[2]) donorOptions[2].textContent = hu ? "Nem" : "No";
  els.medicalSaveButton.textContent = hu ? "MENTÉS + QR" : "SAVE + QR"; els.medicalNfcButton.textContent = "📳 NFC"; els.medicalShareButton.textContent = hu ? "MEGOSZTÁS" : "SHARE"; els.medicalClearButton.textContent = hu ? "TÖRLÉS" : "DELETE";
  set("#guideSpeakButton", "FELOLVASÁS", "READ ALOUD"); set("#nfcReadButton", "OLVASÁS", "READ"); set("#nfcWriteButton", "ÍRÁS", "WRITE"); set("#nfcShareButton", "MEGOSZTÁS", "SHARE");
  setLabel("#heroHubForm label:nth-of-type(1)", "Helyszín / találkozási pont", "Location / meeting point");
  setLabel("#heroHubForm label:nth-of-type(2)", "Veszély / esemény", "Hazard / event");
  setLabel("#heroHubForm label:nth-of-type(3)", "Becsült érintett", "Estimated affected");
  setLabel("#heroHubForm label:nth-of-type(4)", "Nem reagál / nem lélegzik normálisan", "Unresponsive / abnormal breathing");
  setLabel("#heroHubForm label:nth-of-type(5)", "Súlyos vérzés", "Severe bleeding");
  setLabel("#heroHubForm label:nth-of-type(6)", "Beszorult", "Trapped");
  setLabel("#heroHubForm label:nth-of-type(7)", "Megközelítés / rövid megjegyzés", "Access / short note");
  setLabel("#heroHubForm label:nth-of-type(8)", "Kapcsolat — opcionális", "Contact — optional");
}

function setupTheme() {
  const saved = readLocal("proxaid-theme");
  const initial = saved || (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = initial;
  updateThemeColor(initial);
  els.themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    writeLocal("proxaid-theme", next);
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
      if (!db.objectStoreNames.contains("maps")) db.createObjectStore("maps", { keyPath: "id" });
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

function getStoredMap(id) {
  if (!state.db || !id || !state.db.objectStoreNames.contains("maps")) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = state.db.transaction("maps", "readonly").objectStore("maps").get(id);
    request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error);
  });
}

function storeMapPackage(entry) {
  if (!state.db || !state.db.objectStoreNames.contains("maps")) return Promise.reject(new Error("Map storage unavailable"));
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction("maps", "readwrite"); tx.objectStore("maps").put(entry);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
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

function globalCellId(point) {
  const lat = Math.floor((point.lat + 90) * GLOBAL_CELL_SCALE), lon = Math.floor((point.lon + 180) * GLOBAL_CELL_SCALE);
  return `osm-live-${lat}-${lon}`;
}

function globalMapId(point) { return globalCellId(point).replace("osm-live-", "osm-map-"); }

function overpassQuery(point) {
  const around = `(around:${GLOBAL_SEARCH_RADIUS_M},${point.lat.toFixed(6)},${point.lon.toFixed(6)})`;
  return `[out:json][timeout:90];(
    nwr["emergency"~"^(defibrillator|phone|ambulance_station|mountain_rescue|assembly_point|water_rescue|lifeguard|access_point|emergency_ward_entrance)$"]${around};
    nwr["amenity"~"^(hospital|clinic|doctors|pharmacy|police|fire_station|shelter|social_facility|drinking_water|toilets|shower|telephone)$"]${around};
    nwr["healthcare"~"^(hospital|clinic|doctor|pharmacy|first_aid)$"]${around};
    nwr["shop"~"^(chemist|medical_supply)$"]${around};
    nwr["tourism"~"^(alpine_hut|wilderness_hut)$"]${around};
    nwr["amenity"~"^(lavoir|fuel|charging_station|internet_cafe)$"]${around};
    nwr["shop"="laundry"]${around};
    nwr["changing_table"="yes"]${around};
    nwr["office"="diplomatic"]${around};
  );out center tags qt;`;
}

function overpassMapQuery(point) {
  const around = `(around:${GLOBAL_MAP_RADIUS_M},${point.lat.toFixed(6)},${point.lon.toFixed(6)})`;
  return `[out:json][timeout:120];(
    node["place"~"^(city|town|village|hamlet|suburb|neighbourhood|locality)$"]${around};
    way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|unclassified|living_street|pedestrian|road|service|cycleway|footway|path|track)$"]${around};
    way["waterway"~"^(river|stream|canal|drain)$"]${around};
    way["natural"="water"]${around};
    way["railway"]["railway"!~"^(abandoned|disused|razed)$"]${around};
  );out tags geom qt;`;
}

function normalizeOnlineMap(payload, point, retrievedAt) {
  const features = [];
  for (const element of payload.elements || []) {
    const tags = element.tags || {};
    if (element.type === "node" && tags.place && Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
      features.push({ type: "Feature", id: `osm-node-${element.id}`, properties: { layer: "place", class: tags.place, name: tags["name:hu"] || tags["name:en"] || tags.name || null, source: "OpenStreetMap" }, geometry: { type: "Point", coordinates: [element.lon, element.lat] } });
      continue;
    }
    const coordinates = (element.geometry || []).map((item) => [item.lon, item.lat]).filter((item) => item.every(Number.isFinite));
    if (element.type !== "way" || coordinates.length < 2) continue;
    let layer = null, klass = null;
    if (tags.highway) { layer = "road"; klass = tags.highway; }
    else if (tags.waterway) { layer = "waterway"; klass = tags.waterway; }
    else if (tags.natural === "water") { layer = "water"; klass = tags.water || "water"; }
    else if (tags.railway) { layer = "railway"; klass = tags.railway; }
    if (!layer) continue;
    const lastCoordinate = coordinates[coordinates.length - 1];
    const closed = coordinates.length > 3 && coordinates[0][0] === lastCoordinate[0] && coordinates[0][1] === lastCoordinate[1];
    features.push({ type: "Feature", id: `osm-way-${element.id}`, properties: { layer, class: klass, name: tags["name:hu"] || tags["name:en"] || tags.name || null, ref: tags.ref || null, source: "OpenStreetMap" }, geometry: closed && layer === "water" ? { type: "Polygon", coordinates: [coordinates] } : { type: "LineString", coordinates } });
    if (features.length >= 30000) break;
  }
  const mapData = { type: "FeatureCollection", name: "PROXAID on-demand offline street map", metadata: { source: "OpenStreetMap contributors", retrievedAt, center: point, radiusMeters: GLOBAL_MAP_RADIUS_M, zoomRange: [10, 19] }, features };
  mapData.bbox = geoJsonBbox(mapData);
  return validMapData(mapData) ? mapData : null;
}

async function fetchNearbyOfflineMap(point, { force = false } = {}) {
  if (!point) return null;
  const mapId = globalMapId(point), stored = await getStoredMap(mapId).catch(() => null);
  const refreshHours = Number(state.catalog?.globalDiscovery?.offlineMap?.refreshHours || state.catalog?.minimumRefreshHours || 720);
  const refreshedAt = stored?.storedAt ? Date.parse(stored.storedAt) : 0;
  if (stored?.data && (!force || Date.now() - refreshedAt < refreshHours * 60 * 60 * 1000)) { await setMeta("activeMapId", mapId); await applyOfflineMap(stored.data, stored, false); return stored; }
  if (!navigator.onLine) return stored || null;
  const body = new URLSearchParams({ data: overpassMapQuery(point) });
  let payload = null, lastError = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body }, 125000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      payload = await response.json(); break;
    } catch (error) { lastError = error; }
  }
  if (!payload) throw lastError || new Error("Offline map lookup failed");
  const retrievedAt = new Date().toISOString(), mapData = normalizeOnlineMap(payload, point, retrievedAt);
  if (!mapData || mapData.features.length < 10) throw new Error("No usable street map returned");
  const entry = { id: mapId, name: "On-demand offline street map", version: retrievedAt.slice(0, 10), bbox: mapData.bbox, source: "OpenStreetMap contributors", storedAt: retrievedAt, data: mapData };
  await storeMapPackage(entry); await setMeta("activeMapId", mapId); await applyOfflineMap(mapData, entry, false); return entry;
}

async function fetchNearbyGlobalPack(point, { force = false } = {}) {
  if (!navigator.onLine || !point) return null;
  const packId = globalCellId(point), refreshHours = Number(state.catalog?.minimumRefreshHours || 720);
  const lastFetch = await getMeta(`globalFetch:${packId}`).catch(() => null);
  if (!force && lastFetch && Date.now() - Date.parse(lastFetch) < refreshHours * 60 * 60 * 1000) return null;
  const body = new URLSearchParams({ data: overpassQuery(point) });
  let payload = null, lastError = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body }, 95000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      payload = await response.json(); break;
    } catch (error) { lastError = error; }
  }
  if (!payload) throw lastError || new Error("Global POI lookup failed");
  const retrievedAt = new Date().toISOString(), records = (payload.elements || []).map((element) => normalizeOnlineElement(element, retrievedAt)).filter(Boolean).slice(0, 20000);
  if (!records.length) throw new Error("No usable global records returned");
  const pack = { schemaVersion: 1, packId, version: retrievedAt.slice(0, 10).replaceAll("-", "."), generatedAt: retrievedAt, license: "OpenStreetMap contributors, ODbL 1.0", records };
  await setMeta(`globalFetch:${packId}`, retrievedAt).catch(() => {});
  return pack;
}

function fetchWithTimeout(url, options, timeoutMs) {
  if (!("AbortController" in window)) return fetch(url, options);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function onlineCategory(tags) {
  if (tags.emergency === "defibrillator") return "aed";
  if (tags.emergency === "phone") return "emergency_phone";
  if (tags.emergency === "ambulance_station") return "ambulance";
  if (tags.emergency === "mountain_rescue") return "mountain_rescue";
  if (tags.emergency === "assembly_point") return "assembly_point";
  if (tags.emergency === "disaster_response") return "disaster_response";
  if (tags.emergency === "water_rescue") return "water_rescue";
  if (tags.emergency === "lifeguard") return "lifeguard";
  if (tags.emergency === "access_point") return "emergency_access_point";
  if (tags.emergency === "emergency_ward_entrance") return "hospital_emergency";
  const healthcare = { hospital: "hospital", clinic: "clinic", doctor: "doctor", pharmacy: "pharmacy", first_aid: "first_aid" };
  if (healthcare[tags.healthcare]) return healthcare[tags.healthcare];
  const amenity = {
    hospital: "hospital", clinic: "clinic", doctors: "doctor", pharmacy: "pharmacy", police: "police", fire_station: "fire_station",
    shelter: "shelter", drinking_water: "drinking_water", toilets: tags.wheelchair === "yes" ? "accessible_toilets" : "toilets",
    shower: "shower", telephone: "public_phone"
  };
  if (tags.amenity === "social_facility") return ["food_bank", "soup_kitchen"].includes(tags.social_facility) ? "food_assistance" : tags.social_facility === "shelter" ? "homeless_shelter" : "shelter";
  if (amenity[tags.amenity]) return amenity[tags.amenity];
  if (tags.tourism === "alpine_hut") return "alpine_hut";
  if (tags.tourism === "wilderness_hut") return "wilderness_hut";
  if (tags.shop === "chemist") return "pharmacy";
  if (tags.shop === "medical_supply") return "medical_supply";
  if (tags.shop === "laundry") return "laundry";
  if (tags.amenity === "lavoir") return "washing";
  if (tags.amenity === "fuel") return "fuel";
  if (tags.amenity === "charging_station") return "charging";
  if (tags.amenity === "internet_cafe") return "internet_access";
  if (tags.office === "diplomatic") return "embassy";
  if (tags.changing_table === "yes") return "baby_changing";
  return null;
}

function onlineMemberships(category) {
  if (["hospital", "clinic", "doctor", "pharmacy", "medical_supply"].includes(category)) return ["healthcare"];
  if (["hospital_emergency", "aed", "ambulance", "emergency_phone"].includes(category)) return ["urgent", "healthcare"];
  if (["police", "fire_station", "mountain_rescue", "water_rescue", "lifeguard", "assembly_point"].includes(category)) return ["rescue"];
  if (["toilets", "accessible_toilets", "shower"].includes(category)) return ["hygiene"];
  if (["washing", "laundry", "baby_changing"].includes(category)) return ["hygiene"];
  if (["shelter", "homeless_shelter", "alpine_hut", "wilderness_hut", "food_assistance"].includes(category)) return ["shelter"];
  if (category === "drinking_water") return ["water"];
  if (["public_phone", "emergency_phone", "internet_access"].includes(category)) return ["connection"];
  return [];
}

function onlineFallbackName(category) {
  return state.language === "hu" ? (CATEGORY_LABELS[category]?.hu || FILTER_LABELS[category]?.hu || "Segítségpont") : (CATEGORY_LABELS[category]?.en || FILTER_LABELS[category]?.en || "Assistance point");
}

function normalizeOnlineElement(element, retrievedAt) {
  const tags = element.tags || {}, category = onlineCategory(tags);
  const lat = element.lat ?? element.center?.lat, lon = element.lon ?? element.center?.lon;
  if (!category || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const languageTag = state.language === "hu" ? tags["name:hu"] : tags["name:en"];
  const address = tags["addr:full"] || [tags["addr:postcode"], tags["addr:city"] || tags["addr:place"], tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ") || null;
  const website = normalizeOnlineUrl(tags["contact:website"] || tags.website || tags.url);
  return {
    id: `osm-${element.type}-${element.id}`, name: languageTag || tags.name || tags.operator || onlineFallbackName(category), category,
    categories: onlineMemberships(category), kind: "place", description: tags.description || tags["defibrillator:location"] || tags.operator || null,
    address, landmark: tags.loc_name || tags["addr:place"] || null, locality: tags["addr:city"] || tags["addr:place"] || null,
    region: tags["addr:state"] || null, country: tags["addr:country"] || null,
    phone: safePhone(tags["contact:phone"] || tags.phone) || null, email: tags["contact:email"] || tags.email || null, website,
    contacts: {
      mobile: safePhone(tags["contact:mobile"] || tags.mobile) || null, fax: safePhone(tags["contact:fax"] || tags.fax) || null,
      facebook: normalizeOnlineUrl(tags["contact:facebook"] || tags.facebook), instagram: normalizeOnlineUrl(tags["contact:instagram"] || tags.instagram),
      linkedin: normalizeOnlineUrl(tags["contact:linkedin"] || tags.linkedin), twitter: normalizeOnlineUrl(tags["contact:twitter"] || tags.twitter),
      mastodon: normalizeOnlineUrl(tags["contact:mastodon"] || tags.mastodon), youtube: normalizeOnlineUrl(tags["contact:youtube"] || tags.youtube),
      telegram: String(tags["contact:telegram"] || tags.telegram || "").trim() || null, whatsapp: String(tags["contact:whatsapp"] || tags.whatsapp || "").trim() || null
    },
    coordinates: { lat, lon }, openingHours: tags.opening_hours || null,
    access: tags.access || null, wheelchair: tags.wheelchair || null, verification: "community_source",
    confidence: tags.source || tags.check_date ? "medium" : "unverified", tags: [tags.operator, tags.brand, tags.description].filter(Boolean),
    source: { name: "OpenStreetMap contributors", url: `https://www.openstreetmap.org/${element.type}/${element.id}`, retrievedAt: retrievedAt.slice(0, 10), checkedAt: retrievedAt }
  };
}

function normalizeOnlineUrl(value) {
  if (!value) return null;
  try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).href; }
  catch { return null; }
}

async function syncData({ force = false, reason = "manual" } = {}) {
  if (state.syncing) return;
  state.syncing = true; els.syncButton.disabled = true;
  els.syncMessage.textContent = state.language === "hu" ? "Adatok ellenőrzése…" : "Checking data…";
  try {
    state.catalog = await fetchJson("./data/catalog.json", navigator.onLine);
    const installed = new Set(await getMeta("installedPackIds").catch(() => []) || []);
    const installedVersions = await getMeta("installedPackVersions").catch(() => ({})) || {};
    let total = 0;
    for (const descriptor of state.catalog.packs || []) {
      const inRegion = state.userLocation && pointInBbox(state.userLocation, descriptor.bbox);
      if (!(descriptor.required || descriptor.defaultInstall || installed.has(descriptor.id) || (descriptor.autoInstall && inRegion))) continue;
      if (!force && installed.has(descriptor.id) && installedVersions[descriptor.id] === descriptor.version) continue;
      const pack = await fetchJson(descriptor.url, navigator.onLine);
      total += await storePack(pack); installed.add(descriptor.id); installedVersions[descriptor.id] = descriptor.version;
    }
    let globalCount = 0, mapFeatureCount = 0;
    const shouldDiscover = navigator.onLine && ["manual", "location", "online", "startup", "migration"].includes(reason);
    if (shouldDiscover) {
      const mapCenter = reason === "manual" ? state.map?.getCenter() : null;
      const discoveryPoint = mapCenter ? { lat: mapCenter.lat, lon: mapCenter.lng } : state.userLocation;
      if (discoveryPoint) {
        const [mapResult, poiResult] = await Promise.allSettled([
          ensureOfflineMapForPoint(discoveryPoint, { force }),
          fetchNearbyGlobalPack(discoveryPoint, { force })
        ]);
        if (mapResult.status === "fulfilled") mapFeatureCount = mapResult.value?.data?.features?.length || state.mapData?.features?.length || 0;
        if (poiResult.status === "fulfilled" && poiResult.value) {
          const globalPack = poiResult.value; globalCount = await storePack(globalPack); installed.add(globalPack.packId); installedVersions[globalPack.packId] = globalPack.version; total += globalCount;
        }
        if (mapResult.status === "rejected" && poiResult.status === "rejected") els.syncMessage.textContent = state.language === "hu" ? "Az online területgyűjtés most nem válaszolt; a letöltött adatok megmaradtak." : "Online area discovery did not respond; downloaded data remains available.";
      }
    }
    const now = new Date().toISOString();
    await setMeta("lastSync", now); await setMeta("lastSyncReason", reason); await setMeta("installedPackIds", [...installed]); await setMeta("installedPackVersions", installedVersions); await setMeta("dataRevision", DATA_REVISION);
    state.records = await readAllRecords();
    els.syncMessage.textContent = total
      ? (state.language === "hu" ? `${total} rekord frissítve${globalCount ? `, ebből ${globalCount} a jelenlegi 15 km-es körzetből` : ""}${mapFeatureCount ? `; ${mapFeatureCount} offline térképelem` : ""}. ${state.records.length} rekord használatra kész.` : `${total} records refreshed${globalCount ? `, including ${globalCount} within the current 15 km area` : ""}${mapFeatureCount ? `; ${mapFeatureCount} offline map features` : ""}. ${state.records.length} records ready.`)
      : (state.language === "hu" ? `${state.records.length} rekord naprakész${mapFeatureCount ? `; ${mapFeatureCount} offline térképelem használatra kész` : ""}.` : `${state.records.length} records are current${mapFeatureCount ? `; ${mapFeatureCount} offline map features ready` : ""}.`);
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
    button.textContent = filterLabel(category); button.setAttribute("aria-pressed", String(category === state.category));
    button.addEventListener("click", () => {
      state.category = category;
      state.query = "";
      els.searchInput.value = "";
      [...els.categoryFilters.children].forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.category === category)));
      applyFilters();
    });
    fragment.append(button);
  });
  els.categoryFilters.replaceChildren(fragment);
  updateFilterCounts();
}

function updateFilterCounts() {
  const unique = dedupeRecords(state.records).filter(recordApplicable);
  [...els.categoryFilters.children].forEach((button) => {
    const category = button.dataset.category;
    const count = unique.filter((record) => matchesFilter(record, category)).length;
    button.textContent = `${filterLabel(category)} · ${count}`;
    button.setAttribute("aria-label", `${filterLabel(category)}: ${count}`);
  });
}

function recordSearchText(record) {
  const categories = recordCategories(record);
  return normalize([record.name, ...categories, ...categories.map(categoryLabel), record.description, record.address, record.landmark, record.locality, record.region, record.country, record.operator, record.phone, record.email, record.website, ...(record.tags || [])].join(" "));
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
    .filter(recordApplicable)
    .filter((record) => matchesFilter(record, state.category))
    .filter((record) => !query || fuzzyMatch(recordSearchText(record), query))
    .map((record) => ({ ...record, _distance: record.coordinates && state.userLocation ? haversine(state.userLocation, record.coordinates) : null }))
    .sort((a, b) => {
      if (a._distance != null && b._distance != null) return a._distance - b._distance;
      if (a._distance != null) return -1; if (b._distance != null) return 1;
      return a.name.localeCompare(b.name, state.language);
    });
  updateFilterCounts(); renderResults(state.visibleRecords); renderPoiLayer();
}

function renderResults(records) {
  els.resultCount.textContent = `${records.length} ${ui("results")}`;
  const fragment = document.createDocumentFragment();
  if (!records.length) {
    const empty = document.createElement("div"); empty.className = "empty-state";
    const message = document.createElement("p"); message.textContent = ui("noResults"); empty.append(message);
    if (navigator.onLine) {
      const aiButton = document.createElement("button"); aiButton.type = "button"; aiButton.className = "secondary-button"; aiButton.textContent = ui("aiSearch");
      aiButton.addEventListener("click", () => shareSearchPrompt()); empty.append(aiButton);
    }
    fragment.append(empty);
  }
  records.slice(0, 100).forEach((record) => fragment.append(createResultCard(record)));
  els.resultsList.replaceChildren(fragment);
}

function searchPrompt() {
  const center = state.map?.getCenter();
  const location = state.userLocation
    ? `${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lon.toFixed(6)}`
    : center ? `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}` : (state.language === "hu" ? "a felhasználó jelenlegi helye" : "the user's current location");
  const need = state.query || filterLabel(state.category);
  return state.language === "hu"
    ? `Keress most nyitva és ténylegesen elérhető ${need} helyet ${location} közelében. Adj pontos nevet, címet vagy tájékozódási pontot, GPS-koordinátát, minden publikus telefonos és online elérhetőséget, élő hivatalos URL-t, teljes nyitvatartást, hozzáférést, két közvetlen forráslinket és ISO ellenőrzési időt. Minden URL-t ellenőrizz, a találatot lehetőleg két független aktuális forrással erősítsd meg. Hiányzó adatot ne találj ki.`
    : `Find an actually accessible ${need} near ${location} that is open now. Return exact name, address or landmark, GPS coordinates, every public phone and online contact, a live official URL, full opening hours, access, two direct source links and an ISO verification time. Check every URL and confirm the result with two independent current sources where possible. Do not invent missing data.`;
}

function shareSearchPrompt() { sharePayload(searchPrompt(), "PROXAID search prompt"); }

function createResultCard(record) {
  const article = document.createElement("article"); article.className = "result-card";
  const titleRow = document.createElement("div"); titleRow.className = "result-title-row";
  const title = document.createElement("h3"); title.textContent = record.name;
  const tag = document.createElement("span"); tag.className = `tag ${record.verification === "official_directory" ? "verified" : ""}`; tag.textContent = record.verification === "official_directory" ? (state.language === "hu" ? "hivatalos" : "official") : (state.language === "hu" ? "forrásjelölt" : "source-linked");
  titleRow.append(title, tag);
  const description = document.createElement("p"); description.textContent = record.description || categoryLabel(record.category);
  const meta = document.createElement("div"); meta.className = "result-meta";
  const location = recordLocation(record);
  if (location) appendMeta(meta, `⌖ ${location}`, "location");
  if (record.coordinates) appendMeta(meta, `GPS ${record.coordinates.lat.toFixed(6)}, ${record.coordinates.lon.toFixed(6)}`, "coordinates");
  if (record._distance != null) appendMeta(meta, record._distance < 10 ? `${record._distance.toFixed(1)} km` : `${Math.round(record._distance)} km`, "distance");
  const today = todayOpening(record.openingHours);
  if (today) appendMeta(meta, `◷ ${today}`, "open-today");
  const currentStatus = openingNow(record.openingHours);
  if (currentStatus) appendMeta(meta, currentStatus.label, `opening-now ${currentStatus.open ? "open" : "closed"}`);
  if (record.source?.retrievedAt) appendMeta(meta, `${state.language === "hu" ? "adat" : "data"}: ${record.source.retrievedAt}`);
  const actions = document.createElement("div"); actions.className = "result-actions";
  const phone = safePhone(record.phone);
  if (phone) { const call = document.createElement("button"); call.type = "button"; call.className = `call ${phone === "1830" ? "lower-level" : ""}`; call.textContent = `${ui("call")} ${record.phone}`; call.addEventListener("click", () => openCallOptions(phone)); actions.append(call); }
  if (record.coordinates) { const show = document.createElement("button"); show.type = "button"; show.textContent = ui("show"); show.addEventListener("click", () => focusRecord(record)); actions.append(show); }
  if (record.coordinates) { const route = document.createElement("button"); route.type = "button"; route.textContent = ui("route"); route.addEventListener("click", () => openNavigationOptions(record)); actions.append(route); }
  const details = document.createElement("button"); details.type = "button"; details.textContent = ui("recordDetails"); details.addEventListener("click", () => openRecordDetails(record)); actions.append(details);
  const websiteUrl = navigator.onLine ? safeUrl(record.website) : null;
  if (websiteUrl) { const website = document.createElement("a"); website.href = websiteUrl; website.target = "_blank"; website.rel = "noopener noreferrer"; website.textContent = ui("website"); actions.append(website); }
  article.append(titleRow, description, meta, actions); return article;
}
function appendMeta(container, value, className = "") { const span = document.createElement("span"); span.textContent = value; if (className) span.className = className; container.append(span); }

function detailRow(label, value, { href = null } = {}) {
  if (!value) return null;
  const paragraph = document.createElement("p"), strong = document.createElement("strong"); strong.textContent = `${label}: `; paragraph.append(strong);
  if (href) { const link = document.createElement("a"); link.href = href; link.textContent = value; link.target = href.startsWith("http") ? "_blank" : "_self"; link.rel = "noopener noreferrer"; paragraph.append(link); }
  else paragraph.append(document.createTextNode(value));
  return paragraph;
}

function contactUrl(service, value) {
  const direct = safeUrl(value); if (direct) return direct;
  const raw = String(value || "").trim(); if (!raw) return null;
  if (service === "Telegram") return `https://t.me/${raw.replace(/^@/, "")}`;
  if (service === "WhatsApp") { const digits = raw.replace(/\D/g, ""); return digits ? `https://wa.me/${digits}` : null; }
  return null;
}

function openingHoursBlock(value) {
  const section = document.createElement("section"), heading = document.createElement("h3"), list = document.createElement("ul");
  heading.textContent = state.language === "hu" ? "Teljes nyitvatartás" : "Full opening hours";
  const rules = String(value || "").split(";").map((item) => item.trim()).filter(Boolean);
  (rules.length ? rules : [state.language === "hu" ? "Nincs közzétéve." : "Not published."]).forEach((rule) => { const item = document.createElement("li"); item.textContent = rule.replaceAll("-", "–"); list.append(item); });
  section.append(heading, list); return section;
}

function openRecordDetails(record) {
  els.docDialogTitle.textContent = record.name;
  const nodes = [], location = recordLocation(record), phone = safePhone(record.phone), website = safeUrl(record.website), email = String(record.email || "").trim();
  nodes.push(detailRow(state.language === "hu" ? "Kategória" : "Category", categoryLabel(record.category)));
  nodes.push(detailRow(state.language === "hu" ? "Leírás" : "Description", record.description));
  nodes.push(detailRow(state.language === "hu" ? "Cím / tájékozódási pont" : "Address / landmark", location));
  if (record.coordinates) nodes.push(detailRow("GPS", `${record.coordinates.lat.toFixed(6)}, ${record.coordinates.lon.toFixed(6)}`, { href: navigator.onLine ? `https://www.openstreetmap.org/?mlat=${record.coordinates.lat}&mlon=${record.coordinates.lon}#map=17/${record.coordinates.lat}/${record.coordinates.lon}` : null }));
  nodes.push(detailRow(state.language === "hu" ? "Mai nyitvatartás" : "Today", todayOpening(record.openingHours)));
  nodes.push(detailRow(state.language === "hu" ? "Aktuális állapot" : "Current status", openingNow(record.openingHours)?.label));
  nodes.push(openingHoursBlock(record.openingHours));
  nodes.push(detailRow(state.language === "hu" ? "Telefon" : "Phone", record.phone, { href: phone ? `tel:${phone}` : null }));
  nodes.push(detailRow(state.language === "hu" ? "Mobil" : "Mobile", record.contacts?.mobile, { href: record.contacts?.mobile ? `tel:${safePhone(record.contacts.mobile)}` : null }));
  nodes.push(detailRow("Fax", record.contacts?.fax));
  nodes.push(detailRow("E-mail", email, { href: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? `mailto:${email}` : null }));
  if (navigator.onLine) {
    nodes.push(detailRow(state.language === "hu" ? "Weboldal" : "Website", website, { href: website }));
    nodes.push(detailRow("Facebook", safeUrl(record.contacts?.facebook), { href: safeUrl(record.contacts?.facebook) }));
    nodes.push(detailRow("Instagram", safeUrl(record.contacts?.instagram), { href: safeUrl(record.contacts?.instagram) }));
    for (const service of ["LinkedIn", "Twitter", "Mastodon", "YouTube", "Telegram", "WhatsApp"]) {
      const key = service.toLowerCase(), url = contactUrl(service, record.contacts?.[key]); nodes.push(detailRow(service, url, { href: url }));
    }
  }
  nodes.push(detailRow(state.language === "hu" ? "Hozzáférés" : "Access", record.access || record.accessibility?.access));
  nodes.push(detailRow(state.language === "hu" ? "Akadálymentesség" : "Wheelchair", record.wheelchair || record.accessibility?.wheelchair));
  const sourceUrls = [...new Set([record.source?.url, ...(record.source?.urls || [])].map(safeUrl).filter(Boolean))];
  sourceUrls.forEach((url, index) => nodes.push(detailRow(`${state.language === "hu" ? "Forrás" : "Source"}${sourceUrls.length > 1 ? ` ${index + 1}` : ""}`, record.source?.name && index === 0 ? record.source.name : url, { href: navigator.onLine ? url : null })));
  nodes.push(detailRow(state.language === "hu" ? "Adat ellenőrizve" : "Data checked", record.source?.checkedAt || record.source?.retrievedAt));
  if (record.coordinates) {
    const navigation = document.createElement("button"); navigation.type = "button"; navigation.className = "primary-button"; navigation.textContent = state.language === "hu" ? "ÚTVONAL / NAVIGÁCIÓ" : "ROUTE / NAVIGATION"; navigation.addEventListener("click", () => openNavigationOptions(record)); nodes.unshift(navigation);
  }
  els.docContent.replaceChildren(...nodes.filter(Boolean)); openDialog(els.docDialog);
}

function todayOpening(value, date = new Date()) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw === "24/7") return state.language === "hu" ? "Ma: 0–24" : "Today: 24 hours";
  const dayCodes = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], today = dayCodes[date.getDay()];
  let parsedDayRule = false;
  for (const part of raw.split(";").map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+(.+)$/);
    if (!match) {
      if (/^\d{2}:\d{2}-/.test(part)) return `${state.language === "hu" ? "Ma" : "Today"}: ${part.replaceAll("-", "–")}`;
      continue;
    }
    parsedDayRule = true;
    const start = dayCodes.indexOf(match[1]), end = dayCodes.indexOf(match[2] || match[1]), current = dayCodes.indexOf(today);
    const applies = start <= end ? current >= start && current <= end : current >= start || current <= end;
    if (applies) return `${state.language === "hu" ? "Ma" : "Today"}: ${match[3].replaceAll("-", "–")}`;
  }
  if (parsedDayRule) return state.language === "hu" ? "Ma: zárva" : "Today: closed";
  return `${state.language === "hu" ? "Nyitvatartás" : "Hours"}: ${raw}`;
}

function openingNow(value, date = new Date()) {
  if (!value) return null;
  const raw = String(value).trim();
  if (raw === "24/7") return { open: true, label: state.language === "hu" ? "● NYITVA MOST" : "● OPEN NOW" };
  const dayCodes = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], currentDay = date.getDay(), minutesNow = date.getHours() * 60 + date.getMinutes();
  let matchedDay = false;
  for (const part of raw.split(";").map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+(.+)$/);
    if (!match) continue;
    const start = dayCodes.indexOf(match[1]), end = dayCodes.indexOf(match[2] || match[1]);
    const applies = start <= end ? currentDay >= start && currentDay <= end : currentDay >= start || currentDay <= end;
    if (!applies) continue;
    matchedDay = true;
    if (/^(off|closed)$/i.test(match[3])) return { open: false, label: state.language === "hu" ? "● ZÁRVA" : "● CLOSED" };
    for (const range of match[3].split(",").map((item) => item.trim())) {
      const time = range.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/); if (!time) continue;
      const from = Number(time[1]) * 60 + Number(time[2]), to = Number(time[3]) * 60 + Number(time[4]);
      const open = from <= to ? minutesNow >= from && minutesNow < to : minutesNow >= from || minutesNow < to;
      if (open) return { open: true, label: state.language === "hu" ? "● NYITVA MOST" : "● OPEN NOW" };
    }
  }
  if (matchedDay) return { open: false, label: state.language === "hu" ? "● ZÁRVA" : "● CLOSED" };
  return null;
}

function recordLocation(record) {
  if (typeof record.address === "string" && record.address.trim()) return record.address.trim();
  if (record.address && typeof record.address === "object") {
    const street = [record.address.street || record.address.place, record.address.housenumber].filter(Boolean).join(" ");
    const address = [record.address.postcode, record.address.city || record.locality, street].filter(Boolean).join(" ");
    if (address) return address;
  }
  if (record.landmark) return [record.locality, record.landmark].filter(Boolean).join(" · ");
  const context = nearestMapContext(record);
  const parts = [record.locality || context.place, context.road ? `${context.road} ${state.language === "hu" ? "közelében" : "nearby"}` : null].filter(Boolean);
  return parts.join(" · ") || [record.region, record.country].filter(Boolean).join(" · ");
}

function nearestMapContext(record) {
  if (!record?.coordinates || !state.mapData?.features) return {};
  if (state.mapContextCache.has(record.id)) return state.mapContextCache.get(record.id);
  let bestRoad = null, bestRoadKm = Infinity, bestPlace = null, bestPlaceKm = Infinity;
  for (const feature of state.mapData.features) {
    const properties = feature.properties || {}, point = featureMidpoint(feature);
    if (!point || (!properties.name && !properties.ref)) continue;
    const distance = haversine(record.coordinates, { lat: point[0], lon: point[1] });
    if (properties.layer === "place" && distance < bestPlaceKm) { bestPlaceKm = distance; bestPlace = properties.name; }
    if (properties.layer === "road" && distance < bestRoadKm) { bestRoadKm = distance; bestRoad = properties.name || properties.ref; }
  }
  const result = { road: bestRoadKm <= 2 ? bestRoad : null, place: bestPlaceKm <= 25 ? bestPlace : null };
  state.mapContextCache.set(record.id, result); return result;
}

async function loadFirstAid() {
  try { state.firstAid = await fetchJson("./data/first-aid.json", false); els.guideState.textContent = ui("loaded"); els.guideState.className = "ready"; }
  catch { state.firstAid = null; els.guideState.textContent = ui("missing"); els.guideState.className = "missing"; }
}

function localEmergencyText(value) {
  const message = String(value || "");
  return state.emergencyNumber && state.emergencyNumber !== "112" ? message.replace(/\b112\b/g, state.emergencyNumber) : message;
}

function localGuideSteps(item) { return (item?.steps?.[state.language] || item?.steps?.en || []).map(localEmergencyText); }

function openGuide(intent) {
  state.activeIntent = intent; els.guideTitle.textContent = text(intent.title); els.guideSummary.textContent = text(intent.summary);
  els.guideSteps.replaceChildren(...localGuideSteps(intent).map((step) => { const li = document.createElement("li"); li.textContent = step; return li; }));
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
  speak([text(intent.title), text(intent.summary), ...localGuideSteps(intent)].join(". "));
}

function setupGuides() {
  els.guideSpeakButton.addEventListener("click", () => {
    if (!state.activeIntent) return;
    speak([text(state.activeIntent.title), text(state.activeIntent.summary), ...localGuideSteps(state.activeIntent)].join(". "));
  });
}

function selectCprMode(modeId, announce = true) {
  stopCpr(); state.cpr.mode = modeId;
  [els.handsOnlyButton, els.breathsButton].forEach((button) => button.classList.toggle("selected", button.dataset.mode === modeId));
  const mode = state.firstAid?.cprModes?.[modeId]; if (!mode) return;
  els.cprNow.hidden = false; els.cprCounter.textContent = state.language === "hu" ? "KÉSZ" : "READY";
  const ol = document.createElement("ol"); localGuideSteps(mode).forEach((step) => { const li = document.createElement("li"); li.textContent = step; ol.append(li); }); els.cprSteps.replaceChildren(ol);
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
  if (announce) speak([text(mode.label), text(mode.when), ...localGuideSteps(mode)].join(". "));
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
  const finish = ({ abort = false } = {}) => {
    if (state.micSession) state.micSession.active = false;
    clearTimeout(state.micSession?.timer);
    try { abort ? state.recognition?.abort() : state.recognition?.stop(); } catch {}
    state.recognition = null; state.micSession = null;
    els.micButton.classList.remove("listening"); els.micButton.textContent = ui("micOn"); els.micButton.setAttribute("aria-pressed", "false");
  };
  const startInstance = () => {
    const session = state.micSession;
    if (!session?.active || Date.now() >= session.deadline) { finish(); return; }
    const recognition = new Recognition(); state.recognition = recognition;
    recognition.lang = state.language === "hu" ? "hu-HU" : "en-US";
    recognition.interimResults = true; recognition.continuous = true; recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const phrase = String(event.results[index]?.[0]?.transcript || "").trim(); if (!phrase) continue;
        if (event.results[index].isFinal) session.transcript = `${session.transcript} ${phrase}`.trim(); else interim = `${interim} ${phrase}`.trim();
      }
      const transcript = `${session.transcript} ${interim}`.trim(); if (!transcript) return;
      els.searchInput.value = transcript; state.query = transcript; applyFilters();
    };
    recognition.onerror = (event) => {
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error)) {
        els.syncMessage.textContent = state.language === "hu" ? "A mikrofonengedély vagy a hangbemenet nem érhető el." : "Microphone permission or audio input is unavailable.";
        finish({ abort: true });
      }
    };
    recognition.onend = () => {
      state.recognition = null;
      if (session.active && Date.now() < session.deadline) setTimeout(startInstance, 180);
      else finish();
    };
    try { recognition.start(); }
    catch { els.syncMessage.textContent = state.language === "hu" ? "A beszédbevitel nem indult el." : "Speech input did not start."; finish({ abort: true }); }
  };
  const waitForTtsAndStart = () => {
    const started = Date.now();
    const wait = () => {
      if (!state.micSession?.active) return;
      if (!window.speechSynthesis?.speaking || Date.now() - started > 1400) startInstance();
      else setTimeout(wait, 60);
    };
    wait();
  };
  els.micButton.addEventListener("click", () => {
    if (!Recognition) { els.syncMessage.textContent = state.language === "hu" ? "A beszédbevitel itt nem érhető el; a gépelés működik." : "Speech input is unavailable here; typing works."; return; }
    if (state.micSession?.active) { finish(); return; }
    window.speechSynthesis?.cancel();
    state.micSession = { active: true, deadline: Date.now() + 30000, transcript: "" };
    state.micSession.timer = setTimeout(() => finish(), 30250);
    els.micButton.classList.add("listening"); els.micButton.textContent = ui("micStop"); els.micButton.setAttribute("aria-pressed", "true");
    els.syncMessage.textContent = state.language === "hu" ? "A mikrofon legfeljebb 30 másodpercig figyel." : "The microphone listens for up to 30 seconds.";
    navigator.vibrate?.(35);
    waitForTtsAndStart();
  });
}

function roadStyle(feature) {
  const layer = feature.properties?.layer, klass = feature.properties?.class;
  if (layer === "landuse") {
    const colors = { residential: "#e8e5df", commercial: "#eadbd7", retail: "#eadbd7", industrial: "#ddd9d0", forest: "#c9dfc4", meadow: "#d9e9c9", grass: "#d9e9c9", cemetery: "#cfdfcf" };
    return { color: "#bcc7bd", fillColor: colors[klass] || "#e4e7df", fillOpacity: .72, weight: .55 };
  }
  if (layer === "water") return { color: "#6fb6d9", fillColor: "#b8dded", fillOpacity: .85, weight: 1 };
  if (layer === "waterway") return { color: "#55a8d1", weight: klass === "river" ? 3 : 1.6, opacity: .9 };
  if (layer === "railway") return { color: "#555c58", weight: 2.2, opacity: .82, dashArray: "8 5" };
  if (layer === "boundary") return { color: "#8172a8", weight: 1.2, opacity: .72, dashArray: "5 4" };
  if (layer === "road") {
    const major = ["motorway", "trunk", "primary"].includes(klass), medium = ["secondary", "tertiary"].includes(klass), trail = ["path", "footway", "cycleway", "track"].includes(klass);
    const motorway = ["motorway", "motorway_link"].includes(klass);
    return { color: trail ? "#81765f" : motorway ? "#ed7664" : major ? "#e9a24f" : medium ? "#f3d184" : "#fffefa", weight: motorway ? 5.4 : major ? 4.6 : medium ? 3.5 : trail ? 1.4 : 2.6, opacity: trail ? .8 : 1, dashArray: trail ? "5 4" : null, lineCap: "round", lineJoin: "round" };
  }
  if (["LineString", "MultiLineString"].includes(feature.geometry?.type)) return { color: "#65756e", weight: 2, opacity: .82 };
  if (["Polygon", "MultiPolygon"].includes(feature.geometry?.type)) return { color: "#71827a", fillColor: "#dfe8e2", fillOpacity: .42, weight: 1 };
  return { color: "#31584a", weight: 1, fillOpacity: .7 };
}

function roadCasingStyle(feature) {
  if (feature.properties?.layer !== "road") return { color: "transparent", weight: 0, opacity: 0 };
  const klass = feature.properties?.class, major = ["motorway", "motorway_link", "trunk", "trunk_link", "primary", "primary_link"].includes(klass), trail = ["path", "footway", "cycleway", "track"].includes(klass);
  return { color: trail ? "transparent" : "#6b746f", weight: major ? 7.2 : 4.4, opacity: trail ? 0 : .48, lineCap: "round", lineJoin: "round" };
}

function featureMidpoint(feature) {
  if (feature.geometry?.type === "Point") return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
  const points = [];
  const collect = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) { points.push(value); return; }
    value.forEach(collect);
  };
  collect(feature.geometry?.coordinates);
  if (!points.length) return null;
  const point = points[Math.floor(points.length / 2)];
  return [point[1], point[0]];
}

function renderMapLabels() {
  if (!state.map || !state.mapData || !state.mapLabelLayer) return;
  state.mapLabelLayer.clearLayers();
  const zoom = state.map.getZoom(), bounds = state.map.getBounds().pad(.12), used = new Set();
  const candidates = state.mapData.features.filter((feature) => {
    const properties = feature.properties || {}, point = featureMidpoint(feature);
    if (!point || !bounds.contains(point)) return false;
    const namedPoint = feature.geometry?.type === "Point" && properties.name;
    const namedLine = ["LineString", "MultiLineString"].includes(feature.geometry?.type) && (properties.name || properties.ref);
    if (properties.layer === "place" || (!properties.layer && namedPoint)) return zoom >= 10 && (zoom >= 13 || !properties.class || ["city", "town", "village"].includes(properties.class));
    if (!(properties.layer === "road" || (!properties.layer && namedLine)) || zoom < 12 || (!properties.name && !properties.ref)) return false;
    if (zoom < 14) return ["motorway", "trunk", "primary", "secondary"].includes(properties.class);
    if (zoom < 15) return !["path", "footway", "cycleway", "track", "service"].includes(properties.class);
    return true;
  });
  const limit = zoom >= 16 ? 180 : zoom >= 14 ? 110 : 60;
  for (const feature of candidates) {
    if (used.size >= limit) break;
    const properties = feature.properties || {}, point = featureMidpoint(feature);
    const placeFeature = properties.layer === "place" || (!properties.layer && feature.geometry?.type === "Point");
    const key = `${placeFeature ? "place" : "road"}:${properties.name || ""}:${properties.ref || ""}`;
    if (used.has(key)) continue;
    used.add(key);
    let html, className;
    if (placeFeature) {
      html = `<span>${escapeHtml(properties.name)}</span>`; className = "map-text-label map-place-label";
    } else {
      const label = properties.name || properties.ref;
      const ref = properties.ref && properties.ref !== properties.name ? ` <b class="road-ref">${escapeHtml(properties.ref)}</b>` : "";
      html = `<span>${escapeHtml(label)}${ref}</span>`; className = "map-text-label map-road-label";
    }
    L.marker(point, { interactive: false, keyboard: false, pane: "labelPane", icon: L.divIcon({ className, html, iconSize: [1, 1], iconAnchor: [0, 0] }) }).addTo(state.mapLabelLayer);
  }
}

function showLocalMap({ constrain = !navigator.onLine } = {}) {
  if (!state.map || !state.localMapLoaded) return;
  if (constrain && state.localMapBounds) {
    state.map.setMinZoom(state.localMapMinZoom); state.map.setMaxBounds(state.localMapBounds.pad(.18));
    if (!state.localMapBounds.contains(state.map.getCenter())) state.map.fitBounds(state.localMapBounds, { padding: [12, 12] });
  }
  [state.mapCasingLayer, state.mapLayer, state.mapLabelLayer].forEach((layer) => { if (layer && !state.map.hasLayer(layer)) layer.addTo(state.map); });
  renderMapLabels();
  els.mapStatus.textContent = state.language === "hu" ? `Telepített offline régió: ${state.mapData.features.length} térképelem` : `Installed offline region: ${state.mapData.features.length} map features`;
}

function updateBaseMap() {
  if (!state.map) return;
  if (!navigator.onLine) {
    if (state.onlineTileLayer && state.map.hasLayer(state.onlineTileLayer)) state.map.removeLayer(state.onlineTileLayer);
    state.onlineTileReady = false; showLocalMap({ constrain: true }); return;
  }
  state.map.setMinZoom(2); state.map.setMaxBounds(null);
  if (state.onlineTileReady) {
    [state.mapCasingLayer, state.mapLayer, state.mapLabelLayer].forEach((layer) => { if (layer && state.map.hasLayer(layer)) state.map.removeLayer(layer); });
    els.mapStatus.textContent = state.language === "hu" ? "Online, feliratozott globális OpenStreetMap" : "Online labelled global OpenStreetMap";
  }
  if (!state.onlineTileLayer) {
    state.onlineTileLayer = L.tileLayer(ONLINE_TILE_URL, { minZoom: 0, maxZoom: 19, maxNativeZoom: 19, attribution: "© OpenStreetMap contributors", updateWhenIdle: true, keepBuffer: 2 });
    state.onlineTileLayer.on("tileload", () => {
      if (state.onlineTileReady) return;
      state.onlineTileReady = true;
      [state.mapCasingLayer, state.mapLayer, state.mapLabelLayer].forEach((layer) => { if (layer && state.map.hasLayer(layer)) state.map.removeLayer(layer); });
      els.mapStatus.textContent = state.language === "hu" ? "Online, feliratozott OpenStreetMap" : "Online labelled OpenStreetMap";
    });
    state.onlineTileLayer.on("tileerror", () => { if (!state.onlineTileReady) showLocalMap(); });
  }
  if (!state.map.hasLayer(state.onlineTileLayer)) state.onlineTileLayer.addTo(state.map).bringToBack();
}

async function setupMap() {
  if (!window.L) { els.mapStatus.textContent = state.language === "hu" ? "A listanézet használható." : "List view is available."; els.mapState.textContent = ui("missing"); els.mapState.className = "missing"; return; }
  const initialCenter = state.userLocation ? [state.userLocation.lat, state.userLocation.lon] : DEFAULT_CENTER;
  state.map = L.map("streetMap", { zoomControl: false, attributionControl: true, minZoom: 2, maxZoom: 19, preferCanvas: true, tap: true, zoomSnap: .5 }).setView(initialCenter, 14.5);
  state.map.createPane("labelPane"); state.map.getPane("labelPane").style.zIndex = "450"; state.map.getPane("labelPane").style.pointerEvents = "none";
  state.map.attributionControl.setPrefix(false); state.map.attributionControl.addAttribution("© OpenStreetMap contributors");
  L.control.scale({ imperial: false, maxWidth: 120 }).addTo(state.map);
  els.zoomIn.addEventListener("click", () => state.map.zoomIn()); els.zoomOut.addEventListener("click", () => state.map.zoomOut());
  els.resetMap.addEventListener("click", () => {
    if (state.userLocation) state.map.setView([state.userLocation.lat, state.userLocation.lon], 17);
    else if (state.localMapBounds) state.map.fitBounds(state.localMapBounds, { padding: [12, 12] });
    else state.map.setView(DEFAULT_CENTER, 14.5);
  });
  try {
    state.catalog ||= await fetchJson("./data/catalog.json", navigator.onLine).catch(() => null);
    const activeMapId = await getMeta("activeMapId").catch(() => null), stored = await getStoredMap(activeMapId).catch(() => null);
    if (stored?.data) await applyOfflineMap(stored.data, stored, false);
    else {
      const descriptor = state.catalog?.maps?.find((item) => item.id === activeMapId) || state.catalog?.maps?.find((item) => item.defaultInstall) || { id: "reference-map", name: "Reference region", url: "./data/maps/hu-zala-south.geojson" };
      await applyOfflineMap(await fetchJson(descriptor.url, false), descriptor, false);
    }
    state.map.on("zoomend moveend", () => { if (!state.onlineTileReady) renderMapLabels(); });
  } catch { els.mapStatus.textContent = state.language === "hu" ? "A listanézet használható." : "List view is available."; els.mapState.textContent = ui("missing"); els.mapState.className = "missing"; }
  state.poiLayer = L.layerGroup().addTo(state.map); renderPoiLayer(); updateBaseMap(); setTimeout(() => state.map.invalidateSize(), 100);
}

async function ensureOfflineMapForPoint(point, { force = false } = {}) {
  if (!point || !state.map) return null;
  const currentCovers = pointInBbox(point, state.mapData?.bbox);
  if (currentCovers && (!force || state.activeMapDescriptor?.userImported)) return state.activeMapDescriptor;
  const descriptor = state.catalog?.maps?.find((item) => pointInBbox(point, item.bbox));
  if (descriptor && (force || descriptor.id !== state.activeMapDescriptor?.id)) {
    const stored = await getStoredMap(descriptor.id).catch(() => null);
    let mapData = stored?.data;
    if (!mapData && navigator.onLine) mapData = await fetchJson(descriptor.url, true).catch(() => null);
    if (mapData) { await setMeta("activeMapId", descriptor.id).catch(() => {}); await applyOfflineMap(mapData, stored || descriptor, false); return stored || descriptor; }
  }
  return fetchNearbyOfflineMap(point, { force });
}

async function applyOfflineMap(mapData, descriptor = {}, focus = true) {
  if (!state.map || !validMapData(mapData)) throw new Error(state.language === "hu" ? "Érvénytelen térképcsomag." : "Invalid map pack.");
  [state.mapCasingLayer, state.mapLayer, state.mapLabelLayer].forEach((layer) => { if (layer) state.map.removeLayer(layer); });
  state.mapData = mapData; state.activeMapDescriptor = descriptor;
  const bbox = mapData.bbox || geoJsonBbox(mapData);
  state.mapData.bbox = bbox; state.localMapBounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
  const configuredMin = Number(descriptor.minZoom ?? mapData.metadata?.zoomRange?.[0]);
  state.localMapMinZoom = Number.isFinite(configuredMin) ? Math.max(2, Math.min(16, configuredMin)) : Math.max(2, state.map.getBoundsZoom(state.localMapBounds) - 1);
  state.mapCasingLayer = L.geoJSON(mapData, { renderer: L.canvas({ padding: .4 }), filter: (feature) => feature.properties?.layer === "road", style: roadCasingStyle }).addTo(state.map);
  state.mapLayer = L.geoJSON(mapData, {
    renderer: L.canvas({ padding: .4 }), style: roadStyle,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: feature.properties?.class === "city" ? 4 : 2.5, color: "#31584a", fillColor: "#fff", fillOpacity: .92, weight: 1 })
  }).addTo(state.map);
  state.mapLabelLayer = L.layerGroup().addTo(state.map); state.localMapLoaded = true; state.mapContextCache.clear(); renderMapLabels();
  if (focus || !navigator.onLine) state.map.fitBounds(state.localMapBounds, { padding: [12, 12] });
  els.mapStatus.textContent = state.language === "hu" ? `${mapData.features.length} offline térképelem használatra kész` : `${mapData.features.length} offline map features ready`;
  els.mapState.textContent = ui("loaded"); els.mapState.className = "ready"; updateBaseMap();
}

function validMapData(value) {
  return value?.type === "FeatureCollection" && Array.isArray(value.features) && value.features.length > 0 && (validMapBbox(value.bbox) || Boolean(geoJsonBbox(value)));
}

function validMapBbox(bbox) {
  return Array.isArray(bbox) && bbox.length === 4 && bbox.every(Number.isFinite) && bbox[0] >= -180 && bbox[2] <= 180 && bbox[1] >= -90 && bbox[3] <= 90 && bbox[0] <= bbox[2] && bbox[1] <= bbox[3];
}

function geoJsonBbox(collection) {
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  const visit = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) { west = Math.min(west, value[0]); east = Math.max(east, value[0]); south = Math.min(south, value[1]); north = Math.max(north, value[1]); return; }
    value.forEach(visit);
  };
  collection?.features?.forEach((feature) => visit(feature.geometry?.coordinates));
  const bbox = [west, south, east, north]; return validMapBbox(bbox) ? bbox : null;
}

function markerColor(category) { if (category === "aed") return "#e0002b"; if (["hospital", "hospital_emergency", "doctor", "clinic", "pharmacy", "medical_supply"].includes(category)) return "#b500cf"; if (["drinking_water", "toilets", "accessible_toilets"].includes(category)) return "#087fbd"; return "#e1453b"; }

function renderPoiLayer() {
  if (!state.map || !state.poiLayer) return;
  state.poiLayer.clearLayers(); state.recordMarkers.clear();
  state.visibleRecords.forEach((record) => {
    if (!record.coordinates) return;
    const marker = L.circleMarker([record.coordinates.lat, record.coordinates.lon], { radius: record.category === "aed" ? 8 : 6, color: "#fff", weight: 2, fillColor: markerColor(record.category), fillOpacity: .95, pane: "markerPane" });
    const location = recordLocation(record), hours = todayOpening(record.openingHours), currentStatus = openingNow(record.openingHours)?.label;
    marker.bindPopup(`<strong>${escapeHtml(record.name)}</strong><br>${escapeHtml(categoryLabel(record.category))}${location ? `<br>⌖ ${escapeHtml(location)}` : ""}<br>GPS ${record.coordinates.lat.toFixed(6)}, ${record.coordinates.lon.toFixed(6)}${hours ? `<br>◷ ${escapeHtml(hours)}` : ""}${currentStatus ? `<br>${escapeHtml(currentStatus)}` : ""}`, { maxWidth: 300 });
    marker.addTo(state.poiLayer); state.recordMarkers.set(record.id, marker);
  });
}

function focusRecord(record) {
  if (!state.map || !record.coordinates) return;
  state.map.setView([record.coordinates.lat, record.coordinates.lon], 17, { animate: true }); state.recordMarkers.get(record.id)?.openPopup(); document.getElementById("mapFrame")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderUserLocation({ focus = false } = {}) {
  if (!state.map || !state.userLocation) return;
  state.userLayer?.remove(); state.userLayer = L.layerGroup().addTo(state.map);
  if (Number.isFinite(state.userLocation.accuracy) && state.userLocation.accuracy > 0) L.circle([state.userLocation.lat, state.userLocation.lon], { radius: state.userLocation.accuracy, color: "#1479cf", fillColor: "#69baff", fillOpacity: .13, weight: 1 }).addTo(state.userLayer);
  L.circleMarker([state.userLocation.lat, state.userLocation.lon], { radius: 7, color: "#fff", fillColor: "#1479cf", fillOpacity: 1, weight: 2 }).addTo(state.userLayer);
  if (focus && (navigator.onLine || pointInBbox(state.userLocation, state.mapData?.bbox))) state.map.setView([state.userLocation.lat, state.userLocation.lon], 17, { animate: true });
}

function navigationAction(label, href, className = "secondary-link") {
  const link = document.createElement("a"); link.className = className; link.href = href; link.textContent = label; link.rel = "noopener noreferrer"; return link;
}

function openNavigationOptions(record) {
  if (!record?.coordinates) return;
  const { lat, lon } = record.coordinates, name = record.name || "PROXAID", location = recordLocation(record);
  const encodedName = encodeURIComponent(name), encodedDestination = encodeURIComponent(`${lat},${lon}`), ios = /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent);
  const deviceHref = ios ? `maps://?daddr=${lat},${lon}&q=${encodedName}` : `geo:0,0?q=${lat},${lon}(${encodedName})`;
  const nodes = [detailRow(state.language === "hu" ? "Cél" : "Destination", name), detailRow(state.language === "hu" ? "Cím / tájékozódási pont" : "Address / landmark", location), detailRow("GPS", `${lat.toFixed(6)}, ${lon.toFixed(6)}`)];
  const actions = document.createElement("div"); actions.className = "action-row";
  actions.append(navigationAction(state.language === "hu" ? "ESZKÖZ TÉRKÉPE" : "DEVICE MAP", deviceHref, "primary-button"));
  if (navigator.onLine) {
    actions.append(navigationAction("GOOGLE MAPS", `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`));
    actions.append(navigationAction("APPLE MAPS", `https://maps.apple.com/?daddr=${encodedDestination}&dirflg=d`));
    actions.append(navigationAction("OPENSTREETMAP", `https://www.openstreetmap.org/directions?to=${encodedDestination}`));
  }
  const copy = document.createElement("button"); copy.type = "button"; copy.className = "secondary-button"; copy.textContent = state.language === "hu" ? "CÍM + GPS MÁSOLÁSA" : "COPY ADDRESS + GPS"; copy.addEventListener("click", async () => { const copied = await copyToClipboard(`${name}\n${location || ""}\n${lat}, ${lon}`); els.syncMessage.textContent = copied ? ui("copied") : (state.language === "hu" ? "A másolás nem sikerült." : "Copy failed."); }); actions.append(copy);
  const share = document.createElement("button"); share.type = "button"; share.className = "secondary-button"; share.textContent = state.language === "hu" ? "CÉL MEGOSZTÁSA" : "SHARE DESTINATION"; share.addEventListener("click", () => sharePayload(`${name}\n${location || ""}\ngeo:${lat},${lon}?z=17`, "PROXAID destination")); actions.append(share);
  nodes.push(actions); els.docDialogTitle.textContent = state.language === "hu" ? "Útvonal és navigáció" : "Route and navigation"; els.docContent.replaceChildren(...nodes.filter(Boolean)); openDialog(els.docDialog);
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }

function locateUser() {
  if (!("geolocation" in navigator)) { els.syncMessage.textContent = state.language === "hu" ? "A helymeghatározás nem érhető el." : "Location is unavailable."; return; }
  els.locateButton.disabled = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    state.userLocation = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy, capturedAt: new Date().toISOString() };
    await setMeta("lastLocation", state.userLocation).catch(() => {});
    if (state.map) {
      renderUserLocation({ focus: true });
      if (!navigator.onLine && state.mapData?.bbox && !pointInBbox(state.userLocation, state.mapData.bbox)) els.mapStatus.textContent = state.language === "hu" ? "Ehhez a helyhez még nincs letöltött offline térképcsomag." : "No downloaded offline map pack covers this location yet.";
    }
    if (!els.hubLocation.value) els.hubLocation.value = `${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lon.toFixed(6)}`;
    els.locateButton.disabled = false; els.locateButton.textContent = `⌖ ±${Math.round(state.userLocation.accuracy)} m`; applyFilters();
    if (navigator.onLine) await syncData({ reason: "location" });
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

function updateNetworkStatus() { const online = navigator.onLine; els.networkBadge.textContent = online ? ui("online") : ui("offline"); els.networkBadge.classList.toggle("online", online); els.networkBadge.classList.toggle("offline", !online); updateBaseMap(); if (state.cpr.mode) selectCprMode(state.cpr.mode, false); }

function updateEmergencyNumberUi() {
  const number = safePhone(state.emergencyNumber) || DEFAULT_EMERGENCY_NUMBER; state.emergencyNumber = number;
  if (els.emergencyCall) { els.emergencyCall.href = `tel:${number}`; els.emergencyCall.innerHTML = state.language === "hu" ? `HÍVÁS <strong>${escapeHtml(number)}</strong>` : `CALL <strong>${escapeHtml(number)}</strong>`; }
  if (els.callNumberInput && document.activeElement !== els.callNumberInput) els.callNumberInput.value = number;
}

function setEmergencyNumber(value) {
  const number = safePhone(value);
  if (!number) { els.deviceMessage.textContent = state.language === "hu" ? "Adj meg hívható segélyhívó számot." : "Enter a callable emergency number."; return false; }
  state.emergencyNumber = number; writeLocal("proxaid-emergency-number", number); updateEmergencyNumberUi(); return true;
}

function openStorageHelp() {
  const ua = navigator.userAgent.toLowerCase(); let html;
  if (/iphone|ipad|ipod/.test(ua)) html = "<p><strong>iPhone / iPad:</strong> Beállítások → Általános → iPhone/iPad tárhely. Töröld a nem szükséges letöltéseket vagy alkalmazásokat.</p>";
  else if (/android/.test(ua)) html = '<p><a class="secondary-link" href="intent:#Intent;action=android.settings.INTERNAL_STORAGE_SETTINGS;end">BEÁLLÍTÁSOK MEGNYITÁSA</a></p><p><strong>Android:</strong> Beállítások → Tárhely, vagy Alkalmazások → böngésző → Tárhely.</p>';
  else if (/windows/.test(ua)) html = "<p><strong>Windows:</strong> Beállítások → Rendszer → Tárterület.</p>";
  else if (/mac/.test(ua)) html = "<p><strong>macOS:</strong> Rendszerbeállítások → Általános → Tárhely.</p>";
  else html = "<p><strong>Linux:</strong> Nyisd meg a rendszer tárhely- vagy lemezkezelőjét, és szabadíts fel helyet.</p>";
  els.storageInstructions.innerHTML = html; openDialog(els.storageDialog);
}

function callOptions(number, { includeSos = false } = {}) {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), sosText = emergencyPayload(number);
  return [
    { id: "tel", label: state.language === "hu" ? `HÍVÁS EZEN AZ ESZKÖZÖN · ${number}` : `CALL ON THIS DEVICE · ${number}`, href: `tel:${number}`, primary: true },
    includeSos ? { id: "sms", label: state.language === "hu" ? "SOS SZÖVEG ÁTADÁSA SMS-NEK" : "HAND SOS TEXT TO SMS", href: `sms:${ios ? "&" : "?"}body=${encodeURIComponent(sosText)}` } : null,
    { id: "system", label: state.language === "hu" ? "ÁTADÁS TELEPÍTETT APPNAK" : "HAND OFF TO AN INSTALLED APP", action: () => sharePayload(`${state.language === "hu" ? "Hívandó szám" : "Number to call"}: ${number}`, "PROXAID") },
    { id: "copy", label: state.language === "hu" ? "TELEFONSZÁM MÁSOLÁSA" : "COPY PHONE NUMBER", action: async () => { const copied = await copyToClipboard(number); els.deviceMessage.textContent = copied ? ui("copied") : (state.language === "hu" ? "A másolás nem sikerült." : "Copy failed."); } }
  ].filter(Boolean);
}

function openCallOptions(number = state.emergencyNumber, { editable = false } = {}) {
  els.callNumberLabel.hidden = !editable; els.useCallNumberButton.hidden = !editable;
  if (editable) els.callNumberInput.value = state.emergencyNumber;
  const options = callOptions(number, { includeSos: editable });
  const nodes = options.map((option) => {
    const row = document.createElement("div"); row.className = "call-option";
    const link = document.createElement(option.href ? "a" : "button"); link.textContent = option.label; link.className = "handler-button";
    if (option.href) link.href = option.href; else { link.type = "button"; link.addEventListener("click", option.action); }
    row.append(link); return row;
  });
  els.callOptions.replaceChildren(...nodes);
  els.callQr.replaceChildren();
  try {
    const qr = qrcode(0, "M"); qr.addData(`tel:${number}`, "Byte"); qr.make(); els.callQr.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 3, scalable: true });
  } catch { els.callQr.textContent = number; }
  openDialog(els.callDialog);
}

function emergencyPayload(number = state.emergencyNumber) {
  const location = state.userLocation ? `geo:${state.userLocation.lat},${state.userLocation.lon}?z=17` : (state.language === "hu" ? "helyzet nincs megadva" : "location unavailable");
  return `PROXAID SOS\n${new Date().toISOString()}\n${location}\nEmergency: ${number}`;
}

async function sharePayload(payload = emergencyPayload(), title = "PROXAID SOS") {
  if (navigator.share) { await navigator.share({ title, text: payload }).catch(() => {}); return; }
  const copied = await copyToClipboard(payload); els.deviceMessage.textContent = copied ? (state.language === "hu" ? "A segélycsomag a vágólapra került." : "Emergency payload copied.") : (state.language === "hu" ? "A másolás nem sikerült." : "Copy failed.");
}

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(value); return true; } catch {} }
  const field = document.createElement("textarea"); field.value = value; field.setAttribute("readonly", ""); field.style.position = "fixed"; field.style.opacity = "0"; document.body.append(field); field.select(); field.setSelectionRange(0, value.length);
  let copied = false; try { copied = document.execCommand("copy"); } catch {} field.remove(); return copied;
}

function payloadChecksum(value) {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function numericValue(element) { return Math.max(0, Math.min(9999, Number.parseInt(element.value, 10) || 0)); }
function savedHeroHub() { try { return JSON.parse(readLocal("proxaid-herohub") || "null"); } catch { return null; } }

function buildHeroHubPayload() {
  const saved = savedHeroHub();
  const position = state.userLocation ? { lat: Number(state.userLocation.lat.toFixed(6)), lon: Number(state.userLocation.lon.toFixed(6)), accuracyM: Math.round(state.userLocation.accuracy || 0) } : null;
  const packet = {
    schema: "proxaid.herohub/1", id: saved?.id || `PX-${Date.now().toString(36).toUpperCase()}`,
    updated: new Date().toISOString(), status: "draft", position,
    location: els.hubLocation.value.trim().slice(0, 140), hazards: els.hubHazards.value.trim().slice(0, 160),
    observed: { total: numericValue(els.hubTotal), criticalBreathing: numericValue(els.hubCritical), severeBleeding: numericValue(els.hubBleeding), trapped: numericValue(els.hubTrapped) },
    notes: els.hubNotes.value.trim().slice(0, 280), contact: els.hubContact.value.trim().slice(0, 100)
  };
  const unsigned = JSON.stringify(packet); packet.checksum = payloadChecksum(unsigned);
  state.heroHubPayload = JSON.stringify(packet);
  writeLocal("proxaid-herohub", state.heroHubPayload);
  renderHeroHub(packet);
  return state.heroHubPayload;
}

function heroHubHumanText(packet) {
  const location = packet.position ? `${packet.position.lat}, ${packet.position.lon} ±${packet.position.accuracyM} m` : packet.location || "—";
  return [
    `PROXAID HeroHUB ${packet.id}`, `Updated: ${packet.updated}`, `Location: ${location}`,
    `Hazards: ${packet.hazards || "—"}`, `Estimated affected: ${packet.observed.total}`,
    `Unresponsive / abnormal breathing: ${packet.observed.criticalBreathing}`, `Severe bleeding: ${packet.observed.severeBleeding}`,
    `Trapped: ${packet.observed.trapped}`, `Access / notes: ${packet.notes || "—"}`, `Contact: ${packet.contact || "—"}`,
    `Status: ${packet.status}`, `Checksum: ${packet.checksum}`
  ].join("\n");
}

function renderHeroHub(packet) {
  els.heroHubPreview.textContent = heroHubHumanText(packet);
  els.heroHubQr.replaceChildren();
  try {
    const qr = qrcode(0, "M"); qr.addData(state.heroHubPayload, "Byte"); qr.make();
    els.heroHubQr.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 4, scalable: true });
  } catch {
    els.heroHubQr.textContent = state.language === "hu" ? "A csomag túl hosszú a QR-kódhoz; rövidítsd a szöveges mezőket." : "The packet is too long for QR; shorten the text fields.";
  }
}

function loadHeroHub() {
  const saved = savedHeroHub();
  if (!saved) return;
  els.hubLocation.value = saved.location || ""; els.hubHazards.value = saved.hazards || "";
  els.hubTotal.value = saved.observed?.total || 0; els.hubCritical.value = saved.observed?.criticalBreathing || 0;
  els.hubBleeding.value = saved.observed?.severeBleeding || 0; els.hubTrapped.value = saved.observed?.trapped || 0;
  els.hubNotes.value = saved.notes || ""; els.hubContact.value = saved.contact || "";
  state.heroHubPayload = JSON.stringify(saved); renderHeroHub(saved);
}

function savedMedicalCard() { try { return JSON.parse(readLocal("proxaid-medical-card") || "null"); } catch { return null; } }

function medicalCardFromForm() {
  return {
    schema: "proxaid.medical-card/1", updated: new Date().toISOString(),
    name: els.medicalName.value.trim().slice(0, 80) || null, birthDate: els.medicalBirthDate.value || null,
    bloodType: els.medicalBloodType.value || "unknown", donor: els.medicalDonor.value || "unknown",
    allergies: els.medicalAllergies.value.trim().slice(0, 240) || null, medications: els.medicalMedications.value.trim().slice(0, 240) || null,
    conditions: els.medicalConditions.value.trim().slice(0, 240) || null, implants: els.medicalImplants.value.trim().slice(0, 200) || null,
    emergencyContact: els.medicalContact.value.trim().slice(0, 120) || null, notes: els.medicalNotes.value.trim().slice(0, 240) || null
  };
}

function medicalCardHumanText(card) {
  const donor = card.donor === "yes" ? (state.language === "hu" ? "igen" : "yes") : card.donor === "no" ? (state.language === "hu" ? "nem" : "no") : (state.language === "hu" ? "nincs megadva" : "not specified");
  const rows = state.language === "hu"
    ? [["Név", card.name], ["Születési dátum", card.birthDate], ["Vércsoport", card.bloodType === "unknown" ? "ismeretlen" : card.bloodType], ["Donornyilatkozat", donor], ["Allergiák", card.allergies], ["Gyógyszerek / véralvadásgátló", card.medications], ["Betegségek / kórelőzmény", card.conditions], ["Implantátum", card.implants], ["Vészhelyzeti kapcsolat", card.emergencyContact], ["Egyéb", card.notes]]
    : [["Name", card.name], ["Date of birth", card.birthDate], ["Blood type", card.bloodType === "unknown" ? "unknown" : card.bloodType], ["Donor declaration", donor], ["Allergies", card.allergies], ["Medication / anticoagulant", card.medications], ["Conditions / history", card.conditions], ["Implant", card.implants], ["Emergency contact", card.emergencyContact], ["Other", card.notes]];
  return [`PROXAID MEDICAL CARD`, `Updated: ${card.updated}`, ...rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`)].join("\n");
}

function populateMedicalCard(card) {
  if (!card) { els.medicalCardForm.reset(); return; }
  els.medicalName.value = card.name || ""; els.medicalBirthDate.value = card.birthDate || ""; els.medicalBloodType.value = card.bloodType || "unknown"; els.medicalDonor.value = card.donor || "unknown";
  els.medicalAllergies.value = card.allergies || ""; els.medicalMedications.value = card.medications || ""; els.medicalConditions.value = card.conditions || ""; els.medicalImplants.value = card.implants || ""; els.medicalContact.value = card.emergencyContact || ""; els.medicalNotes.value = card.notes || "";
}

function renderMedicalCard(card) {
  els.medicalCardQr.replaceChildren();
  if (!card) { els.medicalCardPreview.textContent = state.language === "hu" ? "Nincs mentett vészkártya." : "No saved medical card."; return; }
  const payload = JSON.stringify(card); els.medicalCardPreview.textContent = medicalCardHumanText(card);
  try { const qr = qrcode(0, "M"); qr.addData(payload, "Byte"); qr.make(); els.medicalCardQr.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true }); }
  catch { els.medicalCardQr.textContent = state.language === "hu" ? "A kártya túl hosszú a QR-kódhoz; rövidítsd a mezőket." : "The card is too long for QR; shorten the fields."; }
}

function setupMedicalCard() {
  els.medicalCardButton.addEventListener("click", () => { const card = savedMedicalCard(); populateMedicalCard(card); renderMedicalCard(card); openDialog(els.medicalCardDialog); });
  els.medicalSaveButton.addEventListener("click", () => { const card = medicalCardFromForm(); const saved = writeLocal("proxaid-medical-card", JSON.stringify(card)); renderMedicalCard(card); els.medicalCardMessage.textContent = saved ? (state.language === "hu" ? "A vészkártya ezen az alkalmazáspéldányon mentve." : "Medical card saved in this app instance.") : (state.language === "hu" ? "A helyi mentés nem sikerült." : "Local save failed."); });
  els.medicalNfcButton.addEventListener("click", () => { const card = savedMedicalCard() || medicalCardFromForm(); writeNfc(JSON.stringify(card), els.medicalCardMessage); });
  els.medicalShareButton.addEventListener("click", () => { const card = savedMedicalCard() || medicalCardFromForm(); sharePayload(medicalCardHumanText(card), "PROXAID medical card"); });
  els.medicalClearButton.addEventListener("click", () => { removeLocal("proxaid-medical-card"); els.medicalCardForm.reset(); renderMedicalCard(null); els.medicalCardMessage.textContent = state.language === "hu" ? "A helyi vészkártya törölve." : "Local medical card deleted."; });
}

async function writeNfc(payload, messageElement = els.nfcMessage) {
  if (!("NDEFReader" in window)) { messageElement.textContent = state.language === "hu" ? "Az NFC itt nem érhető el; használd a QR-kódot vagy a Megosztást." : "NFC is unavailable here; use QR or Share."; return false; }
  try {
    const writer = new NDEFReader(); await writer.write({ records: [{ recordType: "text", data: payload }] });
    messageElement.textContent = state.language === "hu" ? "NFC-címke megírva." : "NFC tag written."; return true;
  } catch {
    messageElement.textContent = state.language === "hu" ? "Az NFC-írás nem sikerült." : "NFC write failed."; return false;
  }
}

function downloadText(filename, content, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setupHero() {
  els.heroHubForm.addEventListener("submit", (event) => { event.preventDefault(); buildHeroHubPayload(); });
  els.heroButton.addEventListener("click", () => {
    const intent = state.firstAid?.intents?.find((item) => item.id === "mass_casualty");
    if (intent) openGuide(intent);
  });
  els.heroHubButton.addEventListener("click", () => {
    if (!els.hubLocation.value && state.userLocation) els.hubLocation.value = `${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lon.toFixed(6)}`;
    buildHeroHubPayload(); openDialog(els.heroHubDialog);
  });
  els.hubBuildButton.addEventListener("click", buildHeroHubPayload);
  els.hubClearButton.addEventListener("click", () => { els.heroHubForm.reset(); removeLocal("proxaid-herohub"); state.heroHubPayload = ""; buildHeroHubPayload(); });
  els.hubNfcButton.addEventListener("click", () => writeNfc(buildHeroHubPayload(), els.heroHubMessage));
  els.hubShareButton.addEventListener("click", () => sharePayload(buildHeroHubPayload(), "PROXAID HeroHUB"));
  els.hubCopyButton.addEventListener("click", async () => { const payload = buildHeroHubPayload(); els.heroHubMessage.textContent = await copyToClipboard(payload) ? ui("copied") : (state.language === "hu" ? "A másolás nem sikerült." : "Copy failed."); });
  els.hubDownloadButton.addEventListener("click", () => { const payload = buildHeroHubPayload(); const packet = JSON.parse(payload); downloadText(`proxaid-herohub-${packet.id.toLowerCase()}.json`, `${JSON.stringify(packet, null, 2)}\n`); });
  loadHeroHub();
}

function appendInlineMarkdown(container, source) {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|`([^`]+)`/g; let cursor = 0; let match;
  while ((match = pattern.exec(source))) {
    if (match.index > cursor) container.append(document.createTextNode(source.slice(cursor, match.index)));
    if (match[1]) { const link = document.createElement("a"); link.textContent = match[1]; link.href = match[2]; link.target = "_blank"; link.rel = "noopener noreferrer"; container.append(link); }
    else { const code = document.createElement("code"); code.textContent = match[3]; container.append(code); }
    cursor = pattern.lastIndex;
  }
  if (cursor < source.length) container.append(document.createTextNode(source.slice(cursor)));
}

function renderMarkdown(source) {
  const fragment = document.createDocumentFragment(); let list = null;
  for (const rawLine of source.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    if (!line) { list = null; continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/), item = line.match(/^[-*]\s+(.+)$/), ordered = line.match(/^\d+\.\s+(.+)$/);
    if (heading) { list = null; const node = document.createElement(`h${heading[1].length}`); appendInlineMarkdown(node, heading[2]); fragment.append(node); continue; }
    if (item || ordered) {
      const tag = ordered ? "ol" : "ul";
      if (!list || list.tagName.toLowerCase() !== tag) { list = document.createElement(tag); fragment.append(list); }
      const li = document.createElement("li"); appendInlineMarkdown(li, (item || ordered)[1]); list.append(li); continue;
    }
    list = null; const paragraph = document.createElement(line.startsWith(">") ? "blockquote" : "p"); appendInlineMarkdown(paragraph, line.replace(/^>\s?/, "")); fragment.append(paragraph);
  }
  return fragment;
}

async function openLocalDocument(path, title) {
  els.docDialogTitle.textContent = title; els.docContent.textContent = state.language === "hu" ? "Betöltés…" : "Loading…"; openDialog(els.docDialog);
  try { const response = await fetch(path); if (!response.ok) throw new Error(); els.docContent.replaceChildren(renderMarkdown(await response.text())); }
  catch { els.docContent.textContent = state.language === "hu" ? "A helyi dokumentum nem tölthető be." : "The local document could not be loaded."; }
}

function setupDocumentsAndInvite() {
  els.readmeButton.addEventListener("click", () => openLocalDocument(state.language === "hu" ? "./README_hu.md" : "./README.md", "PROXAID README"));
  els.userGuideButton.addEventListener("click", () => openLocalDocument(state.language === "hu" ? "./user-guide_hu.md" : "./user-guide.md", state.language === "hu" ? "PROXAID használati útmutató" : "PROXAID User Guide"));
  els.sourcesButton.addEventListener("click", () => openLocalDocument(state.language === "hu" ? "./sources_hu.md" : "./sources.md", state.language === "hu" ? "PROXAID források" : "PROXAID Sources"));
  els.inviteButton.addEventListener("click", () => {
    const link = new URL("./", document.baseURI).href;
    const message = state.language === "hu" ? `Próbáld ki a PROXAID offline vészhelyzeti alkalmazást: ${link}\nEgy felkészült telefon még egy offline útmutató, térkép és lehetséges továbbító pont.` : `Try the PROXAID offline emergency app: ${link}\nOne prepared phone adds another offline guide, map and possible relay point.`;
    sharePayload(message, "PROXAID v1.0");
  });
}

function setupViewportSizing() {
  const update = () => {
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--map-height", `${Math.max(300, Math.round(height * .54))}px`);
    state.map?.invalidateSize({ pan: false });
  };
  update(); window.visualViewport?.addEventListener("resize", update); window.addEventListener("resize", update, { passive: true }); window.addEventListener("orientationchange", update);
}

function setupDeviceActions() {
  els.callOptionsButton.addEventListener("click", () => openCallOptions(state.emergencyNumber, { editable: true }));
  els.useCallNumberButton.addEventListener("click", () => { if (setEmergencyNumber(els.callNumberInput.value)) openCallOptions(state.emergencyNumber, { editable: true }); });
  els.storageHelpButton.addEventListener("click", openStorageHelp);
  els.nfcButton.addEventListener("click", () => { els.nfcPayload.value = emergencyPayload(); openDialog(els.nfcDialog); });
  els.nfcReadButton.addEventListener("click", async () => {
    if (!("NDEFReader" in window)) { els.nfcMessage.textContent = state.language === "hu" ? "Használd a Megosztás gombot vagy QR-/fájlátvitelt." : "Use Share or QR/file transfer."; return; }
    try { const reader = new NDEFReader(); await reader.scan(); els.nfcMessage.textContent = state.language === "hu" ? "Érintsd az NFC-címkét a készülékhez." : "Hold the NFC tag near the device."; reader.onreading = (event) => { const decoder = new TextDecoder(); const record = [...event.message.records].find((item) => item.recordType === "text"); if (record) els.nfcPayload.value = decoder.decode(record.data); }; } catch { els.nfcMessage.textContent = state.language === "hu" ? "Az NFC-olvasás nem indult el." : "NFC reading did not start."; }
  });
  els.nfcWriteButton.addEventListener("click", async () => {
    await writeNfc(els.nfcPayload.value, els.nfcMessage);
  });
  els.nfcShareButton.addEventListener("click", () => sharePayload(els.nfcPayload.value));
  els.meshButton.addEventListener("click", () => { els.deviceMessage.textContent = state.language === "hu" ? "Válaszd a telepített közeli-, MESH- vagy üzenetküldő alkalmazást; az átadást a célalkalmazás igazolja." : "Choose an installed nearby, MESH or messaging app; the target app confirms delivery."; sharePayload(); });
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
  const sourceText = await file.text(), stem = file.name.replace(/\.(geo)?json$|\.csv$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "imported-pack";
  let parsed;
  if (/\.csv$/i.test(file.name) || file.type === "text/csv") {
    const rows = parseCsvRows(sourceText), records = rows.map((row, index) => importedRecord(row, `${stem}-${index + 1}`)).filter(Boolean);
    if (!records.length) throw new Error(state.language === "hu" ? "A CSV-ben nincs használható rekord." : "The CSV contains no usable records.");
    parsed = { schemaVersion: 1, packId: `imported-${stem}`, version: new Date().toISOString().slice(0, 10), records };
  } else parsed = JSON.parse(sourceText);
  const geoPoiRecords = parsed?.type === "FeatureCollection" ? poiRecordsFromGeoJson(parsed, stem) : [];
  const purePoiCollection = parsed?.type === "FeatureCollection" && parsed.features?.length > 0 && geoPoiRecords.length === parsed.features.length;
  const mapData = parsed?.type === "FeatureCollection" && !purePoiCollection ? parsed : parsed?.map?.type === "FeatureCollection" ? parsed.map : null;
  let recordCount = 0, mapCount = 0;
  if (mapData) {
    if (!validMapData(mapData)) throw new Error(state.language === "hu" ? "Érvénytelen GeoJSON térképcsomag." : "Invalid GeoJSON map pack.");
    const requestedId = String(parsed.mapId || `imported-${stem}`).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 72);
    const entry = { id: requestedId || `imported-${stem}`, name: parsed.name || mapData.name || file.name, version: parsed.version || new Date().toISOString().slice(0, 10), bbox: mapData.bbox || geoJsonBbox(mapData), source: parsed.source || mapData.metadata?.source || "User import", userImported: true, storedAt: new Date().toISOString(), data: mapData };
    await storeMapPackage(entry); await setMeta("activeMapId", entry.id); await applyOfflineMap(mapData, entry, true); await updateStats();
    mapCount = mapData.features.length;
  }
  const rawRecords = geoPoiRecords.length ? geoPoiRecords : Array.isArray(parsed) ? parsed.map((row, index) => importedRecord(row, `${stem}-${index + 1}`)).filter(Boolean) : Array.isArray(parsed.records) && parsed.schemaVersion !== 1 ? parsed.records.map((row, index) => importedRecord(row, `${stem}-${index + 1}`)).filter(Boolean) : null;
  const recordPack = rawRecords ? { schemaVersion: 1, packId: parsed.packId || `imported-${stem}`, version: parsed.version || new Date().toISOString().slice(0, 10), records: rawRecords } : parsed.schemaVersion === 1 && Array.isArray(parsed.records) ? parsed : null;
  if (recordPack) { recordCount = await storePack(recordPack); state.records = await readAllRecords(); applyFilters(); await updateStats(); }
  if (!recordCount && !mapCount) throw new Error(state.language === "hu" ? "Nem ismert adat- vagy térképcsomag." : "Unknown data or map pack.");
  els.syncMessage.textContent = state.language === "hu" ? `${recordCount} rekord és ${mapCount} térképelem importálva.` : `${recordCount} records and ${mapCount} map features imported.`;
}

function parseCsvRows(source) {
  const lines = String(source).replace(/^\uFEFF/, "").replace(/\r/g, "").split("\n").filter((line) => line.trim()); if (!lines.length) return [];
  const headers = parseCsvLine(lines.shift()).map((item) => item.trim());
  return lines.map((line) => { const cells = parseCsvLine(line); return Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() || ""])); });
}

function parseCsvLine(line) {
  const cells = []; let value = "", quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(value); value = ""; }
    else value += char;
  }
  cells.push(value); return cells;
}

function importedRecord(row, fallbackId) {
  if (!row || typeof row !== "object") return null;
  const aliases = { aed: "aed", defibrillator: "aed", defibrillator_aed: "aed", drugstore: "pharmacy", chemist: "pharmacy", public_toilet: "toilets", toilet: "toilets", restroom: "toilets", public_water: "drinking_water", potable_water: "drinking_water", phone: "public_phone", emergency_shelter: "shelter", fire_department: "fire_station" };
  const name = String(row.name || row.title || "").trim(), rawCategory = String(row.category || row.type || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), category = aliases[rawCategory] || rawCategory;
  if (!name || !category) return null;
  const lat = Number.parseFloat(row.lat ?? row.latitude ?? row.coordinates?.lat), lon = Number.parseFloat(row.lon ?? row.lng ?? row.longitude ?? row.coordinates?.lon);
  const coordinates = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : null;
  const sourceUrl = safeUrl(row.source_url || row.sourceUrl || row.source?.url), secondSource = safeUrl(row.source_url_2 || row.sourceUrl2);
  return {
    id: String(row.id || fallbackId).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 96), name, category, categories: Array.isArray(row.categories) ? row.categories : [],
    description: String(row.description || row.evidence || "").trim() || null, address: row.address || null, landmark: String(row.landmark || "").trim() || null,
    locality: String(row.locality || row.city || "").trim() || null, region: String(row.region || row.state || "").trim() || null, country: String(row.country || "").trim() || null,
    coordinates, phone: safePhone(row.phone) || null, email: String(row.email || "").trim() || null, website: normalizeOnlineUrl(row.website),
    contacts: { mobile: safePhone(row.mobile || row.contacts?.mobile) || null, fax: safePhone(row.fax || row.contacts?.fax) || null, facebook: normalizeOnlineUrl(row.facebook || row.contacts?.facebook), instagram: normalizeOnlineUrl(row.instagram || row.contacts?.instagram), linkedin: normalizeOnlineUrl(row.linkedin || row.contacts?.linkedin), twitter: normalizeOnlineUrl(row.twitter || row.contacts?.twitter), mastodon: normalizeOnlineUrl(row.mastodon || row.contacts?.mastodon), youtube: normalizeOnlineUrl(row.youtube || row.contacts?.youtube), telegram: row.telegram || row.contacts?.telegram || null, whatsapp: row.whatsapp || row.contacts?.whatsapp || null },
    openingHours: String(row.opening_hours || row.openingHours || "").trim() || null, access: String(row.access || "").trim() || null, wheelchair: String(row.wheelchair || "").trim() || null,
    verification: sourceUrl ? "source_linked" : "unverified", source: { name: String(row.source_name || row.source?.name || "User import"), url: sourceUrl, urls: [sourceUrl, secondSource].filter(Boolean), retrievedAt: String(row.checked_at || row.checkedAt || new Date().toISOString()).slice(0, 10), checkedAt: row.checked_at || row.checkedAt || null }
  };
}

function poiRecordsFromGeoJson(collection, stem) {
  const candidates = (collection.features || []).filter((feature) => feature.geometry?.type === "Point" && feature.properties?.name && feature.properties?.category);
  if (!candidates.length) return [];
  return candidates.map((feature, index) => importedRecord({ ...feature.properties, lon: feature.geometry.coordinates?.[0], lat: feature.geometry.coordinates?.[1] }, `${stem}-${index + 1}`)).filter(Boolean);
}

async function setupServiceWorker() {
  if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
  try {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (readSession("proxaid-sw-reloaded") === DATA_REVISION) return;
      writeSession("proxaid-sw-reloaded", DATA_REVISION); location.reload();
    });
    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" });
    await registration.update().catch(() => {}); await navigator.serviceWorker.ready;
    if ("periodicSync" in registration) await registration.periodicSync.register("proxaid-monthly-sync", { minInterval: 30 * DAY_MS }).catch(() => {});
  } catch {}
}

function setupDialogClosers() {
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeDialog($(button.dataset.close))));
  document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog); }));
}

async function boot() {
  setupLanguage(); setupTheme(); setupViewportSizing(); setupSpeechOutput(); setupFilters(); setupGuides(); setupCpr(); setupMicrophone(); setupDeviceActions(); setupHero(); setupMedicalCard(); setupDocumentsAndInvite(); setupInstall(); setupDialogClosers(); updateNetworkStatus();
  els.searchInput.addEventListener("input", (event) => { state.query = event.target.value; applyFilters(); });
  els.clearSearch.addEventListener("click", () => { state.query = ""; els.searchInput.value = ""; els.searchInput.focus(); applyFilters(); });
  els.locateButton.addEventListener("click", locateUser);
  els.syncButton.addEventListener("click", async () => { if (navigator.storage?.persist) await navigator.storage.persist().catch(() => false); await syncData({ force: true, reason: "manual" }); });
  els.packButton.addEventListener("click", () => els.packInput.click());
  els.packInput.addEventListener("change", async (event) => { try { await importPack(event.target.files?.[0]); } catch (error) { els.syncMessage.textContent = error.message; } finally { event.target.value = ""; } });
  window.addEventListener("online", () => { updateNetworkStatus(); syncData({ reason: "online" }); }); window.addEventListener("offline", updateNetworkStatus);

  await Promise.all([setupServiceWorker(), loadFirstAid()]);
  try { state.db = await openDatabase(); } catch { state.db = null; }
  const storedLocation = await getMeta("lastLocation").catch(() => null);
  if (Number.isFinite(storedLocation?.lat) && Number.isFinite(storedLocation?.lon) && Math.abs(storedLocation.lat) <= 90 && Math.abs(storedLocation.lon) <= 180) {
    state.userLocation = storedLocation; els.locateButton.textContent = state.language === "hu" ? "⌖ UTOLSÓ HELY" : "⌖ LAST LOCATION";
    if (!els.hubLocation.value) els.hubLocation.value = `${storedLocation.lat.toFixed(6)}, ${storedLocation.lon.toFixed(6)}`;
  }
  await setupMap();
  renderUserLocation({ focus: true });
  state.records = await readAllRecords();
  const storedRevision = await getMeta("dataRevision").catch(() => null);
  await syncData({ force: state.records.length === 0 || storedRevision !== DATA_REVISION, reason: storedRevision === DATA_REVISION ? "startup" : "migration" });
  state.records = await readAllRecords(); applyFilters(); await updateStats();
}

boot().catch(() => { updateNetworkStatus(); els.syncMessage.textContent = state.language === "hu" ? "A segélyhívó és a helyi tartalék nézet használható." : "Emergency calling and local fallback remain available."; });
