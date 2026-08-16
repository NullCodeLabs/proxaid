# PROXAID v1.0 használati útmutató

**[A PROXAID alkalmazás megnyitása](https://nullcodelabs.github.io/proxaid/)** — készítsd elő online, majd repülő módban ellenőrizd a telepített példányt. [Vissza a rövid README-hez](./README_hu.md).

## Először a segélyhívás

Közvetlen életveszélyben hívd a helyi segélyhívót, és kövesd a segélyirányítót. Használj kihangosítást, hogy az utasítások közben cselekedni tudj.

## Telepítés és offline előkészítés

1. Nyisd meg a PROXAID-ot online.
2. Nyomd meg a **Frissítés most** gombot.
3. Várd meg az Alkalmazás, Utcatérkép, Helyi pontok és Elsősegély/hang letöltött állapotát.
4. iPhone/iPad készüléken Safari → Megosztás → Főképernyőhöz adás; Androidon és asztali gépen használd a böngésző telepítési menüjét.
5. Repülő módban próbáld ki a térképet, keresést, HERO módot, QR-t és mindkét CPR-módot.

Windows, macOS és Linux alatt támogatott böngésző telepítési parancsa vagy normál böngészőlap használható. iPhone/iPad alatt Safari Megosztás, Androidon a böngésző telepítési vagy főképernyős művelete az út.

Minden böngészőprofil és telepített példány saját helyi adatot tart. Azt a példányt frissítsd, amelyet használni fogsz.

## Képernyő és vezérlés

A felület a látható képernyő szélességéhez és magasságához, a tájoláshoz, a virtuális billentyűzethez és a safe-area területhez igazodik. A böngésző nagyítása megmarad. A fő érintési célok legalább 42 pixel magasak.

## Globális térkép és offline régiócsomag

- Csippentéssel vagy görgetéssel nagyíts; húzással mozgasd.
- Online állapotban a szabványos, feliratozott OpenStreetMap jelenik meg.
- Online a térkép globális, nincs referenciarégióhoz zárva.
- A **Helyzetem** GPS-engedélyt kér, online bárhol utcaszintre visz, elindítja a 15 km-es segítségpont-gyűjtést és a 12 km-es offline utcatérkép mentését.
- A **Frissítés most** GPS nélkül a térkép közepét használja, majd a begyűjtött rekordokat és utca-/út-/víz-/településréteget offline használatra megőrzi.
- A mellékelt referenciatérkép hálózat nélkül is használható; egy regionális adatfolyamot mutat be, és nem korlátozza a globális projektet.
- A `+` és `−` nagyít, a `◎` a GPS-helyre vagy a mellékelt referencianézetre áll vissza.
- Távolabbról település- és főútnevek, közelebb utca- és útszámok látszanak.
- A találati **Mutasd** gomb utcaszintre fókuszál.

Utazás előtt nyisd meg online az úti célt a térképen, majd nyomd meg a **Frissítés most** gombot. A találati kártya és térképpopup címet vagy közeli azonosítási pontot, pontos GPS-koordinátát, pillanatnyi állapotot és mai nyitvatartást mutat. A **Részletek** felugró ablakban adja a teljes nyitvatartást, minden közzétett publikus elérhetőséget, élő weboldalt és forráslinket; az **Útvonal** a készülék térképének vagy online útvonaltervezőnek adja át a célt.

## Helyek és kategóriák

A lista a mellékelt, importált és korábban online begyűjtött rekordokból dolgozik. Helyengedéllyel légvonalbeli távolság szerint rendez. A kategóriagombok azonnal mutatják a tárolt rekordszámot; kiválasztásuk törli a korábbi szöveges keresést. A hasznos közös halmazok miatt a szűrők átfednek:

- Sürgősségi + ügyelet: segélyhívó, mentő, sürgősségi osztály, ügyelet, kórház és klinika.
- Kórház + orvos: kórház, sürgősségi osztály, ügyelet, klinika és orvos.
- Higiénia: WC, akadálymentes WC, zuhany, mosdás és pelenkázó.
- Menedék: menedék, éjszakai/melegedő/hűsölő hely, hegyi vagy erdei hajlék.
- Mentés: mentő, rendőrség, tűzoltóság, hegyi/vízi mentés és gyülekezőpont.

Minden találat megmutatja a forrást és — ha van — a lekérés dátumát. Online állapotban indulás előtt ellenőrizd a jelenlegi nyitvatartást és hozzáférést.

## Kontextuskeresés

Írj be helyet, szolgáltatást vagy hétköznapi vészhelyzeti mondatot. A helyi kereső kezeli az ékezetet, részszót, kisebb elütést és ellenőrzött szinonimát. A súlyozott sürgősségi találat a helyek fölött jelenik meg; nyisd meg a teendőkhöz.

Online, nulla helyi találatnál az **Online keresési prompt** helyzetet és forrásellenőrzési utasítást ad át egy telepített kereső- vagy AI-alkalmazásnak. Válasza ellenőrzésig csak online jelölt.

## Felolvasás, mikrofon és CPR-hang

- A felolvasás alapból be van kapcsolva, és a kezelőelemeket/útmutatókat olvassa.
- A **MIC ON** előbb leállítja a felolvasást, majd legfeljebb 30 másodpercig figyel, és közben a keresőbe írja a felismert szöveget. Újabb gombnyomás leállítja.
- A CPR-ütem és narráció külön van a TTS-től és a mikrofontól.
- A mellékelt magyar narráció csak mellkasi nyomásos; a 30:2 mód helyi szöveget, felolvasást és ütemet használ.

## Felnőtt újraélesztés

A **Csak mellkasi nyomás** módot válaszd, ha nem tudsz befújást adni. A **30 nyomás + 2 befúvás** képzett, képes és kész segélynyújtónak való. A helyi ütem 110/perc, a javasolt 100–120/perc tartományon belül. A segélyirányító és a defibrillátor (AED) utasítása elsőbbséget élvez.

## HERO — több sérült

Nyisd meg a **HERO** módot a rövid, felolvasott sorrendhez:

1. Állj meg biztonságos helyen; figyeld a forgalmat, tüzet, áramot, omlást és veszélyes anyagot.
2. Hívd a segélyhívót kihangosítva; mondd a pontos helyet, veszélyt, becsült létszámot és megközelítést.
3. Képzettség nélkül ne végezz szakmai triázst; kövesd a segélyirányítót, és kérj fel konkrét segítőket.
4. Csillapítsd a súlyos vérzést. Nem reagáló embernél ellenőrizd a légzést; nem normális légzésnél CPR és defibrillátor (AED) kell.
5. A járóképes sérülteket csak biztonságos útvonalon irányítsd gyülekezőhelyre.

## HeroHUB — átadás a mentőknek

A HeroHUB megfigyelhető tényt rögzít, nem diagnózist:

- GPS vagy leírt találkozási pont;
- látható veszély/esemény;
- becsült érintettség;
- nem reagáló/nem normálisan lélegző emberek;
- súlyos vérzés;
- beszorultak;
- megközelítés és opcionális kapcsolat.

Változtatás után nyomd meg a **Helyzetlap frissítése** gombot. Átadási módok:

- QR: univerzális, vizuális offline átadás;
- NFC: NDEF-írás támogatott Web NFC környezetben;
- Bluetooth/MESH: a rendszer megosztási lapja kompatibilis telepített célhoz;
- Másolás: tömör JSON-szöveg;
- JSON mentés: fájlátadás vagy későbbi feldolgozás.

A rövid ellenőrző összeg véletlen módosulást jelez; nem személyazonosító digitális aláírás. A továbbítást a fogadó személy vagy célalkalmazás igazolja.

## NFC és MESH

Az **NFC** néhány centiméterről kompatibilis címkén olvassa vagy írja a vészkártya szövegét. A **MESH segélycsomag** a készülék megosztási menüjén át egy telepített közeli, Meshtastic- vagy üzenetküldő alkalmazásnak adja át az időbélyeges SOS-/helyzetcsomagot. A QR és a JSON-fájl a platformfüggetlen átadási mód.

## Hívás és megosztás

A böngésző régióbeállítása kiválaszt egy induló segélyhívószámot; a **Más hívási mód** ablakban ez azonnal átírható. Elsődleges a `tel:` hívás. További lehetőség az SOS-szöveg átadása az SMS-nek, rendszeres appátadás, számmásolás vagy a `tel:` QR beolvasása másik telefonnal.

## Helyi vészkártya

A **Helyi vészkártya** opcionálisan nevet, születési dátumot, vércsoportot, donornyilatkozatot, allergiát, gyógyszert/véralvadásgátlót, kórelőzményt, implantátumot, vészhelyzeti kapcsolatot és rövid megjegyzést tárol ebben az alkalmazáspéldányban. Mentés után QR-rel, NFC-vel vagy rendszermegosztással adható át. Csak olyan adatot adj meg, amelyet vészhelyzetben megmutatnál; a feloldott készülék, a QR és a megírt NFC-címke olvasható.

## Adatfrissítés és import

A katalógus induláskor, újracsatlakozáskor, helyváltozáskor és kézi frissítéskor ellenőrződik. Az online globális gyűjtés a GPS-hely vagy térképközép 15 km-es körzetét olvassa, és területenként legfeljebb havonta frissít, kivéve a kézi kényszerített frissítést. A projektautomatika havonta frissíti az általános rekordokat, hetente az ideiglenes helyeket, negyedévente az egészségügyi forrásokat, évente a forrás- és licencadatokat.

Az **Adat- / térképcsomag importálása** közvetlenül fogad UTF-8 CSV-t, PROXAID séma-1 rekordcsomagot, pontokat tartalmazó GeoJSON-t, GeoJSON `FeatureCollection` térképet vagy `map` FeatureCollection mezőt tartalmazó PROXAID JSON-t. Az importált rekord és az aktív régiótérkép az adott alkalmazáspéldányban tartósan megmarad. Globális adatbázis-építéshez a `data/inbox/README.md` kanonikus promptját add egy webes kutató/LLM eszköznek. A CSV-séma GPS-t, címet/tájékozódási pontot, ország/régió/települést, minden publikus telefonos és online elérhetőséget, teljes nyitvatartást, hozzáférést, akadálymentességet, érvényességet, két forrást és ellenőrzési időt kér. Tedd az UTF-8 CSV-t a `data/inbox/` mappába; a GitHub ellenőrzési sorba normalizálja, publikálás előtt pedig forrásellenőrzés szükséges.

## Tárhelyjelzés

Kritikusan kevés szabad böngészőtárhelynél egy figyelmeztetés jelenik meg. Nyisd meg a platformhoz adott rövid beállítási útvonalat, szabadíts fel helyet, majd nyomd meg a **Frissítés most** gombot.

## Adatvédelem

A keresés, importált rekord és HeroHUB-vázlat alapból a készüléken marad. Online térképhasználatkor OpenStreetMap-csempe töltődik; az online segítségpont-gyűjtés a kért GPS-/térképközép-körzetet Overpass-végpontnak küldi. Felhasználói tartalom csak indított megosztással, NFC-írással, letöltéssel vagy külső hivatkozással kerül tovább. Nincs analitika vagy reklámkövető.

## Meghívás

A **Meghívás** elküldi az alkalmazás aktuális címét. Egy felkészült telefon még egy offline útmutató, helyi térkép és lehetséges továbbító pont, amikor a normál hálózat kiesik.

## Beépített dokumentumok

A lábléc README, User Guide és Sources gombja a kiválasztott HU/EN nyelvhez tartozó, offline-ra mentett dokumentumot nyitja meg az alkalmazásban.

## Gyors hibaelhárítás

- Régi vagy üres alkalmazás: menj online, nyomd meg a **Frissítés most** gombot, majd nyisd újra a telepített példányt.
- Kereső billentyűzet: közvetlenül a szövegmezőbe koppints; nagyítás nem szükséges.
- A mikrofon vár, de nincs szöveg: engedélyezd a mikrofont, állítsd le a másik hangot és próbáld újra; a gépelés helyben működik.
- Nincs online térképfelirat: ellenőrizd a kapcsolatot; offline nézetben nagyíts, majd nyomd meg a **Helyzetem** vagy egy találat **Mutasd** gombját.
- Nincs közeli találat: töröld a szöveg-/kategóriaszűrőt, frissíts online, vagy használd az online keresési promptot. A hiány nem bizonyítja, hogy a hely nem létezik.
- Nincs NFC: használd a HeroHUB QR-t, rendszermegosztást vagy JSON-exportot.
