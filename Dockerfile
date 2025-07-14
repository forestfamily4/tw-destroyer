FROM node:24-slim

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build

CMD [ "node", "dist/index.js" ]