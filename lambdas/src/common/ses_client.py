from __future__ import annotations

import boto3

from common.config import get_config
from common.logger import logger, safe_extra

_ses = boto3.client("ses")


def send_email(*, to_address: str, subject: str, text_body: str) -> None:
    config = get_config()
    try:
        _ses.send_email(
            Source=config.ses_sender_email,
            Destination={"ToAddresses": [to_address]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": text_body, "Charset": "UTF-8"}},
            },
        )
    except Exception:
        logger.exception("SES send failed", extra=safe_extra({"email": to_address, "subject": subject}))
        raise


def best_effort_send_email(*, to_address: str, subject: str, text_body: str) -> bool:
    try:
        send_email(to_address=to_address, subject=subject, text_body=text_body)
    except Exception:
        return False
    return True


def notify_admin(subject: str, text_body: str) -> bool:
    return best_effort_send_email(
        to_address=get_config().admin_alert_email,
        subject=subject,
        text_body=text_body,
    )
