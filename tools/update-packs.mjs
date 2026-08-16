import { readFile, stat, unlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const regions = JSON.parse(await readFile(new URL("data/regions.json", root), "utf8"));
const catalogUrl = new URL("data/catalog.json", root);
const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
const generatedAt = new Date().toISOString();
const version = generatedAt.slice(0, 10).replaceAll("-", ".");
const mode = process.argv.find((argument) => argument.startsWith("--mode="))?.split("=")[1] || "monthly";
if (!["monthly", "temporary", "quarterly", "audit"].includes(mode)) throw new Error(`Ismeretlen frissítési mód: ${mode}`);

if (mode === "audit") {
  const sources = JSON.parse(await readFile(new URL("data/sources.json", root), "utf8"));
  const checks = [];
  for (const source of sources.sources ?? []) {
    if (!source.id || !source.url || !source.cadence || !source.license) throw new Error(`Hiányos forrásleíró: ${source.id ?? "ismeretlen"}`);
    new URL(source.url);
    try {
      let response = await fetch(source.url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(20000) });
      if ([403, 405].includes(response.status)) response = await fetch(source.url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(20000) });
      await response.body?.cancel(); checks.push({ id: source.id, ok: response.ok, status: response.status, finalUrl: response.url });
    } catch (error) { checks.push({ id: source.id, ok: false, error: error.message }); }
  }
  sources.lastAuditAt = generatedAt;
  await writeFile(new URL("data/sources.json", root), `${JSON.stringify(sources, null, 2)}\n`, "utf8");
  await writeFile(new URL("data/review/source-audit.json", root), `${JSON.stringify({ schemaVersion: 1, generatedAt, status: checks.every((item) => item.ok) ? "passed" : "review_required", checks }, null, 2)}\n`, "utf8");
  console.log(`${sources.sources.length} forrásleíró auditálva.`);
  process.exit(0);
}

