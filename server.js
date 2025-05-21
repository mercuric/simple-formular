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

const CSV_FILE = path.join(dataDir, 'submissions.csv');

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Hilfsfunktion: Schreibe CSV-Zeile
function appendToCSV(data) {
    const header = 'Name,E-Mail,Weitere Kontaktdaten,Notizen,Interesse,Zeitstempel\n';
    const row = `"${data.name.replace(/"/g, '""')}","${data.email.replace(/"/g, '""')}","${data.contact.replace(/"/g, '""')}","${data.notes.replace(/"/g, '""')}","${data.interest.replace(/"/g, '""')}","${data.timestamp}"\n`;
    if (!fs.existsSync(CSV_FILE)) {
        fs.writeFileSync(CSV_FILE, header + row, 'utf8');
    } else {
        fs.appendFileSync(CSV_FILE, row, 'utf8');
    }
}

// Formular-POST
app.post('/submit', (req, res) => {
    const { name, email, contact, notes, timestamp } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name ist erforderlich.' });
    }
    appendToCSV({ name, email: email || '', contact: contact || '', notes: notes || '', timestamp: timestamp || new Date().toISOString() });
    res.json({ success: true });
});

// Admin-Interface
app.get('/admin', (req, res) => {
    if (!fs.existsSync(CSV_FILE)) {
        return res.send('<h2>Noch keine Einträge vorhanden.</h2>');
    }
    const csv = fs.readFileSync(CSV_FILE, 'utf8');
    const rows = csv.trim().split('\n').map(r => r.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '')));
    const header = rows[0];
    const dataRows = rows.slice(1);

    // Stelle sicher, dass der Header "Interesse" enthält, falls noch keine Einträge mit Interesse vorhanden sind
    if (!header.includes('Interesse')) {
        header.splice(4, 0, 'Interesse'); // Füge Interesse an der richtigen Position ein
    }

    let html = `<h2>Alle Einträge</h2><a href="/download" style="margin-bottom:1rem;display:inline-block;">CSV herunterladen</a><table border="1" cellpadding="8" style="border-collapse:collapse;margin-top:1rem;">`;
    html += '<tr>' + header.map(h => `<th>${h}</th>`).join('') + '</tr>';
    dataRows.forEach(row => {
        // Stelle sicher, dass jede Datenreihe die gleiche Anzahl Spalten wie der Header hat
        // Dies ist nötig, falls ältere Einträge ohne "Interesse" existieren
        while (row.length < header.length) {
            row.splice(4, 0, ''); // Füge leere Zelle für Interesse ein
        }
        html += '<tr>' + row.map(cell => `<td>${cell.replace(/\n/g, '<br>')}</td>`).join('') + '</tr>';
    });
    html += '</table>';
    res.send(html);
});

// CSV-Download
app.get('/download', (req, res) => {
    if (!fs.existsSync(CSV_FILE)) {
        return res.status(404).send('Keine Datei vorhanden.');
    }
    res.download(CSV_FILE);
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
}); 