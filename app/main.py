from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app import service
from app.schemas import IncidentCreate, IncidentResponse

app = FastAPI(
    title="AI Incident Triage Engine",
    version="1.0.0",
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/incidents", response_model=IncidentResponse)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
):
    return service.create_incident(
        db,
        payload.title,
        payload.description,
    )


@app.get("/incidents")
def list_incidents(
    db: Session = Depends(get_db),
):
    return service.list_incidents(db)


@app.get("/incidents/{incident_id}")
def get_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
):
    incident = service.get_incident(db, incident_id)

    if not incident:
        raise HTTPException(404, "Incident not found")

    return incident


@app.post("/incidents/{incident_id}/triage")
def triage_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
):
    try:
        return service.transition_incident(
            db,
            incident_id,
            "triage",
        )
    except LookupError as e:
        raise HTTPException(404, str(e))
    except ValueError as e:
        raise HTTPException(409, str(e))


@app.post("/incidents/{incident_id}/resolve")
def resolve_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
):
    try:
        return service.transition_incident(
            db,
            incident_id,
            "resolve",
        )
    except LookupError as e:
        raise HTTPException(404, str(e))
    except ValueError as e:
        raise HTTPException(409, str(e))
