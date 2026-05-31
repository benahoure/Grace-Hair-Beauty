from __future__ import annotations

from aws_lambda_powertools.utilities.typing import LambdaContext

from common.config import get_config
from common.dynamo import get_item
from common.http import method
from common.logger import logger
from common.response import internal_error, ok, options

SETTINGS_KEY = {"settingId": "BUSINESS#SETTINGS", "version": "v1"}

DEFAULT_HOURS = {
    day: {"open": "09:00", "close": "20:00", "closed": False}
    for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}

DEFAULT_SETTINGS = {
    "businessName": "Grace Hair Beauty",
    "phone": "+13178503001",
    "email": "plbahoure2993@gmail.com",
    "address": {
        "street": "955 Baden Manor Dr",
        "city": "Indianapolis",
        "state": "IN",
        "zip": "46217",
    },
    "hours": DEFAULT_HOURS,
    "socialLinks": {
        "instagram": "https://www.instagram.com/ghbeauty24?igsh=MTM0bGxnMzF1OGI0Zw==",
        "facebook": "https://www.facebook.com/GraceHairBeauty01/",
        "tiktok": "https://www.tiktok.com/@ghbeauty24?_r=1&_t=ZT-96PlSWucAbW",
    },
    "googleMapsUrl": "https://www.google.com/search?kgmid=%2Fg%2F11yytfkdj8&q=Grace+hair+beauty",
    "googleReviewUrl": "https://www.google.com/search?kgmid=%2Fg%2F11yytfkdj8&q=Grace+hair+beauty",
    "announcementBanner": None,
    "bookingNotice": "We confirm all appointments within 24 hours.",
}


@logger.inject_lambda_context(log_event=False)
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    if method(event) == "OPTIONS":
        return options()
    try:
        settings = get_item(get_config().table_business_settings, SETTINGS_KEY)
        if not settings:
            settings = DEFAULT_SETTINGS
        public_fields = {
            "businessName": settings["businessName"],
            "phone": settings["phone"],
            "email": settings["email"],
            "address": settings["address"],
            "hours": settings["hours"],
            "socialLinks": settings.get("socialLinks", {}),
            "googleMapsUrl": settings["googleMapsUrl"],
            "googleReviewUrl": settings.get("googleReviewUrl", ""),
            "announcementBanner": settings.get("announcementBanner"),
            "bookingNotice": settings.get("bookingNotice", "We confirm all appointments within 24 hours."),
            "founderImageUrl": settings.get("founderImageUrl"),
            "contactImageUrl": settings.get("contactImageUrl"),
        }
        return ok(public_fields, cache_control="public, max-age=300")
    except Exception:
        logger.exception("Failed to fetch business settings")
        return internal_error()
