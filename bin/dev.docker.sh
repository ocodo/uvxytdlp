#!/bin/bash

docker stop uvxytdlp-ui
docker rm uvxytdlp-ui
docker build -t uvxytdlp-ui .

sudo docker run -d \
  -p 7150:80 \
  -v /mnt/Mirage/ytdlp-downloads:/ytdlp-downloads \
  --name uvxytdlp-ui \
  docker.io/library/uvxytdlp-ui

docker logs uvxytdlp-ui
