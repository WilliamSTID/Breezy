FROM node:20

WORKDIR /app
COPY . ./

RUN npm install

EXPOSE 4003
CMD ["node", "src/index.js"]