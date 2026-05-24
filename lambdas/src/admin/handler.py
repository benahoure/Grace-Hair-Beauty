from __future__ import annotations

from typing import Any, Literal

import boto3
from aws_lambda_powertools.utilities.typing import LambdaContext
from boto3.dynamodb.conditions import Attr
from pydantic import BaseModel, Field, ValidationError

from business_settings.handler import SETTINGS_KEY
from business_settings.models import BusinessSettingsPatch
from common.config import get_config
from common.dynamo import (
    bool_filter,
    delete_item,
    get_item,
    put_item,
    scan_items,
    update_item,
)
from common.errors import ForbiddenError, NotFoundError
from common.http import method, parse_json_body, path, path_parameter, query_params, validation_errors
from common.ids import new_id, ttl_days, utc_now
from common.logger import logger, safe_extra
from common.response import bad_request, created, forbidden, internal_error, not_found, ok, options
from common.security import decrypt_pii, require_admin, validate_cdn_url
from portfolio.models import PortfolioPatch, PortfolioWrite
from reviews.models import ReviewPatch, ReviewWrite
from services.models import ServicePatch, ServiceWrite

_cloudfront = boto3.client("cloudfront")


class AppointmentPatch(BaseModel):
    status: Literal["confirmed", "cancelled", "completed"]
    adminNote: str | None = Field(default=None, max_length=500)


@logger.inject_lambda_context(log_event=False)
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    if method(event) == "OPTIONS":
        return options()
    try:
        admin_user_id = require_admin(event)
    except ForbiddenError as exc:
        return forbidden(str(exc))

    try:
        request_path = path(event)
        request_method = method(event)
        if request_path == "/admin/appointments" and request_method == "GET":
            return get_appointments(event)
        if path_parameter(event, "appointmentId") and request_method == "PATCH":
            return update_appointment(event, admin_user_id)
        if request_path == "/admin/services" and request_method == "GET":
            return get_services(event)
        if request_path == "/admin/services" and request_method == "POST":
            return create_service(event, admin_user_id)
        if path_parameter(event, "serviceId") and request_method == "PATCH":
            return patch_service(event, admin_user_id)
        if path_parameter(event, "serviceId") and request_method == "DELETE":
            return delete_service(event, admin_user_id)
        if request_path == "/admin/portfolio" and request_method == "GET":
            return get_portfolio(event)
        if request_path == "/admin/portfolio" and request_method == "POST":
            return create_portfolio(event, admin_user_id)
        if path_parameter(event, "styleId") and request_method == "PATCH":
            return patch_portfolio(event, admin_user_id)
        if path_parameter(event, "styleId") and request_method == "DELETE":
            return delete_portfolio(event, admin_user_id)
        if request_path == "/admin/reviews" and request_method == "GET":
            return get_reviews_admin(event)
        if request_path == "/admin/reviews" and request_method == "POST":
            return create_review(event, admin_user_id)
        if path_parameter(event, "reviewId") and request_method == "PATCH":
            return patch_review(event, admin_user_id)
        if path_parameter(event, "reviewId") and request_method == "DELETE":
            return delete_review(event, admin_user_id)
        if request_path == "/admin/contact-messages" and request_method == "GET":
            return get_contact_messages(event)
        if request_path == "/admin/business-settings" and request_method == "GET":
            return get_business_settings_admin(event)
        if request_path == "/admin/business-settings" and request_method == "PATCH":
            return patch_business_settings(event, admin_user_id)
        if request_path == "/admin/audit-log" and request_method == "GET":
            return get_audit_log(event)
        return not_found("Admin route not found.")
    except ValueError as exc:
        return bad_request(str(exc))
    except ValidationError as exc:
        return bad_request(validation_errors(exc))
    except Exception:
        logger.exception("Unexpected admin handler error")
        return internal_error()


def resource_id(event: dict, name: str) -> str:
    value = path_parameter(event, name)
    if value:
        return value
    return path(event).rstrip("/").split("/")[-1]


