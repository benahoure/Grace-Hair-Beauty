"""Shared scheduling helpers: braider capacity and overlap math.

The salon runs a fixed number of braiders in parallel (``BRAIDER_COUNT``). A new
appointment is bookable as long as, for every instant of its time window, fewer
than ``BRAIDER_COUNT`` existing active appointments are already running — i.e. at
least one braider is free for the whole service. Duration is honoured, so a long
service only fits where a braider is free that long; a short service can slot into
smaller gaps.

Raising ``BRAIDER_COUNT`` (e.g. when a third braider is hired) is the only change
needed to let more clients book the same window.
"""

from __future__ import annotations

from boto3.dynamodb.conditions import ConditionBase

from appointments.models import DEFAULT_DURATION_MINUTES
from common.config import get_config
from common.dynamo import scan_items
from common.ids import utc_now_epoch

# Number of braiders that can work at the same time (parallel appointment lanes).
BRAIDER_COUNT = 2

# Time window a single appointment occupies, as minutes-since-midnight.
Window = tuple[int, int]


def time_to_minutes(time_str: str) -> int:
    """Convert 'HH:MM' to total minutes since midnight."""
    parts = time_str.split(":")
    return int(parts[0]) * 60 + (int(parts[1]) if len(parts) > 1 else 0)


def _is_active(item: dict, now_epoch: int) -> bool:
    """Active = confirmed/pending, or an unexpired pending_payment hold."""
    status = item.get("status", "")
    if status == "pending_payment":
        expires_at = item.get("expiresAt")
        return expires_at is not None and int(expires_at) > now_epoch
    return status in {"pending", "confirmed"}


def collect_windows(
    filter_expr: ConditionBase,
    *,
    now_epoch: int | None = None,
    exclude_id: str | None = None,
) -> dict[str, list[Window]]:
    """Scan active appointments matching ``filter_expr``.

    Returns ``{date: [(start_min, end_min), ...]}`` for every active appointment,
    using ``serviceDurationMinutes`` stored on the appointment (falling back to
    ``DEFAULT_DURATION_MINUTES``). Appointments matching ``exclude_id`` are skipped
    (used when rescheduling the appointment being moved).
    """
    if now_epoch is None:
        now_epoch = utc_now_epoch()
    config = get_config()

    taken: dict[str, list[Window]] = {}
    cursor = None
    for _ in range(20):
        items, cursor = scan_items(
            config.table_appointments, filter_expression=filter_expr, limit=100, cursor=cursor
        )
        for item in items:
            if exclude_id and item.get("appointmentId") == exclude_id:
                continue
            if not _is_active(item, now_epoch):
                continue
            date_str = item.get("preferredDate", "")
            time_str = item.get("preferredTime", "")
            if not date_str or not time_str:
                continue
            start = time_to_minutes(time_str)
            duration = int(item.get("serviceDurationMinutes", DEFAULT_DURATION_MINUTES))
            taken.setdefault(date_str, []).append((start, start + duration))
        if not cursor:
            break
    return taken


def has_capacity(
    windows: list[Window],
    new_start: int,
    new_end: int,
    capacity: int = BRAIDER_COUNT,
) -> bool:
    """Return True if a booking spanning [new_start, new_end) fits within capacity.

    A braider must be free for the whole window, so we require that at no instant of
    [new_start, new_end) are ``capacity`` existing appointments already running. The
    peak overlap can only rise at an existing appointment's start, so it suffices to
    check ``new_start`` and every existing start that falls inside the new window.
    """
    check_points = [new_start]
    check_points += [start for start, _ in windows if new_start < start < new_end]
    for point in check_points:
        concurrent = sum(1 for start, end in windows if start <= point < end)
        if concurrent >= capacity:
            return False
    return True
