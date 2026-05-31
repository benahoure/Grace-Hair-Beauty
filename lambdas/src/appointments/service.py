from __future__ import annotations

import datetime as dt

from appointments.models import AppointmentRequest
from common.config import get_config
from common.dynamo import get_item, put_item
from common.email_layout import details_table as _details_table
from common.email_layout import email_layout as _email_layout
from common.ids import new_id, ttl_days, utc_now
from common.security import encrypt_pii
from common.ses_client import best_effort_send_email, notify_admin


def _format_date(value: dt.date) -> str:
    return value.strftime("%A, %B %-d, %Y")


def _format_time(value: str) -> str:
    hour, minute = [int(part) for part in value.split(":")]
    suffix = "AM" if hour < 12 else "PM"
    display_hour = hour % 12 or 12
    return f"{display_hour}:{minute:02d} {suffix}"


def _customer_email_text(request: AppointmentRequest, service_name: str) -> str:
    return (
        f"Hi {request.clientName},\n\n"
        "Your appointment request has been received. We will confirm within 24 hours.\n\n"
        f"Service: {service_name}\n"
        f"Preferred date: {_format_date(request.preferredDate)}\n"
        f"Preferred time: {_format_time(request.preferredTime)}\n\n"
        "Grace Hair Beauty"
    )


def _customer_email_html(request: AppointmentRequest, service_name: str) -> str:
    content = _details_table(
        [
            ("Service", service_name),
            ("Preferred date", _format_date(request.preferredDate)),
            ("Preferred time", _format_time(request.preferredTime)),
            ("Confirmation email", str(request.clientEmail)),
            ("Phone", request.clientPhone),
        ]
    )
    return _email_layout(
        preheader=f"We received your {service_name} appointment request.",
        title="Appointment Request Received",
        intro=(
            f"Hi {request.clientName}, thank you for booking with Grace Hair Beauty. "
            "Your request is in the queue, and Grace will confirm the final time, prep notes, "
            "and any deposit details within 24 hours."
        ),
        content=content,
        cta_label="Visit Grace Hair Beauty",
        cta_url=get_config().allowed_origin,
    )


def _admin_email_text(request: AppointmentRequest, service_name: str) -> str:
    requested_at = (
        f"New appointment request for {service_name} on {_format_date(request.preferredDate)} "
        f"at {_format_time(request.preferredTime)}."
    )
    lines = [
        requested_at,
        "",
        f"Client: {request.clientName}",
        f"Email: {request.clientEmail}",
        f"Phone: {request.clientPhone}",
    ]
    if request.notes:
        lines.extend(["", f"Notes: {request.notes}"])
    return "\n".join(lines)


def _admin_email_html(request: AppointmentRequest, service_name: str) -> str:
    content = _details_table(
        [
            ("Client", request.clientName),
            ("Service", service_name),
            ("Preferred date", _format_date(request.preferredDate)),
            ("Preferred time", _format_time(request.preferredTime)),
            ("Email", str(request.clientEmail)),
            ("Phone", request.clientPhone),
            ("Referral", request.referralSource or None),
            ("Notes", request.notes or None),
        ]
    )
    return _email_layout(
        preheader=f"New appointment request for {service_name}.",
        title="New Booking Request",
        intro="A new client submitted an appointment request from the Grace Hair Beauty website.",
        content=content,
        cta_label="Open Admin Dashboard",
        cta_url=f"{get_config().allowed_origin}/admin/appointments",
    )


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
        text_body=_customer_email_text(request, service["name"]),
        html_body=_customer_email_html(request, service["name"]),
    )
    notify_admin(
        f"New appointment request: {service['name']}",
        _admin_email_text(request, service["name"]),
        html_body=_admin_email_html(request, service["name"]),
    )
    return {
        "appointmentId": appointment_id,
        "status": "pending",
        "message": "Your appointment request has been received. We will confirm within 24 hours.",
    }