for (const region of regions.regions.filter((item) => item.enabled)) {
  const [south, west, north, east] = region.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const regularQuery = `[out:json][timeout:180];(
    nwr["emergency"~"^(defibrillator|phone|ambulance_station|mountain_rescue|assembly_point|water_rescue|lifeguard|access_point|emergency_ward_entrance)$"](${bbox});
    nwr["amenity"~"^(hospital|clinic|doctors|pharmacy|police|fire_station|shelter|social_facility|drinking_water|toilets|shower|telephone|lavoir|fuel|charging_station|internet_cafe)$"](${bbox});
    nwr["healthcare"~"^(hospital|clinic|doctor|pharmacy|first_aid|blood_donation)$"](${bbox});
    nwr["shop"~"^(chemist|medical_supply)$"](${bbox});
    nwr["shop"="laundry"](${bbox});
    nwr["tourism"~"^(alpine_hut|wilderness_hut|information)$"](${bbox});
    nwr["information"~"^(guidepost|map)$"](${bbox});
    nwr["changing_table"="yes"](${bbox});
    nwr["office"="diplomatic"](${bbox});
  );out center tags;`;
  const temporaryQuery = `[out:json][timeout:180];(
    nwr["emergency"~"^(assembly_point|disaster_response|temporary_shelter)$"](${bbox});
    nwr["social_facility"~"^(shelter|food_bank|soup_kitchen)$"]["temporary"="yes"](${bbox});
    nwr["amenity"~"^(shelter|toilets|shower|drinking_water|first_aid)$"]["temporary"="yes"](${bbox});
    nwr["opening_date"](${bbox});
    nwr["start_date"]["end_date"](${bbox});
  );out center tags;`;

  if (mode === "monthly" && region.mapOutput && region.mapId) {
    const mapQuery = `[out:json][timeout:300];(
      node["place"](${bbox});
      way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|unclassified|living_street|pedestrian|road|cycleway|footway|path|track)$"](${bbox});
      way["waterway"~"^(river|stream|canal)$"](${bbox});
      nwr["natural"="water"](${bbox});
      way["railway"]["railway"!~"^(abandoned|disused|razed)$"](${bbox});
      way["landuse"~"^(residential|commercial|retail|industrial|forest|meadow|grass|cemetery)$"](${bbox});
      way["boundary"="administrative"]["admin_level"~"^(6|7|8|9|10)$"](${bbox});
      nwr["emergency"~"^(defibrillator|phone|ambulance_station|mountain_rescue|assembly_point|water_rescue|lifeguard|access_point|emergency_ward_entrance)$"](${bbox});
      nwr["amenity"~"^(hospital|clinic|doctors|pharmacy|police|fire_station|shelter|social_facility|drinking_water|toilets|shower|telephone|lavoir|fuel|charging_station|internet_cafe)$"](${bbox});
      nwr["healthcare"~"^(hospital|clinic|doctor|pharmacy|first_aid|blood_donation)$"](${bbox});
      nwr["shop"~"^(chemist|medical_supply)$"](${bbox});
      nwr["shop"="laundry"](${bbox});
      nwr["changing_table"="yes"](${bbox});
      nwr["tourism"~"^(alpine_hut|wilderness_hut|information)$"](${bbox});
      nwr["information"~"^(guidepost|map)$"](${bbox});
    );out body geom;`;
    const rawMap = await fetchOverpass(mapQuery, region.mapId);
    const tempPath = join(tmpdir(), `proxaid-${region.id}-${Date.now()}.json`);
    await writeFile(tempPath, JSON.stringify(rawMap));
    try { await runNode([new URL("build-overpass-pack.mjs", import.meta.url).pathname, tempPath, region.mapOutput, `data/packs/${region.id}.json`]); }
    finally { await unlink(tempPath).catch(() => {}); }
    const packDescriptor = catalog.packs.find((item) => item.id === region.id), mapDescriptor = catalog.maps.find((item) => item.id === region.mapId);
    if (packDescriptor) { packDescriptor.version = version; packDescriptor.estimatedBytes = (await stat(new URL(`data/packs/${region.id}.json`, root))).size; }
    if (mapDescriptor) { mapDescriptor.version = version; mapDescriptor.estimatedBytes = (await stat(new URL(region.mapOutput, root))).size; }
    continue;
  }

  const targetId = mode === "temporary" ? `${region.id}-events` : region.id;
  const raw = await fetchOverpass(mode === "temporary" ? temporaryQuery : regularQuery, targetId);
  const records = raw.elements
    .map((element) => normalizeElement(element, mode))
    .filter(Boolean)
    .filter((record) => record.coordinates.lon >= west && record.coordinates.lon <= east && record.coordinates.lat >= south && record.coordinates.lat <= north);
  if (!records.length && mode !== "temporary") throw new Error(`Üres Overpass-válasz, a meglévő csomag megőrizve: ${targetId}`);
  if (records.length > (region.maximumRecords ?? 25000)) {
    throw new Error(`A régió ${records.length} rekordja meghaladja a biztonsági korlátot; bontsd kisebb területekre: ${region.id}`);
  }
  const pack = {
    schemaVersion: 1,
    packId: targetId,
    version,
    generatedAt,
    license: "OpenStreetMap contributors, ODbL 1.0 — https://www.openstreetmap.org/copyright",
    records
  };
  const text = `${JSON.stringify(pack, null, 2)}\n`;
  await writeFile(new URL(`data/packs/${targetId}.json`, root), text, "utf8");
  const descriptor = catalog.packs.find((item) => item.id === targetId);
  if (descriptor) {
    descriptor.version = version;
    descriptor.estimatedBytes = Buffer.byteLength(text);
  }
}

if (mode === "quarterly") {
  const sources = JSON.parse(await readFile(new URL("data/sources.json", root), "utf8"));
  const due = sources.sources.filter((source) => source.cadence === "quarterly").map((source) => ({ id: source.id, name: source.name, url: source.url, categories: source.categories, checksRequired: ["availability", "coverage", "licence", "sample_records"] }));
  await writeFile(new URL("data/review/source-review.json", root), `${JSON.stringify({ schemaVersion: 1, generatedAt, status: "review_required", due }, null, 2)}\n`, "utf8");
}

