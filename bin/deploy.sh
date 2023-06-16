#!/bin/bash
set -e

eval "$(ssh-agent -s)"
ssh-add /root/.ssh/monadical.key
cd /opt/Morpheus || exit 1
git checkout main || exit 1
git pull --autostash origin main
docker compose -f docker-compose.yaml build
docker compose run --rm api alembic upgrade head
docker compose --profile staging -f docker-compose.yaml stop
