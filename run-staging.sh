echo "running morpheus in staging mode"
docker compose down
docker compose down
docker compose build datalib
docker compose build api
docker compose build worker-ray
docker compose build
docker compose --profile staging up --force-recreate