"""Public read endpoints against in-memory DynamoDB tables."""

from __future__ import annotations

import json


def _get(path: str, params: dict[str, str] | None = None) -> dict:
    return {"rawPath": path, "requestContext": {"http": {"method": "GET"}}, "queryStringParameters": params}


def _put_all(table, items: list[dict]) -> None:
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


def test_public_reviews_are_the_newest_approved_only(reviews_table, lambda_context) -> None:
    from reviews import handler

    approved = [
        {
            "reviewId": f"ok-{i:02d}", "clientName": f"Client {i}", "rating": 5, "body": "Great",
            "approved": True, "approvedKey": "true", "createdAt": f"2026-08-{i + 1:02d}T00:00:00Z",
        }
        for i in range(12)
    ]
    pending = [
        {
            "reviewId": f"wait-{i}", "clientName": "Pending", "rating": 1, "body": "Hold",
            "approved": False, "approvedKey": "false", "createdAt": "2026-09-30T00:00:00Z",
        }
        for i in range(3)
    ]
    aggregate = {"reviewId": "AGGREGATE#RATINGS", "totalCount": 12, "averageRating": 5}
    _put_all(reviews_table, [*approved, *pending, aggregate])

    body = json.loads(handler.lambda_handler(_get("/reviews"), lambda_context)["body"])

    assert [r["reviewId"] for r in body["reviews"]] == [f"ok-{i:02d}" for i in range(11, 1, -1)]
    assert body["nextCursor"] is not None
    assert body["aggregates"] == {"averageRating": 5, "totalCount": 12}


def test_public_services_return_the_complete_catalog(ddb, lambda_context) -> None:
    from services import handler

    table = ddb.create_table(
        TableName="services",
        BillingMode="PAY_PER_REQUEST",
        KeySchema=[{"AttributeName": "serviceId", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "serviceId", "AttributeType": "S"}],
    )
    _put_all(table, [{"serviceId": f"svc-{i:03d}", "name": f"Service {i:03d}", "active": True} for i in range(130)])
    _put_all(table, [{"serviceId": "svc-off", "name": "Retired", "active": False}])

    body = json.loads(handler.lambda_handler(_get("/services"), lambda_context)["body"])

    assert len(body["services"]) == 130


def test_public_gallery_returns_the_complete_catalog_and_filters_after_reading_it(ddb, lambda_context) -> None:
    from portfolio import handler

    table = ddb.create_table(
        TableName="portfolio",
        BillingMode="PAY_PER_REQUEST",
        KeySchema=[{"AttributeName": "styleId", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "styleId", "AttributeType": "S"}],
    )
    _put_all(table, [
        {"styleId": f"s-{i:03d}", "category": "knotless" if i % 2 else "kids", "active": True,
         "createdAt": f"2026-01-01T00:{i // 60:02d}:{i % 60:02d}Z"}
        for i in range(150)
    ])

    everything = json.loads(handler.lambda_handler(_get("/portfolio"), lambda_context)["body"])
    knotless = json.loads(handler.lambda_handler(_get("/portfolio", {"category": "knotless"}), lambda_context)["body"])

    assert len(everything["items"]) == 150
    assert len(knotless["items"]) == 75
    assert everything["nextCursor"] is None
