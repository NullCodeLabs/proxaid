# 🛡️⛑️ PROXAID // Offline vészhelyzeti és túlélési pontterminál

> **Ha eltűnik a hálózat, a lényeges információ ne tűnjön el vele.**

[![GitHub Pages közzététel](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/pages.yml)
[![Offline adatok frissítése](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml/badge.svg)](https://github.com/NullCodeLabs/proxaid/actions/workflows/update-data.yml)

A PROXAID telepíthető, offline-first webalkalmazás az eszközön tárolt sürgősségi és túlélési pontok kereséséhez. GitHub Pages-ről fut, a kereshető adatbázist helyben tárolja, és nem használ külső térképcsempét, CDN-t, analitikát, reklámot vagy helyzetkövetést.

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

## Telepítés telefonra, tabletre és számítógépre

A PROXAID a jelenleg támogatott böngészőkiadásokat célozza, közben funkcióellenőrzéses fallbacket tart fenn régebbi eszközökhöz, köztük iOS 15 Safarira is. Minden eszközön egyszer online meg kell nyitni az oldalt, mielőtt az alkalmazásmag és a kiválasztott csomagok offline használhatók.

| Platform | Ajánlott telepítés | Megbízható tartalékút |
|---|---|---|
| **iPhone / iPad** | Safari → **Megosztás** → **Főképernyőhöz adás** → ha megjelenik, **Megnyitás webalkalmazásként** bekapcsolása. | A PROXAID saját telepítési súgója a régebbi iOS 15 folyamatot is lefedi. Nyisd meg egyszer online, majd próbáld ki Repülőgép módban. |
| **Android** | Aktuális Chrome, Edge vagy Firefox → **Alkalmazás telepítése** / **Hozzáadás a kezdőképernyőhöz** a menüből vagy a telepítési felugróból. | Használd böngészőben; az offline gyorsítótár és a helyi keresés nem függ az önálló ablakos telepítéstől. |
| **Windows** | Aktuális Chrome vagy Edge → telepítés ikon a címsorban. | Aktuális Chrome, Edge vagy Firefox normál böngészőlapon. |
| **macOS** | Safari macOS Sonoma 14+-on → **Fájl → Hozzáadás a Dockhoz**, vagy aktuális Chrome/Edge telepítés. | Aktuális Safari, Chrome, Edge vagy Firefox böngészőlapon. |
| **Linux** | Aktuális Chrome vagy PWA-telepítést támogató Edge/Chromium összeállítás → telepítés ikon. | Aktuális szabványos böngésző; Firefoxban működik a böngészős/offline használat, de nincs natív önálló PWA-telepítési folyamat. |

Hivatalos platformleírások: [Apple — webalkalmazás iPhone-on](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios), [Apple — webalkalmazás Macen](https://support.apple.com/en-us/104996), [web.dev — asztali PWA-telepítés](https://web.dev/learn/pwa/installation) és [Microsoft Edge — PWA telepítése](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux).

### Mit jelent itt a többplatformos működés?

Ugyanaz a GitHub Pages-kiadás működik telefonon, tableten, laptopon és asztali gépen. Minden telepítésnek **saját helyi adatbázisa és gyorsítótára van**: nincs fiók, felhőprofil vagy automatikus eszközök közötti szinkron. A terepen fontos valamennyi eszközt külön frissítsd és külön teszteld.

## Offline architektúra

A PROXAID négy szándékosan elkülönített réteget használ:

1. **Globális vészmag** — nagyon kicsi, mindig előtárazott segélyhívó- és működési adathalmaz.
2. **Ellenőrzött területi mag** — kézzel gondozott, forráskapcsolt rekordok; az automatikus közösségi frissítés nem írhatja felül.
3. **Generált területi pontcsomagok** — lehatárolt, OpenStreetMap-alapú egészségügyi, mentési, menedék-, víz-, higiéniai és kommunikációs pontok.
4. **Későbbi nagy térkép- és útvonalcsomagok** — a részletes úthálózat és globális útvonaltervezés szándékosan nem része ennek a GitHub Pages-kiadásnak.

A világ részletes úthálózata és minden sürgősségi/túlélési adat nem csomagolható felelősen egy kis statikus oldalba. A GitHub Pages korlátozza a közzétett oldal méretét, a böngészők pedig önállóan kezelik a tárhelykvótát és a háttérfutást. Ezért a PROXAID kis, ellenőrizhető és cserélhető területi csomagokra épül.

## Keresés, helymeghatározás és térkép

- A keresés teljesen helyi rekordokon működik, és neveket, helyeket, kategóriákat és címkéket vizsgál.
- Engedély esetén a böngészős helymeghatározás helyi pozíciójelölőt ad, és légvonalbeli távolság szerint rendezi a találatokat.
- A helyengedély megtagadása nem tiltja le a keresést.
- A csomagolt világnézet tájékozódást és ponteloszlást mutat; **nem utcaszintű térkép, fordulóról fordulóra navigáció vagy GPS/mobiltorony-trianguláció**.
- Az eszköz GPS-e internet nélkül is működhet, de az elérhetőséget és pontosságot a hardver, az operációs rendszer, a böngésző, az engedély és a környezet határozza meg.

## Frissítési és közzétételi lánc

Két külön frissítési réteg működik:

- **Az eszközön:** a PROXAID a közzétett katalógust és a telepített csomagokat legfeljebb naponta ellenőrzi, kivéve a kikényszerített kézi frissítést. Safari/iOS alatt a megbízható út az app megnyitása vagy a **Frissítés most**, mert a periodikus háttérfutás nem garantált.
- **A repositoryban:** a `Refresh offline data packs` naponta lefut, és kézzel is indítható. Ha módosult csomagot commitol, kifejezetten elindítja a `Deploy GitHub Pages` workflow-t. Így az új adat akkor is kikerül a weboldalra, amikor a `GITHUB_TOKEN` által végzett normál push önmagában nem indítana új workflow-futást.

Az ütemezett munka nem valós idejű garancia. Késhet, külső szolgáltató hibája miatt meghiúsulhat, vagy inaktív nyilvános repositorynál a GitHub letilthatja. Üres, túl nagy vagy hibás frissítés nem írja felül az előző érvényes csomagot.

## Adatkategóriák

Az adatmodell segélyhívókat, mentőállomásokat és sürgősségi osztályokat, kórházakat, ügyeleteket, klinikákat, gyógyszertárakat, AED-ket, rendőrséget, tűzoltóságot és mentést, menedékeket, ivóvizet, nyilvános WC-t, zuhanyt, mosási lehetőséget, nyilvános kommunikációt, üzemanyagot/töltést, túrainformációt és evakuációs pontokat támogat.

A kategória–OpenStreetMap megfeleltetés a [`data/taxonomy.json`](./data/taxonomy.json) fájlban van. A tényleges lefedettséget a telepített csomagok adják; attól, hogy a séma ismer egy kategóriát, még nem biztos, hogy minden régióban van ilyen rekord.

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

## Jelenleg nincs implementálva — még ne számíts rá

A mostani kiadásban **nincs** hangvezérlés vagy hangos útmutatás, NFC-beolvasás, peer-to-peer MESH-rádió, titkosított SOS-relé, teljes részletes offline úttérkép, fordulóról fordulóra útvonaltervezés, mobiltorony-trianguláció vagy automatikus eszközök közötti szinkron. Ezek lehetséges későbbi modulok, nem jelenlegi biztonsági állítások.

## Források és licencek

- OpenStreetMap contributors — [ODbL 1.0](https://www.openstreetmap.org/copyright)
- Natural Earth világnézet — [public domain feltételek](https://www.naturalearthdata.com/about/terms-of-use/)
- GitHub Pages — [méret- és használati korlátok](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- GitHub Actions — [ütemezett workflow-k működése](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- MDN — [Periodic Background Sync korlátai](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)

Az alapértelmezett angol dokumentáció: **[README.md](./README.md)**.
