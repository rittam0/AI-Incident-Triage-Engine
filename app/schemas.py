import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class IncidentResponse(BaseModel):
    id: uuid.UUID

    title: str
    description: Optional[str]

    severity: str
    assigned_team: str

    state: str

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
