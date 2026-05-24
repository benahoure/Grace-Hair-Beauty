from __future__ import annotations

import datetime as dt
import json
from pathlib import Path


def test_appointment_honeypot_returns_silent_created(lambda_context) -> None:
    from appointments.handler import lambda_handler

    response = lambda_handler({"body": json.dumps({"honeypot": "bot"})}, lambda_context)

    assert response["statusCode"] == 201


def test_appointment_handler_accepts_portfolio_style_id(monkeypatch, lambda_context) -> None:
    from appointments import handler

    captured = {}

    def fake_create_appointment(request):
        captured["portfolioStyleId"] = request.portfolioStyleId
        return {
            "appointmentId": "appt-1",
            "status": "pending",
            "message": "Your appointment request has been received. We will confirm within 24 hours.",
        }

    monkeypatch.setattr(handler, "create_appointment", fake_create_appointment)

    response = handler.lambda_handler(
        {
            "body": json.dumps(
                {
                    "serviceId": "svc-knotless-braids",
                    "portfolioStyleId": "style-boho-waist-length",
                    "clientName": "Amara Test",
                    "clientEmail": "amara@example.com",
                    "clientPhone": "3175550123",
                    "preferredDate": (dt.date.today() + dt.timedelta(days=2)).isoformat(),
                    "preferredTime": "10:00",
                    "honeypot": "",
                }
            )
        },
        lambda_context,
    )

    assert response["statusCode"] == 201
    assert captured["portfolioStyleId"] == "style-boho-waist-length"


def test_appointment_service_persists_portfolio_style_id(monkeypatch) -> None:
    from appointments import service
    from appointments.models import AppointmentRequest

    writes = []
    monkeypatch.setattr(
        service,
        "get_item",
        lambda *args, **kwargs: {"serviceId": "svc-knotless-braids", "name": "Knotless Braids", "active": True},
    )
    monkeypatch.setattr(service, "put_item", lambda table, item: writes.append((table, item)))
    monkeypatch.setattr(service, "best_effort_send_email", lambda **kwargs: True)
    monkeypatch.setattr(service, "notify_admin", lambda *args, **kwargs: True)

    request = AppointmentRequest.model_validate(
        {
            "serviceId": "svc-knotless-braids",
            "portfolioStyleId": "style-boho-waist-length",
            "clientName": "Amara Test",
            "clientEmail": "amara@example.com",
            "clientPhone": "3175550123",
            "preferredDate": (dt.date.today() + dt.timedelta(days=2)).isoformat(),
            "preferredTime": "10:00",
            "honeypot": "",
        }
    )

    service.create_appointment(request)

    appointment_item = next(item for table, item in writes if table == "appointments")
    audit_item = next(item for table, item in writes if table == "audit-log")
    assert appointment_item["portfolioStyleId"] == "style-boho-waist-length"
    assert audit_item["detail"]["portfolioStyleId"] == "style-boho-waist-length"


