import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [inputPath, mapOutput = "data/maps/hu-zala-south.geojson", packOutput = "data/packs/hu-west-osm.json"] = process.argv.slice(2);
if (!inputPath) throw new Error("Usage: node tools/build-overpass-pack.mjs <overpass.json> [map.geojson] [pack.json]");

const input = JSON.parse(await readFile(resolve(inputPath), "utf8"));
const retrievedAt = String(input.osm3s?.timestamp_osm_base ?? new Date().toISOString()).slice(0, 10);
const features = [];
const records = [];
const seen = new Set();
const roadClasses = new Set([
  "motorway", "motorway_link", "trunk", "trunk_link", "primary", "primary_link",
  "secondary", "secondary_link", "tertiary", "tertiary_link", "residential",
  "unclassified", "living_street", "pedestrian", "road"
]);
const namedTrailClasses = new Set(["cycleway", "footway", "path", "track"]);
const usefulWaterways = new Set(["river", "stream", "canal"]);

for (const element of input.elements ?? []) {
  const tags = element.tags ?? {};
  const geometry = elementGeometry(element);
  if (tags.highway && geometry && (roadClasses.has(tags.highway) || (tags.name && namedTrailClasses.has(tags.highway)))) {
    features.push(feature(element, geometry, "road", {
      class: tags.highway,
      name: tags.name ?? tags.ref ?? "",
      ref: tags.ref ?? "",
      surface: tags.surface ?? "",
      access: tags.access ?? ""
    }));
  } else if (tags.waterway && geometry && usefulWaterways.has(tags.waterway)) {
    features.push(feature(element, geometry, "waterway", { class: tags.waterway, name: tags.name ?? "" }));
  } else if (tags.natural === "water" && geometry) {
    features.push(feature(element, geometry, "water", { class: tags.water ?? "water", name: tags.name ?? "" }));
  }

  if (element.type === "node" && tags.place && Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
    features.push({
      type: "Feature",
      id: `osm-${element.type}-${element.id}`,
      properties: { layer: "place", class: tags.place, name: tags.name ?? "" },
      geometry: { type: "Point", coordinates: [element.lon, element.lat] }
    });
  }

  const category = categoryFor(tags);
  if (!category) continue;
  const coordinates = elementCenter(element);
  if (!coordinates) continue;
  const id = `osm-${element.type}-${element.id}`;
  if (seen.has(id)) continue;
  seen.add(id);
  const name = tags.name || fallbackName(category);
  records.push({
    id,
    name,
    category,
    kind: "place",
    description: descriptionFor(category, tags),
    locality: tags["addr:city"] || tags["addr:place"] || null,
    region: "Zala",
    country: "HU",
    phone: normalizePhone(tags.phone || tags["contact:phone"]),
    website: normalizeUrl(tags.website || tags["contact:website"]),
    coordinates,
    openingHours: tags.opening_hours || null,
    access: tags.access || null,
    wheelchair: tags.wheelchair || null,
    verification: "community_source",
    tags: Object.entries(tags).filter(([key]) => ["operator", "brand", "description", "defibrillator:location"].includes(key)).map(([, value]) => value),
    source: {
      name: "OpenStreetMap contributors",
      url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      retrievedAt
    }
  });
}

const map = {
  type: "FeatureCollection",
  name: "PROXAID South Zala offline street map",
  bbox: [16.78, 46.34, 17.15, 46.58],
  metadata: {
    source: "OpenStreetMap contributors via Overpass API",
    sourceUrl: "https://www.openstreetmap.org/copyright",
    retrievedAt,
    license: "ODbL 1.0",
    zoomRange: [10, 18]
  },
  features
};

const pack = {
  schemaVersion: 1,
  packId: "hu-west-osm",
  version: retrievedAt.replaceAll("-", "."),
  generatedAt: new Date().toISOString(),
  license: "OpenStreetMap ODbL 1.0; community source, not an official operational registry",
  records
};

await mkdir(dirname(resolve(mapOutput)), { recursive: true });
await mkdir(dirname(resolve(packOutput)), { recursive: true });
await writeFile(resolve(mapOutput), `${JSON.stringify(map)}\n`);
await writeFile(resolve(packOutput), `${JSON.stringify(pack, null, 2)}\n`);
console.log(`Generated ${features.length} map features and ${records.length} POI records (${retrievedAt}).`);

function feature(element, geometry, layer, properties) {
  return { type: "Feature", id: `osm-${element.type}-${element.id}`, properties: { layer, ...properties }, geometry };
}

function elementGeometry(element) {
  const points = element.geometry?.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
  if (!points?.length) return null;
  const coordinates = points.map((point) => [point.lon, point.lat]);
  const closed = coordinates.length >= 4 && coordinates[0][0] === coordinates.at(-1)[0] && coordinates[0][1] === coordinates.at(-1)[1];
  return { type: closed ? "Polygon" : "LineString", coordinates: closed ? [coordinates] : coordinates };
}

function elementCenter(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  const points = element.geometry?.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
  if (!points?.length) return null;
  const total = points.reduce((sum, point) => ({ lat: sum.lat + point.lat, lon: sum.lon + point.lon }), { lat: 0, lon: 0 });
  return { lat: total.lat / points.length, lon: total.lon / points.length };
}

function categoryFor(tags) {
  if (tags.emergency === "defibrillator") return "aed";
  if (tags.amenity === "pharmacy") return "pharmacy";
  if (tags.amenity === "toilets") return tags.wheelchair === "yes" ? "accessible_toilets" : "toilets";
  if (tags.amenity === "drinking_water") return "drinking_water";
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "clinic") return "clinic";
  if (tags.amenity === "doctors") return "doctor";
  if (tags.amenity === "police") return "police";
  if (tags.amenity === "fire_station") return "fire_station";
  if (tags.amenity === "telephone") return "public_phone";
  if (tags.amenity === "shelter") return "shelter";
  if (tags.healthcare === "pharmacy") return "pharmacy";
  if (["hospital", "clinic", "doctor"].includes(tags.healthcare)) return tags.healthcare === "doctor" ? "doctor" : tags.healthcare;
  return null;
}

function fallbackName(category) {
  return ({
    aed: "AED", pharmacy: "Gyógyszertár", toilets: "Nyilvános WC", accessible_toilets: "Akadálymentes WC",
    drinking_water: "Ivóvíz", hospital: "Kórház", clinic: "Klinika", doctor: "Orvosi rendelő",
    police: "Rendőrség", fire_station: "Tűzoltóság", public_phone: "Nyilvános telefon", shelter: "Menedék"
  })[category] ?? "Helyi pont";
}

function descriptionFor(category, tags) {
  const details = [tags.description, tags["defibrillator:location"], tags.operator].filter(Boolean).join(" · ");
  return details || `${fallbackName(category)} — OpenStreetMap közösségi forrásból; az aktuális hozzáférést ellenőrizd.`;
}

function normalizePhone(value) {
  if (!value) return null;
  const first = String(value).split(/[;/]/)[0].trim().replace(/[^+\d]/g, "");
  return first || null;
}

function normalizeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.href;
  } catch { return null; }
}
