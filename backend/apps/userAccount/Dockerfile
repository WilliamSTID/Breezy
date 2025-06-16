FROM node:20

WORKDIR /app
COPY . ./

RUN npm install && npm rebuild bcrypt --build-from-source

EXPOSE 4004
CMD ["node", "index.js"]