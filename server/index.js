const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: {
    origin: "*",  // Erlaubt Verbindungen von überall (Unity & Web)
    methods: ["GET", "POST"]
  }
});

console.log("🔮 VR-Magic Debugger läuft auf Port 3000");

io.on("connection", (socket) => {
  console.log("⚡ Neuer Client verbunden:", socket.id);

  // Wenn Unity Daten sendet
  socket.on("unity-log", (data) => {
    // Leite sie sofort an die Webseite weiter
    io.emit("web-update", data);
  });
});