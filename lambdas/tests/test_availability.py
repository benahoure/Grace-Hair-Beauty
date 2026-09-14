from __future__ import annotations

import datetime as dt

import pytest

SALON_TZ_NAME = "America/Indiana/Indianapolis"

# A day-hours config used for every day of the week in these tests, so the
# specific day-of-week of a test date never matters — only the cutoff logic
# (today's already-passed slots, and tomorrow-never-blocked) is under test.
_OPEN_ALL_WEEK = {
    day: {"open": "09:00", "close": "21:00", "closed": False}
    for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}


def _freeze_now(monkeypatch: pytest.MonkeyPatch, moment: dt.datetime) -> None:
    """Make ``dt.datetime.now(SALON_TZ)`` inside availability.py return ``moment``."""
    from appointments import availability as availability_module

    class _FrozenDatetime(dt.datetime):
        @classmethod
        def now(cls, tz: dt.tzinfo | None = None) -> dt.datetime:  # type: ignore[override]
            return moment.astimezone(tz) if tz else moment

    monkeypatch.setattr(availability_module.dt, "datetime", _FrozenDatetime)


def _stub_settings(monkeypatch: pytest.MonkeyPatch, hours: dict = _OPEN_ALL_WEEK) -> None:
    from appointments import availability as availability_module

    monkeypatch.setattr(availability_module, "_get_settings", lambda: (hours, set()))
    monkeypatch.setattr(availability_module, "_get_service_duration", lambda service_id: 60)
    monkeypatch.setattr(availability_module, "collect_windows", lambda *a, **k: {})


# ── get_date_slots: same-day partial availability, tomorrow never blocked ───────

def test_today_only_shows_slots_that_have_not_passed(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_date_slots

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 13, 30, tzinfo=SALON_TZ)  # 1:30 PM
    _freeze_now(monkeypatch, now)

    result = get_date_slots("2026-08-05")

    times = [s["time"] for s in result["slots"]]
    # Slots run 09:00-17:00 hourly; 13:00 has already started, so it and
    # everything before it are gone, but 14:00 onward remains.
    assert times == ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]


def test_today_after_last_slot_has_started_is_empty(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_date_slots

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 18, 0, tzinfo=SALON_TZ)  # 6:00 PM — past the 5 PM last start
    _freeze_now(monkeypatch, now)

    result = get_date_slots("2026-08-05")

    assert result["slots"] == []


def test_tomorrow_is_fully_available_even_at_1159pm_today(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_date_slots

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 23, 59, tzinfo=SALON_TZ)
    _freeze_now(monkeypatch, now)

    result = get_date_slots("2026-08-06")  # tomorrow

    times = [s["time"] for s in result["slots"]]
    assert times == [
        "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
    ]


def test_a_genuinely_past_date_has_no_slots(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_date_slots

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 10, 0, tzinfo=SALON_TZ)
    _freeze_now(monkeypatch, now)

    result = get_date_slots("2026-08-04")  # yesterday

    assert result["slots"] == []


# ── get_month_availability: same cutoff behavior reflected in day statuses ──────

def test_month_view_today_is_fully_booked_once_all_slots_have_passed(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_month_availability

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 18, 0, tzinfo=SALON_TZ)
    _freeze_now(monkeypatch, now)

    result = get_month_availability(2026, 8)
    today_entry = next(d for d in result["dates"] if d["date"] == "2026-08-05")

    # Today has hours and isn't blocked/closed — it's just out of bookable
    # slots for the day, not artificially cut off by a 24hr rule.
    assert today_entry["status"] == "fully_booked"
    assert today_entry["availableSlots"] == 0


def test_month_view_tomorrow_is_available_regardless_of_time_today(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_month_availability

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 23, 59, tzinfo=SALON_TZ)
    _freeze_now(monkeypatch, now)

    result = get_month_availability(2026, 8)
    tomorrow_entry = next(d for d in result["dates"] if d["date"] == "2026-08-06")

    assert tomorrow_entry["status"] == "available"
    assert tomorrow_entry["availableSlots"] == 9


def test_month_view_yesterday_is_past(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments.availability import SALON_TZ, get_month_availability

    _stub_settings(monkeypatch)
    now = dt.datetime(2026, 8, 5, 10, 0, tzinfo=SALON_TZ)
    _freeze_now(monkeypatch, now)

    result = get_month_availability(2026, 8)
    yesterday_entry = next(d for d in result["dates"] if d["date"] == "2026-08-04")

    assert yesterday_entry["status"] == "past"
    assert yesterday_entry["availableSlots"] == 0
