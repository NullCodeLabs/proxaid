# Version evolution

This file records notable public PROXAID changes. Documentation edits, data refreshes, regeneration, tests and repackaging do not increment the product version.

## v1.0 — 2026-08-15

### Application

- Unified mobile-first interface for phones, tablets and desktop browsers.
- Fixed touch targets, safe-area layout, wrapping and the mobile search input.
- ALWAYS ON speech output, separate `MIC ON` input and visible HU/EN override.
- Phone, Skype, Viber and generic calling options.
- Web NFC read/write plus system-share MESH/Meshtastic emergency payload and location sharing.

### Map and data

- Replaced the world overview with a locally packaged, zoomable and pannable South Zala street map.
- Added 3,809 map features and 157 OpenStreetMap points to the regional pack.
- Added searchable Szepetnek pharmacy, Nagykanizsa pharmacies, toilets, water, healthcare and public-safety points.
- Added the Nagykanizsa Police Station AED as a separate official-source record.
- Location focus now uses street-level zoom and a GPS accuracy circle.
- Results use real coordinates and straight-line distance among downloaded records.

### First aid and CPR

- Added weighted local emergency search with spelling and synonym tolerance.
- Added nine source-linked first-aid branches with offline Hungarian and English text.
- Separated adult hands-only CPR from 30:2 compressions and rescue breaths.
- Added local 110 BPM pacing, 30:2 counting and screen wake-lock request.
- Added checksummed Hungarian narrated hands-only audio.
- Browser language now selects the relevant Hungarian or English online resource for the chosen CPR mode.

### Offline and security

- Pre-caches the app, local Leaflet renderer, South Zala map, point data, first-aid data and Hungarian audio.
- Separate readiness state for app, map, records and guide/audio content.
- OS-specific low-storage help without raw browser-quota output.
- No analytics, advertising, external runtime scripts or external map tiles.

[Hungarian changelog](./changelog_hu.md)
