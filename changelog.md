# Version evolution

This file records notable public PROXAID changes. Documentation edits, data refreshes, regeneration, tests and repackaging do not increment the product version.

## v1.0 — 2026-08-16

### Application

- Unified mobile-first interface for phones, tablets and desktop browsers.
- Fixed touch targets, safe-area layout, wrapping and the mobile search input.
- ALWAYS ON speech output, separate `MIC ON` input and visible HU/EN override.
- Primary `tel:` call, system handoff, number copy and a `tel:` QR code; retired or unreliable direct app links were removed.
- Web NFC read/write plus system-share MESH/Meshtastic emergency payload and location sharing.
- Added HERO mass-casualty guidance and the HeroHUB incident handover card with offline QR, NFC, system Bluetooth/MESH handoff, copy and JSON export.
- Added screen-pixel/visual-viewport sizing for mobile keyboards, orientation changes and compact phones.
- Stopped TTS before microphone capture so speech input does not transcribe the app's own announcement.
- Extended the microphone session to 30 seconds and kept the MIC control outside automatic speech output.
- Added in-app popup rendering for the selected cached HU/EN README, User Guide and Sources files, plus the one-tap invitation message.
- Added an on-device medical card with QR, NFC and system-share handover.
- Added a browser-region starter emergency number with manual override, call, SMS handoff, system sharing, copy and QR.
- Reframed the README as a concise product/repository entry point with a commented live-app link; detailed operation stays in the English and Hungarian User Guides.

### Map and data

- Added an unrestricted labelled global OpenStreetMap online layer and a bundled zoomable offline regional street map.
- Added worldwide on-demand essential-place discovery within 15 km of GPS or map centre, with 720-hour per-area caching for offline reuse.
- Added worldwide on-demand saving of a 12 km offline street map with place, road, path, water and rail layers.
- Added persistent import and activation of arbitrary regional GeoJSON map packs; catalogue maps can switch automatically when they cover the active location.
- Added 3,809 map features and 157 OpenStreetMap points to the regional pack.
- Added searchable Szepetnek pharmacy, Nagykanizsa pharmacies, toilets, water, healthcare and public-safety points.
- Added the Nagykanizsa Police Station defibrillator (AED) as a separate official-source record.
- Location focus now uses street-level zoom and a GPS accuracy circle.
- Results use real coordinates and straight-line distance among downloaded records.
- Result cards show today's source rule; a details popup shows the full opening schedule, all published public contacts, website, GPS and source links.
- Added current open/closed status for simple opening-hour rules plus device-map and online route handoff.
- Added dynamic settlement, street and road-number labels, road casings and zoom-dependent label density.
- Replaced exact-only category filters with overlapping emergency, healthcare, hygiene, shelter, rescue and connection facets.
- Added an online, location-aware source-verification prompt when installed records return no result.
- Added monthly, weekly, quarterly and annual GitHub Actions cadences, direct CSV/JSON/GeoJSON app import and a reviewed global JSON/CSV/Markdown/TXT queue with every public contact, GPS, live-URL and source field.

### First aid and CPR

- Added weighted local emergency search with spelling and synonym tolerance.
- Added nine source-linked first-aid branches with offline Hungarian and English text.
- Separated adult hands-only CPR from 30:2 compressions and rescue breaths.
- Added local 110 BPM pacing, 30:2 counting and screen wake-lock request.
- Added checksummed Hungarian narrated hands-only audio.
- Browser language now selects the relevant Hungarian or English online resource for the chosen CPR mode.

### Offline and security

- Pre-caches the app, local Leaflet renderer, bundled reference map, point data, first-aid data and Hungarian audio; online tiles and on-demand discovery remain optional network additions.
- Separate readiness state for app, map, records and guide/audio content.
- OS-specific low-storage help without raw browser-quota output.
- No analytics, advertising or external runtime scripts. Online mode requests OpenStreetMap tiles and Overpass place data; offline mode uses stored assets and records.

[Hungarian changelog](./changelog_hu.md)
