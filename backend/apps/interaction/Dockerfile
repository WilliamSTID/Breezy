FROM node:20

WORKDIR /app
COPY . ./

RUN npm install

EXPOSE 4008
CMD ["node", "src/index.js"]