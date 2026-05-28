from __future__ import annotations

import datetime as dt
from html import escape

from appointments.models import AppointmentRequest
from common.config import get_config
from common.dynamo import get_item, put_item
from common.ids import new_id, ttl_days, utc_now
from common.security import encrypt_pii
from common.ses_client import best_effort_send_email, notify_admin

CTA_STYLE = (
    "display: inline-block; background: #B8860B; color: #2C1810; "
    "font: 700 13px Arial, sans-serif; letter-spacing: .08em; text-transform: uppercase; "
    "text-decoration: none; padding: 14px 24px; border-radius: 999px; border: 1px solid #D4A843;"
)
OUTER_TABLE_STYLE = "background: #FAF6F0; margin: 0; padding: 32px 16px;"
CARD_STYLE = (
    "max-width: 640px; overflow: hidden; background: #FFFDF9; border: 1px solid #E4D9CE; "
    "border-radius: 18px; box-shadow: 0 18px 48px rgba(44, 24, 16, 0.12);"
)
EYEBROW_STYLE = (
    "font: 700 11px Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #D4A843;"
)
TITLE_STYLE = (
    "margin: 12px 0 0 0; color: #FAF6F0; font-family: Georgia, 'Times New Roman', serif; "
    "font-size: 34px; line-height: 1.05; font-weight: 600;"
)
DETAIL_LABEL_STYLE = (
    "padding: 14px 0; color: #A07850; font: 700 11px Arial, sans-serif; "
    "letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid #E4D9CE; width: 38%;"
)
DETAIL_VALUE_STYLE = (
    "padding: 14px 0; color: #2C1810; font: 600 15px/1.45 Arial, sans-serif; "
    "border-bottom: 1px solid #E4D9CE;"
)


def _format_date(value: dt.date) -> str:
    return value.strftime("%A, %B %-d, %Y")


def _format_time(value: str) -> str:
    hour, minute = [int(part) for part in value.split(":")]
    suffix = "AM" if hour < 12 else "PM"
    display_hour = hour % 12 or 12
    return f"{display_hour}:{minute:02d} {suffix}"


def _email_layout(
    *,
    preheader: str,
    title: str,
    intro: str,
    content: str,
    cta_label: str | None = None,
    cta_url: str | None = None,
) -> str:
    cta = ""
    if cta_label and cta_url:
        cta = f"""
          <tr>
            <td style="padding: 8px 32px 36px 32px; text-align: center;">
              <a href="{escape(cta_url)}" style="{CTA_STYLE}">
                {escape(cta_label)}
              </a>
            </td>
          </tr>
        """

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escape(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #FAF6F0;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      {escape(preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="{OUTER_TABLE_STYLE}">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="{CARD_STYLE}">
            <tr>
              <td style="background: #2C1810; padding: 30px 32px; text-align: center;">
                <div style="{EYEBROW_STYLE}">
                  Grace Hair Beauty
                </div>
                <h1 style="{TITLE_STYLE}">
                  {escape(title)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 32px 10px 32px;">
                <p style="margin: 0; color: #6B4226; font: 400 16px/1.65 Arial, sans-serif;">
                  {escape(intro)}
                </p>
              </td>
            </tr>
            {content}
            {cta}
            <tr>
              <td style="background: #F2EAE0; border-top: 1px solid #E4D9CE; padding: 22px 32px; text-align: center;">
                <p style="margin: 0; color: #6B4226; font: 400 12px/1.6 Arial, sans-serif;">
                  Grace Hair Beauty · Indianapolis, IN
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


def _detail_row(label: str, value: str | None) -> str:
    if not value:
        return ""
    return f"""
      <tr>
        <td style="{DETAIL_LABEL_STYLE}">
          {escape(label)}
        </td>
        <td style="{DETAIL_VALUE_STYLE}">
          {escape(value)}
        </td>
      </tr>
    """


def _details_table(rows: list[tuple[str, str | None]]) -> str:
    rendered_rows = "".join(_detail_row(label, value) for label, value in rows)
    return f"""
      <tr>
        <td style="padding: 14px 32px 30px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
            {rendered_rows}
          </table>
        </td>
      </tr>
    """


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
