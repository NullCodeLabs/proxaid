# PROXAID v1.0 — offline emergency map and first aid

> Critical information should not disappear when the network does.

[![Deploy GitHub Pages](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml)
[![Refresh offline data](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml)

PROXAID is an offline-first web app for phones, tablets and computers. v1.0 contains a detailed local street map for South Zala, source-linked emergency and essential-service points, and Hungarian/English first-aid guidance. It loads no analytics, advertising, external runtime scripts or map tiles.

[Hungarian README](./README_hu.md) · [Changelog](./changelog.md)

> [!CAUTION]
> In immediate danger, call the local emergency number and follow the dispatcher. The app is not an emergency service and does not replace professional training or on-scene judgement.

## Included in v1.0

- Mobile-first responsive interface for touch, keyboard, phone, tablet and desktop.
- Local South Zala street map derived from OpenStreetMap: roads, named walking/cycling/trail paths, water and settlements.
- Street-level pinch zoom, pan, GPS focus and accuracy circle.
- 165 starter records, including Szepetnek pharmacy, Nagykanizsa pharmacies, toilets, drinking water, healthcare points and the officially sourced AED at Nagykanizsa Police Station.
- Distance ordering only among records downloaded to the current app instance.
- Local fuzzy and contextual search for spelling variation, accents, synonyms and emergency phrases.
- Weighted first-aid matches for cardiac arrest, recovery position, choking, severe bleeding, drowning, burns, infant fever, accidents and multiple casualties.
- ALWAYS ON UI/instruction speech with a separate `MIC ON` speech-input button.
- Separate adult CPR modes: hands-only and 30 compressions + 2 rescue breaths.
- Local 110 BPM pacing, 30:2 counting, screen wake-lock request and a Hungarian narrated hands-only track.
- Optional Web NFC read/write and universal system-share fallback.
- A timestamped location payload shareable to MESH/Meshtastic or messaging apps.
- Phone, Skype, Viber and generic calling handlers; a user-confirmed working handler is placed first.
- Separate readiness state for app, street map, points, guides and audio, without exposing confusing raw browser quotas.

## CPR modes and language routing

### Hands-only CPR

For an adult when the rescuer is not trained, unable or unwilling to give rescue breaths. The local guide runs continuous compressions at 100–120 per minute.

- Hungarian online content: [OMSZA — Tartsd életben!](https://www.youtube.com/watch?v=CMstTrW4kmc)
- English online content: [British Heart Foundation — Hands-Only CPR](https://www.youtube.com/watch?v=O92KL1mw77c)
- Hungarian offline narration: `assets/audio/cpr_hands_only_hu.mp3`
- Audio source: [Hungarian National Ambulance Service Foundation](https://www.mentoalapitvany.hu/v/tartsd-eletben-ujraelesztes-egyszeruen-es-gyorsan/)

### 30 compressions + 2 rescue breaths

For an adult when the rescuer is trained, able and willing to give breaths. The local pacing pauses after 30 compressions for two breaths, then starts the next cycle.

- Hungarian online content: [Egészségvonal — Újraélesztés](https://egeszsegvonal.gov.hu/egeszseg-a-z/u-u/ujraelesztes.html)
- English online content: [Resuscitation Council UK — How to do CPR](https://www.resus.org.uk/public-resource/how-do-cpr)
- Offline: Hungarian and English text, speech output and local 30:2 pacing.

The initial language follows the browser. Hungarian browsers receive Hungarian resources; every other browser language falls back to reviewed English resources. The visible `HU / EN` selector can override this. The online action always matches the selected CPR mode.

*The 2025 lifesaving branches are supported by Resuscitation Council guidance: [Adult BLS 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines) and [First Aid 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/first-aid-guidelines).*

## Offline use

1. Open the site once while online.
2. Select **Refresh now**.
3. Wait until all four readiness rows report downloaded content.
4. Enable airplane mode and test the map, search and both CPR modes.

Installation:

- iPhone / iPad: Safari → Share → Add to Home Screen.
- Android: browser menu → Install or Add to Home screen.
- Windows / macOS / Linux: use the browser install action; normal browser-tab use remains available.

When storage is low, the app shows one warning and the short settings route for the detected operating system.

## Map and point data

The initial South Zala street-map bounds are 16.78–17.15° E and 46.34–46.58° N. Street-level detail is available inside this area; other areas can be added through the same replaceable regional-pack format.

Starter point categories include AED, pharmacy, hospital, clinic, doctor, police, fire station, shelter, drinking water, toilet, accessible toilet and public phone. Every result displays its source and retrieval date.

- Community baseline: [OpenStreetMap contributors — ODbL](https://www.openstreetmap.org/copyright)
- Police-station AED: [police.hu — AED used in a real resuscitation](https://www.police.hu/hu/hirek-es-informaciok/legfrissebb-hireink/kozrendvedelem/elesben-hasznaltak-a-defibrillatort)
- Official Hungarian pharmacy expansion source: [NNGYK pharmacy finder](https://ogyei.gov.hu/?url=gyogyszertarkereso)

## Audio, NFC, MESH and calling

- TTS: UI and instruction speech is enabled by default.
- MIC ON: writes recognized speech into search; typing always remains available.
- CPR audio: separate local pacing/narration, not TTS or microphone input.
- NFC: NDEF read/write on supported Android/Chromium; the same payload uses system sharing elsewhere.
- MESH: shares the emergency payload to a user-selected Meshtastic, MESH or messaging app.
- Calling: `tel:` is primary; Skype, Viber and generic protocols are labelled **Try/Open**.

## Privacy and security

- Location, search and imported records stay in local browser storage.
- No analytics, advertising, external map tiles or third-party runtime code.
- Content Security Policy restricts runtime data connections to the same origin.
- Imported files must match the PROXAID JSON-pack schema.
- A source-linked record does not prove live access or opening status.

## Project files

- `index.html`, `styles.css`, `app.js` — responsive app.
- `sw.js` — offline cache and refresh.
- `data/maps/hu-zala-south.geojson` — local street map.
- `data/packs/hu-west-osm.json` — OpenStreetMap point pack.
- `data/packs/hu-west.json` — curated source records.
- `data/first-aid.json` — bilingual first-aid and CPR decision tree.
- `assets/audio/cpr_hands_only_hu.mp3` — Hungarian narrated hands-only CPR audio.
- `tools/validate.mjs` — release validation for structure, sources, map, CPR and audio hash.

## Local validation and deployment

Node.js 20 or later:

```bash
npm test
```

Service Workers require HTTPS or `localhost`. For GitHub Pages, copy the archive contents to the repository root, select **GitHub Actions** as the Pages source, and push to `main`.

## v1.0 version rule

Documentation edits, data refreshes, regeneration, tests and repackaging do not increment the product version. The canonical release remains v1.0 and the distribution archive is `proxaid-offline.zip`.
