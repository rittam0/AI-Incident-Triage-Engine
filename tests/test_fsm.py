import pytest

from app.fsm import IncidentState, apply_transition


def test_triage_open():
    result = apply_transition(
        IncidentState.OPEN,
        "triage"
    )

    assert result == IncidentState.TRIAGED


def test_resolve_triaged():
    result = apply_transition(
        IncidentState.TRIAGED,
        "resolve"
    )

    assert result == IncidentState.RESOLVED


def test_cannot_resolve_open():
    with pytest.raises(ValueError):
        apply_transition(
            IncidentState.OPEN,
            "resolve"
        )


def test_cannot_triage_resolved():
    with pytest.raises(ValueError):
        apply_transition(
            IncidentState.RESOLVED,
            "triage"
        )


def test_unknown_action():
    with pytest.raises(ValueError):
        apply_transition(
            IncidentState.OPEN,
            "delete"
        )
