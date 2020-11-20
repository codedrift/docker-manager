FROM node:latest AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --quiet
COPY . .
RUN npm run build

FROM node:latest
ARG DOCKER_GROUP_ID
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --quiet
COPY --from=builder /usr/src/app/build/ build/
COPY html html
RUN apt install curl
USER root
RUN curl -o /root/docker.tgz https://download.docker.com/linux/static/stable/x86_64/docker-19.03.9.tgz && tar -C /root -xvf /root/docker.tgz && mv /root/docker/docker /usr/local/bin/docker && rm -rf /root/docker*
RUN curl -L https://github.com/docker/compose/releases/download/1.27.4/docker-compose--`uname -s`-`uname -m` > /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
RUN groupadd -g $DOCKER_GROUP_ID docker && gpasswd -a node docker
USER node

EXPOSE 8080
ENTRYPOINT ["node", "build/main.js"]
