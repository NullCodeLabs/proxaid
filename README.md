# 🛡️⛑️ PROXAID // Offline Emergency & Survival Point Terminal

> **When the network disappears, the essentials should not.**

[![Deploy GitHub Pages](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml)
[![Refresh offline data](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml)

PROXAID is an installable, offline-first web terminal for finding locally stored emergency and survival points. It runs from GitHub Pages, keeps its searchable records on the device, and avoids external map tiles, CDNs, analytics, advertising, and location tracking.

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

## Install on phones, tablets, and computers

PROXAID targets current supported browser releases and keeps feature-detected fallbacks for older devices, including Safari on iOS 15. Each device must open the site online once before its application shell and selected packs can be used offline.

| Platform | Recommended installation | Reliable fallback |
|---|---|---|
| **iPhone / iPad** | Open in Safari → **Share** → **Add to Home Screen** → enable **Open as Web App** when shown. | The built-in PROXAID install help also covers the older iOS 15 flow. Open once online, then test in Airplane Mode. |
| **Android** | Open in current Chrome, Edge, or Firefox → choose **Install app** / **Add to Home screen** from the browser menu or install prompt. | Use it in the browser; offline caching and local search do not depend on a standalone window. |
| **Windows** | Current Chrome or Edge → select the install icon in the address bar. | Use current Chrome, Edge, or Firefox in a normal browser tab. |
| **macOS** | Safari on macOS Sonoma 14+ → **File → Add to Dock**, or use current Chrome/Edge install. | Use current Safari, Chrome, Edge, or Firefox in a browser tab. |
| **Linux** | Current Chrome or Edge/Chromium build with PWA installation → select the install icon. | Use a current standards-based browser; Firefox supports browser/offline use but not a native standalone PWA install flow. |

Official platform instructions: [Apple — web apps on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios), [Apple — web apps on Mac](https://support.apple.com/en-us/104996), [web.dev — desktop PWA installation](https://web.dev/learn/pwa/installation), and [Microsoft Edge — installing PWAs](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux).

### What “cross-platform” means here

The same GitHub Pages deployment works on phone, tablet, laptop, and desktop. Every installation has its **own local database and cache**: there is no account, cloud profile, or automatic device-to-device synchronization. Refresh and test each important device separately before relying on it in the field.

## Offline architecture

PROXAID uses four deliberately separate layers:

1. **Global emergency core** — a very small, always-preloaded set of emergency-number and operating records.
2. **Curated regional core** — hand-maintained, source-linked records that automated community refreshes cannot overwrite.
3. **Generated regional point packs** — bounded OpenStreetMap-derived healthcare, rescue, shelter, water, hygiene, and communication points.
4. **Future large map/route packs** — detailed road graphs and global routing data are intentionally outside this GitHub Pages release.

A detailed global road map plus worldwide emergency and survival datasets cannot responsibly be bundled into a small static site. GitHub Pages has a published-site size limit, while browsers independently control storage quotas and background execution. PROXAID therefore favors small, inspectable, replaceable regional packs.

## Search, positioning, and map behavior

- Search works entirely against local records and recognizes names, locations, categories, and tags.
- With permission, browser geolocation adds a local position marker and sorts results by straight-line distance.
- Denying location does not disable search.
- The bundled world view shows orientation and point distribution; it is **not street-level mapping, turn-by-turn navigation, or GPS/cell-tower triangulation**.
- Device GPS may remain available without internet, but availability and accuracy are controlled by the hardware, operating system, browser, permissions, and surroundings.

## Refresh and publishing chain

There are two different refresh layers:

- **On the device:** PROXAID checks the published catalog and installed packs at most daily unless the user forces a refresh. On Safari/iOS, the dependable path is opening the app or tapping **Refresh now** because periodic background execution is not guaranteed.
- **In the repository:** `Refresh offline data packs` runs daily and can also be started manually. When it commits changed packs, it explicitly starts `Deploy GitHub Pages`, ensuring the refreshed data is published even though GitHub does not recursively trigger workflows from a normal `GITHUB_TOKEN` push.

The scheduled job is not a real-time guarantee. It can be delayed, fail because an upstream provider is unavailable, or be disabled by GitHub for an inactive public repository. The previous valid pack remains in place when an update is empty, oversized, or invalid.

## Data categories

The model supports emergency numbers, ambulance and emergency departments, hospitals, out-of-hours care, clinics, pharmacies, AEDs, police, fire and rescue, shelters, drinking water, public toilets, showers, laundry, public communication, fuel/charging, trail information, and evacuation-related points.

The category-to-OpenStreetMap mapping is documented in [`data/taxonomy.json`](./data/taxonomy.json). Coverage depends on the installed packs; support in the schema does not mean every region currently contains every category.

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

## Not implemented — do not rely on these yet

The current release does **not** provide voice commands or audio guidance, NFC scanning, peer-to-peer MESH radio, encrypted SOS relays, full detailed offline road maps, turn-by-turn route planning, cell-tower triangulation, or automatic synchronization between devices. These are possible future modules, not current safety claims.

## Sources and licences

- OpenStreetMap contributors — [ODbL 1.0](https://www.openstreetmap.org/copyright)
- Natural Earth overview — [public domain terms](https://www.naturalearthdata.com/about/terms-of-use/)
- GitHub Pages — [limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- GitHub Actions — [scheduled workflow behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- MDN — [Periodic Background Sync limitations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)

For the complete Hungarian documentation, see **[README_hu.md](./README_hu.md)**.
