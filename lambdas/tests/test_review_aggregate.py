"""The AGGREGATE#RATINGS row must actually be writable: real DynamoDB (and moto) reject Python floats."""

from __future__ import annotations

import json
from decimal import Decimal

import pytest


@pytest.fixture
def audit_table(ddb):
    return ddb.create_table(
        TableName="audit-log",
        BillingMode="PAY_PER_REQUEST",
        KeySchema=[{"AttributeName": "logId", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "logId", "AttributeType": "S"}],
    )


def _review(review_id: str, rating: int, *, approved: bool) -> dict:
    return {
        "reviewId": review_id, "clientName": f"Client {review_id}", "rating": rating, "body": "Lovely",
        "approved": approved, "approvedKey": str(approved).lower(), "createdAt": f"2026-09-0{rating}T00:00:00Z",
    }


def _patch(review_id: str, body: dict) -> dict:
    return {
        "rawPath": f"/admin/reviews/{review_id}",
        "pathParameters": {"reviewId": review_id},
        "requestContext": {
            "http": {"method": "PATCH"},
            "authorizer": {"jwt": {"claims": {"cognito:groups": "[admins]", "sub": "admin-1"}}},
        },
        "body": json.dumps(body),
    }


def test_admin_review_approval_rewrites_a_stale_summary(reviews_table, audit_table, lambda_context) -> None:
    from admin import handler

    for item in [
        _review("a", 5, approved=True),
        _review("b", 5, approved=True),
        _review("c", 4, approved=True),
        _review("waiting", 3, approved=False),
        {"reviewId": "AGGREGATE#RATINGS", "totalCount": 0, "averageRating": 0, "updatedAt": "2026-05-14T00:00:00Z"},
    ]:
        reviews_table.put_item(Item=item)

    approve = handler.lambda_handler(_patch("waiting", {"approved": True}), lambda_context)
    after_approve = reviews_table.get_item(Key={"reviewId": "AGGREGATE#RATINGS"})["Item"]
    revoke = handler.lambda_handler(_patch("waiting", {"approved": False}), lambda_context)
    after_revoke = reviews_table.get_item(Key={"reviewId": "AGGREGATE#RATINGS"})["Item"]

    assert approve["statusCode"] == 200
    assert (after_approve["totalCount"], after_approve["averageRating"]) == (4, Decimal("4.25"))
    assert revoke["statusCode"] == 200
    assert (after_revoke["totalCount"], after_revoke["averageRating"]) == (3, Decimal("4.67"))
    assert after_revoke["updatedAt"] != "2026-05-14T00:00:00Z"


def test_public_reviews_self_heal_stores_a_fractional_average(reviews_table, lambda_context) -> None:
    from reviews import handler

    for item in [_review("a", 5, approved=True), _review("b", 4, approved=True)]:
        reviews_table.put_item(Item=item)

    event = {"rawPath": "/reviews", "requestContext": {"http": {"method": "GET"}}}
    response = handler.lambda_handler(event, lambda_context)
    stored = reviews_table.get_item(Key={"reviewId": "AGGREGATE#RATINGS"})["Item"]

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["aggregates"] == {"averageRating": 4.5, "totalCount": 2}
    assert (stored["totalCount"], stored["averageRating"]) == (2, Decimal("4.5"))
