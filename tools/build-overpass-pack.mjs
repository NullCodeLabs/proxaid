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
const usefulLanduse = new Set(["residential", "commercial", "retail", "industrial", "forest", "meadow", "grass", "cemetery"]);

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
  } else if (tags.railway && geometry && !["abandoned", "disused", "razed"].includes(tags.railway)) {
    features.push(feature(element, geometry, "railway", { class: tags.railway, name: tags.name ?? "" }));
  } else if (tags.landuse && geometry && usefulLanduse.has(tags.landuse)) {
    features.push(feature(element, geometry, "landuse", { class: tags.landuse, name: tags.name ?? "" }));
  } else if (tags.boundary === "administrative" && geometry && Number(tags.admin_level) >= 6) {
    features.push(feature(element, geometry, "boundary", { class: tags.admin_level ?? "", name: tags.name ?? "" }));
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
    categories: categoryMemberships(category),
    kind: "place",
    description: descriptionFor(category, tags),
    address: addressFor(tags),
    landmark: tags.loc_name || null,
    locality: tags["addr:city"] || tags["addr:place"] || null,
    region: "Zala",
    country: "HU",
    phone: normalizePhone(tags.phone || tags["contact:phone"]),
    email: normalizeEmail(tags.email || tags["contact:email"]),
    website: normalizeUrl(tags.website || tags["contact:website"] || tags.url),
    contacts: {
      mobile: normalizePhone(tags.mobile || tags["contact:mobile"]), fax: normalizePhone(tags.fax || tags["contact:fax"]),
      facebook: normalizeUrl(tags.facebook || tags["contact:facebook"]), instagram: normalizeUrl(tags.instagram || tags["contact:instagram"]),
      linkedin: normalizeUrl(tags.linkedin || tags["contact:linkedin"]), twitter: normalizeUrl(tags.twitter || tags["contact:twitter"]),
      mastodon: normalizeUrl(tags.mastodon || tags["contact:mastodon"]), youtube: normalizeUrl(tags.youtube || tags["contact:youtube"]),
      telegram: String(tags.telegram || tags["contact:telegram"] || "").trim() || null,
      whatsapp: String(tags.whatsapp || tags["contact:whatsapp"] || "").trim() || null
    },
    coordinates,
    openingHours: tags.opening_hours || null,
    access: tags.access || null,
    wheelchair: tags.wheelchair || null,
    verification: "community_source",
    confidence: tags.source || tags.check_date ? "medium" : "unverified",
    validFrom: tags.start_date || tags.opening_date || null,
    validTo: tags.end_date || null,
    tags: Object.entries(tags).filter(([key]) => ["operator", "brand", "description", "defibrillator:location"].includes(key)).map(([, value]) => value),
    source: {
      name: "OpenStreetMap contributors",
      url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      retrievedAt
    }
  });
}

const layerOrder = { landuse: 0, water: 1, waterway: 2, boundary: 3, railway: 4, road: 5, place: 6 };
features.sort((a, b) => (layerOrder[a.properties?.layer] ?? 99) - (layerOrder[b.properties?.layer] ?? 99));

