FROM node:20

WORKDIR /app
COPY . .

RUN npm install dotenv && npm install

EXPOSE 4005
CMD ["node", "src/index.js"]