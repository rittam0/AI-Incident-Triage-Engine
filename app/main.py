from enum import Enum

from fastapi import FastAPI

app = FastAPI()


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/incident")
def triage_incident(title: str):

    text = title.lower()

    if "vpn" in text:
        team = "NETWORK_TEAM"
        severity = Severity.MEDIUM

    elif "email" in text:
        team = "MESSAGING_TEAM"
        severity = Severity.HIGH

    elif "database" in text:
        team = "DATABASE_TEAM"
        severity = Severity.CRITICAL

    else:
        team = "SERVICE_DESK"
        severity = Severity.LOW

    return {
        "incident": title,
        "assigned_team": team,
        "severity": severity
    }
