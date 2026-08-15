# Changelog

Notable public changes to PROXAID are recorded here. Internal attempts, documentation edits, rebuilds, and packaging runs do not change the product version. A new version is created only for an explicitly approved product release.

## v1.0 — 2026-08-14

### Added

- Installable offline-first PWA shell for phone, tablet, and desktop browsers.
- Local IndexedDB point database with text/category search and geolocation-based distance ordering.
- Bundled Natural Earth world overview without external map-tile or CDN dependency.
- Layered global, curated regional, and generated regional point-pack model.
- Manual, validated JSON pack import.
- Source, retrieval-date, and verification-state metadata for point records.
- Automatic and manual data-refresh workflow with safe fallback to the last valid pack.
- English and Hungarian project documentation.

### Changed

- Established **v1.0** as the canonical product version.
- Adopted a single canonical distribution archive: `proxaid-offline.zip`.
- Public documentation now reports released version evolution instead of internal task status.

### Fixed

- Pack updates replace previous records from the same pack instead of leaving removed records behind.
- Empty, oversized, or invalid generated updates cannot overwrite the last valid published pack.

### Security

- No analytics, advertising, or third-party runtime scripts.
- Same-origin runtime data policy.
- Location processing remains on the device in v1.0.

[Hungarian changelog](./changelog_hu.md)
