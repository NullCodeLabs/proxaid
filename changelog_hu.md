# Verziófejlődés

Itt jelennek meg a PROXAID nyilvános, jelentős változásai. A dokumentációs javítás, adatfrissítés, újragenerálás, teszt vagy újracsomagolás nem emeli a termékverziót.

## v1.0 — 2026-08-16

### Alkalmazás

- Egységes mobil-first felület telefonra, tabletre és asztali böngészőre.
- Javított érintési célok, safe-area, tördelés és aktív mobil keresőmező.
- ALWAYS ON felolvasás, külön `MIC ON` beszédbevitel és kézi HU/EN nyelvváltó.
- Elsődleges `tel:` hívás, rendszeres appátadás, számmásolás és `tel:` QR-kód; a megszűnt vagy megbízhatatlan közvetlen applinkek kikerültek.
- Web NFC olvasás/írás, rendszermegosztásos MESH/Meshtastic vészüzenet és helyzetmegosztás.
- HERO tömegbaleseti segítség és HeroHUB átadási helyzetlap offline QR-rel, NFC-vel, rendszeres Bluetooth/MESH átadással, másolással és JSON-exporttal.
- Képernyőpixel-/Visual Viewport-alapú méretezés mobil billentyűzethez, tájolásváltáshoz és kis telefonokhoz.
- A mikrofonos rögzítés előtt leáll a TTS, így a beszédfelismerés nem az alkalmazás saját szövegét írja vissza.
- A mikrofonos munkamenet 30 másodperces; a MIC kezelőelemet az automatikus felolvasás kihagyja.
- A gyorsítótárazott, kiválasztott HU/EN README, User Guide és Sources alkalmazáson belüli felugró nézete, valamint egyérintéses meghívó.
- Helyi vészkártya eszközön tárolt egészségügyi mezőkkel, QR-, NFC- és rendszermegosztásos átadással.
- Böngészőrégióból induló, kézzel átírható helyi segélyhívószám; hívás, SMS-átadás, rendszermegosztás, másolás és QR.
- A README rövid termék-/repóbelépő lett kommentált élő app-linkkel; a részletes működés az angol és magyar User Guide-ban marad.

### Térkép és adatok

- Korlátozás nélküli, feliratozott globális OpenStreetMap online réteg és mellékelt, nagyítható offline régiótérkép.
- Világszintű, igény szerinti segítségpont-gyűjtés a GPS-hely vagy térképközép 15 km-es körzetében, területenként 720 órás tárolással offline újrahasználatra.
- Világszintű, igény szerinti 12 km-es offline utcatérkép-mentés település-, út-, gyalogút-, víz- és vasúti réteggel.
- Tetszőleges regionális GeoJSON-térképcsomag tartós importja és aktiválása; a katalógus térképe helylefedés alapján automatikusan váltható.
- 3 809 helyi térképelem és 157 OpenStreetMap-pont került a régiócsomagba.
- Szepetnek gyógyszertára, nagykanizsai gyógyszertárak, WC-k, ivóvíz, egészségügyi és közbiztonsági pontok kereshetők.
- A Nagykanizsai Rendőrkapitányság defibrillátora (AED) külön, hivatalos rendőrségi forrású rekordot kapott.
- A helyzetgomb utcaszintre nagyít és GPS-pontossági kört mutat.
- A találatok a betöltött rekordok között, valós koordináta és légvonalbeli távolság szerint rendeződnek.
- A kártya a mai forrásszabályt mutatja; a részletek felugró ablaka teljes nyitvatartást, minden közzétett publikus elérhetőséget, weboldalt, GPS-t és forráslinket ad.
- Egyszerű nyitvatartási szabálynál pillanatnyi nyitva/zárva jelzés, valamint eszköztérképes és online útvonalátadás.
- Dinamikus település-, utca- és útszámfelirat, útburkolati kontúr és nagyításhoz igazodó feliratsűrűség.
- Az exact kategóriaszűrőket átfedő sürgősségi, egészségügyi, higiéniai, menedék-, mentési és kapcsolati csoportok váltották fel.
- Nulla telepített találatnál online, helyzetérzékeny forrásellenőrző keresési prompt jelenik meg.
- Havi, heti, negyedéves és éves GitHub Actions adatütem, közvetlen appbeli CSV/JSON/GeoJSON-import, valamint minden publikus kapcsolatot, GPS-t, élő URL-t és forrásmezőt kezelő globális JSON/CSV/Markdown/TXT jelöltadat-import.

### Elsősegély és CPR

- Súlyozott, elütést és szinonimát kezelő helyi vészhelyzeti keresés.
- Kilenc forráskapcsolt elsősegély-ág magyar és angol offline szöveggel.
- Külön csak mellkasi nyomásos és 30:2 felnőtt CPR-mód.
- Helyi 110/perc ütem, 30:2 számlálás és képernyő-ébrentartási kérés.
- Magyar narrált, csak mellkasi nyomásos hang ellenőrzőösszeggel.
- Böngészőnyelv alapján a kiválasztott CPR-mód magyar vagy angol online tartalma nyílik meg.

### Offline és biztonság

- Az alkalmazás, Leaflet-megjelenítő, mellékelt referenciatérkép, pontcsomag, elsősegélyadat és magyar hang előtárazása; az online térképcsempe és igény szerinti gyűjtés hálózati kiegészítő.
- Külön készenléti jelzés az alkalmazásra, térképre, rekordokra és útmutató/hang csomagra.
- Kevés tárhelynél operációsrendszer-specifikus rövid segítség; nyers kvótaérték nem jelenik meg.
- Nincs analitika, reklám vagy külső futásidejű script. Online a térkép OpenStreetMap-csempét és Overpass-helyadatot kér; offline csak tárolt elemet használ.

[English changelog](./changelog.md)
