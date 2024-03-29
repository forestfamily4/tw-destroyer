FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install
RUN npx tsc

CMD [ "node", "dist/index.js" ]