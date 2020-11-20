FROM node:latest AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --quiet
COPY . .
RUN npm run build

FROM node:latest
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --quiet
COPY --from=builder /usr/src/app/build/ build/
COPY html html
COPY entrypoint.sh ./
RUN curl -o /root/docker.tgz https://download.docker.com/linux/static/stable/x86_64/docker-19.03.9.tgz && tar -C /root -xvf /root/docker.tgz && mv /root/docker/docker /usr/local/bin/docker && rm -rf /root/docker*
EXPOSE 8080
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