def test_validation_errors_use_standardized_error_shape(lambda_context) -> None:
    from appointments.handler import lambda_handler

    response = lambda_handler({"body": json.dumps({"serviceId": "", "honeypot": ""})}, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 400
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["message"] == "Please review the highlighted fields."
    assert "fieldErrors" in body["error"]
    assert "errors" not in body


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


def test_public_reviews_post_route_exists() -> None:
    locals_tf = Path(__file__).resolve().parents[2] / "infra" / "locals.tf"

    assert '"POST /reviews"' in locals_tf.read_text()


def test_public_api_router_dispatches_required_public_routes(monkeypatch, lambda_context) -> None:
    from public_api import handler

    dispatched = []

    def fake_handler(name):
        def _handler(event, context):
            dispatched.append((name, event["rawPath"], event["requestContext"]["http"]["method"]))
            return {"statusCode": 200, "body": name}

        return _handler

    monkeypatch.setattr(handler, "appointments_handler", fake_handler("appointments"))
    monkeypatch.setattr(handler, "contact_handler", fake_handler("contact"))
    monkeypatch.setattr(handler, "reviews_handler", fake_handler("reviews"))

    for method_name, raw_path in [
        ("POST", "/appointments"),
        ("POST", "/contact"),
        ("GET", "/reviews"),
        ("POST", "/reviews"),
    ]:
        response = handler.lambda_handler(
            {"rawPath": raw_path, "requestContext": {"http": {"method": method_name}}},
            lambda_context,
        )
        assert response["statusCode"] == 200

    assert dispatched == [
        ("appointments", "/appointments", "POST"),
        ("contact", "/contact", "POST"),
        ("reviews", "/reviews", "GET"),
        ("reviews", "/reviews", "POST"),
    ]


def test_public_api_router_preserves_existing_public_routes(monkeypatch, lambda_context) -> None:
    from public_api import handler

    dispatched = []

    def fake_handler(name):
        def _handler(event, context):
            dispatched.append(name)
            return {"statusCode": 200, "body": name}

        return _handler

    monkeypatch.setattr(handler, "services_handler", fake_handler("services"))
    monkeypatch.setattr(handler, "portfolio_handler", fake_handler("portfolio"))
    monkeypatch.setattr(handler, "business_settings_handler", fake_handler("business-settings"))

    for raw_path in ["/services", "/services/svc-knotless-braids", "/portfolio", "/business-settings"]:
        response = handler.lambda_handler(
            {"rawPath": raw_path, "requestContext": {"http": {"method": "GET"}}},
            lambda_context,
        )
        assert response["statusCode"] == 200

    assert dispatched == ["services", "services", "portfolio", "business-settings"]


def test_admin_api_router_delegates_to_existing_admin_handler(monkeypatch, lambda_context) -> None:
    from admin_api import handler

    captured = {}

    def fake_admin_handler(event, context):
        captured["rawPath"] = event["rawPath"]
        return {"statusCode": 200, "body": "admin"}

    monkeypatch.setattr(handler, "admin_handler", fake_admin_handler)

    response = handler.lambda_handler({"rawPath": "/admin/appointments"}, lambda_context)

    assert response["statusCode"] == 200
    assert captured["rawPath"] == "/admin/appointments"


def test_admin_routes_include_existing_handler_functionality() -> None:
    locals_tf = (Path(__file__).resolve().parents[2] / "infra" / "locals.tf").read_text()

    for route_key in [
        '"PATCH /admin/portfolio/{styleId}"',
        '"POST /admin/reviews"',
        '"DELETE /admin/reviews/{reviewId}"',
        '"GET /admin/contact-messages"',
    ]:
        assert route_key in locals_tf


def test_contact_handler_accepts_phone_without_email_and_photo_name(monkeypatch, lambda_context) -> None:
    from contact import handler

    captured = {}

    def fake_create_contact_message(request):
        captured["email"] = request.email
        captured["phone"] = request.phone
        captured["inspirationPhotoName"] = request.inspirationPhotoName
        return {"messageId": "msg-1", "message": "Thanks for reaching out! We'll respond within 1 business day."}

    monkeypatch.setattr(handler, "create_contact_message", fake_create_contact_message)

    response = handler.lambda_handler(
        {
            "body": json.dumps(
                {
                    "name": "Amara Test",
                    "phone": "3175550123",
                    "message": "I would like help choosing a protective style.",
                    "services": ["Knotless Braids"],
                    "inspirationPhotoName": "inspiration-look.webp",
                    "honeypot": "",
                }
            )
        },
        lambda_context,
    )

    assert response["statusCode"] == 201
    assert captured["email"] is None
    assert captured["phone"] == "+13175550123"
    assert captured["inspirationPhotoName"] == "inspiration-look.webp"


def test_contact_service_persists_photo_name_and_skips_customer_email_when_email_missing(monkeypatch) -> None:
    from contact import service
    from contact.models import ContactRequest

    writes = []
    sent_emails = []
    monkeypatch.setattr(service, "put_item", lambda table, item: writes.append((table, item)))
    monkeypatch.setattr(service, "best_effort_send_email", lambda **kwargs: sent_emails.append(kwargs) or True)
    monkeypatch.setattr(service, "notify_admin", lambda *args, **kwargs: True)

    request = ContactRequest.model_validate(
        {
            "name": "Amara Test",
            "phone": "3175550123",
            "message": "I would like help choosing a protective style.",
            "services": ["Knotless Braids"],
            "inspirationPhotoName": "inspiration-look.webp",
            "honeypot": "",
        }
    )

    service.create_contact_message(request)

    contact_item = next(item for table, item in writes if table == "contact-messages")
    assert contact_item["email"] is None
    assert contact_item["phone"].startswith("local:v1:")
    assert contact_item["inspirationPhotoName"] == "inspiration-look.webp"
    assert sent_emails == []


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
