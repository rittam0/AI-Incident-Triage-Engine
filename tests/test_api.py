import uuid

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
)

TestingSession = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def create_incident(title):
    return client.post(
        "/incidents",
        json={
            "title": title,
            "description": "test incident"
        },
    )


def test_create_vpn_incident():
    r = create_incident("VPN access broken")

    assert r.status_code == 200
    assert r.json()["assigned_team"] == "NETWORK_TEAM"
    assert r.json()["severity"] == "MEDIUM"


def test_create_database_incident():
    r = create_incident("Database connection timeout")

    assert r.status_code == 200
    assert r.json()["assigned_team"] == "DATABASE_TEAM"
    assert r.json()["severity"] == "CRITICAL"


def test_triage_incident():
    incident_id = create_incident(
        "Database outage"
    ).json()["id"]

    r = client.post(
        f"/incidents/{incident_id}/triage"
    )

    assert r.status_code == 200
    assert r.json()["state"] == "TRIAGED"


def test_resolve_incident():
    incident_id = create_incident(
        "Database outage"
    ).json()["id"]

    client.post(
        f"/incidents/{incident_id}/triage"
    )

    r = client.post(
        f"/incidents/{incident_id}/resolve"
    )

    assert r.status_code == 200
    assert r.json()["state"] == "RESOLVED"


def test_illegal_transition():
    incident_id = create_incident(
        "VPN issue"
    ).json()["id"]

    r = client.post(
        f"/incidents/{incident_id}/resolve"
    )

    assert r.status_code == 409


def test_nonexistent_incident():
    r = client.get(
        f"/incidents/{uuid.uuid4()}"
    )

    assert r.status_code == 404
