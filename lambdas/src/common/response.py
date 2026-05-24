from __future__ import annotations

import json
from typing import Any

from common.cors import cors_headers


def build_response(status_code: int, body: Any, *, cache_control: str = "no-store") -> dict:
    return {
        "statusCode": status_code,
        "headers": cors_headers(cache_control),
        "body": json.dumps(body, default=str),
    }


def ok(body: Any, *, cache_control: str = "no-store") -> dict:
    return build_response(200, body, cache_control=cache_control)


def created(body: Any) -> dict:
    return build_response(201, body)


def bad_request(errors: dict[str, str] | str) -> dict:
    if isinstance(errors, str):
        return build_response(400, {"error": errors})
    return build_response(400, {"errors": errors})


def unauthorized(message: str = "Unauthorized") -> dict:
    return build_response(401, {"error": message})


def forbidden(message: str = "Forbidden") -> dict:
    return build_response(403, {"error": message})


def not_found(message: str = "Not found") -> dict:
    return build_response(404, {"error": message})


def conflict(message: str) -> dict:
    return build_response(409, {"error": message})


def internal_error() -> dict:
    return build_response(500, {"error": "An unexpected error occurred. Please try again."})


def options() -> dict:
    return build_response(204, {})
