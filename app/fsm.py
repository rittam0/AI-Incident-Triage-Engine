from enum import Enum


class IncidentState(str, Enum):
    OPEN = "OPEN"
    TRIAGED = "TRIAGED"
    RESOLVED = "RESOLVED"


TRANSITIONS = {
    (IncidentState.OPEN, "triage"): IncidentState.TRIAGED,
    (IncidentState.TRIAGED, "resolve"): IncidentState.RESOLVED,
}


def apply_transition(current_state: IncidentState, action: str) -> IncidentState:
    key = (current_state, action)

    if key not in TRANSITIONS:
        raise ValueError(
            f"Illegal transition: cannot '{action}' an incident in state '{current_state}'"
        )

    return TRANSITIONS[key]
