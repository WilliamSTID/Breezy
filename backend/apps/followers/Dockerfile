FROM node:20

WORKDIR /app

COPY . .

RUN npm install
RUN npm install jsonwebtoken

EXPOSE 4002

CMD ["node", "src/index.js"]