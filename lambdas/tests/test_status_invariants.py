"""Guards for the status-date-index: appointments are found by statusKey, so it must always mirror status."""

from __future__ import annotations

import ast
from collections import Counter
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"

# Dicts with a "status" key but no "statusKey" that are API responses or log fields, never DB writes.
# Counted per function, so adding another status-only dict to one of these functions still fails.
NON_PERSISTED_STATUS_DICTS = Counter({
    ("appointments/availability.py", "get_month_availability"): 1,
    ("appointments/portal_service.py", "_safe_appointment"): 1,
    ("appointments/portal_service.py", "portal_cancel"): 1,
    ("appointments/service.py", "confirm_appointment"): 2,
    ("appointments/service.py", "confirm_appointment_from_webhook"): 1,
    ("reviews/handler.py", "get_reviews"): 1,
    ("reviews/handler.py", "submit_review"): 2,
})


def _status_dicts() -> list[tuple[str, str, ast.Dict]]:
    found = []
    for path in sorted(SRC.rglob("*.py")):
        tree = ast.parse(path.read_text())
        for function in ast.walk(tree):
            if not isinstance(function, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for node in ast.walk(function):
                if isinstance(node, ast.Dict) and any(
                    isinstance(key, ast.Constant) and key.value == "status" for key in node.keys
                ):
                    found.append((str(path.relative_to(SRC)), function.name, node))
    return found


def _value_for(node: ast.Dict, key_name: str) -> ast.expr | None:
    for key, value in zip(node.keys, node.values, strict=True):
        if isinstance(key, ast.Constant) and key.value == key_name:
            return value
    return None


def test_every_status_write_also_writes_a_matching_status_key() -> None:
    status_only: Counter[tuple[str, str]] = Counter()
    mismatched = []
    for file, function, node in _status_dicts():
        status_value = _value_for(node, "status")
        status_key_value = _value_for(node, "statusKey")
        if status_key_value is None:
            status_only[(file, function)] += 1
        elif ast.dump(status_value) != ast.dump(status_key_value):  # type: ignore[arg-type]
            mismatched.append(f"{file}:{node.lineno} ({function})")

    assert not mismatched, f"status and statusKey differ: {mismatched}"
    unexpected = status_only - NON_PERSISTED_STATUS_DICTS
    assert not unexpected, (
        "New dict sets 'status' without 'statusKey'. If it is written to the appointments table, add "
        f"'statusKey' with the same value; if it is only a response, add it to the allowlist: {dict(unexpected)}"
    )


def test_status_lists_cover_every_appointment_status() -> None:
    from appointments.models import ACTIVE_STATUSES, ALL_STATUSES

    assert set(ALL_STATUSES) == {"pending_payment", "pending", "confirmed", "cancelled", "completed", "no_show"}
    assert set(ACTIVE_STATUSES) <= set(ALL_STATUSES)
    assert "pending_payment" in ACTIVE_STATUSES
    assert set(ACTIVE_STATUSES) == {"pending_payment", "pending", "confirmed"}
