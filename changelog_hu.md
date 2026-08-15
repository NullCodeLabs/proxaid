# Változásnapló

Itt jelennek meg a PROXAID nyilvános, jelentős kiadási változásai. Belső próbálkozás, dokumentációs javítás, újragenerálás vagy újracsomagolás nem módosítja a termékverziót. Új verzió csak külön jóváhagyott termékkiadásnál jön létre.

## v1.0 — 2026-08-14

### Új

- Telepíthető, offline-first PWA-mag telefonra, tabletre és asztali böngészőre.
- Helyi IndexedDB-pontadatbázis szöveges/kategóriás kereséssel és helyalapú távolságrendezéssel.
- Beépített Natural Earth világnézet külső térképcsempe- és CDN-függőség nélkül.
- Rétegezett globális, ellenőrzött területi és generált területi pontcsomagmodell.
- Ellenőrzött kézi JSON-csomagimport.
- Forrás-, lekérési dátum- és ellenőrzési státusz minden pontrekordhoz.
- Automatikus és kézi adatfrissítés az utolsó érvényes csomag biztonságos megtartásával.
- Angol és magyar projektdokumentáció.

### Módosult

- A kanonikus termékverzió: **v1.0**.
- Egyetlen kanonikus terjesztési csomag: `proxaid-offline.zip`.
- A nyilvános dokumentáció belső feladatlista helyett a kiadott verziók fejlődését mutatja.

### Javítva

- A csomagfrissítés teljesen lecseréli az adott csomag korábbi rekordjait; a forrásból törölt pontok nem maradnak bent.
- Üres, túl nagy vagy hibás generált frissítés nem írhatja felül az utolsó érvényes publikált csomagot.

### Biztonság

- Nincs analitika, reklám vagy külső futásidejű script.
- Az adatkapcsolat azonos eredetre korlátozott.
- A helyadat feldolgozása a v1.0-ban az eszközön marad.

[English changelog](./changelog.md)
