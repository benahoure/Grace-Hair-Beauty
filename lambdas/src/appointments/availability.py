from __future__ import annotations

import datetime as dt
from zoneinfo import ZoneInfo

from boto3.dynamodb.conditions import Attr

from appointments.models import DEFAULT_DURATION_MINUTES
from appointments.scheduling import collect_windows, has_capacity, time_to_minutes
from common.config import get_config
from common.dynamo import get_item
from common.ids import utc_now_epoch

SALON_TZ = ZoneInfo("America/Indiana/Indianapolis")
DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
SETTINGS_KEY = {"settingId": "BUSINESS#SETTINGS", "version": "v1"}
DEFAULT_HOURS = {
    day: {"open": "09:00", "close": "21:00", "closed": False}
    for day in DAY_NAMES
}
# Latest hour a client may start a booking (5:00 PM). A long service may run past
# closing — the salon simply finishes that client.
LATEST_START_HOUR = 17


def _get_settings() -> tuple[dict, set[str]]:
    """Return (hours_by_day, blocked_dates_set)."""
    config = get_config()
    settings = get_item(config.table_business_settings, SETTINGS_KEY)
    if not settings:
        return DEFAULT_HOURS, set()
    hours = settings.get("hours", DEFAULT_HOURS)
    blocked_raw = settings.get("blockedDates") or []
    return hours, set(blocked_raw)


def _get_service_duration(service_id: str) -> int:
    """Return service durationMinutes from DynamoDB, falling back to DEFAULT_DURATION_MINUTES."""
    config = get_config()
    service = get_item(config.table_services, {"serviceId": service_id})
    if service:
        return int(service.get("durationMinutes", DEFAULT_DURATION_MINUTES))
    return DEFAULT_DURATION_MINUTES


def _generate_slots(day_hours: dict) -> list[str]:
    """
    Return HH:MM slot strings, on the hour, from opening until the latest allowed
    start (5:00 PM). Duration no longer limits the last slot — a long service may
    finish after closing. Slots stop at LATEST_START_HOUR or one hour before an
    early close, whichever comes first.
    """
    if day_hours.get("closed", True):
        return []
    try:
        open_hour  = int(str(day_hours.get("open",  "09:00")).split(":")[0])
        close_hour = int(str(day_hours.get("close", "21:00")).split(":")[0])
    except (ValueError, AttributeError):
        return []
    last_start_hour = min(LATEST_START_HOUR, close_hour - 1)
    return [f"{h:02d}:00" for h in range(open_hour, last_start_hour + 1)]


def _format_time_12h(hour: int, minute: int = 0) -> str:
    suffix  = "AM" if hour < 12 else "PM"
    display = hour % 12 or 12
    return f"{display}:{minute:02d} {suffix}"


def _slot_is_within_24hr(slot_str: str, date: dt.date, cutoff: dt.datetime) -> bool:
    h       = int(slot_str.split(":")[0])
    slot_dt = dt.datetime(date.year, date.month, date.day, h, 0, tzinfo=SALON_TZ)
    return slot_dt <= cutoff


# ── Public API ────────────────────────────────────────────────────────────────

def get_month_availability(year: int, month: int, service_id: str | None = None) -> dict:
    hours, blocked_dates = _get_settings()
    now_epoch    = utc_now_epoch()
    now_salon  = dt.datetime.now(SALON_TZ)
    today_salon = now_salon.date()
    cutoff_24hr  = now_salon + dt.timedelta(hours=24)

    duration_minutes = _get_service_duration(service_id) if service_id else DEFAULT_DURATION_MINUTES

    first_day = dt.date(year, month, 1)
    last_day  = (dt.date(year + 1, 1, 1) if month == 12 else dt.date(year, month + 1, 1)) - dt.timedelta(days=1)

    taken_by_date = collect_windows(
        Attr("preferredDate").between(first_day.isoformat(), last_day.isoformat()),
        now_epoch=now_epoch,
    )

    dates_result = []
    current = first_day
    while current <= last_day:
        date_str  = current.isoformat()
        day_name  = DAY_NAMES[current.weekday()]
        day_hours = hours.get(day_name, {"closed": True})

        if current <= today_salon:
            status          = "past"
            available_count = 0
        elif date_str in blocked_dates:
            status          = "blocked"
            available_count = 0
        elif day_hours.get("closed", True):
            status          = "closed"
            available_count = 0
        else:
            all_slots     = _generate_slots(day_hours)
            taken_windows = taken_by_date.get(date_str, [])

            available_slots   = []
            within_24hr_count = 0
            booked_count      = 0

            for slot_str in all_slots:
                slot_start_min = time_to_minutes(slot_str)
                if not has_capacity(taken_windows, slot_start_min, slot_start_min + duration_minutes):
                    booked_count += 1
                    continue
                slot_dt = dt.datetime(current.year, current.month, current.day,
                                      slot_start_min // 60, 0, tzinfo=SALON_TZ)
                if slot_dt <= cutoff_24hr:
                    within_24hr_count += 1
                    continue
                available_slots.append(slot_str)

            available_count = len(available_slots)

            if available_count > 0:
                status = "available"
            elif not all_slots:
                status = "closed"
            elif within_24hr_count > 0:
                status = "blocked_24hr"
            else:
                status = "fully_booked"

        dates_result.append({
            "date":           date_str,
            "status":         status,
            "availableSlots": available_count,
        })
        current += dt.timedelta(days=1)

    return {
        "month":    f"{year}-{month:02d}",
        "timezone": "America/Indiana/Indianapolis",
        "dates":    dates_result,
    }


def get_date_slots(date_str: str, service_id: str | None = None) -> dict:
    hours, blocked_dates = _get_settings()
    now_epoch    = utc_now_epoch()
    now_salon  = dt.datetime.now(SALON_TZ)
    today_salon = now_salon.date()
    cutoff_24hr  = now_salon + dt.timedelta(hours=24)

    duration_minutes = _get_service_duration(service_id) if service_id else DEFAULT_DURATION_MINUTES

    try:
        date = dt.date.fromisoformat(date_str)
    except ValueError:
        return {"date": date_str, "timezone": "America/Indiana/Indianapolis", "slots": []}

    if date <= today_salon:
        return {"date": date_str, "timezone": "America/Indiana/Indianapolis", "slots": []}

    if date_str in blocked_dates:
        return {"date": date_str, "timezone": "America/Indiana/Indianapolis", "slots": []}

    day_name  = DAY_NAMES[date.weekday()]
    day_hours = hours.get(day_name, {"closed": True})
    all_slots = _generate_slots(day_hours)
    if not all_slots:
        return {"date": date_str, "timezone": "America/Indiana/Indianapolis", "slots": []}

    taken_by_date = collect_windows(
        Attr("preferredDate").eq(date_str),
        now_epoch=now_epoch,
    )
    taken_windows = taken_by_date.get(date_str, [])

    slots_result = []
    for slot_str in all_slots:
        slot_start_min = time_to_minutes(slot_str)
        if not has_capacity(taken_windows, slot_start_min, slot_start_min + duration_minutes):
            continue
        h       = slot_start_min // 60
        slot_dt = dt.datetime(date.year, date.month, date.day, h, 0, tzinfo=SALON_TZ)
        if slot_dt <= cutoff_24hr:
            continue
        slots_result.append({
            "time":     _format_time_12h(h),
            "datetime": slot_dt.isoformat(),
            "available": True,
        })

    return {
        "date":     date_str,
        "timezone": "America/Indiana/Indianapolis",
        "slots":    slots_result,
    }
