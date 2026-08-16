# When trouble hits but there is no internet — perhaps no phone or GPS coverage either. Not just for adrenaline seekers.

> **An offline-capable emergency map with first-aid support.**

**PROXAID v1.0**

## Open the app

**[Launch PROXAID](https://nullcodelabs.github.io/proxaid/)** — open it online once, allow location only when needed, press **Refresh now**, then test the installed copy in airplane mode.

[Magyar README](./README_hu.md) · [Detailed User Guide](./user-guide.md) · [Sources](./sources.md) · [Changelog](./changelog.md)

## What it is and who it is for

PROXAID is a global, responsive, offline-first emergency PWA for the public, travellers, outdoor users, event teams and responders. It keeps essential guidance and collected place data usable when connectivity degrades.

The bundled reference data demonstrates one regional pipeline, not a product boundary. Online mapping and nearby discovery work worldwide; offline coverage expands through collected records and importable regional maps.

> [!IMPORTANT]
> In immediate danger, call the local emergency number and follow the dispatcher.

## Capabilities

- Global labelled OpenStreetMap online; on-demand offline saving of a 12 km street/road/water/place layer, plus persistent import of additional GeoJSON regions.
- Worldwide 15 km essential-place discovery around GPS or the current map centre; collected results remain available offline.
- Address/landmark, exact GPS, current open/closed state, today's hours, full schedule, public contacts, route handoff, live website and source links where published.
- Overlapping filters for urgent care, healthcare, defibrillator (AED), pharmacy, water, hygiene, shelter, rescue and communication.
- Contextual offline search for emergency phrases, accents, partial words, spelling variation and reviewed synonyms.
- Speech output enabled by default; separate `MIC ON` speech input.
- Separate hands-only and 30:2 CPR modes, local 110/min pacing and Hungarian hands-only narration.
- HERO multiple-casualty guidance and HeroHUB handover by QR, NFC, system sharing, copy or JSON.
- Editable local emergency number with `tel:`/SMS/app handoff/copy/QR, plus an on-device medical card with QR/NFC/share handover.
- Direct CSV, JSON and GeoJSON import; a global research prompt and review queue for additional sources.
- Responsive layout for phones, tablets and desktop browsers; installable PWA and offline application shell.
- No analytics or advertising trackers.

## Quick use

1. Open the live app online and press **My location** or move the map to the target area.
2. Press **Refresh now** to collect the current 15 km place area and 12 km offline street map.
3. Search or choose a category; press **Show** for the map and **Details** for hours and contacts.
4. Install the PWA, then verify map, search, guides, QR and CPR in airplane mode.
5. For immediate danger use the emergency call first; for multiple casualties use **HERO** and **HeroHUB**.

## Repository mini-guide

The project is a static PWA. Serve the repository over HTTPS or `localhost`; no build step is required. Node.js 20 or later is used for validation and data tooling:

```bash
npm test
```

GitHub Actions deploys Pages and runs weekly, monthly, quarterly and annual data workflows. Web-research/LLM output can enter the review queue through the canonical CSV prompt in [`data/inbox/README.md`](./data/inbox/README.md). Only reviewed records belong in public offline packs.

## Data and privacy

Online map mode requests OpenStreetMap tiles. Online nearby discovery sends the requested GPS/map-centre area to an Overpass endpoint. Searches, imported packs and HeroHUB drafts otherwise stay local until the user shares or exports them.

Detailed operation, platform notes, NFC/MESH behaviour, data flow and troubleshooting are in the **[User Guide](./user-guide.md)**. Clinical and technical references are in **[Sources](./sources.md)**.

Documentation, data refreshes, tests and repackaging do not increment the product version. The canonical product version remains **v1.0**.