def audit(
    admin_user_id: str,
    action: str,
    resource_type: str,
    resource_id_value: str,
    detail: dict[str, Any] | None = None,
) -> None:
    put_item(
        get_config().table_audit_log,
        {
            "logId": new_id(),
            "adminId": admin_user_id,
            "action": action,
            "resourceType": resource_type,
            "resourceId": resource_id_value,
            "detail": detail or {},
            "createdAt": utc_now(),
            "expiresAt": ttl_days(365),
        },
    )


def get_appointments(event: dict) -> dict:
    config = get_config()
    params = query_params(event)
    status = params.get("status")
    filter_expression: Any = Attr("appointmentId").exists()
    if status:
        filter_expression = filter_expression & Attr("status").eq(status)
    if params.get("date"):
        filter_expression = filter_expression & Attr("preferredDate").eq(params["date"])

    items, next_cursor = scan_items(
        config.table_appointments,
        filter_expression=filter_expression,
        limit=min(int(params.get("limit", "25")), 50),
        cursor=params.get("cursor"),
    )
    appointments = []
    for item in sorted(items, key=lambda value: value.get("createdAt", ""), reverse=True):
        item["clientEmail"] = decrypt_pii(item.get("clientEmail"))
        item["clientPhone"] = decrypt_pii(item.get("clientPhone"))
        appointments.append(item)
    return ok({"appointments": appointments, "nextCursor": next_cursor})


def get_services(event: dict) -> dict:
    params = query_params(event)
    items, next_cursor = scan_items(
        get_config().table_services,
        filter_expression=Attr("serviceId").exists(),
        limit=min(int(params.get("limit", "50")), 100),
        cursor=params.get("cursor"),
    )
    services = sorted(items, key=lambda value: value.get("displayOrder", value.get("name", "")))
    return ok({"services": services, "nextCursor": next_cursor})


def get_portfolio(event: dict) -> dict:
    params = query_params(event)
    items, next_cursor = scan_items(
        get_config().table_portfolio,
        filter_expression=Attr("styleId").exists(),
        limit=min(int(params.get("limit", "50")), 100),
        cursor=params.get("cursor"),
    )
    portfolio = sorted(items, key=lambda value: value.get("createdAt", ""), reverse=True)
    return ok({"portfolio": portfolio, "nextCursor": next_cursor})


def get_reviews_admin(event: dict) -> dict:
    params = query_params(event)
    items, next_cursor = scan_items(
        get_config().table_reviews,
        filter_expression=Attr("reviewId").exists(),
        limit=min(int(params.get("limit", "50")), 100),
        cursor=params.get("cursor"),
    )
    reviews = sorted(items, key=lambda value: value.get("createdAt", ""), reverse=True)
    return ok({"reviews": reviews, "nextCursor": next_cursor})


def get_business_settings_admin(event: dict) -> dict:
    settings = get_item(get_config().table_business_settings, SETTINGS_KEY)
    if not settings:
        return not_found("Business settings have not been configured.")
    return ok(settings)


def get_audit_log(event: dict) -> dict:
    params = query_params(event)
    items, next_cursor = scan_items(
        get_config().table_audit_log,
        filter_expression=Attr("logId").exists(),
        limit=min(int(params.get("limit", "25")), 100),
        cursor=params.get("cursor"),
    )
    entries = sorted(items, key=lambda value: value.get("createdAt", ""), reverse=True)
    return ok({"entries": entries, "nextCursor": next_cursor})


def update_appointment(event: dict, admin_user_id: str) -> dict:
    body = AppointmentPatch.model_validate(parse_json_body(event))
    appointment_id = resource_id(event, "appointmentId")
    now = utc_now()
    existing = get_item(get_config().table_appointments, {"appointmentId": appointment_id})
    if not existing:
        return not_found("Appointment not found.")
    try:
        updated = update_item(
            get_config().table_appointments,
            {"appointmentId": appointment_id},
            {"status": body.status, "adminNote": body.adminNote, "updatedAt": now},
        )
    except NotFoundError:
        return not_found("Appointment not found.")
    audit(admin_user_id, f"appointment.{body.status}", "appointment", appointment_id)
    updated["clientEmail"] = decrypt_pii(updated.get("clientEmail"))
    updated["clientPhone"] = decrypt_pii(updated.get("clientPhone"))
    return ok(updated)


