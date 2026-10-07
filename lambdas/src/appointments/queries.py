"""Read appointments through the status-date-index GSI (statusKey + preferredDate).

The appointments table is never scanned: a scan reads every row ever written, so
its cost — and the risk of silently dropping rows that don't fit in one page —
grows with the salon's history. Every read here is bounded by a status partition
plus a preferredDate range, or paginated with a cursor.
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from boto3.dynamodb.conditions import Key

from appointments.models import ALL_STATUSES
from common.config import get_config
from common.dynamo import query_all_index, query_index

STATUS_DATE_INDEX = "status-date-index"


def appointments_in_range(statuses: Iterable[str], date_from: str, date_to: str) -> list[dict[str, Any]]:
    """Every appointment with one of ``statuses`` and preferredDate in [date_from, date_to] (YYYY-MM-DD)."""
    table = get_config().table_appointments
    date_range = Key("preferredDate").between(date_from, date_to)
    items: list[dict[str, Any]] = []
    for status in statuses:
        items.extend(query_all_index(table, STATUS_DATE_INDEX, "statusKey", status, range_condition=date_range))
    return items


def appointments_page(
    status: str,
    *,
    ascending: bool,
    limit: int,
    cursor: str | None,
) -> tuple[list[dict[str, Any]], str | None]:
    """One page of a single status, ordered by preferredDate."""
    return query_index(
        get_config().table_appointments,
        STATUS_DATE_INDEX,
        "statusKey",
        status,
        limit=limit,
        cursor=cursor,
        scan_index_forward=ascending,
    )


def month_counts(year: int) -> dict[str, int]:
    """Number of appointments per month ("YYYY-MM") in ``year``."""
    counts: dict[str, int] = {}
    for item in appointments_in_range(ALL_STATUSES, f"{year:04d}-01-01", f"{year:04d}-12-31"):
        month = str(item.get("preferredDate", ""))[:7]
        counts[month] = counts.get(month, 0) + 1
    return counts
