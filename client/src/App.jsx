import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Verbindung zum Server herstellen
const socket = io("http://localhost:3000");

function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Disconnected 🔴");

  useEffect(() => {
    socket.on("connect", () => setStatus("Connected 🟢"));
    socket.on("disconnect", () => setStatus("Disconnected 🔴"));

    // Hier kommen die Daten von Unity an
    socket.on("web-update", (data) => {
      const newLog = { 
        id: Date.now(), 
        time: new Date().toLocaleTimeString(), 
        ...data 
      };
      // Neue Logs oben hinzufügen
      setLogs((prev) => [newLog, ...prev]);
    });

    return () => socket.off("web-update");
  }, []);

  return (
    <div style={{ padding: "20px", background: "#111", color: "#0f0", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1>🔮 VR Spellcast Debugger</h1>
      <h3>Status: {status}</h3>
      <div style={{ marginTop: "20px", borderTop: "1px solid #333" }}>
        {logs.map((log) => (
          <div key={log.id} style={{ borderBottom: "1px solid #222", padding: "5px 0" }}>
            <span style={{ color: "#666" }}>[{log.time}]</span> 
            <strong style={{ color: log.type === "Error" ? "red" : "#0f0", marginLeft: "10px" }}>
              [{log.type || "LOG"}]
            </strong> 
            <span style={{ marginLeft: "10px", color: "#ddd" }}>{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && <p style={{ color: "#555" }}>Warte auf Logs aus der VR...</p>}
      </div>
    </div>
  );
}

export default App;