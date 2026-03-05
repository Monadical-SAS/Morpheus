# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Morpheus is an open-source web platform for AI image generation using Stable Diffusion. It is a multi-service monorepo where each service is independently containerized and orchestrated via Docker Compose locally, and deployed to AWS EKS in production.

## Services and Architecture

```
morpheus-client (Next.js, port 3000)
morpheus-admin  (Next.js, port 3001)
morpheus-collaborative (Node.js/Socket.io, port 3002)
     |
morpheus-server (FastAPI, port 8001)
     |                  |                |
PostgreSQL (5432)   AWS S3         morpheus-worker (Ray, ports 8000/8265)
                                        |
                                  Firebase (Auth/Collab)
```

- **morpheus-data** is a shared Python library (built as a wheel) used by `morpheus-server` and `morpheus-worker`. It owns all SQLAlchemy models, Pydantic schemas, Alembic migrations, and S3/Firebase repository implementations.
- **morpheus-server** is the FastAPI backend. It depends on the `morpheus-data` wheel being built first.
- **morpheus-worker** runs a Ray cluster for GPU-accelerated Stable Diffusion inference.
- The client uses Firebase for authentication and Socket.io for real-time collaboration.

## Development Commands

### Starting the environment

```bash
# Copy secrets templates and fill in values
cp morpheus-server/secrets.env.dist morpheus-server/secrets.env
cp morpheus-client/env.local.dist morpheus-client/.env.local
cp morpheus-client/env.local.dist morpheus-admin/.env.local

# Apply DB migrations (required before first start)
docker compose run --rm datalib alembic upgrade head

# Start all services
docker compose up

# Start specific services
docker compose up api client admin
```

### Backend (morpheus-server / morpheus-data)

```bash
# Run all tests
docker compose run --rm api pytest

# Run a single test file
docker compose run --rm api pytest tests/test_module.py

# Run a single test
docker compose run --rm api pytest tests/test_module.py::test_function

# Lint
docker compose run --rm api flake8 --max-line-length 120 --exclude app/migrations/ .

# Format
docker compose run --rm api black --line-length 120 --exclude app/migrations/ .
```

### Database migrations

```bash
# Auto-generate a migration from model changes
docker compose run --rm datalib alembic revision --autogenerate -m "Description"

# Apply pending migrations
docker compose run --rm datalib alembic upgrade head
```

### Frontend (morpheus-client / morpheus-admin)

```bash
# Lint
docker compose exec client yarn lint
docker compose exec admin yarn lint

# Direct yarn usage (outside Docker)
cd morpheus-client && yarn dev    # port 3000
cd morpheus-admin   && yarn dev   # port 3001
```

### Collaborative server

```bash
docker compose exec collaborative yarn test:code  # ESLint
docker compose exec collaborative yarn fix        # Prettier + ESLint fix
```

### Building Docker images

```bash
# Build order matters: datalib must be built first
docker compose build datalib  # generates wheel file consumed by api/worker
docker compose build api
docker compose build client admin collaborative

# Build all
docker compose build
```

### Model management CLI

```bash
docker compose --profile manage build          # build the model-script service
docker compose run --rm model-script --help
docker compose run --rm model-script s3 list
docker compose run --rm model-script db register <server> <target>
```

## Code Architecture Details

### morpheus-data (shared library)

All database models live in `morpheus_data/models/models.py` (SQLAlchemy) and `morpheus_data/models/schemas.py` (Pydantic). Changes here require rebuilding the wheel (`docker compose build datalib`) before dependent services pick them up.

Repository classes in `morpheus_data/repository/` follow the repository pattern and are the only place that touches the database or S3 directly.

### morpheus-server structure

```
app/
  api/          # FastAPI route handlers (thin layer, delegates to services)
  services/     # Business logic
  models/       # Pydantic request/response models (distinct from DB models)
  integrations/ # Third-party integrations
  config.py     # Pydantic Settings (reads from secrets.env)
  app.py        # FastAPI app setup, router registration
main.py         # Uvicorn entry point
```

### Key configuration

| File | Purpose |
|------|---------|
| `morpheus-server/secrets.env` | Backend secrets (DB, Firebase, AWS, Ray URL) |
| `morpheus-client/.env.local` | Frontend env (API URL, Firebase config, WS URL) |
| `morpheus-server/app/config.py` | Pydantic Settings class |
| `morpheus-worker/models.yaml` | Ray Serve deployment configuration |
| `docker-compose.yaml` | Service orchestration for local dev |

### Python code standards

- Black formatter with `--line-length 120`
- Flake8 with `--max-line-length 120 --exclude app/migrations/`
- Alembic migrations live in `morpheus-data/morpheus_data/migrations/`

### TypeScript/JavaScript code standards

- ESLint for both frontend apps and collaborative server
- Prettier for collaborative server (`yarn fix`)

## Commit conventions

Follow Conventional Commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` tooling/deps
- `docs:` documentation
- `refactor:` restructuring
- `test:` tests
- `perf:` performance

## Infrastructure

- Production runs on AWS EKS (Kubernetes), provisioned with Terraform in `infra/`
- Helm charts are in `infra/charts/`
- CI/CD is via GitHub Actions (`.github/workflows/`); `monorepo/cicd.py` detects which services changed to run targeted pipelines
- Monitoring: Sentry (errors), Ray Dashboard (port 8265), Prometheus/Grafana (production)