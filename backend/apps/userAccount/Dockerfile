FROM node:20

WORKDIR /app
COPY . ./
COPY ../../.env /app/global.env

RUN npm install && npm rebuild bcrypt --build-from-source

EXPOSE 4004

CMD ["node", "src/index.js"]