#!/usr/bin/env python3
from __future__ import annotations

import os
from decimal import Decimal

import boto3

BUSINESS_SETTINGS = {
    "settingId": "BUSINESS#SETTINGS",
    "version": "v1",
    "businessName": "Grace Hair Beauty",
    "phone": "+13178503001",
    "email": "ghbeauty24@gmail.com",
    "address": {
        "street": "955 Baden Manor Dr",
        "city": "Indianapolis",
        "state": "IN",
        "zip": "46217",
    },
    "hours": {
        day: {"open": "09:00", "close": "20:00", "closed": False}
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    },
    "socialLinks": {
        "instagram": "https://www.instagram.com/ghbeauty24?igsh=MTM0bGxnMzF1OGI0Zw==",
        "facebook": "https://www.facebook.com/GraceHairBeauty01/",
        "tiktok": "https://www.tiktok.com/@ghbeauty24?_r=1&_t=ZT-96PlSWucAbW",
    },
    "googleMapsUrl": "https://www.google.com/search?kgmid=%2Fg%2F11yytfkdj8&q=Grace+hair+beauty",
    "googleReviewUrl": "https://www.google.com/search?kgmid=%2Fg%2F11yytfkdj8&q=Grace+hair+beauty",
    "announcementBanner": None,
    "bookingNotice": "We confirm all appointments within 24 hours.",
    "updatedAt": "2026-05-14T00:00:00Z",
    "updatedBy": "seed",
}

SERVICES = [
    ("African Braids", "african-braids", 18000),
    ("Natural Hairstyle", "natural", 8500),
    ("Sew-In", "sew-in", 17500),
    ("Men Hairstyles", "men", 6500),
    ("Kids Hairstyles", "kids", 7500),
    ("Signature Hairstyles", "african-braids", 15000),
    ("Professional Hair Braiding", "african-braids", 16000),
    ("Deep Hair Treatment", "natural", 5500),
    ("Hair Revitalization Therapy", "natural", 7000),
    ("Protective Styling", "natural", 9500),
    ("Silk Press & Styling", "natural", 9000),
    ("Crochet Braids", "african-braids", 9999),
    ("Knotless Braids", "african-braids", 21999),
    ("Boho Braid Waist Length", "african-braids", 25000),
]


def slug(value: str) -> str:
    return value.lower().replace("&", "and").replace(" ", "-").replace("--", "-")


def main() -> None:
    dynamodb = boto3.resource("dynamodb")
    services_table = dynamodb.Table(os.environ["TABLE_SERVICES"])
    settings_table = dynamodb.Table(os.environ["TABLE_BUSINESS_SETTINGS"])
    reviews_table = dynamodb.Table(os.environ["TABLE_REVIEWS"])
    cdn_base_url = os.environ["CDN_BASE_URL"].rstrip("/")

    settings_table.put_item(Item=BUSINESS_SETTINGS)
    reviews_table.put_item(
        Item={
            "reviewId": "AGGREGATE#RATINGS",
            "totalCount": Decimal(0),
            "sumRatings": Decimal(0),
            "averageRating": Decimal(0),
            "updatedAt": "2026-05-14T00:00:00Z",
        }
    )

    for index, (name, category, price) in enumerate(SERVICES):
        service_id = f"svc-{slug(name)}"
        services_table.put_item(
            Item={
                "serviceId": service_id,
                "name": name,
                "category": category,
                "description": f"{name} delivered with precision, care, and healthy-hair technique.",
                "startingPrice": Decimal(price),
                "priceUnit": "cents",
                "durationMinutes": Decimal(120 if price < 10000 else 240),
                "imageUrl": f"{cdn_base_url}/services/{service_id}.webp",
                "featured": index in {0, 1, 2, 3, 4, 12, 13},
                "active": True,
                "activeKey": "true",
                "createdAt": "2026-05-14T00:00:00Z",
                "updatedAt": "2026-05-14T00:00:00Z",
            }
        )


if __name__ == "__main__":
    main()
