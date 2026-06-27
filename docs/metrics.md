# API Benchmark Metrics

Generated: `2026-06-27T12:59:52.577083+00:00`

Target: `http://127.0.0.1:8000`

Configuration:

- Requests per scenario: `50`
- Concurrency: `5`
- Benchmark client: Python standard library HTTP client

| Scenario | p50 latency | p95 latency | Throughput | Error rate | Successful / Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Incident creation | 512.13 ms | 1012.63 ms | 8.47 rps | 0.0% | 50 / 50 |
| Triage transition | 367.16 ms | 487.31 ms | 6.48 rps | 0.0% | 50 / 50 |

Notes:

- Triage transition benchmark creates a fresh incident and then measures the `/incidents/{id}/triage` transition latency.
- Results are local development measurements and should be re-run on the target deployment environment before capacity claims.
