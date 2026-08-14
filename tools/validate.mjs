import { access, readFile } from "node:fs/promises";

const required = [
  "index.html", "styles.css", "app.js", "sw.js", "manifest.webmanifest",
  "assets/icon.svg", "assets/icon-180.png", "assets/icon-192.png", "assets/icon-512.png",
  "data/catalog.json", "data/core.json", "data/regions.json",
  "data/taxonomy.json", "data/world-110m.geojson", "404.html", ".nojekyll"
];

for (const file of required) await access(new URL(`../${file}`, import.meta.url));

const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
if (!manifest.start_url || !manifest.scope || !Array.isArray(manifest.icons)) throw new Error("Hibás web app manifest");
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons.some((icon) => icon.sizes === size && icon.type === "image/png")) throw new Error(`Hiányzó telepítési ikon: ${size}`);
}

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url), "utf8"));
if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.packs)) throw new Error("Hibás csomagkatalógus");
if (!Number.isFinite(catalog.minimumRefreshHours) || !Number.isFinite(catalog.movementRefreshKm)) throw new Error("Hiányos frissítési szabály");

const ids = new Set();
for (const descriptor of catalog.packs) {
  if (!descriptor.id || !descriptor.url?.startsWith("./data/") || descriptor.url.includes("..")) throw new Error("Érvénytelen csomagleíró");
  if (!validBbox(descriptor.bbox)) throw new Error(`Hibás befoglaló téglalap: ${descriptor.id}`);
  const relative = `../${descriptor.url.replace(/^\.\//, "")}`;
  const pack = JSON.parse(await readFile(new URL(relative, import.meta.url), "utf8"));
  if (pack.schemaVersion !== 1 || pack.packId !== descriptor.id || !Array.isArray(pack.records)) throw new Error(`Hibás csomag: ${descriptor.id}`);
  for (const record of pack.records) {
    if (!record.id || !record.name || !record.category) throw new Error(`Hiányos rekord: ${descriptor.id}`);
    if (ids.has(record.id)) throw new Error(`Duplikált rekordazonosító: ${record.id}`);
    ids.add(record.id);
    if (!record.verification || !record.source?.name || !validHttpUrl(record.source?.url) || !/^\d{4}-\d{2}-\d{2}$/.test(record.source?.retrievedAt ?? "")) {
      throw new Error(`Hiányos forrás- vagy frissességjelölés: ${record.id}`);
    }
    if (record.website && !validHttpUrl(record.website)) throw new Error(`Hibás webcím: ${record.id}`);
    if (record.phone && !/^\+?[\d,;*#]+$/.test(record.phone)) throw new Error(`Hibás telefonszám: ${record.id}`);
    if (record.coordinates) {
      const { lat, lon } = record.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error(`Hibás koordináta: ${record.id}`);
      if (!pointInBbox(record.coordinates, descriptor.bbox)) throw new Error(`A rekord a csomag régióján kívül esik: ${record.id}`);
    }
  }
}

const world = JSON.parse(await readFile(new URL("../data/world-110m.geojson", import.meta.url), "utf8"));
if (world.type !== "FeatureCollection" || !Array.isArray(world.features) || !world.features.length) throw new Error("Hibás offline világnézet");

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
for (const descriptor of catalog.packs.filter((item) => item.required || item.defaultInstall)) {
  if (!shell.includes(descriptor.url)) throw new Error(`Az induló csomag nincs előtárazva: ${descriptor.id}`);
}

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
for (const id of ["mapCanvas", "searchInput", "syncButton", "storagePolicy", "packButton", "installDialog", "closeInstallDialog"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Hiányzó kezelőfelületi elem: ${id}`);
}

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const shellCacheName = shell.match(/const SHELL_CACHE = "([^"]+)"/)?.[1];
if (!shellCacheName || !app.includes(`"${shellCacheName}"`)) throw new Error("A gyorsítótár-verzió eltér az alkalmazás és a Service Worker között");

const refreshWorkflow = await readFile(new URL("../.github/workflows/update-data.yml", import.meta.url), "utf8");
for (const requiredFragment of ["actions: write", "id: commit", "gh workflow run pages.yml --ref main"]) {
  if (!refreshWorkflow.includes(requiredFragment)) throw new Error(`Hiányos adatfrissítés→Pages közzétételi lánc: ${requiredFragment}`);
}

const englishReadme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const hungarianReadme = await readFile(new URL("../README_hu.md", import.meta.url), "utf8");
for (const [name, content] of [["README.md", englishReadme], ["README_hu.md", hungarianReadme]]) {
  if (!content.includes("iPhone") || !content.includes("Android") || !content.includes("Windows") || !content.includes("Linux")) {
    throw new Error(`Hiányos platformdokumentáció: ${name}`);
  }
}

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
