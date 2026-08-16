# PROXAID v1.0 Sources and Guidance

This file is cached with the app and displayed by the in-app **Sources** button. It summarises the guidance used; the linked publisher remains authoritative.

## Immediate emergency and resuscitation

- [Resuscitation Council UK — Adult Basic Life Support Guidelines 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines): recognition of cardiac arrest, emergency call, 100–120 compressions/min, 5–6 cm depth, minimum interruptions and AED use.
- [Resuscitation Council UK — First Aid Guidelines 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/first-aid-guidelines): choking, life-threatening bleeding, burns, drowning, heat/cold emergencies and other time-critical first aid.
- [Resuscitation Council UK — How to do CPR](https://www.resus.org.uk/public-resource/how-do-cpr): public-facing hands-only and 30:2 CPR sequence.
- [IFRC — International First Aid, Resuscitation and Education Guidelines 2025](https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025): international first-aid evidence and education baseline.
- [Hungarian National Ambulance Service Foundation — Tartsd életben!](https://www.mentoalapitvany.hu/v/tartsd-eletben-ujraelesztes-egyszeruen-es-gyorsan/): source of the included Hungarian narrated hands-only CPR audio.
- [Egészségvonal — Újraélesztés](https://egeszsegvonal.gov.hu/egeszseg-a-z/u-u/ujraelesztes.html): Hungarian public CPR information.

The app’s hands-only and 30:2 branches are separate. Drowning and trained-rescuer guidance can prioritise ventilations; the on-scene dispatcher remains authoritative.

## HERO and HeroHUB

- [WHO — Mass Casualty Management](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/mass-casualty-management): coordinated mass-casualty preparation, structured triage and clinical documentation.
- [WHO/ICRC/MSF — Interagency Integrated Triage Tool](https://www.who.int/tools/triage): standardised facility triage for routine and mass-casualty conditions. PROXAID does not ask an untrained bystander to perform professional triage.
- [WHO — Emergency Care Toolkit](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/emergency-care-toolkit): systematic emergency assessment, checklists, Basic Emergency Care and standardised clinical forms.
- [WHO — Prehospital Emergency Care Toolkit](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/prehospital-toolkit): dispatch, communication, handover and prehospital operational guidance.

HeroHUB deliberately records observable counts, location, hazards, access and optional contact rather than diagnoses. Its compact checksum detects accidental change; it is not an identity signature or proof of delivery.

## Map and essential-place data

- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright): community place and street baseline under ODbL 1.0.
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API): worldwide 15 km on-demand place discovery and automated offline regional-pack extraction.
- [Overture Maps — Getting Data](https://docs.overturemaps.org/getting-data/): monthly global transportation, place and division releases for scalable regional PMTiles builds.
- [NNGYK pharmacy finder](https://ogyei.gov.hu/gyogyszertarkereso): reviewed Hungarian pharmacy expansion source.
- [Hungarian Police — Nagykanizsa AED](https://www.police.hu/hu/hirek-es-informaciok/legfrissebb-hireink/kozrendvedelem/elesben-hasznaltak-a-defibrillatort): official source for the 24-hour police-station AED record.

Community and official records are normalised with GPS, address/landmark, all published public contacts, website, source-formatted full hours, access, provenance and check time. The result card shows today's source rule; **Details** exposes the full schedule and contacts. Online URLs are clickable only with a connection.

## Browser capabilities

- [W3C Geolocation API](https://www.w3.org/TR/geolocation/): device location request.
- [Web Speech API specification](https://webaudio.github.io/web-speech-api/): speech synthesis and optional browser speech recognition.
- [Web NFC specification](https://w3c.github.io/web-nfc/): optional NDEF read/write.
- [Web Bluetooth specification](https://webbluetoothcg.github.io/web-bluetooth/): user-mediated access to compatible Bluetooth Low Energy devices.
- [Web Share API](https://www.w3.org/TR/web-share/): operating-system handoff to installed nearby, messaging or MESH applications.
- [Service Workers](https://www.w3.org/TR/service-workers/): offline application shell and cached data.

QR and JSON remain the platform-neutral HeroHUB handover. NFC and Bluetooth/MESH options are additive, explicit user actions.

## Bundled national emergency numbers

- [European Commission — 112](https://digital-strategy.ec.europa.eu/en/policies/112)
- [United States National 911 Program — 911](https://www.911.gov/calling-911)
- [GOV.UK — 999 and 112](https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers)
- [Australian Government — Triple Zero 000](https://www.triplezero.gov.au/)
- [New Zealand Police — 111](https://www.police.govt.nz/call-111)
- [India Ministry of Home Affairs — 112 ERSS](https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss)
- [Japan Fire and Disaster Management Agency — 119](https://www.fdma.go.jp/mission/enrichment/kyukyumusen_kinkyutuhou/119.html)

The interface selects a starter number from the browser region, and **Other calling mode** allows immediate manual override.

## Opportunistic MESH and satellite architecture

- [Meshtastic documentation](https://meshtastic.org/docs/): external LoRa mesh devices and application ecosystem.
- [Delay-Tolerant Networking Architecture — RFC 4838](https://www.rfc-editor.org/rfc/rfc4838): store-carry-forward design for disrupted networks.

The resilient design is: many low-cost leaf nodes use BLE/LoRa; a smaller number of trusted gateway nodes at responders, hospitals or event command add terrestrial backhaul and, where procured, a dedicated satellite modem. Opt-in phone satellite capability may add another route but is never the sole gateway and is never used without the owner’s action.

## Refresh and review policy

- weekly: temporary/event/disaster-response records;
- monthly: general places and regional map inputs;
- quarterly: stable healthcare directories and clinical-source review;
- annually: source availability, licence and attribution audit;
- immediately: user/admin correction when a material error is confirmed.

GitHub Actions schedules the pipelines. Worldwide browsing works on demand around GPS or map centre; repository builds expand through the region registry. The canonical research prompt accepts any country, region or bounding box. Candidate JSON/CSV/Markdown/TXT is normalised into `data/review/candidates.json`; human review is required before publication.

## Software licences

See `third-party-notices.md` for Leaflet and QR Code Generator notices. Runtime code is served from the same origin and cached for offline use.
