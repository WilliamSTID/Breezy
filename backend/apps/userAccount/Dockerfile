FROM node:20

WORKDIR /app
COPY . ./
RUN npm install

EXPOSE 5050
CMD ["node", "src/index.js"]