# AI Incident Triage Engine

Backend service for creating, triaging, and resolving incidents with deterministic rule-based severity and team assignment.

## Resume Highlights

- FastAPI backend with typed request/response schemas.
- PostgreSQL persistence through SQLAlchemy.
- Docker Compose environment with API and database services.
- Tested incident workflow covering create, triage, resolve, illegal transitions, and not-found behavior.
- Reproducible local benchmark script reporting p50 latency, p95 latency, throughput, and error rate.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/incidents uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/
```

## Docker Compose

Start the backend stack only:

```bash
docker compose -f docker-compose.yml up -d --build
```

The base Compose file starts:

- `api` on `http://localhost:8000`
- `db` on `localhost:5432`

Note: `docker-compose.override.yml` and the `frontend/` directory are experimental Phase 1 frontend artifacts. They are not required for backend readiness, benchmarks, tests, or resume review.

## Tests

```bash
pytest
```

Current verified result:

```text
11 passed
```

## Benchmark Command

```bash
python scripts/benchmark_api.py --base-url http://localhost:8000 --requests 50 --concurrency 5
```

The benchmark writes results to:

```text
docs/metrics.md
```

## Metrics Summary

See [docs/metrics.md](docs/metrics.md) for the latest local benchmark run.

Latest backend-only local run:

| Scenario | p50 latency | p95 latency | Throughput | Error rate |
| --- | ---: | ---: | ---: | ---: |
| Incident creation | 512.13 ms | 1012.63 ms | 8.47 rps | 0.0% |
| Triage transition | 367.16 ms | 487.31 ms | 6.48 rps | 0.0% |

Tracked metrics:

- p50 latency
- p95 latency
- throughput
- error rate
- incident creation latency
- triage transition latency

## API Workflow

Create an incident:

```bash
curl -X POST http://localhost:8000/incidents \
  -H "Content-Type: application/json" \
  -d '{"title":"Database connection timeout","description":"Users cannot connect"}'
```

List incidents:

```bash
curl http://localhost:8000/incidents
```

Get incident detail:

```bash
curl http://localhost:8000/incidents/{incident_id}
```

Triage incident:

```bash
curl -X POST http://localhost:8000/incidents/{incident_id}/triage
```

Resolve incident:

```bash
curl -X POST http://localhost:8000/incidents/{incident_id}/resolve
```

## Architecture

```mermaid
flowchart LR
    Client["API Client"] --> API["FastAPI Service"]
    API --> Service["Incident Service"]
    Service --> FSM["State Machine"]
    Service --> DB[("PostgreSQL")]
    API --> Schemas["Pydantic Schemas"]
```

## Known Limitations

- Classification is deterministic and rule-based; no external AI model is called.
- Database migrations are not configured yet; startup uses SQLAlchemy metadata creation.
- Authentication and authorization are not implemented.
- The generated frontend is experimental and not part of the backend-only production freeze.

## Failure Mode Validation

Failure mode tested: requests for nonexistent incident IDs return HTTP 404 instead of returning invalid data or modifying persisted state. Failure-path validation is included alongside incident creation, triage workflow, and benchmark verification.
