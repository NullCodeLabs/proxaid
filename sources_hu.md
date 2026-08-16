# PROXAID v1.0 — források és ajánlások

Az alkalmazás gyorsítótárazza ezt a fájlt. Az összefoglaló a beépített logika alapját jelöli; a hivatkozott kiadó tartalma az irányadó.

## Segélynyújtás és újraélesztés

- [Resuscitation Council UK — Adult Basic Life Support 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines): keringésmegállás felismerése, segélyhívás, 100–120/perc, 5–6 cm, minimális megszakítás és AED.
- [Resuscitation Council UK — First Aid 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/first-aid-guidelines): félrenyelés, életveszélyes vérzés, égés, vízből mentés, hő- és hidegártalom.
- [Resuscitation Council UK — How to do CPR](https://www.resus.org.uk/public-resource/how-do-cpr): lakossági, csak nyomásos és 30:2 CPR.
- [IFRC — International First Aid, Resuscitation and Education Guidelines 2025](https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025): nemzetközi elsősegély- és oktatási bizonyítékalap.
- [Országos Mentőszolgálat Alapítvány — Tartsd életben!](https://www.mentoalapitvany.hu/v/tartsd-eletben-ujraelesztes-egyszeruen-es-gyorsan/): a mellékelt magyar, narrált, csak mellkasi nyomásos CPR-hang forrása.
- [Egészségvonal — Újraélesztés](https://egeszsegvonal.gov.hu/egeszseg-a-z/u-u/ujraelesztes.html): magyar lakossági CPR-tájékoztató.

A csak mellkasi nyomásos és a 30:2 ág külön működik. Vízből mentésnél és képzett segélynyújtónál a befúvás hangsúlya eltérhet; a segélyirányító utasítása elsőbbséget élvez.

## HERO és HeroHUB

- [WHO — Mass Casualty Management](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/mass-casualty-management): összehangolt tömegbaleseti felkészülés, triázs és dokumentálás.
- [WHO/ICRC/MSF — Interagency Integrated Triage Tool](https://www.who.int/tools/triage): szabványos intézményi triázs. A PROXAID képzetlen jelenlévőt nem kér szakmai triázsra.
- [WHO — Emergency Care Toolkit](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/emergency-care-toolkit): szisztematikus sürgősségi vizsgálat, ellenőrzőlisták, Basic Emergency Care és szabványos adatlapok.
- [WHO — Prehospital Emergency Care Toolkit](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/prehospital-toolkit): irányítás, kommunikáció, átadás és prehospitális működés.

A HeroHUB diagnózis helyett megfigyelhető létszámot, helyet, veszélyt, megközelítést és opcionális kapcsolatot rögzít. Ellenőrző összege véletlen változást jelez; nem személyazonosító aláírás és nem kézbesítési bizonyíték.

## Térkép- és segítségpontadatok

- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright): ODbL 1.0 közösségi hely- és utcaadat.
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API): világszintű, 15 km-es igény szerinti segítségpont-keresés és offline régiócsomagok automatikus kinyerése.
- [Overture Maps — Getting Data](https://docs.overturemaps.org/getting-data/): havi globális közlekedési, hely- és területi kiadások skálázható regionális PMTiles-csomagokhoz.
- [NNGYK gyógyszertárkereső](https://ogyei.gov.hu/gyogyszertarkereso): ellenőrzött magyar gyógyszertári bővítési forrás.
- [Rendőrség — nagykanizsai AED](https://www.police.hu/hu/hirek-es-informaciok/legfrissebb-hireink/kozrendvedelem/elesben-hasznaltak-a-defibrillatort): a rendőrkapitányság 24 órás AED-rekordjának hivatalos forrása.

A közösségi és hivatalos rekordok GPS-szel, címmel/tájékozódási ponttal, minden közzétett publikus elérhetőséggel, weboldallal, teljes forrásformátumú nyitvatartással, hozzáféréssel, forrással és ellenőrzési idővel egységesülnek. A találati kártya a mai szabályt, a **Részletek** a teljes listát és elérhetőségeket mutatja. Az online link csak kapcsolat esetén kattintható.

## Böngészőfunkciók

- [W3C Geolocation API](https://www.w3.org/TR/geolocation/): helymeghatározás.
- [Web Speech API](https://webaudio.github.io/web-speech-api/): felolvasás és opcionális böngészős beszédfelismerés.
- [Web NFC](https://w3c.github.io/web-nfc/): opcionális NDEF-olvasás/írás.
- [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/): felhasználó által indított BLE-hozzáférés kompatibilis eszközhöz.
- [Web Share API](https://www.w3.org/TR/web-share/): rendszeres átadás telepített közeli-, üzenetküldő vagy MESH-alkalmazásnak.
- [Service Workers](https://www.w3.org/TR/service-workers/): offline alkalmazás és gyorsítótárazott adatok.

A QR és JSON a platformfüggetlen HeroHUB-átadás. Az NFC és Bluetooth/MESH kiegészítő, mindig felhasználó által indított út.

## Beépített országos segélyhívók

- [Európai Bizottság — 112](https://digital-strategy.ec.europa.eu/en/policies/112)
- [United States National 911 Program — 911](https://www.911.gov/calling-911)
- [GOV.UK — 999 és 112](https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers)
- [Australian Government — Triple Zero 000](https://www.triplezero.gov.au/)
- [New Zealand Police — 111](https://www.police.govt.nz/call-111)
- [India Ministry of Home Affairs — 112 ERSS](https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss)
- [Japan Fire and Disaster Management Agency — 119](https://www.fdma.go.jp/mission/enrichment/kyukyumusen_kinkyutuhou/119.html)

A felület böngészőrégió alapján választ induló számot, de a **Más hívási mód** ablakban a helyi szám kézzel azonnal felülírható.

## Opportunista MESH és műholdas rendszer

- [Meshtastic dokumentáció](https://meshtastic.org/docs/): külső LoRa MESH-eszközök és alkalmazások.
- [Delay-Tolerant Networking Architecture — RFC 4838](https://www.rfc-editor.org/rfc/rfc4838): tárol–visz–továbbít elv megszakadt hálózatokhoz.

A megbízható felépítésben sok olcsó végpont BLE/LoRa kapcsolatot használ; kevesebb, rendőrségnél, tűzoltóságnál, kórháznál vagy rendezvényirányításnál működő átjáró földi hálózatot és — ahol telepítik — saját műholdas modemet ad. Az önkéntesen használt telefonos műholdkapcsolat további út lehet, de nem egyetlen átjáró és nem működik a tulajdonos művelete nélkül.

## Frissítési és ellenőrzési rend

- hetente: ideiglenes/rendezvény/havária rekord;
- havonta: általános helyek és regionális térképbemenet;
- negyedévente: stabil egészségügyi címtárak és szakmai források;
- évente: elérhetőség-, licenc- és forrásaudit;
- azonnal: igazolt, lényeges felhasználói/adminisztrátori javítás.

A GitHub Actions időzíti a folyamatokat. A világszintű böngészős gyűjtés GPS vagy térképközép körül igény szerint működik; a repóban épülő csomagok a régiójegyzékkel bővíthetők. A kanonikus kutatóprompt bármely országot, régiót vagy befoglaló téglalapot elfogad. A JSON/CSV/Markdown/TXT jelöltadat `data/review/candidates.json` fájlba normalizálódik, és csak emberi ellenőrzés után publikálható.

## Szoftverlicencek

A Leaflet és QR Code Generator közleményei a `third-party-notices.md` fájlban vannak. A futásidejű kód azonos eredetről érkezik és offline gyorsítótárba kerül.
