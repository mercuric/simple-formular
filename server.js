const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Stelle sicher, dass das data-Verzeichnis existiert
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const DATA_FILE = path.join(dataDir, 'submissions.jsonl');

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Hilfsfunktion: Schreibe JSON Lines Zeile
function appendToJsonl(data) {
    // Daten als JSON-String und mit Zeilenumbruch an die Datei anhängen
    const jsonlRow = JSON.stringify(data) + '\n';
    fs.appendFileSync(DATA_FILE, jsonlRow, 'utf8');
}

// Formular-POST
app.post('/submit', (req, res) => {
    const { name, email, contact, notes, interest, timestamp } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name ist erforderlich.' });
    }
    appendToJsonl({ name, email: email || '', contact: contact || '', notes: notes || '', interest: interest || [], timestamp: timestamp || new Date().toISOString() });
    res.json({ success: true });
});

// Admin-Interface
app.get('/admin', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.send('<h2>Noch keine Einträge vorhanden.</h2>');
    }

    const jsonlContent = fs.readFileSync(DATA_FILE, 'utf8');
    const lines = jsonlContent.trim().split('\n');
    const dataEntries = lines.map(line => JSON.parse(line));

    // Kopfzeilen aus allen verfügbaren Schlüsseln erstellen
    let headerSet = new Set();
    dataEntries.forEach(entry => {
        Object.keys(entry).forEach(key => headerSet.add(key));
    });
    const header = Array.from(headerSet);

    let html = `<h2>Alle Einträge</h2><a href="/download" style="margin-bottom:1rem;display:inline-block;">Daten herunterladen (JSONL)</a><table border="1" cellpadding="8" style="border-collapse:collapse;margin-top:1rem;">`;
    html += '<tr>' + header.map(h => `<th>${h}</th>`).join('') + '</tr>';

    dataEntries.forEach(entry => {
        html += '<tr>';
        header.forEach(h => {
            const cellData = entry[h];
            let cellContent = '';
            if (Array.isArray(cellData)) {
                cellContent = cellData.join(', ');
            } else if (cellData !== undefined && cellData !== null) {
                 cellContent = String(cellData).replace(/\n/g, '<br>');
            }
            html += `<td>${cellContent}</td>`;
        });
        html += '</tr>';
    });

    html += '</table>';
    res.send(html);
});

// Daten-Download
app.get('/download', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.status(404).send('Keine Datei vorhanden.');
    }
    res.download(DATA_FILE, 'submissions.jsonl');
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
}); 