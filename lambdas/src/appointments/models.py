from __future__ import annotations

import datetime as dt
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from common.validators import HtmlStrippingModelMixin, normalize_us_phone


class AppointmentRequest(HtmlStrippingModelMixin, BaseModel):
    serviceId: str = Field(min_length=1, max_length=80)
    portfolioStyleId: str | None = Field(default=None, max_length=120)
    clientName: str = Field(min_length=2, max_length=100)
    clientEmail: EmailStr
    clientPhone: str = Field(min_length=7, max_length=20)
    preferredDate: dt.date
    preferredTime: str = Field(pattern=r"^\d{2}:\d{2}$")
    alternateDate: dt.date | None = None
    notes: str = Field(default="", max_length=500)
    referralSource: Literal["instagram", "tiktok", "google", "yelp", "friend", "other", ""] = ""
    honeypot: str = Field(default="", exclude=True)

    @field_validator("clientPhone", mode="before")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return normalize_us_phone(value)

    @field_validator("preferredDate", "alternateDate", mode="after")
    @classmethod
    def validate_future_date(cls, value: dt.date | None) -> dt.date | None:
        if value is None:
            return value
        today = dt.date.today()
        if value <= today:
            raise ValueError("Date must be at least 1 day in the future.")
        if value > today + dt.timedelta(days=90):
            raise ValueError("Date must be within the next 90 days.")
        return value

    @field_validator("preferredTime", mode="after")
    @classmethod
    def validate_business_hours(cls, value: str) -> str:
        hour = int(value.split(":")[0])
        if not 8 <= hour <= 20:
            raise ValueError("Preferred time must be between 8:00 AM and 8:00 PM.")
        return value
