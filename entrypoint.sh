#!/bin/bash
DOCKER_GROUP_ID=$(stat -c '%g' /var/run/docker.sock)
groupadd -g $DOCKER_GROUP_ID docker
node build/main.js