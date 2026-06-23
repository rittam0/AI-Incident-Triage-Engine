import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    severity = Column(String(20), nullable=False)
    assigned_team = Column(String(50), nullable=False)

    state = Column(String(20), nullable=False, default="OPEN")

    created_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

    __table_args__ = (
        Index("idx_incident_state", "state"),
        Index("idx_incident_team", "assigned_team"),
    )
