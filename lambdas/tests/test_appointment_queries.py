"""Appointment reads against an in-memory DynamoDB with the real status-date-index schema."""

from __future__ import annotations

import datetime as dt
import json


def _put_all(table, items: list[dict]) -> None:
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


# ── appointments_in_range ───────────────────────────────────────────────────────

def test_range_returns_only_requested_statuses_and_dates(appointments_table, make_appointment) -> None:
    from appointments.queries import appointments_in_range

    _put_all(appointments_table, [
        make_appointment("in-1", "confirmed", "2026-10-10"),
        make_appointment("in-2", "completed", "2026-10-31"),
        make_appointment("in-3", "cancelled", "2026-10-01"),
        make_appointment("out-after", "confirmed", "2026-11-01"),
        make_appointment("out-before", "confirmed", "2026-09-30"),
        make_appointment("out-status", "pending_payment", "2026-10-15"),
    ])

    items = appointments_in_range(("confirmed", "completed", "cancelled"), "2026-10-01", "2026-10-31")

    assert sorted(item["appointmentId"] for item in items) == ["in-1", "in-2", "in-3"]


def test_range_reads_every_page_and_never_truncates(appointments_table, make_appointment) -> None:
    from appointments.queries import appointments_in_range

    # 250 rows in one status and month: the index returns them in pages of 100.
    _put_all(appointments_table, [
        make_appointment(f"a-{i:03d}", "confirmed", f"2026-10-{(i % 28) + 1:02d}") for i in range(250)
    ])

    items = appointments_in_range(("confirmed",), "2026-10-01", "2026-10-31")

    assert len(items) == 250
    assert len({item["appointmentId"] for item in items}) == 250


# ── appointments_page ───────────────────────────────────────────────────────────

def test_page_walks_a_status_in_date_order_without_gaps_or_duplicates(appointments_table, make_appointment) -> None:
    from appointments.queries import appointments_page

    start = dt.date(2026, 1, 1)
    _put_all(appointments_table, [
        make_appointment(f"c-{i:03d}", "completed", (start + dt.timedelta(days=i)).isoformat()) for i in range(120)
    ])

    seen: list[dict] = []
    cursor = None
    while True:
        page, cursor = appointments_page("completed", ascending=False, limit=50, cursor=cursor)
        seen.extend(page)
        if not cursor:
            break

    dates = [item["preferredDate"] for item in seen]
    assert len(seen) == 120
    assert len({item["appointmentId"] for item in seen}) == 120
    assert dates == sorted(dates, reverse=True)


# ── month_counts ────────────────────────────────────────────────────────────────

def test_month_counts_cover_one_year_and_every_status(appointments_table, make_appointment) -> None:
    from appointments.queries import month_counts

    _put_all(appointments_table, [
        make_appointment("a", "confirmed", "2026-10-10"),
        make_appointment("b", "completed", "2026-10-02"),
        make_appointment("c", "cancelled", "2026-12-24"),
        make_appointment("hold", "pending_payment", "2026-10-11"),
        make_appointment("next-year", "confirmed", "2027-01-05"),
        make_appointment("last-year", "confirmed", "2025-12-31"),
    ])

    assert month_counts(2026) == {"2026-10": 3, "2026-12": 1}


# ── capacity check (collect_windows) ────────────────────────────────────────────

def test_capacity_check_counts_only_active_bookings(appointments_table, make_appointment) -> None:
    from appointments.scheduling import collect_windows

    now = 1_800_000_000
    _put_all(appointments_table, [
        make_appointment("confirmed", "confirmed", "2026-10-10", preferredTime="10:00"),
        make_appointment("pending", "pending", "2026-10-10", preferredTime="13:00"),
        make_appointment("hold-live", "pending_payment", "2026-10-10", preferredTime="15:00", expiresAt=now + 600),
        make_appointment("hold-expired", "pending_payment", "2026-10-10", preferredTime="16:00", expiresAt=now - 1),
        make_appointment("cancelled", "cancelled", "2026-10-10"),
        make_appointment("completed", "completed", "2026-10-10"),
        make_appointment("being-moved", "confirmed", "2026-10-10", preferredTime="11:00"),
        make_appointment("other-day", "confirmed", "2026-10-11"),
    ])

    windows = collect_windows("2026-10-10", "2026-10-10", now_epoch=now, exclude_id="being-moved")

    assert sorted(windows["2026-10-10"]) == [(600, 720), (780, 900), (900, 1020)]
    assert "2026-10-11" not in windows


def test_capacity_check_finds_live_bookings_regardless_of_history_size(appointments_table, make_appointment) -> None:
    from appointments.scheduling import collect_windows

    # The old scan stopped after examining 2,000 rows, so a long history could hide a live
    # booking and allow overbooking. Index queries never read the history at all.
    history = [make_appointment(f"hist-{i:04d}", "completed", "2025-06-15") for i in range(2100)]
    _put_all(appointments_table, [*history, make_appointment("live", "confirmed", "2026-10-10")])

    assert collect_windows("2026-10-10", "2026-10-10", now_epoch=0) == {"2026-10-10": [(600, 720)]}


# ── admin endpoint, end to end through the real router ──────────────────────────

def _admin_event(params: dict[str, str] | None) -> dict:
    return {
        "rawPath": "/admin/appointments",
        "requestContext": {
            "http": {"method": "GET"},
            "authorizer": {"jwt": {"claims": {"cognito:groups": "[admins]", "sub": "admin-1"}}},
        },
        "queryStringParameters": params,
    }


def test_admin_month_view_returns_every_booking_in_the_month(
    appointments_table, make_appointment, lambda_context
) -> None:
    from admin import handler

    # Mirrors the incident: plenty of history, and an October 10 booking that must show.
    # Every status shows, including an in-progress checkout ("Payment Pending"), as before the fix.
    history = [make_appointment(f"hist-{i:02d}", "completed", f"2026-{(i % 9) + 1:02d}-15") for i in range(35)]
    october = [
        make_appointment("oct-10", "confirmed", "2026-10-10", preferredTime="10:00"),
        make_appointment("oct-10-early", "confirmed", "2026-10-10", preferredTime="09:00"),
        make_appointment("oct-02", "completed", "2026-10-02"),
        make_appointment("oct-hold", "pending_payment", "2026-10-12"),
    ]
    _put_all(appointments_table, [*history, *october])

    response = handler.lambda_handler(_admin_event({"from": "2026-10-01", "to": "2026-10-31"}), lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert [a["appointmentId"] for a in body["appointments"]] == ["oct-02", "oct-10-early", "oct-10", "oct-hold"]
    assert body["nextCursor"] is None


def test_admin_invalid_range_is_a_400_not_a_500(appointments_table, lambda_context) -> None:
    from admin import handler

    response = handler.lambda_handler(_admin_event({"from": "2026-10-31", "to": "2026-10-01"}), lambda_context)

    assert response["statusCode"] == 400
