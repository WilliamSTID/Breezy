# Base Node
FROM node:18

# Créer un dossier de travail
WORKDIR /app

# Copier les fichiers de configuration et d'installation
COPY . ./
COPY ../../.env /app/global.env

RUN npm install

EXPOSE 4006

# Lancer le serveur
CMD ["node", "src/index.js"]
