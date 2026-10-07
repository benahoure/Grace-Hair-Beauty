from __future__ import annotations

import json

import pytest

# ── scan_all_items: complete reads for catalog-sized tables ────────────────────


def test_scan_all_items_reads_every_page(monkeypatch: pytest.MonkeyPatch) -> None:
    from common import dynamo

    all_rows = [{"id": str(i)} for i in range(250)]

    def fake_scan_items(table_name, *, filter_expression=None, limit=100, cursor=None):
        start = int(cursor) if cursor else 0
        page = all_rows[start : start + limit]
        next_cursor = str(start + limit) if start + limit < len(all_rows) else None
        return page, next_cursor

    monkeypatch.setattr(dynamo, "scan_items", fake_scan_items)

    assert dynamo.scan_all_items("services") == all_rows


# ── get_appointments: request shapes ───────────────────────────────────────────


def _body(response: dict) -> dict:
    return json.loads(response["body"])


@pytest.fixture
def range_calls(monkeypatch: pytest.MonkeyPatch) -> list[tuple]:
    from admin import handler

    calls: list[tuple] = []

    def fake_in_range(statuses, date_from, date_to):
        calls.append((tuple(statuses), date_from, date_to))
        return [
            {"appointmentId": "late", "preferredDate": "2026-10-10", "preferredTime": "14:00", "createdAt": "1"},
            {"appointmentId": "early", "preferredDate": "2026-10-10", "preferredTime": "09:00", "createdAt": "3"},
            {"appointmentId": "first", "preferredDate": "2026-10-02", "preferredTime": "16:00", "createdAt": "2"},
        ]

    monkeypatch.setattr(handler, "appointments_in_range", fake_in_range)
    return calls


def test_month_range_queries_every_status_and_sorts_by_date_then_time(range_calls) -> None:
    from admin import handler
    from appointments.models import ALL_STATUSES

    body = _body(handler.get_appointments({"queryStringParameters": {"from": "2026-10-01", "to": "2026-10-31"}}))

    assert range_calls == [(ALL_STATUSES, "2026-10-01", "2026-10-31")]
    assert [a["appointmentId"] for a in body["appointments"]] == ["first", "early", "late"]
    assert body["nextCursor"] is None


def test_range_with_status_queries_only_that_status(range_calls) -> None:
    from admin import handler

    params = {"status": "confirmed", "from": "2026-10-05", "to": "2026-10-11"}
    handler.get_appointments({"queryStringParameters": params})

    assert range_calls == [(("confirmed",), "2026-10-05", "2026-10-11")]


def test_single_date_param_is_a_one_day_range(range_calls) -> None:
    from admin import handler

    handler.get_appointments({"queryStringParameters": {"date": "2026-10-10"}})

    assert range_calls[0][1:] == ("2026-10-10", "2026-10-10")


def test_no_range_and_no_pagination_returns_the_complete_set_for_older_clients(range_calls) -> None:
    from admin import handler
    from appointments.models import ALL_STATUSES

    body = _body(handler.get_appointments({"queryStringParameters": None}))

    assert range_calls == [(ALL_STATUSES, "0000-01-01", "9999-12-31")]
    assert [a["appointmentId"] for a in body["appointments"]] == ["early", "first", "late"]  # createdAt desc


def test_paginated_status_listing_passes_order_limit_and_cursor(monkeypatch: pytest.MonkeyPatch) -> None:
    from admin import handler

    calls: list[dict] = []

    def fake_page(status, *, ascending, limit, cursor):
        calls.append({"status": status, "ascending": ascending, "limit": limit, "cursor": cursor})
        return [{"appointmentId": "x", "preferredDate": "2026-10-10", "preferredTime": "10:00"}], "next-token"

    monkeypatch.setattr(handler, "appointments_page", fake_page)

    body = _body(handler.get_appointments(
        {"queryStringParameters": {"status": "completed", "limit": "500", "order": "asc", "cursor": "abc"}}
    ))

    assert calls == [{"status": "completed", "ascending": True, "limit": 100, "cursor": "abc"}]
    assert body["nextCursor"] == "next-token"


@pytest.mark.parametrize(
    ("params", "message"),
    [
        ({"status": "nonsense"}, "Invalid appointment status"),
        ({"from": "2026-10-01"}, "Both from and to are required"),
        ({"from": "10/01/2026", "to": "2026-10-31"}, "formatted YYYY-MM-DD"),
        ({"from": "2026-10-31", "to": "2026-10-01"}, "on or before"),
        ({"from": "2026-01-01", "to": "2026-12-31"}, "cannot exceed 92 days"),
        ({"from": "2026-10-01", "to": "2026-10-31", "limit": "50"}, "cannot be combined with a date range"),
        ({"limit": "50"}, "status is required"),
        ({"status": "confirmed", "limit": "fifty"}, "limit must be a number"),
        ({"status": "confirmed", "limit": "50", "order": "sideways"}, "order must be asc or desc"),
    ],
)
def test_invalid_requests_are_rejected(params: dict, message: str, range_calls) -> None:
    from admin import handler

    with pytest.raises(ValueError, match=message):
        handler.get_appointments({"queryStringParameters": params})
    assert range_calls == []


# ── month-picker summary ───────────────────────────────────────────────────────


def test_month_summary_returns_counts_for_the_requested_year(monkeypatch: pytest.MonkeyPatch) -> None:
    from admin import handler

    monkeypatch.setattr(handler, "month_counts", lambda year: {"2026-10": 3} if year == 2026 else {})

    body = _body(handler.get_appointments({"queryStringParameters": {"summary": "months", "year": "2026"}}))

    assert body == {"year": 2026, "months": {"2026-10": 3}}


@pytest.mark.parametrize(
    ("year", "message"),
    [("", "must be a number"), ("abc", "must be a number"), ("1999", "out of range"), ("2101", "out of range")],
)
def test_month_summary_rejects_bad_years(year: str, message: str) -> None:
    from admin import handler

    with pytest.raises(ValueError, match=message):
        handler.get_appointments({"queryStringParameters": {"summary": "months", "year": year}})
