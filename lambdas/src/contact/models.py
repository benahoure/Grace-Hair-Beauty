from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator

from common.validators import HtmlStrippingModelMixin, normalize_us_phone

_MAX_SERVICE_ITEMS = 20
_MAX_SERVICE_LEN = 60


class ContactRequest(HtmlStrippingModelMixin, BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    message: str = Field(min_length=10, max_length=1000)
    services: list[str] = Field(default_factory=list)
    honeypot: str = Field(default="", exclude=True)

    @field_validator("phone", mode="before")
    @classmethod
    def validate_optional_phone(cls, value: str | None) -> str | None:
        if not value:
            return None
        return normalize_us_phone(value)

    @field_validator("services", mode="before")
    @classmethod
    def validate_services(cls, value: list) -> list[str]:
        if not isinstance(value, list):
            raise ValueError("services must be a list")
        if len(value) > _MAX_SERVICE_ITEMS:
            raise ValueError(f"Too many services selected (max {_MAX_SERVICE_ITEMS}).")
        return [str(s)[:_MAX_SERVICE_LEN] for s in value]
