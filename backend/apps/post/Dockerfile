# Base Node
FROM node:18

# Créer un dossier de travail
WORKDIR /app

# Copier les fichiers de configuration et d'installation
COPY package*.json ./
RUN npm install

COPY . .

# Expose le port (à adapter si différent)
EXPOSE 3000

# Lancer le serveur
CMD ["node", "src/index.js"]
