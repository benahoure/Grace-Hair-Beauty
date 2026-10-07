from __future__ import annotations

from types import SimpleNamespace

import pytest


def test_create_refund_tags_the_refund_with_the_appointment_id(monkeypatch: pytest.MonkeyPatch) -> None:
    from common import stripe_client

    calls: list[dict] = []
    fake_stripe = SimpleNamespace(
        refunds=SimpleNamespace(create=lambda params, options: calls.append({"params": params, "options": options}))
    )
    monkeypatch.setattr(stripe_client, "get_stripe", lambda: fake_stripe)

    stripe_client.create_refund("ch_123", idempotency_key="appt-1-client-cancel", appointment_id="appt-1")

    assert calls == [{
        "params": {"charge": "ch_123", "metadata": {"appointmentId": "appt-1"}},
        "options": {"idempotency_key": "appt-1-client-cancel"},
    }]


def test_refund_webhook_with_metadata_finalizes_by_key_without_scanning(monkeypatch: pytest.MonkeyPatch) -> None:
    from webhooks import handler

    finalized: list[str] = []
    monkeypatch.setattr(handler, "_finalize_refund", finalized.append)
    monkeypatch.setattr(handler, "_finalize_refund_by_charge", lambda charge_id: pytest.fail("fallback scan used"))

    refund = SimpleNamespace(status="succeeded", metadata=SimpleNamespace(appointmentId="appt-1"), charge="ch_123")
    handler._handle_refund_event(refund)

    assert finalized == ["appt-1"]


def _seed_with_charge_beyond_first_page(table, make_appointment) -> None:
    # 150 unrelated rows: the old lookup examined only 5 rows (limit=5) and missed most appointments.
    with table.batch_writer() as batch:
        for i in range(150):
            batch.put_item(Item=make_appointment(f"other-{i:03d}", "completed", "2026-09-01"))
        batch.put_item(Item=make_appointment("target", "cancelled", "2026-10-10", stripeChargeId="ch_target"))


def test_legacy_refund_lookup_by_charge_finds_the_appointment_anywhere(
    appointments_table, make_appointment, monkeypatch: pytest.MonkeyPatch
) -> None:
    from webhooks import handler

    _seed_with_charge_beyond_first_page(appointments_table, make_appointment)
    finalized: list[str] = []
    monkeypatch.setattr(handler, "_finalize_refund", finalized.append)

    handler._finalize_refund_by_charge("ch_target")

    assert finalized == ["target"]


def test_legacy_refund_failure_lookup_by_charge_finds_the_appointment_anywhere(
    appointments_table, make_appointment, monkeypatch: pytest.MonkeyPatch
) -> None:
    from webhooks import handler

    _seed_with_charge_beyond_first_page(appointments_table, make_appointment)
    marked: list[tuple[str, str]] = []
    monkeypatch.setattr(handler, "_mark_refund_failed", lambda appt_id, reason: marked.append((appt_id, reason)))

    handler._mark_refund_failed_by_charge("ch_target", "expired_or_canceled_card")

    assert marked == [("target", "expired_or_canceled_card")]
