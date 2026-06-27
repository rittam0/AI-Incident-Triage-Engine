from sqlalchemy.orm import Session

from app.fsm import IncidentState, apply_transition
from app.models import Incident


def classify_incident(title: str):
    text = title.lower()

    if "vpn" in text:
        return "MEDIUM", "NETWORK_TEAM"

    elif "email" in text:
        return "HIGH", "MESSAGING_TEAM"

    elif "database" in text:
        return "CRITICAL", "DATABASE_TEAM"

    else:
        return "LOW", "SERVICE_DESK"


def create_incident(
    db: Session,
    title: str,
    description: str | None = None,
):
    severity, assigned_team = classify_incident(title)

    incident = Incident(
        title=title,
        description=description,
        severity=severity,
        assigned_team=assigned_team,
        state="OPEN",
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


def list_incidents(db: Session):
    return db.query(Incident).all()


def get_incident(db: Session, incident_id):
    return db.query(Incident).filter(
        Incident.id == incident_id
    ).first()


def transition_incident(
    db: Session,
    incident_id,
    action: str,
):
    incident = get_incident(db, incident_id)

    if incident is None:
        raise LookupError("Incident not found")

    current = IncidentState(incident.state)

    next_state = apply_transition(
        current,
        action,
    )

    incident.state = next_state.value

    db.commit()
    db.refresh(incident)

    return incident
