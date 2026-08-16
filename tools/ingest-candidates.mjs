import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const root = new URL("../", import.meta.url);
const inbox = new URL("data/inbox/", root);
const review = new URL("data/review/", root);
await mkdir(inbox, { recursive: true }); await mkdir(review, { recursive: true });

const files = (await readdir(inbox, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.toLowerCase() !== "readme.md");
const candidates = [];
for (const file of files) {
  const sourcePath = new URL(file.name, inbox), content = await readFile(sourcePath, "utf8"), extension = extname(file.name).toLowerCase();
  const rows = extension === ".json" ? parseJson(content) : extension === ".csv" ? parseCsv(content) : [".md", ".txt"].includes(extension) ? parseMarkdown(content) : [];
  for (const row of rows) {
    const candidate = normalize(row, file.name);
    if (candidate) candidates.push(candidate);
  }
}

const deduped = [...new Map(candidates.map((item) => [`${item.category}:${item.name.toLowerCase()}:${item.coordinates?.lat ?? ""}:${item.coordinates?.lon ?? ""}`, item])).values()];
let previous = null;
try { previous = JSON.parse(await readFile(new URL("candidates.json", review), "utf8")); } catch {}
const unchanged = previous && JSON.stringify(previous.candidates || []) === JSON.stringify(deduped);
const output = { schemaVersion: 1, generatedAt: unchanged ? previous.generatedAt : new Date().toISOString(), status: "review_required", candidates: deduped };
await writeFile(new URL("candidates.json", review), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`${files.length} inboxfájl, ${deduped.length} ellenőrzendő jelölt.`);

function parseJson(content) {
  const value = JSON.parse(content);
  return Array.isArray(value) ? value : value.records || value.candidates || [value];
}

function parseCsv(content) {
  const lines = content.replace(/\r/g, "").split("\n").filter(Boolean); if (!lines.length) return [];
  const headers = csvLine(lines.shift()); return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header.trim(), csvLine(line)[index]?.trim() || ""])));
}

function csvLine(line) {
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

function parseMarkdown(content) {
  const rows = []; let current = null;
  for (const rawLine of content.replace(/\r/g, "").split("\n")) {
    const heading = rawLine.match(/^#{2,3}\s+(.+)$/); if (heading) { if (current) rows.push(current); current = { name: heading[1].trim() }; continue; }
    const field = rawLine.match(/^[-*]?\s*([A-Za-z_][A-Za-z0-9_ -]*):\s*(.+)$/); if (current && field) current[field[1].trim().toLowerCase().replaceAll(" ", "_")] = field[2].trim();
  }
  if (current) rows.push(current); return rows;
}

function normalize(row, inputFile) {
  const name = String(row.name || row.title || "").trim(), category = String(row.category || row.type || "").trim().toLowerCase().replaceAll(" ", "_");
  const sourceUrl = validUrl(row.source_url || row.sourceUrl || row.url), sourceUrl2 = validUrl(row.source_url_2 || row.sourceUrl2), lat = number(row.lat || row.latitude), lon = number(row.lon || row.lng || row.longitude);
  if (!name || !category || !sourceUrl) return null;
  const coordinates = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : null;
  const fingerprint = createHash("sha256").update(`${category}|${name}|${sourceUrl}|${lat}|${lon}`).digest("hex").slice(0, 20);
  return {
    candidateId: `candidate-${fingerprint}`, name, category, coordinates,
    address: String(row.address || "").trim() || null, phone: String(row.phone || "").trim() || null,
    email: String(row.email || "").trim() || null, website: validUrl(row.website || row.contact_website),
    contacts: {
      mobile: String(row.mobile || row.contact_mobile || "").trim() || null,
      fax: String(row.fax || row.contact_fax || "").trim() || null,
      facebook: validUrl(row.facebook || row.contact_facebook), instagram: validUrl(row.instagram || row.contact_instagram),
      linkedin: validUrl(row.linkedin || row.contact_linkedin), twitter: validUrl(row.twitter || row.contact_twitter),
      mastodon: validUrl(row.mastodon || row.contact_mastodon), youtube: validUrl(row.youtube || row.contact_youtube),
      telegram: String(row.telegram || row.contact_telegram || "").trim() || null,
      whatsapp: String(row.whatsapp || row.contact_whatsapp || "").trim() || null
    },
    openingHours: String(row.opening_hours || row.openingHours || "").trim() || null,
    access: String(row.access || "").trim() || null, wheelchair: String(row.wheelchair || "").trim() || null,
    country: String(row.country || "").trim() || null, region: String(row.region || "").trim() || null, locality: String(row.locality || row.city || "").trim() || null,
    validFrom: String(row.valid_from || row.validFrom || "").trim() || null,
    validTo: String(row.valid_to || row.validTo || "").trim() || null,
    landmark: String(row.landmark || "").trim() || null,
    temporary: ["yes", "true", "1"].includes(String(row.temporary || "").trim().toLowerCase()),
    checkedAt: String(row.checked_at || row.checkedAt || "").trim() || null,
    source: { url: sourceUrl, urls: [sourceUrl, sourceUrl2].filter(Boolean), evidence: String(row.evidence || row.description || "").trim() || null, inputFile },
    review: { state: "pending", checksRequired: ["coordinates", "current_access", "opening_hours", "public_contacts", "live_urls", "second_source", "source_rights", "duplicate"] }
  };
}

function number(value) { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) ? parsed : NaN; }
function validUrl(value) { try { const url = new URL(String(value || "")); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; } }
