# 🧙‍♂️ Magic VR Debugger

Ein Echtzeit-Debugging-Tool für Unity VR-Entwicklung. Es sendet Logs und Events aus der VR-Brille (Meta Quest) direkt an eine Webseite auf deinem PC/Laptop, damit du die Brille zum Testen nicht abnehmen musst.

=========================================
🚀 FEATURES
=========================================
* Live-Logs: Sieh Debug.Log Nachrichten sofort im Browser.
* Kategorien: Farbliche Unterscheidung (z. B. System, Combat, Error).
* Wireless: Funktioniert über lokales WLAN (kein Kabel nötig).
* Zero-UI in VR: Keine störenden Debug-Texte im Spiel selbst.

=========================================
🛠️ VORAUSSETZUNGEN
=========================================
* Unity (getestet mit Unity 6 / 2022+)
* Node.js (für den Webserver)
* WLAN: PC und VR-Brille müssen im selben Netzwerk sein.

=========================================
📦 INSTALLATION & START
=========================================

Das Projekt besteht aus zwei Teilen: Der Webseite (Server) und dem Spiel (Unity).

--- SCHRITT 1: Web-Server starten (Am PC) ---
Du benötigst zwei Terminal-Fenster.

1. Terminal 1 (Backend):
   cd server
   npm install  (Nur beim ersten Mal)
   node index.js
   -> Wartet auf "Listening on port 3000"

2. Terminal 2 (Frontend):
   cd client
   npm install  (Nur beim ersten Mal)
   npm run dev
   -> Wartet auf "Local: http://localhost:5173"

👉 Öffne im Browser: http://localhost:5173

--- SCHRITT 2: Unity Setup ---

1. Plugin installieren:
   Lade "Socket.IO for Unity" herunter und importiere die package.json.

2. Skript erstellen:
   Erstelle ein GameObject "DebugManager" und packe das Skript "MagicDebugSender" drauf.

3. Verbindung konfigurieren:
   Klicke auf den DebugManager.
   Server Url für PC-Test:  http://localhost:3000
   Server Url für VR:       http://DEINE-PC-IP:3000  (z.B. 192.168.178.20:3000)

=========================================
💻 NUTZUNG IM CODE
=========================================

Das Skript fängt automatisch alle normalen Unity-Logs (Debug.Log) ab.
Du kannst aber auch eigene Events senden:

// C# Code Beispiel:
GameObject.Find("DebugManager").GetComponent<MagicDebugSender>().SendToWeb("Combat", "Feuerball geworfen!");

=========================================
❓ TROUBLESHOOTING
=========================================

Problem: Die Logs kommen nicht an.
1. Sind PC und VR-Brille im selben WLAN?
2. Firewall: Hast du Node.js erlaubt?
3. Unity Inspector: Hast du die richtige IP-Adresse eingetragen (nicht localhost bei VR)?
4. Ist das DebugManager Objekt in der Szene?