catalog.generatedAt = generatedAt;
await writeFile(catalogUrl, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

function normalizeElement(element, refreshMode) {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const category = categoryFor(tags);
  if (!category) return null;
  const fallbackName = {
    aed: "Defibrillátor (AED)", emergency_phone: "Segélytelefon",
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
    categories: categoryMemberships(category),
    kind: "place",
    description: tags.description || tags.operator || null,
    address: addressFor(tags),
    landmark: tags.loc_name || null,
    locality: tags["addr:city"] || tags["addr:place"] || null,
    region: tags["addr:state"] || null,
    country: tags["addr:country"] || null,
    phone: normalizePhone(tags["contact:phone"] || tags.phone),
    email: normalizeEmail(tags["contact:email"] || tags.email),
    website: normalizeWebsite(tags["contact:website"] || tags.website || tags.url),
    contacts: {
      mobile: normalizePhone(tags["contact:mobile"] || tags.mobile), fax: normalizePhone(tags["contact:fax"] || tags.fax),
      facebook: normalizeWebsite(tags["contact:facebook"] || tags.facebook), instagram: normalizeWebsite(tags["contact:instagram"] || tags.instagram),
      linkedin: normalizeWebsite(tags["contact:linkedin"] || tags.linkedin), twitter: normalizeWebsite(tags["contact:twitter"] || tags.twitter),
      mastodon: normalizeWebsite(tags["contact:mastodon"] || tags.mastodon), youtube: normalizeWebsite(tags["contact:youtube"] || tags.youtube),
      telegram: String(tags["contact:telegram"] || tags.telegram || "").trim() || null,
      whatsapp: String(tags["contact:whatsapp"] || tags.whatsapp || "").trim() || null
    },
    coordinates: { lat, lon },
    openingHours: tags.opening_hours || null,
    tags: searchTags,
    accessibility: { wheelchair: tags.wheelchair || null, access: tags.access || null },
    verification: "community_source",
    confidence: tags.source || tags.check_date ? "medium" : "unverified",
    validFrom: tags.start_date || tags.opening_date || null,
    validTo: tags.end_date || null,
    expiresAt: refreshMode === "temporary" ? new Date(Date.now() + 14 * 86400000).toISOString() : null,
    source: {
      name: "OpenStreetMap contributors",
      url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      retrievedAt: generatedAt.slice(0, 10)
    }
  };
}

function categoryMemberships(category) {
  const memberships = {
    hospital: ["healthcare"], clinic: ["healthcare"], doctor: ["healthcare"], pharmacy: ["healthcare"], medical_supply: ["healthcare"], hospital_emergency: ["healthcare", "urgent"],
    urgent_care: ["healthcare", "urgent"], aed: ["urgent"], ambulance: ["urgent", "rescue"], police: ["rescue"], fire_station: ["rescue"],
    toilets: ["hygiene"], accessible_toilets: ["hygiene"], shower: ["hygiene"], washing: ["hygiene"], laundry: ["hygiene"], baby_changing: ["hygiene"], drinking_water: ["water"],
    shelter: ["shelter"], homeless_shelter: ["shelter"], food_assistance: ["shelter"], alpine_hut: ["shelter"], wilderness_hut: ["shelter"],
    public_phone: ["connection"], emergency_phone: ["connection", "urgent"]
  };
  return memberships[category] || [];
}

function categoryFor(tags) {
  if (tags.emergency === "defibrillator") return "aed";
  if (tags.emergency === "phone") return "emergency_phone";
  if (tags.emergency === "ambulance_station") return "ambulance";
  if (tags.emergency === "mountain_rescue") return "mountain_rescue";
  if (tags.emergency === "assembly_point") return "assembly_point";
  if (tags.emergency === "disaster_response") return "disaster_response";
  if (tags.emergency === "temporary_shelter") return "shelter";
  if (tags.emergency === "water_rescue") return "water_rescue";
  if (tags.emergency === "lifeguard") return "lifeguard";
  if (tags.emergency === "access_point") return "emergency_access_point";
  if (tags.emergency === "emergency_ward_entrance") return "hospital_emergency";
  const healthcare = {
    hospital: "hospital", clinic: "clinic", doctor: "doctor", pharmacy: "pharmacy",
    first_aid: "first_aid", blood_donation: "blood_bank"
  };
  if (healthcare[tags.healthcare]) return healthcare[tags.healthcare];
  if (tags.shop === "chemist") return "pharmacy";
  if (tags.shop === "medical_supply") return "medical_supply";
  if (tags.shop === "laundry") return "laundry";
  const amenities = {
    hospital: "hospital", clinic: "clinic", doctors: "doctor", pharmacy: "pharmacy",
    police: "police", fire_station: "fire_station", shelter: "shelter",
    social_facility: ["food_bank", "soup_kitchen"].includes(tags.social_facility) ? "food_assistance" : tags.social_facility === "shelter" ? "homeless_shelter" : "shelter",
    drinking_water: "drinking_water", toilets: tags.wheelchair === "yes" ? "accessible_toilets" : "toilets",
    shower: "shower", telephone: "public_phone", fuel: "fuel",
    charging_station: "charging", internet_cafe: "internet_access", first_aid: "first_aid"
  };
  if (amenities[tags.amenity]) return amenities[tags.amenity];
  if (tags.amenity === "lavoir") return "washing";
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

function addressFor(tags) {
  if (tags["addr:full"]) return tags["addr:full"];
  const street = tags["addr:street"] || tags["addr:place"] || "";
  return [tags["addr:postcode"], tags["addr:city"], street, tags["addr:housenumber"]].filter(Boolean).join(" ") || null;
}

function normalizeWebsite(value) {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function normalizeEmail(value) {
  const email = String(value ?? "").trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
}

function runNode(argumentsList) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, argumentsList, { cwd: root, stdio: "inherit" });
    child.once("error", reject); child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Adatépítő kilépési kód: ${code}`)));
  });
}
