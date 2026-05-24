from __future__ import annotations

from appointments.models import AppointmentRequest
from common.config import get_config
from common.dynamo import get_item, put_item
from common.ids import new_id, ttl_days, utc_now
from common.security import encrypt_pii
from common.ses_client import best_effort_send_email, notify_admin


def create_appointment(request: AppointmentRequest) -> dict:
    config = get_config()
    service = get_item(config.table_services, {"serviceId": request.serviceId})
    if not service or service.get("active") in {False, "false"}:
        raise ValueError("Selected service was not found.")

    now = utc_now()
    appointment_id = new_id()
    item = {
        "appointmentId": appointment_id,
        "serviceId": request.serviceId,
        "serviceName": service["name"],
        "clientName": request.clientName,
        "clientEmail": encrypt_pii(str(request.clientEmail)),
        "clientPhone": encrypt_pii(request.clientPhone),
        "preferredDate": request.preferredDate.isoformat(),
        "preferredTime": request.preferredTime,
        "alternateDate": request.alternateDate.isoformat() if request.alternateDate else None,
        "notes": request.notes,
        "status": "pending",
        "statusKey": "pending",
        "adminNote": None,
        "referralSource": request.referralSource,
        "createdAt": now,
        "updatedAt": now,
    }
    if request.portfolioStyleId:
        item["portfolioStyleId"] = request.portfolioStyleId

    put_item(config.table_appointments, item)
    audit_detail = {
        "source": "public_booking",
        "serviceId": request.serviceId,
    }
    if request.portfolioStyleId:
        audit_detail["portfolioStyleId"] = request.portfolioStyleId

    put_item(
        config.table_audit_log,
        {
            "logId": new_id(),
            "adminId": "system",
            "action": "appointment.created",
            "resourceType": "appointment",
            "resourceId": appointment_id,
            "detail": audit_detail,
            "createdAt": now,
            "expiresAt": ttl_days(365),
        },
    )

    best_effort_send_email(
        to_address=str(request.clientEmail),
        subject="Grace Hair Beauty appointment request received",
        text_body=(
            f"Hi {request.clientName},\n\n"
            "Your appointment request has been received. We will confirm within 24 hours.\n\n"
            f"Service: {service['name']}\nPreferred date: {request.preferredDate}\n"
        ),
    )
    notify_admin(
        "New Grace Hair Beauty appointment request",
        f"New appointment request for {service['name']} on {request.preferredDate} at {request.preferredTime}.",
    )
    return {
        "appointmentId": appointment_id,
        "status": "pending",
        "message": "Your appointment request has been received. We will confirm within 24 hours.",
    }
