FROM node:20

WORKDIR /app

COPY . ./
COPY ../../.env /app/global.env

RUN npm install

#COPY ../../libs/ ./libs

EXPOSE 4005
CMD ["node", "src/index.js"]