def create_service(event: dict, admin_user_id: str) -> dict:
    body = ServiceWrite.model_validate(parse_json_body(event))
    validate_cdn_url(body.imageUrl, "services")
    now = utc_now()
    service_id = new_id()
    item = body.model_dump()
    item.update(
        {
            "serviceId": service_id,
            "priceUnit": "cents",
            "activeKey": str(body.active).lower(),
            "createdAt": now,
            "updatedAt": now,
        }
    )
    put_item(get_config().table_services, item)
    audit(admin_user_id, "service.created", "service", service_id, {"name": body.name})
    return created(item)


def patch_service(event: dict, admin_user_id: str) -> dict:
    body = ServicePatch.model_validate(parse_json_body(event))
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return bad_request("No service fields provided.")
    if updates.get("imageUrl"):
        validate_cdn_url(updates["imageUrl"], "services")
    if "active" in updates:
        updates["activeKey"] = str(updates["active"]).lower()
    service_id = resource_id(event, "serviceId")
    updates["updatedAt"] = utc_now()
    try:
        updated = update_item(get_config().table_services, {"serviceId": service_id}, updates)
    except NotFoundError:
        return not_found("Service not found.")
    audit(admin_user_id, "service.updated", "service", service_id, {"fields": sorted(updates)})
    return ok(updated)


def delete_service(event: dict, admin_user_id: str) -> dict:
    service_id = resource_id(event, "serviceId")
    try:
        update_item(get_config().table_services, {"serviceId": service_id}, {"active": False, "updatedAt": utc_now()})
    except NotFoundError:
        return not_found("Service not found.")
    audit(admin_user_id, "service.deleted", "service", service_id)
    return ok({"message": "Service deactivated."})


def create_portfolio(event: dict, admin_user_id: str) -> dict:
    body = PortfolioWrite.model_validate(parse_json_body(event))
    validate_cdn_url(body.imageUrl, "portfolio")
    validate_cdn_url(body.thumbnailUrl, "portfolio")
    now = utc_now()
    style_id = new_id()
    item = body.model_dump()
    item.update(
        {
            "styleId": style_id,
            "activeKey": str(body.active).lower(),
            "createdAt": now,
            "updatedAt": now,
        }
    )
    put_item(get_config().table_portfolio, item)
    audit(admin_user_id, "portfolio.created", "portfolio", style_id, {"title": body.title})
    return created(item)


def patch_portfolio(event: dict, admin_user_id: str) -> dict:
    body = PortfolioPatch.model_validate(parse_json_body(event))
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return bad_request("No portfolio fields provided.")
    if updates.get("imageUrl"):
        validate_cdn_url(updates["imageUrl"], "portfolio")
    if updates.get("thumbnailUrl"):
        validate_cdn_url(updates["thumbnailUrl"], "portfolio")
    if "active" in updates:
        updates["activeKey"] = str(updates["active"]).lower()
    style_id = resource_id(event, "styleId")
    updates["updatedAt"] = utc_now()
    try:
        updated = update_item(get_config().table_portfolio, {"styleId": style_id}, updates)
    except NotFoundError:
        return not_found("Portfolio item not found.")
    audit(admin_user_id, "portfolio.updated", "portfolio", style_id, {"fields": sorted(updates)})
    return ok(updated)


def delete_portfolio(event: dict, admin_user_id: str) -> dict:
    style_id = resource_id(event, "styleId")
    delete_item(get_config().table_portfolio, {"styleId": style_id})
    audit(admin_user_id, "portfolio.deleted", "portfolio", style_id)
    return ok({"message": "Portfolio item deleted."})


