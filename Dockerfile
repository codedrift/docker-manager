FROM node:latest AS builder
ARG NPM_SECRET
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --quiet
COPY . .
RUN npm run build

FROM node:latest
ARG NPM_SECRET
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --quiet
COPY --from=builder /usr/src/app/build/ build/
USER node
EXPOSE 8080
ENTRYPOINT ["node", "build/main.js"]
