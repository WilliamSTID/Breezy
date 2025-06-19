FROM node:20

WORKDIR /app

# Copier d'abord package.json et package-lock.json
COPY package*.json ./
RUN npm install
RUN npm install dotenv

# Ensuite copier le reste des fichiers
COPY . .

# S'assurer que le fichier .env est utilisé
ENV NODE_ENV=production

EXPOSE 4003
CMD ["node", "src/index.js"]