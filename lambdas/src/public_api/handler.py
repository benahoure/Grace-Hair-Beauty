from __future__ import annotations

from collections.abc import Callable

from aws_lambda_powertools.utilities.typing import LambdaContext

from appointments.handler import lambda_handler as appointments_handler
from business_settings.handler import lambda_handler as business_settings_handler
from common.http import method, path
from common.response import not_found, options
from contact.handler import lambda_handler as contact_handler
from portfolio.handler import lambda_handler as portfolio_handler
from reviews.handler import lambda_handler as reviews_handler
from services.handler import lambda_handler as services_handler

Handler = Callable[[dict, LambdaContext], dict]


def _normalize_path(value: str) -> str:
    normalized = value.rstrip("/")
    return normalized or "/"


def _resolve_handler(request_method: str, request_path: str) -> Handler | None:
    if request_method == "GET" and (request_path == "/services" or request_path.startswith("/services/")):
        return services_handler
    if request_method == "GET" and request_path == "/portfolio":
        return portfolio_handler
    if request_method in {"GET", "POST"} and request_path == "/reviews":
        return reviews_handler
    if request_method == "GET" and request_path == "/business-settings":
        return business_settings_handler
    if request_method == "POST" and request_path == "/appointments":
        return appointments_handler
    if request_method == "POST" and request_path == "/contact":
        return contact_handler
    return None


def lambda_handler(event: dict, context: LambdaContext) -> dict:
    request_method = method(event)
    if request_method == "OPTIONS":
        return options()

    handler = _resolve_handler(request_method, _normalize_path(path(event)))
    if handler is None:
        return not_found("Public route not found.")
    return handler(event, context)
