# Ha baj van, de nincs internet, esetleg telefon sem, GPS lefedettség sem! Nem csak adrenalin vadászok számára!

> **Offline is működő vészhelyzeti térkép és elsősegélynyújtás támogatással.**

**PROXAID v1.0**

## Az alkalmazás megnyitása

**[PROXAID indítása](https://nullcodelabs.github.io/proxaid/)** — egyszer nyisd meg online, csak szükség esetén engedélyezd a helymeghatározást, nyomd meg a **Frissítés most** gombot, majd repülő módban is próbáld ki a telepített példányt.

[English README](./README.md) · [Részletes használati útmutató](./user-guide_hu.md) · [Források](./sources_hu.md) · [Változásnapló](./changelog_hu.md)

## Mi ez, és kinek szól?

A PROXAID globális, reszponzív, offline-first vészhelyzeti PWA civileknek, utazóknak, túrázóknak, rendezvénycsapatoknak és mentésben részt vevőknek. A lényeges útmutatókat és a begyűjtött helyadatokat gyenge vagy megszűnt hálózatnál is használhatóan tartja.

A mellékelt referenciaadat egy regionális adatfolyam mintája, nem a termék határa. Az online térkép és közeli keresés világszerte működik; az offline lefedettség begyűjtött rekordokkal és importálható régiótérképekkel bővíthető.

> [!IMPORTANT]
> Közvetlen életveszélyben hívd a helyi segélyhívót, és kövesd a segélyirányító utasításait.

## Funkciók és képességek

- Globális, feliratozott OpenStreetMap online; a kijelölt terület 12 km-es utca-/út-/víz-/településrétege igény szerint offline-ra menthető, további GeoJSON-régiók pedig tartósan importálhatók.
- Világszintű, 15 km-es segítségpont-gyűjtés GPS vagy a térkép közepe körül; a begyűjtött eredmény offline is megmarad.
- Cím/tájékozódási pont, pontos GPS, pillanatnyi nyitva/zárva állapot, mai és teljes nyitvatartás, publikus elérhetőségek, útvonal, élő weboldal és forráslink, ahol közzétették.
- Átfedő szűrők sürgősségre, egészségügyre, defibrillátorra (AED), gyógyszertárra, vízre, higiéniára, menedékre, mentésre és kapcsolatra.
- Kontextusérzékeny offline keresés vészhelyzeti mondatokra, ékezetre, részszóra, elütésre és ellenőrzött szinonimára.
- Alapból bekapcsolt felolvasás; külön `MIC ON` beszédbevitel.
- Külön csak mellkasi nyomásos és 30:2 CPR-mód, helyi 110/perces ütem és magyar, csak nyomásos narráció.
- HERO tömegbaleseti segítség és HeroHUB átadás QR-rel, NFC-vel, rendszermegosztással, másolással vagy JSON-nal.
- Szerkeszthető helyi segélyhívószám, `tel:`/SMS/appátadás/másolás/QR, valamint eszközön mentett vészkártya QR-/NFC-/megosztási átadással.
- Közvetlen CSV-, JSON- és GeoJSON-import; globális kutatóprompt és ellenőrzési sor az új adatforrásokhoz.
- Reszponzív telefonos, tabletes és asztali felület; telepíthető PWA és offline alkalmazás.
- Nincs analitika vagy reklámkövetés.

## Gyors használat

1. Nyisd meg online az alkalmazást, majd nyomd meg a **Helyzetem** gombot, vagy mozgasd a térképet a célterületre.
2. A **Frissítés most** begyűjti az aktuális 15 km-es segítségpont-körzetet és a 12 km-es offline utcatérképet.
3. Keress vagy válassz kategóriát; a **Mutasd** térképre visz, a **Részletek** megnyitja a nyitvatartást és elérhetőségeket.
4. Telepítsd a PWA-t, majd repülő módban ellenőrizd a térképet, keresést, útmutatót, QR-t és CPR-t.
5. Közvetlen életveszélyben először segélyhívás; több sérültnél **HERO** és **HeroHUB**.

## Mini útmutató a repóhoz

A projekt statikus PWA. HTTPS-en vagy `localhost` alatt szolgáld ki; külön build nem szükséges. Az ellenőrzéshez és adatkezelő eszközökhöz Node.js 20 vagy újabb kell:

```bash
npm test
```

A GitHub Actions közzéteszi a Pages-oldalt, és heti, havi, negyedéves, illetve éves adatfolyamatot futtat. Webes kutató/LLM kimenete a [`data/inbox/README.md`](./data/inbox/README.md) kanonikus CSV-promptjával kerülhet az ellenőrzési sorba. Nyilvános offline csomagba csak ellenőrzött rekord való.

## Adat és adatvédelem

Online térképnél OpenStreetMap-csempe töltődik. Az online közeli gyűjtés a kért GPS-/térképközép-körzetet Overpass-végpontnak küldi. A keresés, importált csomag és HeroHUB-vázlat egyébként helyben marad, amíg a felhasználó meg nem osztja vagy exportálja.

A részletes működés, platformjegyzetek, NFC/MESH, adatfolyam és hibaelhárítás a **[Használati útmutatóban](./user-guide_hu.md)** található. A szakmai és technikai hivatkozások a **[Forrásokban](./sources_hu.md)** vannak.

A dokumentáció, adatfrissítés, teszt és újracsomagolás nem emeli a termékverziót. A kanonikus verzió továbbra is **v1.0**.
