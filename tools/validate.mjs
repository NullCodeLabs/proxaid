import { access, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";

const required = [
  "index.html", "styles.css", "app.js", "sw.js", "manifest.webmanifest",
  "assets/icon.svg", "assets/icon-180.png", "assets/icon-192.png", "assets/icon-512.png",
  "assets/vendor/leaflet.css", "assets/vendor/leaflet.js", "assets/vendor/qrcode.mjs", "assets/vendor/qrcode_utf8.mjs", "assets/audio/cpr_hands_only_hu.mp3",
  "data/catalog.json", "data/core.json", "data/regions.json",
  "data/taxonomy.json", "data/sources.json", "data/maps/hu-zala-south.geojson",
  "data/first-aid.json", "README.md", "README_hu.md", "user-guide.md", "user-guide_hu.md", "sources.md", "sources_hu.md",
  "changelog.md", "changelog_hu.md", "third-party-notices.md", "404.html", ".nojekyll"
];

for (const file of required) await access(new URL(`../${file}`, import.meta.url));

const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
if (!manifest.start_url || !manifest.scope || !Array.isArray(manifest.icons)) throw new Error("Hibás web app manifest");
const fixedHeader = "Ha baj van, de nincs internet, esetleg telefon sem, GPS lefedettség sem! Nem csak adrenalin vadászok számára!";
const fixedSubHeader = "Offline is működő vészhelyzeti térkép és elsősegélynyújtás támogatással.";
if (manifest.name !== fixedHeader || manifest.description !== fixedSubHeader || manifest.short_name !== "PROXAID") throw new Error("Eltér a webapp rögzített címsora");
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons.some((icon) => icon.sizes === size && icon.type === "image/png")) throw new Error(`Hiányzó telepítési ikon: ${size}`);
}

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url), "utf8"));
if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.packs)) throw new Error("Hibás csomagkatalógus");
if (!Number.isFinite(catalog.minimumRefreshHours) || !Number.isFinite(catalog.movementRefreshKm)) throw new Error("Hiányos frissítési szabály");
if (!Array.isArray(catalog.maps) || !Array.isArray(catalog.guides) || !Array.isArray(catalog.audio)) throw new Error("Hiányos offline tartalomkatalógus");
if (catalog.globalDiscovery?.coverage !== "worldwide-on-demand" || !Number.isFinite(catalog.globalDiscovery?.radiusMeters) || !Array.isArray(catalog.globalDiscovery?.fields)) {
  throw new Error("Hiányos globális igény szerinti adatgyűjtés");
}
for (const descriptor of [...catalog.maps, ...catalog.guides, ...catalog.audio]) {
  if (!descriptor.id || !descriptor.url?.startsWith("./") || descriptor.url.includes("..")) throw new Error(`Érvénytelen offline tartalomleíró: ${descriptor.id ?? "ismeretlen"}`);
  const relative = `../${descriptor.url.replace(/^\.\//, "")}`;
  if ((await stat(new URL(relative, import.meta.url))).size !== descriptor.estimatedBytes) throw new Error(`Eltérő offline tartalomméret: ${descriptor.id}`);
}
if (!Number.isFinite(catalog.globalDiscovery?.offlineMap?.radiusMeters) || !Number.isFinite(catalog.globalDiscovery?.offlineMap?.refreshHours)
  || !["places", "roads", "paths", "water", "rail"].every((layer) => catalog.globalDiscovery.offlineMap.layers?.includes(layer))) {
  throw new Error("Hiányos globális offline utcatérkép-leíró");
}

