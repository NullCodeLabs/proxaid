# 🛡️⛑️ PROXAID // Offline Emergency & Survival Point Terminal

> **When the network disappears, the essentials should not.**

[![Deploy GitHub Pages](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml)
[![Refresh offline data](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml)

PROXAID is an installable, offline-first web terminal for finding locally stored emergency and survival points. It runs from GitHub Pages, keeps its searchable records on the device, and avoids external map tiles, CDNs, analytics, advertising, and location tracking.

> **v1.0 — public technical preview (14 August 2026):** the offline application core, local search, and pack handling provide a working foundation. Focused expansion of the mobile-first interface, detailed street mapping, and regional data coverage is underway. This release is primarily intended for developer evaluation and offline preparedness.

Release history: **[`changelog.md`](./changelog.md)** · [Magyar változásnapló](./changelog_hu.md)

> [!CAUTION]
> **PROXAID is an aid, not an emergency service, medical device, or navigation system.** In immediate danger, call the official local emergency number and follow dispatcher instructions. Calls still require a working telephone network. Community data may be incomplete, inaccurate, or outdated.

## What works now

- **Offline application shell:** the interface, local world overview, and installed data packs remain available after one successful online load.
- **On-device point database:** IndexedDB storage, local text/category search, and distance sorting when location permission is granted.
- **No external map dependency:** a bundled Natural Earth vector overview is drawn locally on a canvas; no tile server, WebGL map SDK, CDN, or tracker is required.
- **Layered data packs:** a small global emergency core, a curated regional pack, and a separately generated OpenStreetMap regional pack.
- **Safe pack replacement:** an updated pack atomically replaces its previous records, so removed upstream entries do not linger locally.
- **Source and freshness labels:** every record carries a source, retrieval date, and verification state.
- **Resilient refresh:** checks on launch, when connectivity returns, after resuming, after significant location change, and on manual request. Periodic background refresh is requested only where the browser supports it.
- **Manual JSON pack import:** prepared regional packs can be transferred and installed without changing the application code.
- **Private-by-design operation:** location is used inside the browser and is not sent to a PROXAID server by this release.

### Exact current offline payload

- Interface: HTML, CSS, JavaScript, manifest, icons, and 404 page.
- Local map: `world-110m.geojson` world overview.
- Data description: catalog, regions, and taxonomy.
- Point data: `global-core`, default-installed `hu-west`, and cached `hu-west-osm`.
- `hu-west-osm` currently contains 0 records. Detailed street maps, route packs, and approved CPR audio are not yet included.

## Install on phones, tablets, and computers

PROXAID targets current supported browser releases and keeps feature-detected fallbacks for older devices, including Safari on iOS 15. Each device must open the site online once before its application shell and selected packs can be used offline.

- **iPhone / iPad:** Safari → **Share** → **Add to Home Screen**. Fallback: Safari tab.
- **Android:** Chrome/Edge/Firefox → **Install app** or **Add to Home screen**. Fallback: browser tab.
- **Windows:** Chrome/Edge install icon. Fallback: Chrome/Edge/Firefox tab.
- **macOS:** Safari → **File → Add to Dock**, or Chrome/Edge install. Fallback: browser tab.
- **Linux:** Chromium/Chrome/Edge build with PWA installation. Fallback: standards-based browser tab.

Official platform instructions: [Apple — web apps on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios), [Apple — web apps on Mac](https://support.apple.com/en-us/104996), [web.dev — desktop PWA installation](https://web.dev/learn/pwa/installation), and [Microsoft Edge — installing PWAs](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux).

**iOS/iPadOS 15 installation path:** Safari → Share → Add to Home Screen.

### What “cross-platform” means here

The same GitHub Pages deployment works on phone, tablet, laptop, and desktop. Every browser/installation has its **own local database and cache**: there is no account, cloud profile, or automatic device-to-device synchronization. An offline app does not synchronize; it reads the last verified local copy. Network refresh can occur only while connectivity and platform execution allow it.

The accepted bridge is a portable signed pack: download one region file to Files/Downloads, USB or removable storage, then import and verify that same file in each browser/PWA. OS sharing, QR manifests and local WebRTC/PairDrop-style transfer may move the file, but cannot inject one browser's IndexedDB or Cache Storage into another browser automatically.

### Global support strategy

Absolute support for every past and future device/browser is not technically possible. PROXAID instead uses capability tiers:

1. **Emergency minimum:** responsive text UI, local emergency numbers, manual search and file import without WebGL, NFC, Bluetooth or speech.
2. **Offline PWA:** Service Worker, local database, geolocation and downloaded data/audio packs.
3. **Detailed map:** regional road map/routing packs where GPU, memory and storage allow, with a list/non-WebGL fallback.
4. **Optional device APIs:** speech, NFC, Bluetooth and richer sharing only after feature detection, permission and a tested fallback.
5. **Native safety tier:** iOS/Android system APIs for background geofencing, local notifications, health stores and reliable external-device integration.

## Offline architecture

PROXAID uses four deliberately separate layers:

1. **Global emergency core** — a very small, always-preloaded set of emergency-number and operating records.
2. **Curated regional core** — hand-maintained, source-linked records that automated community refreshes cannot overwrite.
3. **Generated regional point packs** — bounded OpenStreetMap-derived healthcare, rescue, shelter, water, hygiene, and communication points.
4. **Future large map/route packs** — detailed road graphs and global routing data are intentionally outside this GitHub Pages release.

A detailed global road map plus worldwide emergency and survival datasets cannot responsibly be bundled into a small static site. GitHub Pages has a published-site size limit, while browsers independently control storage quotas and background execution. PROXAID therefore favors small, inspectable, replaceable regional packs.

No single global directory is authoritative enough. The accepted pipeline prefers national/regional official emergency, AED, pharmacy, on-call and health-facility registries, then uses OpenStreetMap/Geofabrik, Overture and healthsites.io as open baselines. Commercial directories such as OPTEN may enrich addresses/contact data only after API, licence, redistribution and freshness review; they cannot override an official operational registry merely because they list a business.

Opening status has three separate states: **scheduled open now** calculated locally from fresh parseable hours, **live open** confirmed by a current authoritative online source, and **unknown/stale**. The app must also calculate the next scheduled opening where possible and must never display a reassuring open state from missing or stale data.

## Search, positioning, and map behavior

- Search works entirely against local records and recognizes names, locations, categories, and tags.
- With permission, browser geolocation adds a local position marker and sorts results by straight-line distance.
- Denying location does not disable search.
- The bundled world view shows orientation and point distribution; it is **not street-level mapping, turn-by-turn navigation, or GPS/cell-tower triangulation**.
- Device GPS may remain available without internet, but availability and accuracy are controlled by the hardware, operating system, browser, permissions, and surroundings.

Szepetnek acceptance test: **My location** focuses Szepetnek at street-level zoom; results appear only at their real coordinates; empty or insufficient local coverage shows **no downloaded verified result** instead of Budapest/default markers.

Distance sorting means **nearest loaded record**, not nearest suitable/open/verified lifesaving resource. Suitability, current availability, route time and coverage confidence must be evaluated separately.

## Refresh and publishing chain

There are two different refresh layers:

- **On the device:** PROXAID checks the published catalog and installed packs at most daily unless the user forces a refresh. On Safari/iOS, the dependable path is opening the app or tapping **Refresh now** because periodic background execution is not guaranteed.
- **In the repository:** `Refresh offline data packs` runs daily and can also be started manually. When it commits changed packs, it explicitly starts `Deploy GitHub Pages`, ensuring the refreshed data is published even though GitHub does not recursively trigger workflows from a normal `GITHUB_TOKEN` push.

The scheduled job is not a real-time guarantee. It can be delayed, fail because an upstream provider is unavailable, or be disabled by GitHub for an inactive public repository. The previous valid pack remains in place when an update is empty, oversized, or invalid.

## Data categories

The model supports emergency numbers, ambulance and emergency departments, hospitals, out-of-hours care, clinics, pharmacies, AEDs, police, fire and rescue, shelters, drinking water, public toilets, showers, laundry, public communication, fuel/charging, trail information, and evacuation-related points.

The category-to-OpenStreetMap mapping is documented in [`data/taxonomy.json`](./data/taxonomy.json). Coverage depends on the installed packs; support in the schema does not mean every region currently contains every category.

Country-specific call packs must preserve service level. For Hungary, 112 is the primary life-threatening emergency action; 1830 is a visually different lower-level out-of-hours primary-care action. Communication buttons may expose `tel:`, `sms:` and optional app/share handlers, but a web page cannot reliably inventory every installed app. Unverified Viber/Skype/other possibilities must appear as grey **Try/Open** actions, not as “installed”, and network-dependent handlers must show offline status.

## Accepted audio model — three separate functions

- **UI narration / TTS — ALWAYS ON:** every button and instruction interaction is spoken in the active/browser language, including NFC, MESH, and emergency controls.
- **MIC ON / STT:** the button at the start of search receives speech and writes recognized text into the search field.
- **CPR audio:** a separate beat/song or short narrated instruction for pacing resuscitation. It is neither button narration nor microphone input.

The four files in the existing `cpr_audio_guides.zip` are **rejected prototypes** and must not be integrated.

- Legally downloadable beat candidate: [CPR beat — direct MP3](https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e6/CPR_beat.ogg/CPR_beat.ogg.mp3) · [source and public-domain licence](https://commons.wikimedia.org/wiki/File:CPR_beat.ogg)
- Hungarian online training: [OMSZA — Tartsd életben!](https://www.youtube.com/watch?v=CMstTrW4kmc)
- English online training: [British Heart Foundation — Hands-Only CPR](https://www.youtube.com/watch?v=O92KL1mw77c)
- Original song online: [Bee Gees — Stayin’ Alive](https://www.youtube.com/watch?v=I_izvAbhExY) — link only; do not package it in the repository without permission.

The accepted offline skills library also includes a professionally reviewed classic trained-rescuer adult compression-plus-breath pathway and separate scene-safety, recovery-position, choking, severe-bleeding, burns and other source-versioned first-aid modules. Dispatcher/AED instructions override prerecorded guidance. If a reviewed language pack is missing, built-in browser translation and then a clearly labelled extension suggestion may be offered only as an online, privacy-disclosed last resort.

## NFC, MESH, discreet help and satellite truth

- **NFC:** optional signed emergency-card or pack-manifest exchange. Android Web NFC is an enhancement; iPhone/Safari cannot be the baseline. A public NFC tag must contain only a user-selected minimal emergency card, not the detailed health profile.
- **MESH:** QR/file transfer and local WebRTC are active-app paths; reliable background BLE/Wi-Fi relaying needs native code. Real off-grid multi-hop requires compatible external radio hardware such as Meshtastic/LoRa and matching regional radio settings.
- **GPS:** receives a position; it does not transmit an alert. SMS, mobile data, Wi-Fi, Bluetooth, push and external radio each need separate permissions, delivery and acknowledgement states.
- **Discreet help:** a browser PWA cannot capture volume/power combinations while locked. Use the operating system Emergency SOS setup as the hardware-button path; future native/in-app duress options must not claim delivery without acknowledgement.
- **Signal for Help:** the thumb-in-palm gesture means “contact me safely”, not “automatically call police”. Camera recognition requires the app open and camera permission and carries false-positive/coercion risks.
- **Starlink/satellite:** when a terminal, direct-to-cell service or OS satellite feature supplies connectivity, PROXAID can use that normal transport. Availability is device/carrier/country/plan dependent; there is no universal browser API that turns GPS/NFC/Bluetooth into satellite messaging.

## Private emergency health profile target

Accepted combined intake: manual local form + authorized HealthKit/Health Connect import in the native mobile shell + signed QR/file export and import. Merge only fields selected by the user.

Keep two layers: a private detailed profile, and a separately chosen minimal responder card for QR/NFC/lock-screen display. Candidate fields include unknown/unverified blood group, allergies, anticoagulants and other medicines, relevant diagnoses, implants/pacemaker, diabetes, epilepsy, anaphylaxis, pregnancy where relevant, donor status as a user statement, language, emergency instructions and trusted contacts.

Local-only processing substantially reduces disclosure risk but does not automatically remove GDPR or other health-data obligations. The form must warn about stale/self-reported data, wrong blood group, lost/shared devices, lock-screen/NFC exposure, screenshots, browser deletion, backups/exports and malicious tag replacement. No analytics or third-party scripts may touch the profile.

## One product: PWA core plus a thin native safety shell

This does **not** mean two separate products. The same responsive UI, data model, offline map/search, language packs and safety logic remain the shared PROXAID core. Browser/PWA distribution works everywhere it can. An optional iOS/Android shell—potentially using a reviewed Capacitor-style bridge—adds only OS-controlled functions such as background border geofencing/local notifications, HealthKit/Health Connect, stronger NFC/BLE and external MESH support. Desktop stays web/PWA, and the PWA remains useful without the mobile shell.

Border-pack warnings illustrate the split: an open foreground PWA may compare GPS with downloaded pack boundaries; an inactive/locked alert requires native iOS region monitoring or Android geofencing. Roaming is not a reliable border detector. The safe design preloads adjacent border strips, uses distance hysteresis against GPS jitter, and names the missing pack in a local notification. Sound, vibration and LEDs remain subject to OS/device/user settings; Web Push is network delivery and is not an offline GPS alarm.

## Large downloads and GitHub Releases

Keep source code and small approved audio in the repository. A GitHub Release asset is a separately downloadable attachment, not a blob copied into every Git clone/history; each asset must be under 2 GiB. This is suitable for whole regional packs that the user downloads and imports. Direct PMTiles streaming is a different requirement: the host must correctly support HTTP Range requests and CORS, so use tested object storage/CDN when on-demand tile reads are required.

Upload a release pack:

1. Open [NullCodeLabs/proxaid — new Release](https://github.com/NullCodeLabs/proxaid/releases/new).
2. Enter a version tag and short release title.
3. Drop the region pack into **Attach binaries**.
4. Select **Publish release**, then copy the asset download URL into the PROXAID catalog.

## Deploy to GitHub Pages

1. Copy the **contents** of this package into the repository root. Existing folders are merged; only files with exactly the same path are replaced.
2. Keep any independent workflow with a different filename, such as your Weekly Radar workflow. This package owns only `.github/workflows/pages.yml` and `.github/workflows/update-data.yml`.
3. In **Settings → Pages → Source**, select **GitHub Actions**.
4. Commit and push to `main`. `Deploy GitHub Pages` validates the project before publishing it.
5. Open the deployed site once online on every target device, install it if desired, tap **Refresh now**, and perform a real offline test.

All runtime paths are relative, so both `owner.github.io/repository/` project URLs and custom domains are supported. A custom domain still requires correct GitHub Pages and DNS configuration.

## Local validation

Node.js 20 or newer is required for repository checks:

```bash
npm test
```

Service Workers require HTTPS or `localhost`; opening `index.html` through `file://` is not a valid offline-PWA test.

## Security and trust boundaries

- Location permission is optional and this release processes the resulting coordinates locally.
- “Source-linked” means a record identifies a source; it does not mean field, governmental, or medical verification.
- The Content Security Policy allows runtime data connections only to the same origin.
- Imported JSON packs are structurally validated, but only install packs from a source you trust.
- Browser storage may still be evicted by the operating system. **Refresh now** requests persistent storage where supported, and the interface shows the detected storage policy.

## v1.0 scope and evolution

v1.0 is the first public technical release of the offline application core, local point database, geolocation sorting, pack import, and source/freshness labels. The mobile-first interface, detailed offline street maps, TTS, MIC ON, approved CPR audio, NFC/MESH, background alerts, and native health-data bridge are development directions for separately approved future releases.

Public version evolution is maintained in **[`changelog.md`](./changelog.md)**.

## Sources and licences

- OpenStreetMap contributors — [ODbL 1.0](https://www.openstreetmap.org/copyright)
- Natural Earth overview — [public domain terms](https://www.naturalearthdata.com/about/terms-of-use/)
- GitHub Pages — [limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- GitHub Actions — [scheduled workflow behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- MDN — [Periodic Background Sync limitations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)
- WebKit — [iOS/iPadOS 16.4 Home Screen support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- MDN — [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- Protomaps — [PMTiles HTTP Range/CORS hosting](https://docs.protomaps.com/pmtiles/cloud-storage)
- healthsites.io — [open health-facility API](https://healthsites.io/api/docs/)
- Canadian Women's Foundation — [Signal for Help](https://canadianwomen.org/signal-for-help/)
- Apple/Android — [HealthKit authorization](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data), [Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started)
- AHA/OMSZ/EU — [2025 Adult BLS](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support), [Hungarian 1830 service](https://www.mentok.hu/ugyelet/), [European 112](https://digital-strategy.ec.europa.eu/en/policies/112)
- GitHub — [Release assets](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

For the complete Hungarian documentation, see **[README_hu.md](./README_hu.md)**.
