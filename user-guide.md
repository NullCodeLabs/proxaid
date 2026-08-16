# PROXAID v1.0 User Guide

**[Open the PROXAID app](https://nullcodelabs.github.io/proxaid/)** — prepare it online, then verify the installed copy in airplane mode. [Back to the concise README](./README.md).

## Emergency first

Call the local emergency number in immediate danger and follow the dispatcher. Use speakerphone so you can act while receiving instructions.

## Install and prepare offline use

1. Open PROXAID online.
2. Press **Refresh now**.
3. Wait until App, Street map, Local places and First aid/audio report downloaded.
4. Install from Safari Share on iPhone/iPad, or the browser install menu on Android and desktop.
5. Switch to airplane mode and test map, search, HERO, QR and both CPR modes.

Windows, macOS and Linux can use a supported browser install action or a normal browser tab. iPhone/iPad uses Safari Share; Android uses the browser install or home-screen action.

Each browser profile and installed copy keeps its own local data. Refresh the copy you intend to carry.

## Screen and controls

The layout uses the visible screen width and height, including orientation, the on-screen keyboard and display safe areas. Browser zoom remains available. All primary touch targets are at least 42 pixels high.

## Global map and offline regional packs

- Pinch or scroll to zoom; drag to move.
- The standard labelled OpenStreetMap layer is used online.
- Online navigation is worldwide and has no reference-region bounds.
- **My location** requests GPS, moves to street level anywhere online, starts a 15 km essential-place discovery and saves a 12 km offline street map.
- **Refresh now** uses GPS, or the current map centre when GPS is unavailable, and keeps the collected records plus street/road/water/place layers for offline use.
- The bundled reference street map remains available offline; it demonstrates one regional pipeline and does not limit the global project scope.
- `+` and `−` change zoom; `◎` returns to the current GPS position or the bundled reference view.
- Settlement and main-road labels appear at lower zoom; street names and road numbers appear when closer.
- **Show** on a result focuses the point at street level.

Before travelling, open the destination on the online map and press **Refresh now**. Result cards and map popups expose an address or nearby identifier, exact GPS coordinates, current status and today's opening hours. **Details** opens the source-formatted full hours, all published public contacts, live website and evidence links; **Route** hands the destination to the device map or an online routing service.

## Places and category filters

Results come from bundled, imported and previously discovered records. With location permission they are ordered by straight-line distance. Filter buttons report the stored count and clear the prior text query when selected. Filters overlap where useful:

- Emergency + urgent: emergency call, ambulance, emergency department, urgent care, hospital and clinic.
- Hospital + doctor: hospital, emergency department, urgent care, clinic and doctor.
- Hygiene: toilets, accessible toilets, shower, washing and baby-changing records.
- Shelter: shelter, night/warming/cooling centre, alpine or wilderness hut.
- Rescue: ambulance, police, fire, mountain/water rescue and assembly points.

Every result shows its provenance and retrieval date when present. Check live opening and access before travelling when a connection is available.

## Context search

Type a place, service or plain-language emergency phrase. The local matcher handles accents, partial words, small spelling errors and reviewed synonyms. A weighted emergency match appears above place results. Open it for the action guide.

When an online search returns zero local records, **Online search prompt** shares a location-aware, source-checking prompt to an installed search or AI application. Its answer is an unverified online lead until confirmed.

## Speech and audio

- Speech output is enabled by default and reads controls and opened guidance.
- **MIC ON** cancels current speech first, then listens for up to 30 seconds and writes interim recognition into search. Press it again to stop.
- CPR pacing and narration are separate from speech output and microphone input.
- The included Hungarian narrated track is hands-only CPR. The 30:2 mode uses local text, speech and pacing.

## Adult CPR

Choose **Hands-only CPR** when rescue breaths cannot be given. Choose **30 compressions + 2 breaths** when trained, able and willing. The local pacer runs at 110 compressions per minute within the recommended 100–120 range. Follow the dispatcher and defibrillator (AED) prompts over the app.

## HERO — multiple casualties

Open **HERO** for a short spoken sequence:

1. Stop in a safe place; identify traffic, fire, electricity, collapse and hazardous materials.
2. Call emergency services on speakerphone; report exact location, hazards, estimated number affected and access.
3. Do not perform professional triage unless trained; follow the dispatcher and assign specific helpers.
4. Control severe bleeding. Check breathing in an unresponsive person; start CPR and request a defibrillator (AED) for abnormal breathing.
5. Move walking casualties to a safe assembly point only when the route is safe.

## HeroHUB — responder handover

HeroHUB stores observable facts, not diagnoses:

- GPS or written meeting point;
- visible hazards/event type;
- estimated number affected;
- unresponsive/abnormal-breathing count;
- severe-bleeding count;
- trapped count;
- access notes and optional contact.

Press **Refresh incident card** after changes. Hand it over using:

- QR: universal offline visual transfer;
- NFC: NDEF write where Web NFC is supported;
- Bluetooth/MESH: system share sheet to a compatible installed target;
- Copy: compact JSON text;
- JSON save: file handover or later ingestion.

The packet includes a short checksum against accidental alteration. It is not a cryptographic identity signature. Delivery is confirmed only by the receiving person or target application.

## NFC and MESH

**NFC** reads or writes the emergency-card text on a compatible tag at very short range. **MESH emergency packet** hands the timestamped SOS/incident packet to an installed nearby, Meshtastic or messaging application through the system share sheet. QR and JSON remain platform-neutral handover paths.

## Calling and sharing

The browser region selects a starter emergency number, which can be edited immediately under **Other calling mode**. The `tel:` action is primary. Other paths hand SOS text to SMS, use the system share sheet, copy the number or display a `tel:` QR code for another phone.

## Local medical card

The optional **Local medical card** stores name, birth date, blood type, donor declaration, allergies, medication/anticoagulants, medical history, implants, emergency contact and a short note in this app instance. It can be handed over by QR, NFC or system sharing. Enter only information you would disclose in an emergency; an unlocked device, exported QR or written NFC tag can be read.

## Data refresh and import

The catalogue is checked on startup, reconnection, location change and manual refresh. Online worldwide discovery reads a 15 km area around GPS or the map centre and refreshes each local area no more than monthly unless manually forced. Project automation refreshes general records monthly, temporary records weekly, stable health sources quarterly and source/licence metadata annually.

Use **Import data / map pack** directly with UTF-8 CSV, a PROXAID schema-version-1 record pack, point GeoJSON, a GeoJSON `FeatureCollection` map, or a PROXAID JSON object containing a `map` FeatureCollection. Imported records and the active regional map persist in the current application instance. For global database research, run the canonical prompt from `data/inbox/README.md` in a web-enabled research/LLM tool. Its CSV schema includes GPS, address/landmark, country/region/locality, all published phone and online contacts, full hours, access, wheelchair status, validity, two sources and check time. Place the UTF-8 CSV in `data/inbox/`; GitHub normalizes it into a review queue and publication still requires source review.

## Storage warning

If free browser storage becomes critically low, PROXAID shows one warning. Open the supplied platform instructions, free space, return and press **Refresh now**.

## Privacy

Searches, imported records and HeroHUB drafts stay on the device by default. Online map use requests OpenStreetMap tiles; online place discovery sends the requested GPS/map-centre area to an Overpass endpoint. User content transfers only after a triggered share, NFC write, download or external link. PROXAID contains no analytics or advertising tracker.

## Invite

Press **Invite** to share the current app address. One more prepared phone means one more offline guide, local map and possible relay point when normal networks fail.

## Built-in documents

The footer README, User Guide and Sources buttons open the selected HU/EN document from the offline application cache.

## Troubleshooting

- Blank or old app: go online and press **Refresh now**, then reopen the installed copy.
- Search keyboard: tap directly inside the search field; browser zoom is not required.
- Microphone waits but returns nothing: allow microphone permission, stop other audio and retry; typing remains local.
- No online map labels: check connectivity; offline, zoom closer and press **My location** or a result's **Show** button.
- No nearby result: clear the text/category filter, refresh online, or use the online search prompt. Do not treat absence as proof that a service does not exist.
- NFC unavailable: use HeroHUB QR, system sharing or JSON export.
