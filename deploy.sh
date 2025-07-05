#!/bin/bash
sudo docker compose down
sudo docker compose pull
sudo docker compose --env-file .env up -d
sudo docker image prune -f