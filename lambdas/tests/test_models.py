from __future__ import annotations

import datetime as dt

import pytest


def test_appointment_validation_normalizes_phone() -> None:
    from appointments.models import AppointmentRequest

    request = AppointmentRequest.model_validate(
        {
            "serviceId": "svc-knotless-braids",
            "clientName": "Amara Test",
            "clientEmail": "amara@example.com",
            "clientPhone": "(317) 555-0123",
            "preferredDate": (dt.date.today() + dt.timedelta(days=2)).isoformat(),
            "preferredTime": "10:00",
            "honeypot": "",
        }
    )

    assert request.clientPhone == "+13175550123"


def test_appointment_validation_rejects_past_date() -> None:
    from appointments.models import AppointmentRequest

    with pytest.raises(ValueError, match="Date must be"):
        AppointmentRequest.model_validate(
            {
                "serviceId": "svc-knotless-braids",
                "clientName": "Amara Test",
                "clientEmail": "amara@example.com",
                "clientPhone": "3175550123",
                "preferredDate": (dt.date.today() - dt.timedelta(days=1)).isoformat(),
                "preferredTime": "10:00",
            }
        )
