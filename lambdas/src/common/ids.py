from __future__ import annotations

import datetime as dt

import ulid


def new_id() -> str:
    return str(ulid.new())


def utc_now() -> str:
    return dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def ttl_days(days: int) -> int:
    return int((dt.datetime.now(dt.UTC) + dt.timedelta(days=days)).timestamp())