const sourceRegistry = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));
if (sourceRegistry.schemaVersion !== 1 || !Array.isArray(sourceRegistry.sources) || sourceRegistry.sources.length < 5) throw new Error("Hiányos forrásjegyzék");
for (const source of sourceRegistry.sources) {
  if (!source.id || !source.name || !validHttpUrl(source.url) || !source.cadence || !source.license) throw new Error(`Hiányos forrásleíró: ${source.id ?? "ismeretlen"}`);
}
for (const id of ["openstreetmap-overpass", "us-911", "uk-999-112", "au-triple-zero", "nz-111", "in-112-erss", "jp-119"]) {
  if (!sourceRegistry.sources.some((source) => source.id === id)) throw new Error(`Hiányzó forrásregiszter-bejegyzés: ${id}`);
}

const taxonomy = JSON.parse(await readFile(new URL("../data/taxonomy.json", import.meta.url), "utf8"));
if (taxonomy.schemaVersion !== 1 || !taxonomy.groups?.some((group) => group.categories?.includes("medical_supply")) || !taxonomy.groups?.some((group) => group.categories?.includes("baby_changing"))) {
  throw new Error("Hiányos globális kategóriarendszer");
}

const ids = new Set();
const allRecords = [];
for (const descriptor of catalog.packs) {
  if (!descriptor.id || !descriptor.url?.startsWith("./data/") || descriptor.url.includes("..")) throw new Error("Érvénytelen csomagleíró");
  if (!validBbox(descriptor.bbox)) throw new Error(`Hibás befoglaló téglalap: ${descriptor.id}`);
  const relative = `../${descriptor.url.replace(/^\.\//, "")}`;
  const pack = JSON.parse(await readFile(new URL(relative, import.meta.url), "utf8"));
  if (pack.schemaVersion !== 1 || pack.packId !== descriptor.id || !Array.isArray(pack.records)) throw new Error(`Hibás csomag: ${descriptor.id}`);
  if ((await stat(new URL(relative, import.meta.url))).size !== descriptor.estimatedBytes) throw new Error(`Eltérő csomagméret: ${descriptor.id}`);
  allRecords.push(...pack.records);
  for (const record of pack.records) {
    if (!record.id || !record.name || !record.category) throw new Error(`Hiányos rekord: ${descriptor.id}`);
    if (ids.has(record.id)) throw new Error(`Duplikált rekordazonosító: ${record.id}`);
    ids.add(record.id);
    if (!record.verification || !record.source?.name || !validHttpUrl(record.source?.url) || !/^\d{4}-\d{2}-\d{2}$/.test(record.source?.retrievedAt ?? "")) {
      throw new Error(`Hiányos forrás- vagy frissességjelölés: ${record.id}`);
    }
    if (record.website && !validHttpUrl(record.website)) throw new Error(`Hibás webcím: ${record.id}`);
    for (const [service, value] of Object.entries(record.contacts || {})) {
      if (value && !["mobile", "fax", "telegram", "whatsapp"].includes(service) && !validHttpUrl(value)) throw new Error(`Hibás ${service}-elérhetőség: ${record.id}`);
    }
    if (record.phone && !/^\+?[\d,;*#]+$/.test(record.phone)) throw new Error(`Hibás telefonszám: ${record.id}`);
    if (record.coordinates) {
      const { lat, lon } = record.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error(`Hibás koordináta: ${record.id}`);
      if (!pointInBbox(record.coordinates, descriptor.bbox)) throw new Error(`A rekord a csomag régióján kívül esik: ${record.id}`);
    }
  }
}

const streetMap = JSON.parse(await readFile(new URL("../data/maps/hu-zala-south.geojson", import.meta.url), "utf8"));
if (streetMap.type !== "FeatureCollection" || !validBbox(streetMap.bbox) || !streetMap.features.some((feature) => feature.properties?.layer === "road")) {
  throw new Error("Hibás offline utcatérkép");
}

const firstAid = JSON.parse(await readFile(new URL("../data/first-aid.json", import.meta.url), "utf8"));
for (const modeId of ["hands_only", "compressions_breaths"]) {
  const mode = firstAid.cprModes?.[modeId];
  if (!mode?.steps?.hu?.length || !mode?.steps?.en?.length || !validHttpUrl(mode.online?.hu?.url) || !validHttpUrl(mode.online?.en?.url)) {
    throw new Error(`Hiányos CPR-mód: ${modeId}`);
  }
}
if (firstAid.cprModes.hands_only.offlineAudio?.hu !== "./assets/audio/cpr_hands_only_hu.mp3") throw new Error("A magyar narráció nem a csak mellkasi nyomásos módhoz tartozik");
if (firstAid.cprModes.compressions_breaths.offlineAudio?.hu || firstAid.cprModes.compressions_breaths.offlineAudio?.en) throw new Error("A 30:2 módhoz téves narrált hang van rendelve");
if (!Array.isArray(firstAid.intents) || firstAid.intents.length < 8 || firstAid.intents.some((intent) => !intent.steps?.hu?.length || !intent.steps?.en?.length || !intent.sources?.length)) {
  throw new Error("Hiányos elsősegély döntési fa");
}

const osmPack = JSON.parse(await readFile(new URL("../data/packs/hu-west-osm.json", import.meta.url), "utf8"));
if (!osmPack.records.some((record) => record.id === "osm-node-5715927281" && record.category === "pharmacy")) throw new Error("Hiányzik a szepetneki gyógyszertár");
const curatedPack = JSON.parse(await readFile(new URL("../data/packs/hu-west.json", import.meta.url), "utf8"));
if (!curatedPack.records.some((record) => record.id === "hu-nagykanizsa-police-aed" && record.category === "aed" && record.verification === "official_directory")) {
  throw new Error("Hiányzik a nagykanizsai rendőrségi defibrillátor (AED) hivatalos rekordja");
}
for (const id of ["eu-emergency-112", "us-emergency-911", "gb-emergency-999", "au-emergency-000", "nz-emergency-111", "in-emergency-112", "jp-fire-ambulance-119"]) {
  if (!allRecords.some((record) => record.id === id && record.verification === "official_directory")) throw new Error(`Hiányzó hivatalos segélyhívó-rekord: ${id}`);
}
for (const [label, categories, minimum] of [
  ["gyógyszertár", ["pharmacy"], 20], ["ivóvíz", ["drinking_water"], 1],
  ["WC/tisztálkodás", ["toilets", "accessible_toilets", "shower"], 1],
  ["nyilvános telefon", ["public_phone", "emergency_phone"], 1], ["menedék", ["shelter", "homeless_shelter", "alpine_hut", "wilderness_hut"], 1],
  ["rendőrség", ["police"], 1], ["tűzoltóság", ["fire_station"], 1], ["defibrillátor (AED)", ["aed"], 1]
]) {
  const count = allRecords.filter((record) => [record.category, ...(record.categories || [])].some((category) => categories.includes(category))).length;
  if (count < minimum) throw new Error(`Hiányos induló kategória: ${label} (${count})`);
}

const audioDescriptor = catalog.audio.find((item) => item.id === "cpr-hands-only-hu");
const audio = await readFile(new URL("../assets/audio/cpr_hands_only_hu.mp3", import.meta.url));
if (!audioDescriptor || createHash("sha256").update(audio).digest("hex") !== audioDescriptor.sha256) throw new Error("A magyar CPR-hang ellenőrzőösszege eltér");

const regions = JSON.parse(await readFile(new URL("../data/regions.json", import.meta.url), "utf8"));
if (regions.schemaVersion !== 1 || !Array.isArray(regions.regions)) throw new Error("Hibás régiójegyzék");
for (const region of regions.regions) {
  const [south, west, north, east] = region.bbox ?? [];
  if (!region.id || ![south, west, north, east].every(Number.isFinite) || south < -90 || north > 90 || west < -180 || east > 180 || south > north || west > east) {
    throw new Error(`Hibás frissítési régió: ${region.id ?? "ismeretlen"}`);
  }
  if (!catalog.packs.some((pack) => pack.id === region.id)) throw new Error(`A frissítési régióhoz nincs katalógusbejegyzés: ${region.id}`);
}

const shell = await readFile(new URL("../sw.js", import.meta.url), "utf8");
for (const file of required) {
  if (!["sw.js", ".nojekyll"].includes(file) && !shell.includes(`./${file}`)) {
    throw new Error(`Nincs előtárazva: ${file}`);
  }
}
for (const match of shell.matchAll(/"\.\/(.*?)"/g)) await access(new URL(`../${match[1]}`, import.meta.url));
for (const descriptor of catalog.packs.filter((item) => item.required || item.defaultInstall)) {
  if (!shell.includes(descriptor.url)) throw new Error(`Az induló csomag nincs előtárazva: ${descriptor.id}`);
}

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
for (const id of ["streetMap", "searchInput", "micButton", "ttsButton", "handsOnlyButton", "breathsButton", "syncButton", "packButton", "nfcButton", "meshButton", "heroButton", "heroHubButton", "heroHubQr", "readmeButton", "userGuideButton", "sourcesButton", "docDialog", "installDialog", "medicalCardButton", "medicalCardDialog", "medicalCardForm", "medicalCardQr", "callNumberInput", "useCallNumberButton"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Hiányzó kezelőfelületi elem: ${id}`);
}
if (!html.includes(`<title>${fixedHeader}</title>`) || !html.includes(`>${fixedHeader}</h1>`) || !html.includes(`>${fixedSubHeader}</p>`)) throw new Error("Eltér az alkalmazás rögzített címsora");
const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
if (htmlIds.length !== new Set(htmlIds).size) throw new Error("Duplikált HTML id");
for (const target of [...html.matchAll(/data-close="([^"]+)"/g)].map((match) => match[1])) if (!htmlIds.includes(target)) throw new Error(`Hibás bezárási cél: ${target}`);

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const elementRegistry = app.match(/const els = Object\.fromEntries\(\[([\s\S]*?)\]\.map/)?.[1] || "";
for (const id of [...elementRegistry.matchAll(/"([^"]+)"/g)].map((match) => match[1])) if (!htmlIds.includes(id)) throw new Error(`Az alkalmazás nem létező elemet kér: ${id}`);
const shellCacheName = shell.match(/const SHELL_CACHE = "([^"]+)"/)?.[1];
if (!shellCacheName || !app.includes(`"${shellCacheName}"`)) throw new Error("A gyorsítótár-verzió eltér az alkalmazás és a Service Worker között");
for (const requiredFragment of [
  "const DB_VERSION = 2", "createObjectStore(\"maps\"", "type === \"FeatureCollection\"", "storeMapPackage(entry)",
  "tile.openstreetmap.org/{z}/{x}/{y}.png", "overpass-api.de/api/interpreter", "GLOBAL_SEARCH_RADIUS_M = 15000",
  "GLOBAL_MAP_RADIUS_M = 12000", "fetchNearbyOfflineMap", "openRecordDetails(record)", "todayOpening(record.openingHours)", "openingNow(record.openingHours)",
  "openNavigationOptions(record)", "medicalCardFromForm", "parseCsvRows", "userImported", "localGuideSteps", "readSession", "deadline: Date.now() + 30000", "data-no-speak"
]) {
  if (!`${app}\n${html}`.includes(requiredFragment)) throw new Error(`Hiányzó v1.0 funkció: ${requiredFragment}`);
}

const refreshWorkflow = await readFile(new URL("../.github/workflows/update-data.yml", import.meta.url), "utf8");
for (const requiredFragment of ["actions: write", "id: commit", "gh workflow run pages.yml --ref main", "actions/checkout@v6", "actions/setup-node@v7"]) {
  if (!refreshWorkflow.includes(requiredFragment)) throw new Error(`Hiányos adatfrissítés→Pages közzétételi lánc: ${requiredFragment}`);
}
const pagesWorkflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
for (const requiredFragment of ["actions/checkout@v6", "actions/setup-node@v7", "actions/configure-pages@v5", "actions/upload-pages-artifact@v4", "actions/deploy-pages@v4"]) {
  if (!pagesWorkflow.includes(requiredFragment)) throw new Error(`Hiányos GitHub Pages munkafolyamat: ${requiredFragment}`);
}
for (const cadence of ["17 3 1 * *", "37 3 * * 1", "27 4 2 1,4,7,10 *", "47 4 3 1 *"]) {
  if (!refreshWorkflow.includes(cadence)) throw new Error(`Hiányzó adatfrissítési ütem: ${cadence}`);
}

const englishReadme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const hungarianReadme = await readFile(new URL("../README_hu.md", import.meta.url), "utf8");
const englishGuide = await readFile(new URL("../user-guide.md", import.meta.url), "utf8");
const hungarianGuide = await readFile(new URL("../user-guide_hu.md", import.meta.url), "utf8");
if (!hungarianReadme.startsWith(`# ${fixedHeader}\n\n> **${fixedSubHeader}**`)) throw new Error("Eltér a magyar README rögzített címsora");
for (const [name, content] of [["English docs", `${englishReadme}\n${englishGuide}`], ["Hungarian docs", `${hungarianReadme}\n${hungarianGuide}`]]) {
  if (!content.includes("iPhone") || !content.includes("Android") || !content.includes("Windows") || !content.includes("Linux")) {
    throw new Error(`Hiányos platformdokumentáció: ${name}`);
  }
}
for (const fragment of ["12 km", "CSV", "medical card", "emergency number", "Route"]) if (!`${englishReadme}\n${englishGuide}`.includes(fragment)) throw new Error(`Hiányos angol dokumentáció: ${fragment}`);
for (const fragment of ["12 km", "CSV", "vészkártya", "segélyhívószám", "Útvonal"]) if (!`${hungarianReadme}\n${hungarianGuide}`.includes(fragment)) throw new Error(`Hiányos magyar dokumentáció: ${fragment}`);

const inboxGuide = await readFile(new URL("../data/inbox/README.md", import.meta.url), "utf8");
for (const field of ["locality", "region", "country", "fax", "linkedin", "telegram", "whatsapp", "wheelchair", "source_url_2"]) {
  if (!inboxGuide.includes(field)) throw new Error(`Hiányzó globális adatgyűjtési mező: ${field}`);
}

const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
for (const fragment of ["font-size: max(16px", "@media (max-width: 380px)", "env(safe-area-inset-bottom)", "var(--map-height)"]) if (!css.includes(fragment)) throw new Error(`Hiányos reszponzív CSS: ${fragment}`);
if (!html.includes("width=device-width") || html.includes("user-scalable=no") || !app.includes("visualViewport") || !html.includes("text/csv,.csv")) throw new Error("Hiányos mobil/import konfiguráció");
if ([app, html, hungarianReadme, englishReadme].some((content) => /South Zala|Dél-Zala|dél-zalai/i.test(content))) throw new Error("A publikus termék régióspecifikus címkével maradt");

console.log(`PROXAID validation passed: ${catalog.packs.length} pack, ${ids.size} unique records.`);

function validHttpUrl(value) {
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
}

function validBbox(bbox) {
  return Array.isArray(bbox) && bbox.length === 4 && bbox.every(Number.isFinite)
    && bbox[0] >= -180 && bbox[2] <= 180 && bbox[1] >= -90 && bbox[3] <= 90
    && bbox[0] <= bbox[2] && bbox[1] <= bbox[3];
}

function pointInBbox(point, bbox) {
  return point.lon >= bbox[0] && point.lat >= bbox[1] && point.lon <= bbox[2] && point.lat <= bbox[3];
}
