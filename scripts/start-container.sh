#!/bin/bash

curl -X POST localhost:8080/containers \
    -H "Content-Type: application/json" \
    --data-binary @- <<EOF
{
  "image": "alphabetapeter/werner",
  "name": "werner",
  "ports": [{
      "host": 8081,
      "container": 8080
  }],
  "env": ["FOO=BAR"],
  "readyRoute": "/health",
  "readyTimeoutMs": 1000
}
EOF
