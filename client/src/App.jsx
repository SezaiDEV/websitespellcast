import { useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';
// Alle notwendigen Diagramm-Komponenten importieren
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

// Verbindung zum Server herstellen
const socket = io("http://localhost:3000");

function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Disconnected 🔴");
  const [startTime, setStartTime] = useState(new Date());

  useEffect(() => {
    socket.on("connect", () => setStatus("Connected 🟢"));
    socket.on("disconnect", () => setStatus("Disconnected 🔴"));

    // Hier kommen die Daten von Unity an
    socket.on("web-update", (data) => {
      const newLog = { 
        id: Date.now(), 
        time: new Date().toLocaleTimeString(),
        fullDate: new Date(), // Für Zeitberechnung wichtig
        type: data.type || "Info",
        message: data.message || JSON.stringify(data)
      };
      // Neue Logs oben hinzufügen
      setLogs((prev) => [newLog, ...prev]);
    });

    return () => socket.off("web-update");
  }, []);

  // --- LOGS DOWNLOADEN ---
  const downloadLogs = () => {
    if (logs.length === 0) return alert("Nichts zu speichern!");
    
    const fileContent = logs.map(log => 
      `[${log.time}] [${log.type}] ${log.message}`
    ).join('\n');

    const element = document.createElement("a");
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `vr-research-data-${new Date().getHours()}-${new Date().getMinutes()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearLogs = () => {
    setLogs([]);
    setStartTime(new Date());
  };

  // --- WISSENSCHAFTLICHE ANALYSE (Automatisch) ---
  const stats = useMemo(() => {
    let successCount = 0;
    let failCount = 0;
    
    // Speicher für Durchschnitts-Scores (Präzision)
    let shapeScores = {
      "Circle": { total: 0, count: 0 },
      "Triangle": { total: 0, count: 0 },
      "Square": { total: 0, count: 0 },
      "Star": { total: 0, count: 0 }
    };

    // Speicher für Zeitverlauf (Ermüdung)
    let timeBuckets = {};

    logs.forEach(log => {
      const msg = log.message;
      
      // 1. SCORE AUSLESEN: Sucht nach Zahl in Klammern "(0.95)"
      const scoreMatch = msg.match(/\((\d\.\d+)\)/);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      // 2. ERFOLG vs FEHLER (Basiert auf deinen C# Logs mit ✨ oder ❌)
      const isSuccess = msg.includes("✨") || log.type === "Combat";
      const isFail = msg.includes("❌") || msg.includes("ungena") || log.type === "System";

      if (isSuccess) successCount++;
      if (isFail) failCount++;

      // 3. PRÄZISION PRO FORM
      if (score > 0) {
        let shape = "Sonstige";
        
        // Hier wird der Name gefiltert
        if (msg.toLowerCase().includes("circle") || msg.toLowerCase().includes("kreis")) shape = "Circle";
        else if (msg.toLowerCase().includes("triangle") || msg.toLowerCase().includes("dreieck")) shape = "Triangle";
        else if (msg.toLowerCase().includes("square") || msg.toLowerCase().includes("viereck")) shape = "Square";
        // --- NEU: STERN HINZUGEFÜGT ---
        else if (msg.toLowerCase().includes("star") || msg.toLowerCase().includes("stern")) shape = "Star";
        // ------------------------------
        
        // Nur zählen wenn wir die Form kennen
        if (shapeScores[shape]) {
          shapeScores[shape].total += score;
          shapeScores[shape].count++;
        }
      }

      // 4. ZEITVERLAUF (Casts pro Minute)
      const diffMs = log.fullDate - startTime;
      const minute = Math.floor(diffMs / 60000); // Minute 0, 1, 2...
      if (!timeBuckets[minute]) timeBuckets[minute] = { name: `${minute}m`, actions: 0 };
      if (isSuccess || isFail) timeBuckets[minute].actions++;
    });

    // Daten aufbereiten für Balkendiagramm
    const precisionData = Object.keys(shapeScores).map(key => ({
      name: key,
      Score: shapeScores[key].count > 0 ? (shapeScores[key].total / shapeScores[key].count).toFixed(2) : 0
    })).filter(item => item.Score > 0); 

    const timelineData = Object.values(timeBuckets);

    return { successCount, failCount, precisionData, timelineData };
  }, [logs, startTime]);

  // Daten für Tortendiagramm
  const chartData = [
    { name: 'Erkannt', value: stats.successCount },
    { name: 'Fehlgeschlagen', value: stats.failCount }
  ];

  const COLORS = ['#00ff00', '#ff0000']; 
  const duration = Math.floor((new Date() - startTime) / 1000);

  return (
    <div style={{ padding: "20px", background: "#111", color: "#0f0", minHeight: "100vh", fontFamily: "monospace" }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #333", paddingBottom: "20px", marginBottom: "20px" }}>
        <div>
          <h1>🔮 VR Research Debugger</h1>
          <h3>Status: {status} | Laufzeit: {duration}s</h3>
        </div>
        <div>
          <button onClick={downloadLogs} style={btnStyle}>💾 Speichern (.txt)</button>
          <button onClick={clearLogs} style={{...btnStyle, background: '#333'}}>🗑️ Reset</button>
        </div>
      </div>

      {/* --- DASHBOARD GRID (3 Diagramme) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* 1. ZUVERLÄSSIGKEIT (Torte) */}
        <div style={cardStyle}>
          <h3 style={{marginTop: 0}}>📊 Zuverlässigkeit</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{textAlign: 'center', color: '#888'}}>
             Quote: {stats.successCount + stats.failCount > 0 ? ((stats.successCount / (stats.successCount + stats.failCount)) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {/* 2. PRÄZISION (Balken) */}
        <div style={cardStyle}>
          <h3 style={{marginTop: 0}}>🎯 Präzision (Score Ø)</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={stats.precisionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis domain={[0, 1]} stroke="#666" />
                <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} cursor={{fill: '#222'}} />
                <Bar dataKey="Score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. ERMÜDUNG (Fläche) */}
        <div style={cardStyle}>
          <h3 style={{marginTop: 0}}>⚡ Ermüdung (Apm)</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={stats.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} />
                <Area type="monotone" dataKey="actions" stroke="#00ff00" fill="#00ff00" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* LOG LISTE */}
      <h3 style={{ borderBottom: "1px solid #333", paddingBottom: "10px" }}>📝 Log Feed ({logs.length})</h3>
      <div style={{ marginTop: "10px", maxHeight: '300px', overflowY: 'auto' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ borderBottom: "1px solid #222", padding: "5px 0", display: "flex" }}>
            <span style={{ color: "#555", minWidth: "90px" }}>[{log.time}]</span> 
            <strong style={{ 
              color: log.message.includes("❌") ? "red" : (log.message.includes("✨") ? "#00ffea" : "#0f0"), 
              minWidth: "80px",
              marginLeft: "10px" 
            }}>
              [{log.type}]
            </strong> 
            <span style={{ marginLeft: "10px", color: "#ddd" }}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styling Helper
const btnStyle = {
  padding: "10px 15px",
  marginLeft: "10px",
  background: "#005500",
  color: "#fff",
  border: "1px solid #0f0",
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: "1em",
  borderRadius: "4px"
};

const cardStyle = {
  border: "1px solid #333", 
  padding: "15px", 
  borderRadius: "5px", 
  background: "#0a0a0a"
};

export default App;