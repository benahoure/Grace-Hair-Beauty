from __future__ import annotations

from common.config import get_config
from common.dynamo import put_item
from common.ids import new_id, ttl_days, utc_now
from common.security import encrypt_pii
from common.ses_client import best_effort_send_email, notify_admin
from contact.models import ContactRequest


def create_contact_message(request: ContactRequest) -> dict:
    config = get_config()
    now = utc_now()
    message_id = new_id()
    services_text = ", ".join(request.services) if request.services else "none selected"
    put_item(
        config.table_contact_messages,
        {
            "messageId": message_id,
            "name": request.name,
            "email": encrypt_pii(str(request.email)) if request.email else None,
            "phone": encrypt_pii(request.phone),
            "message": request.message,
            "services": request.services,
            "inspirationPhotoName": request.inspirationPhotoName,
            "read": False,
            "readKey": "false",
            "createdAt": now,
            "expiresAt": ttl_days(365),
        },
    )
    if request.email:
        best_effort_send_email(
            to_address=str(request.email),
            subject="Grace Hair Beauty received your message",
            text_body="Thanks for reaching out to Grace Hair Beauty. We will respond within 1 business day.",
        )
    notify_admin(
        "New Grace Hair Beauty contact message",
        f"New message from {request.name}. Services of interest: {services_text}.",
    )
    return {
        "messageId": message_id,
        "message": "Thanks for reaching out! We'll respond within 1 business day.",
    }
