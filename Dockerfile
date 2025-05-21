FROM node:20-slim

WORKDIR /app

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere alle Projektdateien
COPY . .

# Port freigeben
EXPOSE 3000

# Starte die Anwendung
CMD ["node", "server.js"] 