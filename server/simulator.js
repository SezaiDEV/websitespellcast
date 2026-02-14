const io = require('socket.io-client');

// Verbindung zum Server herstellen (Genau wie Unity es tun würde)
const socket = io('http://localhost:3000');

console.log("🤖 Fake-Unity-Simulator gestartet...");

socket.on('connect', () => {
    console.log("✅ Verbunden mit Server! Drücke STRG+C zum Beenden.");
    
    // Startet die automatische Simulation
    startSimulation();
});

function startSimulation() {
    // Alle 2 Sekunden einen Zufalls-Zauber senden
    setInterval(() => {
        const actions = [
            // 1. Guter Kreis
            { 
                type: 'Combat', 
                message: '✨ Zauber: Circle (0.95)' 
            },
            // 2. Schlechtes Dreieck
            { 
                type: 'Combat', 
                message: '✨ Zauber: Triangle (0.75)' 
            },
            // 3. Perfektes Viereck
            { 
                type: 'Combat', 
                message: '✨ Zauber: Square (0.99)' 
            },
            // 4. Fehler / Daneben
            { 
                type: 'Error', 
                message: '❌ Zu ungenau: Star (0.40)' 
            },
            // 5. Treffer
            {
                type: 'Combat',
                message: '🎯 Treffer! (Circle)'
            }
        ];

        // Zufällige Aktion auswählen
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        // WICHTIG: Sende das Event so, wie dein Server es erwartet.
        // Falls dein Server auf 'unity-log' hört und 'web-update' sendet:
        // Wir senden hier mal beides, um sicherzugehen, dass was ankommt.
        
        // Variante A: Wir tun so als wären wir Unity (Server muss das weiterleiten)
        socket.emit('web-update', randomAction); 
        
        // Variante B: Falls dein Server "unity-log" erwartet
        socket.emit('unity-log', randomAction);

        console.log(`📤 Gesendet: [${randomAction.type}] ${randomAction.message}`);

    }, 1500); // Alle 1.5 Sekunden
}