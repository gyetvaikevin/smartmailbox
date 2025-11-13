📬 Smart Mailbox – ESP32 IoT Project
🔹 Rövid leírás
Okos postaláda prototípus ESP32 alapokon, érintőkijelzővel, QR kód olvasással és AWS IoT integrációval. A rendszer célja, hogy biztonságosan és kényelmesen lehessen kezelni a zárakat QR kód, webes felület vagy felhőalapú parancsok segítségével.

⚙️ Funkciók
Ajtónyitás több forrásból:

érintőkijelző gombok

QR kód olvasó

webes felület

MQTT parancsok (AWS IoT)

Jelszókezelés és beállítások mentése

Offline log tárolás és automatikus feltöltés, ha visszatér az internet

Vizualizált állapot a kijelzőn (ikonok, gombok, logó)

Audit naplózás (nyitások, események, időbélyeggel)

🛠 Hardver
ESP32 (WiFi + BT)

TFT kijelző (ST7796 driver)

Kapacitív érintésvezérlő (FT6206)

Relék a zárakhoz

QR kód olvasó (UART)

Postaláda mechanika

💻 Szoftver
Arduino IDE

Könyvtárak: Arduino_GFX, Adafruit GFX, WiFiManager, PubSubClient, ArduinoJson

SPIFFS fájlrendszer (logó és ikonok tárolása)

AWS IoT Core integráció (TLS tanúsítványokkal)

WebServer API (jelszó beállítás, ajtóvezérlés)

☁️ Felhő integráció
AWS IoT Core

MQTT témák:

postalada/<THINGNAME>/cmd – parancsok

postalada/<THINGNAME>/ack – visszajelzés

postalada/<THINGNAME>/status – audit log

postalada/<THINGNAME>/statusupdate – aktuális állapot

📊 Példa használat
A felhasználó QR kódot mutat → postaláda nyílik.

Az esemény audit logként kerül az AWS IoT‑be.

Ha nincs internet, az esemény lokálisan tárolódik, majd később feltöltődik.

A kijelzőn ikonok mutatják a WiFi/MQTT kapcsolat állapotát.

🚀 Tervek
Videós bemutató a működésről

Webapp integráció a motoros projekttel

További IoT funkciók (pl. értesítések mobilra)
