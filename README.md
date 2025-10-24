# 📦 SmartMailbox

**Verzió:** v1.1.0  
**Frissítve:** 2025. október vége után – audit log frontend integráció + reszponzív UI overhaul

A SmartMailbox egy IoT alapú, hitelesített kézbesítési pont, amely ESP32 hardverre, AWS backendre és React frontendre épül.  
Célja: a hagyományos aláírásos átvétel kiváltása biztonságos, naplózott, távolról vezérelhető postaládával.

---

## 🚀 Komponensek

- **ESP32 firmware**
  - Heartbeat, esemény logok, ack üzenetek
  - Parancs fogadás MQTT-n
  - Beépített diagnosztikai webszerver (`/lock1`, `/lock2`, `/mqttconnect`, `/ip`)
  - QR modul UART-on
  - Lock állapotfigyelés

- **Backend (AWS)**
  - IoT Core + Lambda + DynamoDB
  - Funkciók: `updateStatus-dev`, `processDeviceEvents-dev`, `manualOpen-dev`, `getDeviceLogs-dev`
  - Táblák:
    - `SmartMailboxStorage-dev` → aktuális állapot
    - `MailboxQRLogs-dev` → audit trail
    - `userdevices` → user–device kapcsolatok

- **Frontend (React)**
  - Webes zárvezérlés
  - Állapotlekérés színkódolt UI-val
  - Audit logok táblázatos megjelenítése (`LogsPage` + `LogsTable`)
  - Reszponzív, teljes szélességű UI (navbar, dashboard grid)

- **Auth**
  - Cognito User Pool
  - Google IdP integráció
  - PreSignUpClean / PostConfirmationClean Lambda
  - GDPR-kompatibilis működés

---

## 🔗 Fő végpontok

- `POST /statusget` → aktuális zárállapot lekérése
- `POST /manual` → kézi nyitási parancs
- `GET /listDevices` → felhasználóhoz tartozó eszközök
- `POST /linkDevice` → eszköz hozzárendelése
- `GET /logs?deviceId=...` → audit logok lekérése

---

## 📊 Kommunikációs összefoglaló

| Forrás   | Cél       | Protokoll | Endpoint/Téma | Megjegyzés |
|----------|-----------|-----------|---------------|------------|
| ESP32    | IoT Core  | MQTT      | .../status    | Heartbeat + esemény log |
| ESP32    | IoT Core  | MQTT      | .../ack       | Ack üzenet |
| Backend  | ESP32     | MQTT      | .../cmd       | Nyitási parancs |
| Frontend | API GW    | HTTPS     | /statusget    | Státusz lekérés |
| Frontend | API GW    | HTTPS     | /manual       | Kézi vezérlés |
| Frontend | API GW    | HTTPS     | /listDevices  | Eszközlista |
| Frontend | API GW    | HTTPS     | /linkDevice   | Eszköz linkelés |
| Frontend | API GW    | HTTPS     | /logs         | Audit log lekérés |

---

## ✅ Újdonságok v1.1.0

- Új `/logs` végpont → audit trail lekérés
- `getDeviceLogs-dev` Lambda → DynamoDB query a `MailboxQRLogs-dev` táblából
- Frontend:
  - Új `LogsPage` + `LogsTable` komponensek
  - Audit logok táblázatos megjelenítése
  - Reszponzív, teljes szélességű UI overhaul

---

## 📂 Projektstruktúra

