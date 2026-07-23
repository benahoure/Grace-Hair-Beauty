from __future__ import annotations

import datetime as dt

import pytest

# ── has_capacity: braider concurrency math ──────────────────────────────────────

def test_has_capacity_empty_day_is_open() -> None:
    from appointments.scheduling import has_capacity

    # 10:00-15:00 (5h) on an empty day, 2 braiders.
    assert has_capacity([], 600, 900, capacity=2) is True


def test_has_capacity_allows_second_braider_on_full_overlap() -> None:
    from appointments.scheduling import has_capacity

    # One 5h booking already at 10:00. A second identical booking still fits
    # because the salon has a second braider.
    existing = [(600, 900)]
    assert has_capacity(existing, 600, 900, capacity=2) is True


def test_has_capacity_blocks_third_when_both_braiders_busy() -> None:
    from appointments.scheduling import has_capacity

    # Two 5h bookings already at 10:00 -> both braiders busy 10:00-15:00.
    existing = [(600, 900), (600, 900)]
    assert has_capacity(existing, 600, 900, capacity=2) is False
    # ...and any window overlapping that busy stretch is blocked too.
    assert has_capacity(existing, 660, 780, capacity=2) is False  # 11:00-13:00


def test_has_capacity_back_to_back_is_not_an_overlap() -> None:
    from appointments.scheduling import has_capacity

    # Existing ends exactly when the new one starts (both braiders free at 12:00).
    existing = [(540, 720), (540, 720)]  # two 9:00-12:00 bookings
    assert has_capacity(existing, 720, 900, capacity=2) is True  # 12:00-15:00


def test_has_capacity_short_service_squeezes_into_gap() -> None:
    from appointments.scheduling import has_capacity

    # Lane 1 busy 9:00-14:00; Lane 2 busy 12:00-17:00 -> a 3h gap on Lane 2 (9-12).
    existing = [(540, 840), (720, 1020)]
    # A 1h service at 11:00 (660-720) fits the gap: peak overlap is 1.
    assert has_capacity(existing, 660, 720, capacity=2) is True
    # A 5h service at 9:00 (540-840) does not: it would collide with both during 12-14.
    assert has_capacity(existing, 540, 840, capacity=2) is False


def test_has_capacity_uses_peak_concurrency_not_overlap_count() -> None:
    from appointments.scheduling import has_capacity

    # Two existing bookings that never overlap each other but each overlaps the new
    # window at different times. Peak concurrency is 1, so it must be allowed even
    # though two existing appointments touch the window.
    existing = [(0, 120), (300, 420)]  # 0:00-2:00 and 5:00-7:00
    assert has_capacity(existing, 60, 360, capacity=2) is True  # 1:00-6:00


def test_has_capacity_respects_configurable_count() -> None:
    from appointments.scheduling import has_capacity

    existing = [(600, 900), (600, 900)]
    # With a third braider, a third concurrent booking becomes possible.
    assert has_capacity(existing, 600, 900, capacity=3) is True


def test_default_braider_count_is_two() -> None:
    from appointments.scheduling import BRAIDER_COUNT

    assert BRAIDER_COUNT == 2


# ── _generate_slots: hourly grid, latest start 5:00 PM ──────────────────────────

def test_generate_slots_hourly_capped_at_5pm() -> None:
    from appointments.availability import _generate_slots

    slots = _generate_slots({"open": "09:00", "close": "21:00", "closed": False})
    assert slots == ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]


def test_generate_slots_closed_day_is_empty() -> None:
    from appointments.availability import _generate_slots

    assert _generate_slots({"closed": True}) == []


def test_generate_slots_stops_before_an_early_close() -> None:
    from appointments.availability import _generate_slots

    # Closing at 15:00 -> last start is 14:00 (one hour before close).
    slots = _generate_slots({"open": "09:00", "close": "15:00", "closed": False})
    assert slots == ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]


# ── model validator: latest booking start is 5:00 PM ────────────────────────────

def _valid_booking_payload(**overrides: object) -> dict:
    payload = {
        "serviceId": "svc-knotless-braids",
        "clientName": "Amara Test",
        "clientEmail": "amara@example.com",
        "clientPhone": "3175550123",
        "preferredDate": (dt.date.today() + dt.timedelta(days=2)).isoformat(),
        "preferredTime": "17:00",
        "policyAccepted": True,
        "honeypot": "",
    }
    payload.update(overrides)
    return payload


def test_booking_allows_5pm_start() -> None:
    from appointments.models import PaymentIntentRequest

    request = PaymentIntentRequest.model_validate(_valid_booking_payload(preferredTime="17:00"))
    assert request.preferredTime == "17:00"


def test_booking_rejects_start_after_5pm() -> None:
    from appointments.models import PaymentIntentRequest

    with pytest.raises(ValueError, match="8:00 AM and 5:00 PM"):
        PaymentIntentRequest.model_validate(_valid_booking_payload(preferredTime="18:00"))


# ── service guard: capacity-2 at booking time ───────────────────────────────────

def test_slot_guard_allows_two_concurrent(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments import service

    monkeypatch.setattr(service, "collect_windows", lambda *a, **k: {"2026-08-01": [(600, 900)]})
    # 10:00 for 5h, one braider already booked -> second braider free.
    assert service._slot_is_available("2026-08-01", "10:00", duration_minutes=300) is True


def test_slot_guard_blocks_when_both_braiders_busy(monkeypatch: pytest.MonkeyPatch) -> None:
    from appointments import service

    monkeypatch.setattr(service, "collect_windows", lambda *a, **k: {"2026-08-01": [(600, 900), (600, 900)]})
    assert service._slot_is_available("2026-08-01", "10:00", duration_minutes=300) is False
