# Data inbox / adatjelölt-gyűjtő

Place source-linked `.json`, `.csv`, `.md` or `.txt` files here. `npm run ingest:candidates` normalizes them into `data/review/candidates.json`. Candidates never enter release packs before review.

Ide kerülhet bármely, webes keresésre képes LLM vagy kutatóeszköz UTF-8 CSV-kimenete. Az ellenőrzés előtt egyetlen jelölt sem válik nyilvános PROXAID-rekorddá.

## Canonical CSV header

`name,category,address,landmark,locality,region,country,lat,lon,phone,mobile,fax,email,website,facebook,instagram,linkedin,twitter,mastodon,youtube,telegram,whatsapp,opening_hours,access,wheelchair,temporary,valid_from,valid_to,source_url,source_url_2,checked_at,evidence`

## Collection prompt / gyűjtőprompt

Replace the bracketed values, then paste the prompt into a web-enabled research assistant. Download the answer as UTF-8 CSV and place it in this directory.

Az alábbi promptban cseréld ki a szögletes zárójelben lévő részeket, futtasd webes keresésre képes kutatóasszisztenssel, majd töltsd le az eredményt UTF-8 CSV-ként ebbe a mappába.

> Research currently operating [CATEGORY] locations worldwide inside [COUNTRY, REGION OR BOUNDING BOX]. Use official registries first and verify every row with a second current independent source where possible. Return exact public name, full address, nearby landmark, locality, region, country, latitude, longitude, callable phone/mobile/fax, public email, live official website and every published public social/contact URL, source-formatted full opening_hours, access and wheelchair conditions, temporary yes/no, validity dates, two direct evidence URLs, ISO checked_at time, and one-sentence evidence. Check that every submitted URL resolves at collection time. Never infer or invent a missing value: leave the cell empty. Exclude closed, duplicate, private or unlocatable places. Output only valid UTF-8 comma-separated CSV with this exact header: name,category,address,landmark,locality,region,country,lat,lon,phone,mobile,fax,email,website,facebook,instagram,linkedin,twitter,mastodon,youtube,telegram,whatsapp,opening_hours,access,wheelchair,temporary,valid_from,valid_to,source_url,source_url_2,checked_at,evidence

## Import

1. Save the file as lowercase English, for example `pharmacy_hu_zala_2026-08.csv`.
2. Run `npm run ingest:candidates`.
3. Review `data/review/candidates.json`.
4. Publish only records whose coordinates, access, source rights, freshness and duplicate status were checked.
