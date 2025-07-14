FROM node:24-slim

WORKDIR /app

COPY . .

RUN yarn install --production
RUN yarn build

CMD [ "node", "dist/index.js" ]