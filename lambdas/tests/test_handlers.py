from __future__ import annotations

import json


def test_appointment_honeypot_returns_silent_created(lambda_context) -> None:
    from appointments.handler import lambda_handler

    response = lambda_handler({"body": json.dumps({"honeypot": "bot"})}, lambda_context)

    assert response["statusCode"] == 201


def test_public_reviews_return_approved_only(monkeypatch, lambda_context) -> None:
    from reviews import handler

    monkeypatch.setattr(
        handler,
        "scan_items",
        lambda *args, **kwargs: (
            [
                {
                    "reviewId": "approved-1",
                    "clientName": "Amara T.",
                    "rating": 5,
                    "body": "Grace took great care of my hair.",
                    "approved": True,
                    "createdAt": "2026-05-01T00:00:00Z",
                }
            ],
            None,
        ),
    )
    monkeypatch.setattr(
        handler,
        "get_item",
        lambda *args, **kwargs: {"averageRating": 5, "totalCount": 1},
    )

    response = handler.lambda_handler({"rawPath": "/reviews"}, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["reviews"][0]["clientName"] == "Amara T."
    assert body["aggregates"]["totalCount"] == 1


def test_admin_route_requires_admin_group(lambda_context) -> None:
    from admin.handler import lambda_handler

    response = lambda_handler(
        {
            "rawPath": "/admin/appointments",
            "requestContext": {
                "http": {"method": "GET"},
                "authorizer": {"jwt": {"claims": {"sub": "user-1", "cognito:groups": ["staff"]}}},
            },
        },
        lambda_context,
    )

    assert response["statusCode"] == 403


def test_business_settings_returns_safe_defaults_when_unseeded(monkeypatch, lambda_context) -> None:
    from business_settings import handler

    monkeypatch.setattr(handler, "get_item", lambda *args, **kwargs: None)

    response = handler.lambda_handler({"rawPath": "/business-settings"}, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["businessName"] == "Grace Hair Beauty"
    assert body["email"] == "ghbeauty24@gmail.com"
    assert body["address"]["street"] == "955 Baden Manor Dr"
