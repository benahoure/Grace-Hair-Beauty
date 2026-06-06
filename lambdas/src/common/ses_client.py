from __future__ import annotations

import functools
import smtplib
import ssl
from email.message import EmailMessage

import boto3

from common.config import get_config
from common.logger import logger, safe_extra

_SMTP_HOST = "smtp.zoho.com"
_SMTP_PORT = 587


@functools.lru_cache(maxsize=1)
def _get_smtp_creds() -> tuple[str, str, list[str]]:
    config = get_config()
    ssm = boto3.client("ssm")
    response = ssm.get_parameters(
        Names=[
            config.zoho_smtp_user_ssm,
            config.zoho_smtp_password_ssm,
            config.zoho_admin_emails_ssm,
        ],
        WithDecryption=True,
    )
    params = {p["Name"]: p["Value"] for p in response["Parameters"]}
    user = params[config.zoho_smtp_user_ssm]
    password = params[config.zoho_smtp_password_ssm]
    admin_emails = [e.strip() for e in params[config.zoho_admin_emails_ssm].split(",") if e.strip()]
    return user, password, admin_emails


def _build_message(
    from_addr: str,
    to_addresses: list[str],
    subject: str,
    text_body: str,
    html_body: str | None,
) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"Grace Hair Beauty <{from_addr}>"
    msg["To"] = ", ".join(to_addresses)
    msg["Reply-To"] = f"Grace Hair Beauty <{from_addr}>"
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")
    return msg


def _smtp_send(smtp_user: str, smtp_password: str, msg: EmailMessage) -> None:
    context = ssl.create_default_context()
    with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT, timeout=15) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def send_email(
    *, to_address: str, subject: str, text_body: str, html_body: str | None = None
) -> None:
    smtp_user, smtp_password, _ = _get_smtp_creds()
    msg = _build_message(smtp_user, [to_address], subject, text_body, html_body)
    try:
        _smtp_send(smtp_user, smtp_password, msg)
    except Exception:
        logger.exception("SMTP send failed", extra=safe_extra({"email": to_address, "subject": subject}))
        raise


def best_effort_send_email(
    *, to_address: str, subject: str, text_body: str, html_body: str | None = None
) -> bool:
    try:
        send_email(to_address=to_address, subject=subject, text_body=text_body, html_body=html_body)
        return True
    except Exception:
        return False


def notify_admin(subject: str, text_body: str, html_body: str | None = None) -> bool:
    try:
        smtp_user, smtp_password, admin_emails = _get_smtp_creds()
        if not admin_emails:
            logger.warning("notify_admin: no admin emails configured")
            return False
        msg = _build_message(smtp_user, admin_emails, subject, text_body, html_body)
        _smtp_send(smtp_user, smtp_password, msg)
        return True
    except Exception:
        logger.exception("SMTP notify_admin failed", extra=safe_extra({"subject": subject}))
        return False
