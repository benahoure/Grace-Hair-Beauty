from __future__ import annotations

import os
import sys
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

# Stub out the stripe package so tests that transitively import common.stripe_client
# don't fail with ModuleNotFoundError when the package isn't installed in the test venv.
if "stripe" not in sys.modules:
    sys.modules["stripe"] = MagicMock()


@pytest.fixture(autouse=True)
def lambda_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    monkeypatch.setenv("AWS_REGION", "us-east-1")
    monkeypatch.setenv("AWS_" + "ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_" + "SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "testing")
    monkeypatch.setenv("TABLE_SERVICES", "services")
    monkeypatch.setenv("TABLE_APPOINTMENTS", "appointments")
    monkeypatch.setenv("TABLE_PORTFOLIO", "portfolio")
    monkeypatch.setenv("TABLE_REVIEWS", "reviews")
    monkeypatch.setenv("TABLE_CONTACT_MESSAGES", "contact-messages")
    monkeypatch.setenv("TABLE_BUSINESS_SETTINGS", "business-settings")
    monkeypatch.setenv("TABLE_AUDIT_LOG", "audit-log")
    monkeypatch.setenv("ALLOWED_ORIGIN", "https://example.test")
    monkeypatch.setenv("ASSETS_BUCKET", "assets")
    monkeypatch.setenv("CDN_BASE_URL", "https://cdn.example.test")
    monkeypatch.setenv("SES_SENDER_EMAIL", "no-reply@example.test")
    monkeypatch.setenv("ADMIN_ALERT_EMAIL", "admin@example.test")
    monkeypatch.delenv("KMS_KEY_ID", raising=False)
    monkeypatch.setenv("ENVIRONMENT", "dev")
    monkeypatch.setenv("ZOHO_SMTP_USER_SSM", "/gracehairsbeauty/test/zoho-smtp-user")
    monkeypatch.setenv("ZOHO_SMTP_PASSWORD_SSM", "/gracehairsbeauty/test/zoho-smtp-password")
    monkeypatch.setenv("ZOHO_ADMIN_EMAILS_SSM", "/gracehairsbeauty/test/zoho-admin-emails")
    os.environ.setdefault("POWERTOOLS_SERVICE_NAME", "grace-hair-beauty-test")


@pytest.fixture
def lambda_context():
    return SimpleNamespace(
        function_name="test-function",
        memory_limit_in_mb=128,
        invoked_function_arn="arn:aws:lambda:us-east-1:123456789012:function:test-function",
        aws_request_id="test-request-id",
    )


# ── In-memory DynamoDB (moto) mirroring infra/dynamodb.tf key + index schemas ──


@pytest.fixture
def ddb(monkeypatch: pytest.MonkeyPatch):
    import boto3
    from moto import mock_aws

    from common import dynamo

    with mock_aws():
        resource = boto3.resource("dynamodb", region_name="us-east-1")
        monkeypatch.setattr(dynamo, "_resource", resource)
        yield resource


@pytest.fixture
def appointments_table(ddb):
    return ddb.create_table(
        TableName="appointments",
        BillingMode="PAY_PER_REQUEST",
        KeySchema=[{"AttributeName": "appointmentId", "KeyType": "HASH"}],
        AttributeDefinitions=[
            {"AttributeName": "appointmentId", "AttributeType": "S"},
            {"AttributeName": "statusKey", "AttributeType": "S"},
            {"AttributeName": "preferredDate", "AttributeType": "S"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "status-date-index",
                "KeySchema": [
                    {"AttributeName": "statusKey", "KeyType": "HASH"},
                    {"AttributeName": "preferredDate", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }
        ],
    )


@pytest.fixture
def reviews_table(ddb):
    return ddb.create_table(
        TableName="reviews",
        BillingMode="PAY_PER_REQUEST",
        KeySchema=[{"AttributeName": "reviewId", "KeyType": "HASH"}],
        AttributeDefinitions=[
            {"AttributeName": "reviewId", "AttributeType": "S"},
            {"AttributeName": "approvedKey", "AttributeType": "S"},
            {"AttributeName": "createdAt", "AttributeType": "S"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "approved-date-index",
                "KeySchema": [
                    {"AttributeName": "approvedKey", "KeyType": "HASH"},
                    {"AttributeName": "createdAt", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }
        ],
    )


@pytest.fixture
def make_appointment():
    return _make_appointment


def _make_appointment(appointment_id: str, status: str, date: str, **extra: object) -> dict:
    item: dict = {
        "appointmentId": appointment_id,
        "status": status,
        "statusKey": status,
        "preferredDate": date,
        "preferredTime": "10:00",
        "serviceDurationMinutes": 120,
        "createdAt": f"{date}T00:00:00Z",
        "clientName": "Test Client",
        "clientEmail": "client@example.com",
        "clientPhone": "3175550123",
    }
    item.update(extra)
    return item
