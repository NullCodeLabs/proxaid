import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const regions = JSON.parse(await readFile(new URL("data/regions.json", root), "utf8"));
const catalogUrl = new URL("data/catalog.json", root);
const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
const generatedAt = new Date().toISOString();
const version = generatedAt.slice(0, 10).replaceAll("-", ".");

for (const region of regions.regions.filter((item) => item.enabled)) {
  const [south, west, north, east] = region.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:180];(
    nwr["emergency"~"^(defibrillator|phone|ambulance_station|mountain_rescue|assembly_point|water_rescue|lifeguard|access_point|emergency_ward_entrance)$"](${bbox});
    nwr["amenity"~"^(hospital|clinic|doctors|pharmacy|police|fire_station|shelter|social_facility|drinking_water|toilets|shower|telephone|fuel|charging_station|internet_cafe)$"](${bbox});
    nwr["healthcare"~"^(hospital|clinic|doctor|pharmacy|first_aid|blood_donation)$"](${bbox});
    nwr["tourism"~"^(alpine_hut|wilderness_hut|information)$"](${bbox});
    nwr["information"~"^(guidepost|map)$"](${bbox});
    nwr["changing_table"="yes"](${bbox});
    nwr["office"="diplomatic"](${bbox});
  );out center tags;`;

  const raw = await fetchOverpass(query, region.id);
  const records = raw.elements
    .map(normalizeElement)
    .filter(Boolean)
    .filter((record) => record.coordinates.lon >= west && record.coordinates.lon <= east && record.coordinates.lat >= south && record.coordinates.lat <= north);
  if (!records.length) throw new Error(`Üres Overpass-válasz, a meglévő csomag megőrizve: ${region.id}`);
  if (records.length > (region.maximumRecords ?? 25000)) {
    throw new Error(`A régió ${records.length} rekordja meghaladja a biztonsági korlátot; bontsd kisebb területekre: ${region.id}`);
  }
  const pack = {
    schemaVersion: 1,
    packId: region.id,
    version,
    generatedAt,
    license: "OpenStreetMap contributors, ODbL 1.0 — https://www.openstreetmap.org/copyright",
    records
  };
  const text = `${JSON.stringify(pack, null, 2)}\n`;
  await writeFile(new URL(`data/packs/${region.id}.json`, root), text, "utf8");
  const descriptor = catalog.packs.find((item) => item.id === region.id);
  if (descriptor) {
    descriptor.version = version;
    descriptor.estimatedBytes = Buffer.byteLength(text);
  }
}

catalog.generatedAt = generatedAt;
await writeFile(catalogUrl, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

function normalizeElement(element) {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const category = categoryFor(tags);
  if (!category) return null;
  const fallbackName = {
    aed: "Automata külső defibrillátor (AED)", emergency_phone: "Segélytelefon",
    ambulance: "Mentőállomás", mountain_rescue: "Hegyi mentőpont", water_rescue: "Vízi mentőpont",
    lifeguard: "Vízimentő", assembly_point: "Vészhelyzeti gyülekezési pont",
    emergency_access_point: "Vészhelyzeti megközelítési pont", hospital_emergency: "Sürgősségi bejárat",
    drinking_water: "Ivóvíz", toilets: "Nyilvános WC", shower: "Zuhany",
    public_phone: "Nyilvános telefon", shelter: "Menedék", alpine_hut: "Hegyi hajlék",
    wilderness_hut: "Erdei hajlék", baby_changing: "Pelenkázóhely",
    guidepost: "Útjelző", information_map: "Tájékoztató térkép", charging: "Töltőpont"
  }[category];
  const name = tags["name:hu"] || tags.name || fallbackName || tags.operator;
  if (!name) return null;
  const searchTags = [];
  if (tags.changing_table === "yes") searchTags.push("pelenkázó", "baby changing");
  if (tags.wheelchair === "yes") searchTags.push("akadálymentes", "wheelchair");
  if (tags.internet_access && tags.internet_access !== "no") searchTags.push("internet", "wifi");
  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    category,
    kind: "place",
    description: tags.description || tags.operator || null,
    locality: tags["addr:city"] || tags["addr:place"] || null,
    region: tags["addr:state"] || null,
    country: tags["addr:country"] || null,
    phone: normalizePhone(tags["contact:phone"] || tags.phone),
    website: normalizeWebsite(tags["contact:website"] || tags.website),
    coordinates: { lat, lon },
    openingHours: tags.opening_hours || null,
    tags: searchTags,
    accessibility: { wheelchair: tags.wheelchair || null, access: tags.access || null },
    verification: "community_source",
    source: {
      name: "OpenStreetMap contributors",
      url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      retrievedAt: generatedAt.slice(0, 10)
    }
  };
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
  const healthcare = {
    hospital: "hospital", clinic: "clinic", doctor: "doctor", pharmacy: "pharmacy",
    first_aid: "first_aid", blood_donation: "blood_bank"
  };
  if (healthcare[tags.healthcare]) return healthcare[tags.healthcare];
  const amenities = {
    hospital: "hospital", clinic: "clinic", doctors: "doctor", pharmacy: "pharmacy",
    police: "police", fire_station: "fire_station", shelter: "shelter",
    social_facility: tags.social_facility === "shelter" ? "homeless_shelter" : "shelter",
    drinking_water: "drinking_water", toilets: tags.wheelchair === "yes" ? "accessible_toilets" : "toilets",
    shower: "shower", telephone: "public_phone", fuel: "fuel",
    charging_station: "charging", internet_cafe: "internet_access"
  };
  if (amenities[tags.amenity]) return amenities[tags.amenity];
  if (tags.tourism === "alpine_hut") return "alpine_hut";
  if (tags.tourism === "wilderness_hut") return "wilderness_hut";
  if (tags.information === "guidepost") return "guidepost";
  if (tags.information === "map") return "information_map";
  if (tags.office === "diplomatic") return "embassy";
  if (tags.changing_table === "yes") return "baby_changing";
  return null;
}

async function fetchOverpass(query, regionId) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];
  const errors = [];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "PROXAID-offline-data-builder/0.2 (GitHub Actions)"
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(210000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      errors.push(`${new URL(endpoint).hostname}: ${error.message}`);
    }
  }
  throw new Error(`Overpass-frissítés sikertelen (${regionId}): ${errors.join("; ")}`);
}

function normalizePhone(value) {
  const normalized = String(value ?? "").split(/[;,]/, 1)[0].replace(/[^+\d*#]/g, "");
  return normalized || null;
}

function normalizeWebsite(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
