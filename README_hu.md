# 🛡️⛑️ PROXAID // Offline vészhelyzeti és túlélési pontterminál

> **Ha eltűnik a hálózat, a lényeges információ ne tűnjön el vele.**

[![GitHub Pages közzététel](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml)
[![Offline adatok frissítése](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml)

A PROXAID telepíthető, offline-first webalkalmazás az eszközön tárolt sürgősségi és túlélési pontok kereséséhez. GitHub Pages-ről fut, a kereshető adatbázist helyben tárolja, és nem használ külső térképcsempét, CDN-t, analitikát, reklámot vagy helyzetkövetést.

> **v1.0 — nyilvános műszaki előzetes (2026. augusztus 14.):** az offline alkalmazásmag, a helyi keresés és a csomagkezelés működő alapot ad. A mobil-first kezelőfelület, a részletes utcatérkép és a régiós adatlefedettség célzott bővítése folyamatban van. A PROXAID jelenlegi kiadása elsősorban fejlesztői értékelésre és offline felkészülésre szolgál.

Kiadási előzmények: **[`changelog_hu.md`](./changelog_hu.md)** · [English changelog](./changelog.md)

> [!CAUTION]
> **A PROXAID segédeszköz, nem segélyszolgálat, orvostechnikai eszköz vagy navigációs rendszer.** Közvetlen veszélyben hívd a hivatalos helyi segélyhívót, és kövesd a diszpécser utasításait. A híváshoz továbbra is működő telefonhálózat kell. A közösségi adatok hiányosak, pontatlanok vagy elavultak lehetnek.

## Ami most valóban működik

- **Offline alkalmazásmag:** egy sikeres online megnyitás után a kezelőfelület, a helyi világnézet és a telepített adatcsomagok hálózat nélkül is elérhetők.
- **Eszközön tárolt pontadatbázis:** IndexedDB-alapú tárolás, helyi szöveges és kategória szerinti keresés, engedélyezett helymeghatározásnál távolság szerinti rendezés.
- **Nincs külső térképfüggőség:** a csomagolt Natural Earth vektoros világnézetet helyi canvas rajzolja ki; nem kell térképcsempe-szerver, WebGL SDK, CDN vagy követőkód.
- **Rétegezett adatcsomagok:** kis globális vészmag, kézzel gondozott területi csomag és ettől elkülönített, OpenStreetMap-alapú generált területi csomag.
- **Biztonságos csomagcsere:** az új csomag teljesen lecseréli a saját korábbi rekordjait, így a forrásból törölt pontok nem maradnak bent.
- **Forrás- és frissességjelölés:** minden rekord tartalmaz forrást, lekérési dátumot és ellenőrzési állapotot.
- **Rugalmas frissítés:** ellenőrzés indul megnyitáskor, visszatérő internetnél, az app folytatásakor, jelentős helyváltozás után és kézi kérésre. Napi háttérfrissítést csak a támogató böngészőben kér.
- **Kézi JSON-csomagimport:** előre elkészített régiós csomag telepíthető az alkalmazáskód módosítása nélkül.
- **Helyi adatkezelés:** a helyzetet ez a kiadás a böngészőn belül használja, és nem küldi PROXAID-szerverre.

### A jelenlegi offline csomag pontos tartalma

- Kezelőfelület: HTML, CSS, JavaScript, manifest, ikonok és 404-oldal.
- Helyi térkép: `world-110m.geojson` világnézet.
- Adatleírás: katalógus, régiólista és taxonómia.
- Pontadat: `global-core`, alapértelmezetten `hu-west`, valamint gyorsítótárazott `hu-west-osm`.
- A `hu-west-osm` jelenleg 0 rekordos. Részletes utcatérkép, útvonalcsomag és jóváhagyott CPR-hang még nincs a letöltésben.

## Telepítés telefonra, tabletre és számítógépre

A PROXAID a jelenleg támogatott böngészőkiadásokat célozza, közben funkcióellenőrzéses fallbacket tart fenn régebbi eszközökhöz, köztük iOS 15 Safarira is. Minden eszközön egyszer online meg kell nyitni az oldalt, mielőtt az alkalmazásmag és a kiválasztott csomagok offline használhatók.

- **iPhone / iPad:** Safari → **Megosztás** → **Főképernyőhöz adás**. Tartalék: használat Safari-lapon.
- **Android:** Chrome/Edge/Firefox → **Alkalmazás telepítése** vagy **Hozzáadás a kezdőképernyőhöz**. Tartalék: használat böngészőlapon.
- **Windows:** Chrome/Edge telepítés ikon. Tartalék: Chrome/Edge/Firefox böngészőlapon.
- **macOS:** Safari → **Fájl → Hozzáadás a Dockhoz**, vagy Chrome/Edge telepítés. Tartalék: böngészőlap.
- **Linux:** PWA-telepítést támogató Chromium/Chrome/Edge. Tartalék: szabványos böngészőlap.

Hivatalos platformleírások: [Apple — webalkalmazás iPhone-on](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios), [Apple — webalkalmazás Macen](https://support.apple.com/en-us/104996), [web.dev — asztali PWA-telepítés](https://web.dev/learn/pwa/installation) és [Microsoft Edge — PWA telepítése](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux).

**iOS/iPadOS 15 telepítési út:** Safari → Megosztás → Főképernyőhöz adás.

### Mit jelent itt a többplatformos működés?

Ugyanaz a GitHub Pages-kiadás működik telefonon, tableten, laptopon és asztali gépen. Minden böngészőnek/telepítésnek **saját helyi adatbázisa és gyorsítótára van**: nincs fiók, felhőprofil vagy automatikus eszközök közötti szinkron. Offline állapotban az app nem szinkronizál, hanem a legutóbbi ellenőrzött helyi másolatot olvassa. Frissítés csak akkor történhet, amikor van hálózat és a platform futni engedi az appot.

Az elfogadott áthidalás egy hordozható, aláírt csomag: a régiófájlt egyszer le lehet menteni a Fájlok/Letöltések mappába, USB-re vagy cserélhető tárhelyre, majd ugyanazt a fájlt minden böngésző/PWA külön importálja és ellenőrzi. Az OS megosztási lapja, QR-manifeszt vagy helyi WebRTC/PairDrop-szerű átvitel továbbíthatja a fájlt, de egyik böngésző IndexedDB-/Cache-tartalmát sem tudja automatikusan a másikba injektálni.

### Globális támogatási stratégia

Minden múltbeli és jövőbeli eszköz/böngésző abszolút támogatása technikailag nem ígérhető. A PROXAID ezért képességszintekre épül:

1. **Vészhelyzeti minimum:** reszponzív szöveges UI, helyi segélyhívók, kézi keresés és fájlimport WebGL, NFC, Bluetooth vagy beszédfunkció nélkül.
2. **Offline PWA:** Service Worker, helyi adatbázis, geolokáció és letöltött adat-/hangcsomagok.
3. **Részletes térkép:** területi közúti térkép és útvonalcsomag, ahol a GPU, memória és tárhely engedi; mellette listás/nem-WebGL tartalék.
4. **Opcionális eszköz-API-k:** beszéd, NFC, Bluetooth és fejlettebb megosztás csak képességvizsgálat, engedély és tesztelt fallback után.
5. **Natív biztonsági szint:** iOS/Android rendszer-API-k háttér-geokerítéshez, helyi értesítéshez, egészségügyi tárakhoz és megbízható külső eszközkapcsolathoz.

## Offline architektúra

A PROXAID négy szándékosan elkülönített réteget használ:

1. **Globális vészmag** — nagyon kicsi, mindig előtárazott segélyhívó- és működési adathalmaz.
2. **Ellenőrzött területi mag** — kézzel gondozott, forráskapcsolt rekordok; az automatikus közösségi frissítés nem írhatja felül.
3. **Generált területi pontcsomagok** — lehatárolt, OpenStreetMap-alapú egészségügyi, mentési, menedék-, víz-, higiéniai és kommunikációs pontok.
4. **Későbbi nagy térkép- és útvonalcsomagok** — a részletes úthálózat és globális útvonaltervezés szándékosan nem része ennek a GitHub Pages-kiadásnak.

A világ részletes úthálózata és minden sürgősségi/túlélési adat nem csomagolható felelősen egy kis statikus oldalba. A GitHub Pages korlátozza a közzétett oldal méretét, a böngészők pedig önállóan kezelik a tárhelykvótát és a háttérfutást. Ezért a PROXAID kis, ellenőrizhető és cserélhető területi csomagokra épül.

Egyetlen globális jegyzék sem elég teljes és hiteles. Az elfogadott adatfolyam országonként először a hivatalos sürgősségi, AED-, gyógyszertár-, ügyeleti és egészségügyi nyilvántartásokat keresi, majd nyílt alapként OpenStreetMap/Geofabrik-, Overture- és healthsites.io-adatokat fésül össze. Az OPTEN-hez hasonló üzleti adatbázis csak API-, licenc-, újraközlési és frissességi vizsgálat után egészítheti ki a címet/elérhetőséget; hivatalos működési adatot pusztán azért nem írhat felül, mert felsorol egy vállalkozást.

A nyitvatartás három külön állapot: **menetrend szerint most nyitva** friss és értelmezhető helyi órarendből számolva, **élőben nyitva** aktuális hiteles online forrásból, illetve **ismeretlen/elavult**. A következő várható nyitást is helyben kell számolni, ha lehet; hiányos vagy régi adatból tilos megnyugtató zöld „nyitva” jelzést adni.

## Keresés, helymeghatározás és térkép

- A keresés teljesen helyi rekordokon működik, és neveket, helyeket, kategóriákat és címkéket vizsgál.
- Engedély esetén a böngészős helymeghatározás helyi pozíciójelölőt ad, és légvonalbeli távolság szerint rendezi a találatokat.
- A helyengedély megtagadása nem tiltja le a keresést.
- A csomagolt világnézet tájékozódást és ponteloszlást mutat; **nem utcaszintű térkép, fordulóról fordulóra navigáció vagy GPS/mobiltorony-trianguláció**.
- Az eszköz GPS-e internet nélkül is működhet, de az elérhetőséget és pontosságot a hardver, az operációs rendszer, a böngésző, az engedély és a környezet határozza meg.

A szepetneki elfogadási feltétel: a **Tartózkodási hely** gomb Szepetnekre állít és utcaszintig közelít; a találatok kizárólag a valós koordinátájukon jelennek meg; üres vagy elégtelen helyi adatnál Budapest/alapértelmezett pont helyett **nincs letöltött ellenőrzött találat** állapot látszik.

A távolságrendezés jelentése: **a betöltött rekordok közül legközelebbi**, nem pedig a legközelebbi alkalmas/nyitott/hiteles életmentő pont. Az alkalmasságot, aktuális elérhetőséget, útvonalidőt és lefedettségi bizalmat külön kell értékelni.

## Frissítési és közzétételi lánc

Két külön frissítési réteg működik:

- **Az eszközön:** a PROXAID a közzétett katalógust és a telepített csomagokat legfeljebb naponta ellenőrzi, kivéve a kikényszerített kézi frissítést. Safari/iOS alatt a megbízható út az app megnyitása vagy a **Frissítés most**, mert a periodikus háttérfutás nem garantált.
- **A repositoryban:** a `Refresh offline data packs` naponta lefut, és kézzel is indítható. Ha módosult csomagot commitol, kifejezetten elindítja a `Deploy GitHub Pages` workflow-t. Így az új adat akkor is kikerül a weboldalra, amikor a `GITHUB_TOKEN` által végzett normál push önmagában nem indítana új workflow-futást.

Az ütemezett munka nem valós idejű garancia. Késhet, külső szolgáltató hibája miatt meghiúsulhat, vagy inaktív nyilvános repositorynál a GitHub letilthatja. Üres, túl nagy vagy hibás frissítés nem írja felül az előző érvényes csomagot.

## Adatkategóriák

Az adatmodell segélyhívókat, mentőállomásokat és sürgősségi osztályokat, kórházakat, ügyeleteket, klinikákat, gyógyszertárakat, AED-ket, rendőrséget, tűzoltóságot és mentést, menedékeket, ivóvizet, nyilvános WC-t, zuhanyt, mosási lehetőséget, nyilvános kommunikációt, üzemanyagot/töltést, túrainformációt és evakuációs pontokat támogat.

A kategória–OpenStreetMap megfeleltetés a [`data/taxonomy.json`](./data/taxonomy.json) fájlban van. A tényleges lefedettséget a telepített csomagok adják; attól, hogy a séma ismer egy kategóriát, még nem biztos, hogy minden régióban van ilyen rekord.

Az országcsomagoknak meg kell őrizniük a hívások sürgősségi szintjét. Magyarországon a 112 az életveszélyes helyzet elsődleges gombja; az 1830 ettől látványosan eltérő, alacsonyabb szintű alapellátási ügyeleti művelet. A kommunikációs sor tartalmazhat `tel:`, `sms:` és opcionális app-/megosztási linkeket, de egy weboldal nem tud minden telepített appot megbízhatóan leltározni. Az ellenőrizetlen Viber/Skype/egyéb lehetőségek szürkén, **Próba/Megnyitás** felirattal jelenjenek meg, ne „telepítve” állítással; a hálózatfüggő szolgáltatás mutassa az offline állapotot.

## Elfogadott hangmodell — három külön funkció

- **UI-felolvasás / TTS — ALWAYS ON:** minden gomb és utasítás interakcióját felolvassa az aktív/böngészőnyelven. Ez vonatkozik az NFC-, MESH- és sürgősségi gombokra is.
- **MIC ON / STT:** a kereső elején lévő gomb fogadja a beszédet, és a felismert szöveget beírja a keresőmezőbe.
- **CPR-hang:** az újraélesztéshez külön ritmust adó kattogás/zene vagy rövid, narrált hangutasítás. Nem a gombok felolvasása és nem mikrofonos bevitel.

A meglévő `cpr_audio_guides.zip` négy fájlja **elutasított prototípus**; nem kerülhet be a végleges PROXAID-ba.

- Jogtisztán letölthető ritmusjelölt: [CPR beat — MP3 letöltés](https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e6/CPR_beat.ogg/CPR_beat.ogg.mp3) · [forrás és public-domain licenc](https://commons.wikimedia.org/wiki/File:CPR_beat.ogg)
- Magyar online oktatóvideó: [OMSZA — Tartsd életben! Újraélesztés egyszerűen és gyorsan](https://www.youtube.com/watch?v=CMstTrW4kmc)
- Angol online oktatóvideó: [British Heart Foundation — Hands-Only CPR](https://www.youtube.com/watch?v=O92KL1mw77c)
- Eredeti dal online: [Bee Gees — Stayin’ Alive](https://www.youtube.com/watch?v=I_izvAbhExY) — csak online hivatkozás; nem csomagolható a repositoryba engedély nélkül.

Az elfogadott offline alapkészség-könyvtár szakmailag felülvizsgált klasszikus, képzett segélynyújtónak szóló felnőtt kompresszió-plusz-befúvás utat, továbbá külön helyszínbiztonsági, stabil oldalfekvéses, fulladásos, súlyos vérzéses, égési és más forrásverziózott elsősegélymodult is tartalmaz. A diszpécser/AED utasítása felülírja az előre rögzített útmutatót. Hiányzó hiteles nyelvcsomagnál a böngésző beépített fordítása, majd világosan jelölt extension-javaslat csak online, adatvédelmi figyelmeztetéssel lehet végső tartalék.

## NFC, MESH, titkos segítség és műhold — valós határok

- **NFC:** opcionális, aláírt minimális vészkártya vagy csomagmanifeszt átadása. Android Web NFC kiegészítő lehet; iPhone/Safari nem lehet alap. Nyilvánosan olvasható NFC-re nem kerülhet a teljes részletes egészségprofil.
- **MESH:** QR/fájlátadás és helyi WebRTC nyitott appos út; megbízható háttér-BLE/Wi-Fi reléhez natív kód kell. Valódi, infrastruktúra nélküli többugrásos hálózathoz kompatibilis külső rádió, például Meshtastic/LoRa és azonos régiós rádióbeállítás szükséges.
- **GPS:** helyet fogad, nem továbbít segélykérést. Az SMS, mobilnet, Wi-Fi, Bluetooth, push és külső rádió mind külön engedélyt, kézbesítési és visszaigazolási állapotot igényel.
- **Titkos segítség:** lezárt kijelzőn a PWA nem foghat hangerő-/bekapcsológomb-kombinációt. A hardvergombos út az operációs rendszer Emergency SOS funkciója; jövőbeli natív/appos kényszerjelzés visszaigazolás nélkül nem állíthatja, hogy elküldték.
- **Signal for Help:** a tenyérbe zárt hüvelykujj jelentése „keress meg biztonságosan”, nem automatikus rendőrhívás. Kamerás felismeréshez nyitott app és kameraengedély kell, és téves riasztási/kényszerhelyzeti kockázata van.
- **Starlink/műhold:** ha terminál, direct-to-cell szolgáltatás vagy OS-műholdfunkció kapcsolatot biztosít, a PROXAID azt normál internet-/SMS-átvitelként használhatja. Eszköz-, szolgáltató-, ország- és csomagfüggő; nincs univerzális webes API, amely a GPS/NFC/Bluetooth eszközt műholdas adóvá változtatná.

## Helyi vészhelyzeti egészségprofil célja

Az elfogadott egyesített adatbevitel: kézi helyi űrlap + a natív mobilburokban engedélyezett HealthKit/Health Connect-import + aláírt QR-/fájlexport és -import. Az import csak a felhasználó által kiválasztott mezőket egyesíti.

Két réteg kell: részletes privát profil, valamint külön kiválasztott minimális segélynyújtói kártya QR-/NFC-/zároltképernyős megjelenítéshez. Lehetséges mezők: ismeretlen/nem ellenőrzött vércsoport, allergiák, véralvadásgátló és egyéb gyógyszerek, releváns diagnózisok, implantátum/pacemaker, cukorbetegség, epilepszia, anafilaxia, indokolt esetben terhesség, saját nyilatkozat szerinti donorállapot, nyelv, sürgősségi utasítás és megbízható kapcsolatok.

A csak helyi működés jelentősen csökkenti az adatkiadás veszélyét, de nem tünteti el automatikusan a GDPR- vagy más egészségadat-szabályokat. A formnak figyelmeztetnie kell az elavult/önbevallott adatra, téves vércsoportra, elveszett/közös eszközre, zároltképernyő-/NFC-kitettségre, képernyőképre, böngészőtörlésre, mentés-/exportkiszivárgásra és rosszindulatúan kicserélt címkére. A profilt analitika vagy külső szkript nem érintheti.

## Egy termék: PWA-mag és vékony natív biztonsági réteg

Ez **nem két külön termék**. Ugyanaz a reszponzív UI, adatmodell, offline térkép/keresés, nyelvi csomag és biztonsági logika marad a közös PROXAID-mag. A böngészős/PWA-kiadás ott működik, ahol a webplatform engedi. Az opcionális iOS/Android burok — például ellenőrzött Capacitor-szerű híddal — kizárólag az OS által védett funkciókat adja hozzá: háttérbeli határ-geokerítést/helyi értesítést, HealthKit/Health Connect hozzáférést, erősebb NFC/BLE- és külső MESH-kapcsolatot. Asztali gépen marad a web/PWA, és a mobilburok nélkül is használható a mag.

A határátlépési csomagriasztás jól mutatja a különbséget: nyitott, előtérben lévő PWA összevetheti a GPS-t a letöltött csomaghatárral; lezárt/inaktív figyelmeztetéshez natív iOS régiófigyelés vagy Android geofencing kell. A roaming nem megbízható országhatár-jel. A biztonságos terv előre letölti a szomszédos határsávokat, távolsági hiszterézissel szűri a GPS-ugrálást, és helyi értesítésben megnevezi a hiányzó csomagot. Hang, rezgés és LED az OS/eszköz/felhasználói beállítás függvénye; a Web Push hálózati kézbesítés, nem offline GPS-riasztás.

## Nagy letöltések és GitHub Releases

A forráskód és a kicsi, jóváhagyott hangfájl maradhat a repositoryban. A GitHub Release asset külön letölthető melléklet, nem kerül bele minden Git-klónba és a teljes fájltörténetbe; egy fájl 2 GiB-nál kisebb lehet. Ez jó teljes területi csomag letöltésére és importjára. A közvetlen PMTiles-streamelés más igény: a tárhelynek helyesen kell kezelnie a HTTP Range és CORS kéréseket, ezért részletek igény szerinti olvasásához tesztelt objektumtár/CDN kell.

Release-csomag feltöltése:

1. Nyisd meg: [NullCodeLabs/proxaid — új Release](https://github.com/NullCodeLabs/proxaid/releases/new).
2. Adj meg verziócímkét és rövid kiadási nevet.
3. Húzd a régiócsomagot az **Attach binaries** mezőbe.
4. Nyomd meg a **Publish release** gombot, majd másold az asset letöltési linkjét a PROXAID katalógusába.

## Telepítés GitHub Pages-re

1. A csomag **tartalmát** másold a repository gyökerébe. A meglévő mappák összeolvadnak; csak a pontosan azonos útvonalú fájlok cserélődnek.
2. A külön fájlnéven lévő független workflow, például a Weekly Radar, megmarad. Ez a csomag csak a `.github/workflows/pages.yml` és `.github/workflows/update-data.yml` fájlokat kezeli.
3. A **Settings → Pages → Source** beállításnál válaszd a **GitHub Actions** lehetőséget.
4. Commitolj és pusholj a `main` ágra. A `Deploy GitHub Pages` közzététel előtt validálja a projektet.
5. Minden céleszközön nyisd meg egyszer online a közzétett oldalt, szükség esetén telepítsd, nyomd meg a **Frissítés most** gombot, majd végezz valódi offline próbát.

Minden futásidejű útvonal relatív, ezért az `owner.github.io/repository/` projektcím és az egyéni domain is támogatott. Az egyéni domainhez továbbra is helyes GitHub Pages- és DNS-beállítás kell.

## Helyi ellenőrzés

A repository ellenőrzéséhez Node.js 20 vagy újabb szükséges:

```bash
npm test
```

A Service Worker csak HTTPS alatt vagy `localhost` címen aktiválható; az `index.html` egyszerű `file://` megnyitása nem érvényes offline PWA-teszt.

## Biztonsági és bizalmi határok

- A helyengedély opcionális, a kapott koordinátát ez a kiadás helyben dolgozza fel.
- A „forráskapcsolt” azt jelenti, hogy a rekord megjelöl egy forrást; nem jelent helyszíni, hatósági vagy orvosszakmai hitelesítést.
- A Content Security Policy futás közben csak azonos eredetű adatkapcsolatot enged.
- Az importált JSON-csomag szerkezetét az app ellenőrzi, de csak megbízható forrásból származó csomagot telepíts.
- Az operációs rendszer a böngészős tárhelyet később is törölheti. A **Frissítés most** támogatott környezetben tartós tárhelyet kér, a felület pedig mutatja az észlelt adatmegőrzési állapotot.

## A v1.0 hatóköre és továbblépése

A v1.0 az offline alkalmazásmag, a helyi pontadatbázis, a geolokációs rendezés, a csomagimport és a forrás-/frissességjelölés első nyilvános műszaki kiadása. A mobil-first felület, a részletes offline utcatérkép, a TTS, a MIC ON, a jóváhagyott CPR-hang, az NFC/MESH, a háttérriasztás és a natív egészségadat-kapcsolat a következő külön jóváhagyott kiadások fejlesztési iránya.

A nyilvános verziófejlődés a **[`changelog_hu.md`](./changelog_hu.md)** fájlban követhető.

## Források és licencek

- OpenStreetMap contributors — [ODbL 1.0](https://www.openstreetmap.org/copyright)
- Natural Earth világnézet — [public domain feltételek](https://www.naturalearthdata.com/about/terms-of-use/)
- GitHub Pages — [méret- és használati korlátok](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- GitHub Actions — [ütemezett workflow-k működése](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- MDN — [Periodic Background Sync korlátai](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)
- WebKit — [iOS/iPadOS 16.4 főképernyős támogatás](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- MDN — [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- Protomaps — [PMTiles HTTP Range/CORS tárhely](https://docs.protomaps.com/pmtiles/cloud-storage)
- healthsites.io — [nyílt egészségügyi intézmény API](https://healthsites.io/api/docs/)
- Canadian Women's Foundation — [Signal for Help](https://canadianwomen.org/signal-for-help/)
- Apple/Android — [HealthKit-engedélyezés](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data), [Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started)
- AHA/OMSZ/EU — [2025 felnőtt BLS](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support), [magyar 1830 ügyelet](https://www.mentok.hu/ugyelet/), [európai 112](https://digital-strategy.ec.europa.eu/en/policies/112)
- GitHub — [Release assetek](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

Az alapértelmezett angol dokumentáció: **[README.md](./README.md)**.
