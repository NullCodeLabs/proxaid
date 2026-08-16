# PROXAID v1.0 — offline vészhelyzeti térkép és elsősegély

> Ha eltűnik a hálózat, a lényeges információ ne tűnjön el vele.

[![GitHub Pages közzététel](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml)
[![Offline adatok frissítése](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml)

A PROXAID telefonon, tableten és számítógépen használható offline-first webalkalmazás. A v1.0 Dél‑Zala részletes helyi utcatérképét, forrásjelölt sürgősségi és alapellátási pontjait, valamint magyar–angol elsősegély-útmutatóit tartalmazza. Nincs analitika, reklámkövetés, külső futásidejű script vagy térképcsempe.

Kiadási előzmények: [változásnapló](./changelog_hu.md) · [English README](./README.md)

> [!CAUTION]
> Közvetlen életveszélyben hívd a helyi segélyhívót, és kövesd a segélyirányító utasításait. Az alkalmazás nem segélyszolgálat és nem helyettesíti a szakmai képzést vagy a helyszíni döntést.

## A v1.0 tartalma

- Mobil-first, billentyűzettel és érintéssel is használható reszponzív felület.
- Helyben tárolt Dél‑Zala utcatérkép OpenStreetMap-adatokból: közutak, névvel jelölt gyalog-/kerékpár-/túrautak, vizek és települések.
- Utcaszintű nagyítás, csippentéses zoom, mozgatás, GPS-helyzet és pontossági kör.
- 165 induló rekord; közöttük Szepetnek gyógyszertára, nagykanizsai gyógyszertárak, WC-k, ivóvíz, egészségügyi pontok, valamint a Nagykanizsai Rendőrkapitányság hivatalos forrású AED-rekordja.
- Távolság szerinti rendezés kizárólag a készülékre betöltött rekordok között.
- Elütést, részleges szót, ékezetet, szinonimát és vészhelyzeti kifejezést kezelő helyi keresés.
- Súlyozott elsősegély-találat újraélesztésre, stabil oldalfekvésre, félrenyelésre, súlyos vérzésre, vízből mentésre, égésre, csecsemőlázra, balesetre és tömegbalesetre.
- ALWAYS ON felolvasás minden kezelőgombhoz és útmutatóhoz; külön `MIC ON` beszédbevitel.
- Két külön felnőtt CPR-mód: csak mellkasi nyomás, illetve 30 nyomás + 2 befúvás.
- Helyi 110/perc ritmus, 30:2 számlálás, képernyő-ébrentartási kérés és magyar narrált, csak mellkasi nyomásos hang.
- Opcionális Web NFC olvasás/írás; minden más eszközön rendszermegosztásos vészkártya.
- MESH/Meshtastic és üzenetküldő alkalmazások felé átadható, időbélyegzett helycsomag.
- Telefon, Skype, Viber és általános hívóapp-lehetőség; a felhasználó által működőként jelölt kezelő előre kerül.
- Külön offline állapot az alkalmazásra, utcatérképre, pontokra, elsősegélyre és hangra. A felület nem mutat félreérthető nyers böngészőkvótát.

## CPR: a két mód pontos szétválasztása

### Csak mellkasi nyomás

Felnőttnél választható, ha a segélynyújtó nem képzett, nem képes vagy nem kész befújást végezni. Folyamatos 100–120/perc mellkasi nyomást mutat.

- Magyar online tartalom: [OMSZA — Tartsd életben!](https://www.youtube.com/watch?v=CMstTrW4kmc)
- Angol online tartalom: [British Heart Foundation — Hands-Only CPR](https://www.youtube.com/watch?v=O92KL1mw77c)
- Magyar offline narráció: `assets/audio/cpr_hands_only_hu.mp3`
- A hang forrása: [Országos Mentőszolgálat Alapítvány](https://www.mentoalapitvany.hu/v/tartsd-eletben-ujraelesztes-egyszeruen-es-gyorsan/)

### 30 mellkasi nyomás + 2 befúvás

Felnőttnél választható, ha a segélynyújtó képzett, képes és kész befújást végezni. A helyi ütem 30 nyomás után két befúvásra jelez, majd újrakezdi a ciklust.

- Magyar online tartalom: [Egészségvonal — Újraélesztés](https://egeszsegvonal.gov.hu/egeszseg-a-z/u-u/ujraelesztes.html)
- Angol online tartalom: [Resuscitation Council UK — How to do CPR](https://www.resus.org.uk/public-resource/how-do-cpr)
- Offline: magyar és angol szöveges útmutató, felolvasás és helyi 30:2 ütem.

Az induló nyelvet a böngésző beállítása adja. Magyar böngészőn a magyar, minden más nyelvnél az angol ellenőrzött tartalom az alap; a `HU / EN` kapcsolóval ez kézzel felülírható. Az online gomb mindig a kiválasztott CPR-módhoz tartozó tartalmat nyitja meg.

*A 2025-ös életmentési elágazásokat a Resuscitation Council útmutatói támogatják: [BLS 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines), [elsősegély 2025](https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/first-aid-guidelines).*

## Offline használat

1. Nyisd meg az oldalt egyszer online.
2. Nyomd meg a **Frissítés most** gombot.
3. Várd meg, amíg mind a négy készenléti sor letöltött állapotot jelez.
4. Kapcsold be a repülő módot, majd ellenőrizd a térképet, keresést és mindkét CPR-módot.

Telepítés:

- iPhone / iPad: Safari → Megosztás → Főképernyőhöz adás.
- Android: böngészőmenü → Telepítés vagy Hozzáadás a kezdőképernyőhöz.
- Windows / macOS / Linux: a böngésző telepítési parancsa; böngészőlapon is használható.

Kevés tárhelynél az alkalmazás csak figyelmeztetést és az adott operációs rendszer rövid beállítási útját mutatja.

## Térkép- és pontadatok

Az induló Dél‑Zala térképcsomag határa: 16.78–17.15° keleti hosszúság és 46.34–46.58° északi szélesség. A részletes utcatérkép ezen a területen működik; más régiók ugyanilyen cserélhető csomagként adhatók hozzá.

Az induló pontcsomag kategóriái: AED, gyógyszertár, kórház, klinika, orvos, rendőrség, tűzoltóság, menedék, ivóvíz, WC, akadálymentes WC és nyilvános telefon. A rekordok forrása és lekérési ideje minden találatnál látható.

- Közösségi alap: [OpenStreetMap contributors — ODbL](https://www.openstreetmap.org/copyright)
- Rendőrségi AED: [police.hu — Élesben használták a defibrillátort](https://www.police.hu/hu/hirek-es-informaciok/legfrissebb-hireink/kozrendvedelem/elesben-hasznaltak-a-defibrillatort)
- Magyar gyógyszertárak hivatalos bővítési forrása: [NNGYK gyógyszertárkereső](https://ogyei.gov.hu/?url=gyogyszertarkereso)

## Hang, NFC, MESH és hívás

- TTS: alapból bekapcsolt kezelőfelület- és útmutató-felolvasás.
- MIC ON: a felismert beszédet a keresőmezőbe írja; a gépelés mindig használható.
- CPR-hang: külön helyi ritmus/narráció, nem TTS és nem mikrofonos bevitel.
- NFC: támogatott Android/Chromium környezetben NDEF olvasás és írás; máshol ugyanaz az adat a rendszer megosztási lapján adható át.
- MESH: a rendszer megosztási lapján Meshtastic, MESH- vagy üzenetküldő alkalmazásnak átadható vészüzenet. A felület csak a felhasználó által kiválasztott célalkalmazást nyitja meg.
- Hívás: a `tel:` az elsődleges, a Skype/Viber/egyéb protokoll **Próba/Megnyitás** jelöléssel szerepel.

## Adatvédelem és biztonság

- A helyzet, keresés és importált rekordok a böngésző helyi tárában maradnak.
- Nincs analitika, reklám, külső térképcsempe vagy harmadik féltől betöltött futásidejű kód.
- A Content Security Policy az alkalmazás adatkapcsolatait azonos eredetre korlátozza.
- Importáláskor csak a PROXAID sémájának megfelelő JSON-csomag fogadható el.
- A forrásjelölt adat nem jelenti az aktuális hozzáférés vagy nyitvatartás élő igazolását.

## Projektfájlok

- `index.html`, `styles.css`, `app.js` — reszponzív alkalmazás.
- `sw.js` — offline gyorsítótár és frissítés.
- `data/maps/hu-zala-south.geojson` — helyi utcatérkép.
- `data/packs/hu-west-osm.json` — OSM-pontcsomag.
- `data/packs/hu-west.json` — kézzel gondozott forrásrekordok.
- `data/first-aid.json` — kétnyelvű elsősegély- és CPR-döntési fa.
- `assets/audio/cpr_hands_only_hu.mp3` — magyar narrált, csak mellkasi nyomásos CPR-hang.
- `tools/validate.mjs` — kiadás előtti szerkezeti, forrás-, térkép-, CPR- és hanghash-ellenőrzés.

## Helyi ellenőrzés és közzététel

Node.js 20 vagy újabb:

```bash
npm test
```

A Service Worker HTTPS-en vagy `localhost` alatt működik. GitHub Pages közzétételnél a repository gyökerébe másold a csomag tartalmát, a Pages forrása legyen **GitHub Actions**, majd pushold a `main` ágat.

## v1.0 verziószabály

A dokumentációs javítás, adatfrissítés, újragenerálás, teszt vagy újracsomagolás nem emeli a termékverziót. A kanonikus kiadás v1.0, a terjesztési fájl neve `proxaid-offline.zip`.