def create_review(event: dict, admin_user_id: str) -> dict:
    body = ReviewWrite.model_validate(parse_json_body(event))
    now = utc_now()
    review_id = new_id()
    item = body.model_dump()
    item.update(
        {
            "reviewId": review_id,
            "approvedKey": str(body.approved).lower(),
            "createdAt": now,
            "updatedAt": now,
        }
    )
    put_item(get_config().table_reviews, item)
    recalculate_review_aggregate()
    audit(admin_user_id, "review.created", "review", review_id)
    return created(item)


def patch_review(event: dict, admin_user_id: str) -> dict:
    body = ReviewPatch.model_validate(parse_json_body(event))
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return bad_request("No review fields provided.")
    if "approved" in updates:
        updates["approvedKey"] = str(updates["approved"]).lower()
    review_id = resource_id(event, "reviewId")
    updates["updatedAt"] = utc_now()
    try:
        updated = update_item(get_config().table_reviews, {"reviewId": review_id}, updates)
    except NotFoundError:
        return not_found("Review not found.")
    recalculate_review_aggregate()
    audit(admin_user_id, "review.updated", "review", review_id, {"fields": sorted(updates)})
    return ok(updated)


def delete_review(event: dict, admin_user_id: str) -> dict:
    review_id = resource_id(event, "reviewId")
    delete_item(get_config().table_reviews, {"reviewId": review_id})
    recalculate_review_aggregate()
    audit(admin_user_id, "review.deleted", "review", review_id)
    return ok({"message": "Review deleted."})


def recalculate_review_aggregate() -> None:
    review_items: list[dict[str, Any]] = []
    cursor = None
    while True:
        reviews, cursor = scan_items(
            get_config().table_reviews,
            filter_expression=bool_filter("approved", True),
            limit=100,
            cursor=cursor,
        )
        review_items.extend(item for item in reviews if not str(item.get("reviewId", "")).startswith("AGGREGATE#"))
        if not cursor:
            break
    total = len(review_items)
    rating_sum = sum(int(item.get("rating", 0)) for item in review_items)
    average = round(rating_sum / total, 2) if total else 0
    put_item(
        get_config().table_reviews,
        {
            "reviewId": "AGGREGATE#RATINGS",
            "totalCount": total,
            "sumRatings": rating_sum,
            "averageRating": average,
            "updatedAt": utc_now(),
        },
    )


def get_contact_messages(event: dict) -> dict:
    params = query_params(event)
    filter_expression = Attr("messageId").exists()
    if params.get("read") in {"true", "false"}:
        filter_expression = filter_expression & bool_filter("read", params["read"] == "true")
    items, next_cursor = scan_items(
        get_config().table_contact_messages,
        filter_expression=filter_expression,
        limit=min(int(params.get("limit", "25")), 50),
        cursor=params.get("cursor"),
    )
    messages = []
    for item in sorted(items, key=lambda value: value.get("createdAt", ""), reverse=True):
        item["email"] = decrypt_pii(item.get("email"))
        item["phone"] = decrypt_pii(item.get("phone"))
        messages.append(item)
    return ok({"messages": messages, "nextCursor": next_cursor})


def patch_business_settings(event: dict, admin_user_id: str) -> dict:
    body = BusinessSettingsPatch.model_validate(parse_json_body(event))
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return bad_request("No business settings fields provided.")
    updates["updatedAt"] = utc_now()
    updates["updatedBy"] = admin_user_id
    try:
        updated = update_item(get_config().table_business_settings, SETTINGS_KEY, updates)
    except NotFoundError:
        return not_found("Business settings have not been configured.")
    audit(admin_user_id, "settings.updated", "settings", "BUSINESS#SETTINGS", {"fields": sorted(updates)})
    invalidate_business_settings_cache()
    logger.info("Business settings updated", extra=safe_extra({"adminId": admin_user_id}))
    return ok(updated)


def invalidate_business_settings_cache() -> None:
    distribution_id = get_config().business_settings_distribution_id
    if not distribution_id:
        return
    try:
        _cloudfront.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={
                "CallerReference": new_id(),
                "Paths": {"Quantity": 1, "Items": ["/business-settings"]},
            },
        )
    except Exception:
        logger.exception("CloudFront invalidation failed")
