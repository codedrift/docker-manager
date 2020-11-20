#!/bin/bash
docker-compose build --build-arg DOCKER_GROUP_ID=`getent group docker | cut -d: -f3`
docker-compose up