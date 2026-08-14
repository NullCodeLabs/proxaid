# 🛡️ PROXAID // A Mátrix Sötét Oldala Túlélési Kézikönyv

⚠️ **KRITIKUS BIZTONSÁGI FIGYELMEZTETÉS:** Ez nem egy sima weboldal vagy online kényelmi applikáció. Ez egy offline-first vészhelyzeti terminál. Amikor a digitális infrastruktúra darabjaira hullik, a felhőalapú rendszerek pedig cserbenhagynak, nem lesz időd bűvölni a térerőt. Itt nincsenek fiktív adatok, nincs üres ígérgetés, és nincs internetfüggőség. Csak a tiszta, keserű valóság, a globális koordináta-mátrix és a lokális cache, ami életben tart.

---

## 1. 📲 A Digitális Szuverenitás Megszerzése (Asztali és Mobil Telepítési Protokoll)

Amikor a hálózat összeomlik, a digitális köldökzsinórod azonnal elszakad. Ha nincs nálad lokálisan mentett eszköz, halott vagy. Így rögzítheted a rendszer magját örökre a saját hardveredbe, teljesen díjmentesen, közvetítők és külső függőségek nélkül:

### 🔴 iOS / iPhone / iPad (Safari & Chrome böngészők)
* **A helyzet:** Az Apple ökoszisztéma szándékosan korlátozza a külső webalkalmazások automatikus telepítését, hogy a saját zárt rendszerükben tartsanak. A Chrome iOS-en ráadásul nem engedi közvetlenül a mentést.
* **A protokoll (lépésről lépésre):**
  1. Nyisd meg a PROXAID linket a natív Safari böngésződben.
  2. Nézz le a képernyő aljára (vagy a címsor sarkába), és kattints a **Megosztás (Share)** ikonra (a négyzet, amiből felfelé mutat egy nyíl).
  3. Görgess le az opciók között a lenyíló listában, amíg meg nem találod a **"Főképernyőhöz adás" (Add to Home Screen)** gombot.
  4. Erősítsd meg a műveletet. Ezzel a mozdulattal a terminál kikerül a készüléked főképernyőjére, és független, teljes képernyős, offline natív alkalmazásként üzemel tovább.

### 🟢 Android (Chrome, Firefox, Edge)
* Nyisd meg a terminál linkjét a mobil böngésződben.
* Ha a rendszer érzékeli a hardveres kompatibilitást, a jobb felső sarokban azonnal megjelenik a piros **"TELEPÍTÉS"** gomb – kattints rá azonnal.
* Amennyiben a böngésző ezt nem dobja fel automatikusan, nyisd meg a jobb felső sarokbeli főmenüt (a három pontot), és válaszd kézzel az **"Alkalmazás telepítése"** vagy **"Főképernyőhöz adás"** opciót.

### 💻 Asztali Gép (Windows 11 / macOS - Chrome, Edge, Firefox)
* Nyisd meg a felületet asztali gépen vagy laptopon.
* A böngésző címsorának jobb szélén megjelenik egy dedikált monitor+nyíl ikon (vagy alternatívaként a böngésző beállításai menüből lehívható a **"PROXAID telepítése..."** parancs).
* A telepítési folyamat után a program egy teljesen önálló, független ablakban, asztali appként fut, és a teljes világtérkép, valamint az összes kritikus adat azonnal rendelkezésedre áll offline módban is.

---

## 2. 🗺️ Az Adatbázis, a Tájolás és a Célzott Navigáció Architektúrája

A legtöbb applikáció akkor adja fel, amikor a legnagyobb szükséged lenne rá. A PROXAID ezzel szemben nem kér bocsánatot:

* **A Világtérkép Teljes Letöltése:** Amikor először lépsz be, a rendszer nem darabol fel semmit, hanem a teljes beépített globális adatbázist (sürgősségi központok, patikák, ivóvízpontok, AED defibrillátorok) letölti és helyben rögzíti a memóriába (IndexedDB / CacheStorage). Laptopon és mobilon is zárt egészként fut, hálózati elérés nélkül is.
* **Pontos Helymeghatározás & Inverz Tájolási Logika:** A hardveres GPS azonnal rögzíti a koordinátádat. Ha a GPS és a mobilhálózat teljesen bedől, a rendszer a legutolsó mentett pozícióból vagy a bázistornyok földrajzi metaadataiból számolt zónából (pl. Zala-régió / Nagykanizsa környéke) számolja ki a tartózkodási helyedet.
* **Intelligens Kontextus Kereső:** Nincsenek nehézkes legördülő menük vagy felesleges szűrők. Írd be a keresőbe nyersen, amit keresel (pl. *"Szepetnek patika"* vagy *"Nagykanizsa"*), és a helyi intelligens algoritmus azonnal a legközelebbi regionális találatot dobja ki. Ha pedig olyan helyet keresel, ami még nincs benne a lokális bázisban, de van neted, a rendszer lekérdezi a külső valós adatbázisból (OpenStreetMap), berajzolja, és **véglegesen menti a memóriádba** a későbbi offline használatra.

---

## 3. 🎙️ Hangvezérlés és Hangkimenet (A Krízis Interfész)

Kritikus helyzetben, amikor a kezed remeg, vagy a fagyban esélytelen gépelni, a kommunikációnak más alapon kell működnie:

* A kód teljes körű magyar nyelvi (`hu-HU`) beszédfelismerési profillal van felszerelve.
* A **"HANGPARANCS / AUDIO"** gombra kattintva elég kimondanod a várost vagy a keresett egységet, a rendszer pedig nemcsak végrehajtja, hanem magyar hangszintetizátorral vissza is igazolja a parancsot.

---

## 4. 🔄 Napi GitHub Szinkronizációs Hátsó Kapu (Backdoor)

* **Kritikus Frissítések:** A háttérben a rendszer folyamatosan figyeli a változásokat. Ha a központi repóban új, hiteles adatok (pl. friss defibrillátorok vagy vészhelyzeti pontok) érkeznek, az oldal tetején megjelenik egy figyelmeztető sáv: `🔄 NAPI GITHUB SZINKRONIZÁCIÓ ELÉRHETŐ`.
* Egyetlen kattintással frissítheted a lokális terminálodat, teljesen díjmentesen, extra szoftverek és előfizetések nélkül.

---

## 5. ℹ️ Hardveres Státuszmodulok (NFC & MESH)

* **NFC Gomb:** Aktív státuszban (`NFC: BE (OLVASÁS)` vagy `NFC: BE (SZIMULÁLT)`) készen áll a fizikai vészhelyzeti tagek olvasására. Kikapcsolt állapotban piros kerettel jelzi a lekapcsolást.
* **MESH Gomb:** A helyi peer-to-peer hálózati skálázást és szűrést kapcsolja be (`MESH: BE (P2P)`), vizuális és hangos visszajelzéssel kísérve.
