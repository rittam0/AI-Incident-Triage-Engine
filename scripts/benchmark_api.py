from __future__ import annotations

import argparse
import json
import statistics
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0

    ordered = sorted(values)
    index = int(round((len(ordered) - 1) * pct))
    return ordered[index]


def request_json(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    timeout: float = 10.0,
) -> tuple[int, dict[str, Any] | list[Any] | None, float]:
    data = None
    headers = {"Accept": "application/json"}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(url, data=data, headers=headers, method=method)
    start = time.perf_counter()

    try:
        with urlopen(request, timeout=timeout) as response:
            body = response.read()
            elapsed_ms = (time.perf_counter() - start) * 1000
            if not body:
                return response.status, None, elapsed_ms
            return response.status, json.loads(body.decode("utf-8")), elapsed_ms
    except HTTPError as exc:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return exc.code, None, elapsed_ms
    except URLError:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return 0, None, elapsed_ms


def create_incident(base_url: str, index: int) -> dict[str, Any]:
    status, body, elapsed_ms = request_json(
        "POST",
        f"{base_url}/incidents",
        {
            "title": f"Database benchmark incident {index} {uuid.uuid4()}",
            "description": "benchmark run",
        },
    )

    return {
        "ok": status == 200,
        "status": status,
        "latency_ms": elapsed_ms,
        "incident": body if isinstance(body, dict) else None,
    }


def triage_incident(base_url: str, index: int) -> dict[str, Any]:
    created = create_incident(base_url, index)

    if not created["ok"] or not created["incident"]:
        return {
            "ok": False,
            "status": created["status"],
            "latency_ms": created["latency_ms"],
        }

    incident_id = created["incident"]["id"]
    status, _, elapsed_ms = request_json(
        "POST",
        f"{base_url}/incidents/{incident_id}/triage",
    )

    return {
        "ok": status == 200,
        "status": status,
        "latency_ms": elapsed_ms,
    }


def summarize(results: list[dict[str, Any]], elapsed_seconds: float) -> dict[str, Any]:
    latencies = [result["latency_ms"] for result in results if result["ok"]]
    total = len(results)
    errors = total - len(latencies)

    return {
        "requests": total,
        "successful_requests": len(latencies),
        "errors": errors,
        "error_rate_percent": round((errors / total) * 100, 2) if total else 0.0,
        "throughput_rps": round(total / elapsed_seconds, 2) if elapsed_seconds else 0.0,
        "p50_latency_ms": round(statistics.median(latencies), 2) if latencies else 0.0,
        "p95_latency_ms": round(percentile(latencies, 0.95), 2),
        "min_latency_ms": round(min(latencies), 2) if latencies else 0.0,
        "max_latency_ms": round(max(latencies), 2) if latencies else 0.0,
    }


def run_case(
    name: str,
    worker,
    base_url: str,
    requests: int,
    concurrency: int,
) -> dict[str, Any]:
    started = time.perf_counter()
    results: list[dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [
            executor.submit(worker, base_url, index)
            for index in range(1, requests + 1)
        ]
        for future in as_completed(futures):
            results.append(future.result())

    elapsed_seconds = time.perf_counter() - started
    summary = summarize(results, elapsed_seconds)
    summary["name"] = name
    summary["elapsed_seconds"] = round(elapsed_seconds, 2)
    return summary


def render_markdown(
    base_url: str,
    requests: int,
    concurrency: int,
    create_summary: dict[str, Any],
    triage_summary: dict[str, Any],
) -> str:
    generated_at = datetime.now(timezone.utc).isoformat()

    return f"""# API Benchmark Metrics

Generated: `{generated_at}`

Target: `{base_url}`

Configuration:

- Requests per scenario: `{requests}`
- Concurrency: `{concurrency}`
- Benchmark client: Python standard library HTTP client

| Scenario | p50 latency | p95 latency | Throughput | Error rate | Successful / Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Incident creation | {create_summary["p50_latency_ms"]} ms | {create_summary["p95_latency_ms"]} ms | {create_summary["throughput_rps"]} rps | {create_summary["error_rate_percent"]}% | {create_summary["successful_requests"]} / {create_summary["requests"]} |
| Triage transition | {triage_summary["p50_latency_ms"]} ms | {triage_summary["p95_latency_ms"]} ms | {triage_summary["throughput_rps"]} rps | {triage_summary["error_rate_percent"]}% | {triage_summary["successful_requests"]} / {triage_summary["requests"]} |

Notes:

- Triage transition benchmark creates a fresh incident and then measures the `/incidents/{{id}}/triage` transition latency.
- Results are local development measurements and should be re-run on the target deployment environment before capacity claims.
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Benchmark the incident API.")
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument("--requests", type=int, default=50)
    parser.add_argument("--concurrency", type=int, default=5)
    parser.add_argument("--output", default="docs/metrics.md")
    args = parser.parse_args()

    status, _, _ = request_json("GET", f"{args.base_url}/")
    if status != 200:
        print(f"Health check failed for {args.base_url}: status={status}")
        return 1

    create_summary = run_case(
        "Incident creation",
        create_incident,
        args.base_url,
        args.requests,
        args.concurrency,
    )
    triage_summary = run_case(
        "Triage transition",
        triage_incident,
        args.base_url,
        args.requests,
        args.concurrency,
    )

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        render_markdown(
            args.base_url,
            args.requests,
            args.concurrency,
            create_summary,
            triage_summary,
        ),
        encoding="utf-8",
    )

    print(json.dumps({
        "incident_creation": create_summary,
        "triage_transition": triage_summary,
        "output": str(output),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
