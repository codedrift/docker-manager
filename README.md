# docker-manager


## Build and run

```bash
docker-compose build
docker-compose up
```

## Run without compose

```bash
docker run -d -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock codedriftdotnet/docker-manager:latest --name=docker-manager
```


## See containers

Go to http://localhost:8080/containers?type=html

## Start container

```bash
sh scripts/start-container.sh
```


## Run without docker

Supply CONNECT_HOST=localhost as env variable


