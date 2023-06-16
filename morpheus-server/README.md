# Morpheus - Stable Diffusion backend

FastAPI backend for the Morpheus project.

## Quickstart

```bash
# Clone the codebase
git clone git@github.com:Monadical-SAS/Morpheus.git

# Move to the directory
cd Morpheus/morpheus-server 

# Create secrets file
cp -p secrets.env.dist secrets.env

# Edit the secrets file
nano secrets.env
# Make sure to replace the firebase variables with the ones from the firebase-admin-dk.json file

# Build and run the docker image
docker-compose build
docker-compose up
```

The server will be available at http://localhost:8001

To run tests
```shell
# Running all the tests
docker compose run --rm api pytest

# Running a specific test
docker compose run --rm api pytest tests/test_module.py

# Running a specific test function
docker compose run --rm api pytest tests/test_module.py::test_function
```

To run migrations
```shell
# Create migration
docker-compose run --rm api alembic revision --autogenerate -m "Initial migration"

# Migrate / Update the head
docker-compose run --rm api alembic upgrade head     
```