const map = {
  type: "FeatureCollection",
  name: "PROXAID bundled offline reference street map",
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
  if (tags.emergency === "phone") return "emergency_phone";
  if (tags.emergency === "ambulance_station") return "ambulance";
  if (tags.emergency === "mountain_rescue") return "mountain_rescue";
  if (tags.emergency === "assembly_point") return "assembly_point";
  if (tags.emergency === "water_rescue") return "water_rescue";
  if (tags.emergency === "lifeguard") return "lifeguard";
  if (tags.emergency === "access_point") return "emergency_access_point";
  if (tags.emergency === "emergency_ward_entrance") return "hospital_emergency";
  const healthcare = { hospital: "hospital", clinic: "clinic", doctor: "doctor", pharmacy: "pharmacy", first_aid: "first_aid", blood_donation: "blood_bank" };
  if (healthcare[tags.healthcare]) return healthcare[tags.healthcare];
  if (tags.shop === "chemist") return "pharmacy";
  if (tags.shop === "medical_supply") return "medical_supply";
  if (tags.shop === "laundry") return "laundry";
  const amenities = {
    hospital: "hospital", clinic: "clinic", doctors: "doctor", pharmacy: "pharmacy", police: "police", fire_station: "fire_station",
    shelter: "shelter", social_facility: ["food_bank", "soup_kitchen"].includes(tags.social_facility) ? "food_assistance" : tags.social_facility === "shelter" ? "homeless_shelter" : "shelter", drinking_water: "drinking_water",
    toilets: tags.wheelchair === "yes" ? "accessible_toilets" : "toilets", shower: "shower", telephone: "public_phone",
    fuel: "fuel", charging_station: "charging", internet_cafe: "internet_access", first_aid: "first_aid"
  };
  if (amenities[tags.amenity]) return amenities[tags.amenity];
  if (tags.amenity === "lavoir") return "washing";
  if (tags.tourism === "alpine_hut") return "alpine_hut";
  if (tags.tourism === "wilderness_hut") return "wilderness_hut";
  if (tags.information === "guidepost") return "guidepost";
  if (tags.information === "map") return "information_map";
  if (tags.changing_table === "yes") return "baby_changing";
  return null;
}

function categoryMemberships(category) {
  const memberships = {
    hospital: ["healthcare"], clinic: ["healthcare"], doctor: ["healthcare"], pharmacy: ["healthcare"], medical_supply: ["healthcare"], hospital_emergency: ["healthcare", "urgent"],
    urgent_care: ["healthcare", "urgent"], aed: ["urgent"], ambulance: ["urgent", "rescue"], police: ["rescue"], fire_station: ["rescue"],
    mountain_rescue: ["rescue"], water_rescue: ["rescue"], lifeguard: ["rescue"], assembly_point: ["rescue"],
    toilets: ["hygiene"], accessible_toilets: ["hygiene"], shower: ["hygiene"], washing: ["hygiene"], laundry: ["hygiene"], baby_changing: ["hygiene"], drinking_water: ["water"],
    shelter: ["shelter"], homeless_shelter: ["shelter"], food_assistance: ["shelter"], alpine_hut: ["shelter"], wilderness_hut: ["shelter"],
    public_phone: ["connection"], emergency_phone: ["connection", "urgent"], internet_access: ["connection"]
  };
  return memberships[category] || [];
}

function fallbackName(category) {
  return ({
    aed: "Defibrillátor (AED)", pharmacy: "Gyógyszertár", toilets: "Nyilvános WC", accessible_toilets: "Akadálymentes WC",
    drinking_water: "Ivóvíz", hospital: "Kórház", clinic: "Klinika", doctor: "Orvosi rendelő", medical_supply: "Gyógyászati segédeszköz",
    police: "Rendőrség", fire_station: "Tűzoltóság", public_phone: "Nyilvános telefon", emergency_phone: "Segélytelefon", shelter: "Menedék",
    shower: "Zuhany", washing: "Mosdás", laundry: "Mosoda", baby_changing: "Pelenkázó", homeless_shelter: "Éjszakai menedék", food_assistance: "Élelmiszersegély", alpine_hut: "Hegyi hajlék", wilderness_hut: "Erdei hajlék",
    ambulance: "Mentőállomás", mountain_rescue: "Hegyi mentőpont", water_rescue: "Vízi mentőpont", lifeguard: "Vízimentő",
    assembly_point: "Vészhelyzeti gyülekezőpont", emergency_access_point: "Vészhelyzeti megközelítési pont", hospital_emergency: "Sürgősségi bejárat"
  })[category] ?? "Helyi pont";
}

function descriptionFor(category, tags) {
  const details = [tags.description, tags["defibrillator:location"], tags.operator].filter(Boolean).join(" · ");
  return details || `${fallbackName(category)} — OpenStreetMap közösségi forrásból; az aktuális hozzáférést ellenőrizd.`;
}

function addressFor(tags) {
  if (tags["addr:full"]) return tags["addr:full"];
  const street = tags["addr:street"] || tags["addr:place"] || "";
  return [tags["addr:postcode"], tags["addr:city"], street, tags["addr:housenumber"]].filter(Boolean).join(" ") || null;
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

function normalizeEmail(value) {
  const email = String(value ?? "").trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
}
