FROM node:20

WORKDIR /app

# Copie package.json + package-lock.json
COPY ./package*.json ./

# Copie le code source (contenu de src/)
COPY ./src/ .

RUN npm install

EXPOSE 4005
CMD ["node", "index.js"]
