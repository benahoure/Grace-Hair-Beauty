#!/usr/bin/env python3
from __future__ import annotations

import os
from decimal import Decimal
from typing import Any

import boto3

BUSINESS_SETTINGS = {
    "settingId": "BUSINESS#SETTINGS",
    "version": "v1",
    "businessName": "Grace Hair Beauty",
    "phone": "+13178503001",
    "email": "plbahoure2993@gmail.com",
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

SERVICES: list[dict[str, Any]] = [
    {
        "serviceId": "svc-african-braids",
        "name": "African Braids",
        "category": "african-braids",
        "subcategory": "specialty-braids",
        "description": "Traditional African braiding with clean parts, lasting hold, and careful scalp care.",
        "startingPrice": 18000,
        "durationMinutes": 240,
        "imagePath": "/services/african-braids.webp",
        "featured": True,
        "bookingCount": 145,
    },
    {
        "serviceId": "svc-knotless-braids",
        "name": "Knotless Braids",
        "category": "african-braids",
        "subcategory": "knotless-braids",
        "description": "Lightweight knotless braids with a natural lay and reduced scalp tension.",
        "startingPrice": 21999,
        "durationMinutes": 300,
        "imagePath": "/services/knotless-braids-wavy-ends.webp",
        "imagePosition": "center 18%",
        "featured": True,
        "bookingCount": 187,
    },
    {
        "serviceId": "svc-box-braids",
        "name": "Box Braids",
        "category": "african-braids",
        "subcategory": "box-braids",
        "description": "Classic box braids with clean square parts, lightweight feel, and beautiful length.",
        "startingPrice": 16500,
        "durationMinutes": 240,
        "imagePath": "/services/box-braids.webp",
        "featured": True,
        "bookingCount": 163,
    },
    {
        "serviceId": "svc-box-braids-styled",
        "name": "Styled Box Braids",
        "category": "african-braids",
        "subcategory": "box-braids",
        "description": "Box braids styled into an elegant updo or design for a polished, finished look.",
        "startingPrice": 18000,
        "durationMinutes": 240,
        "imagePath": "/services/box-braids-styled.webp",
        "featured": False,
        "bookingCount": 43,
    },
    {
        "serviceId": "svc-senegalese-twist",
        "name": "Senegalese Twist",
        "category": "african-braids",
        "subcategory": "senegalese-twists",
        "description": "Classic senegalese twists with a smooth finish, natural look, and lasting hold.",
        "startingPrice": 18000,
        "durationMinutes": 210,
        "imagePath": "/services/senegalese-twist.webp",
        "featured": True,
        "bookingCount": 91,
    },
    {
        "serviceId": "svc-senegalese-twist-colors",
        "name": "Senegalese Twist Colors",
        "category": "african-braids",
        "subcategory": "senegalese-twists",
        "description": "Vibrant senegalese twists with color blending for a bold protective style.",
        "startingPrice": 20000,
        "durationMinutes": 270,
        "imagePath": "/services/senegalese-twist-colors.webp",
        "featured": True,
        "bookingCount": 67,
    },
    {
        "serviceId": "svc-fulani-braids",
        "name": "Fulani Braids",
        "category": "african-braids",
        "subcategory": "fulani-braids",
        "description": "Traditional fulani braids with delicate cornrow patterns and a refined protective finish.",
        "startingPrice": 19000,
        "durationMinutes": 240,
        "imagePath": "/services/fulani-braids.webp",
        "featured": True,
        "bookingCount": 98,
    },
    {
        "serviceId": "svc-miracle-knot",
        "name": "Miracle Knot Hairstyle",
        "category": "african-braids",
        "subcategory": "specialty-braids",
        "description": "A stunning knotted style that blends artistry and protection for a unique look.",
        "startingPrice": 21000,
        "durationMinutes": 300,
        "imagePath": "/services/miracle-knot-hairstyle.webp",
        "featured": True,
        "bookingCount": 47,
    },
    {
        "serviceId": "svc-crochet-braids",
        "name": "Crochet Braids",
        "category": "african-braids",
        "subcategory": "crochet-braids",
        "description": "Versatile crochet styles with efficient install time and beautiful movement.",
        "startingPrice": 9999,
        "durationMinutes": 150,
        "imagePath": "/services/crochet-hairstyle.webp",
        "featured": False,
        "bookingCount": 54,
    },
    {
        "serviceId": "svc-boho-waist",
        "name": "Boho Braid Waist Length",
        "category": "african-braids",
        "subcategory": "boho-braids",
        "description": "Waist-length boho braids with soft texture and a graceful dimensional finish.",
        "startingPrice": 25000,
        "durationMinutes": 360,
        "imagePath": "/services/boho-knotless-braids-blonde.webp",
        "imagePosition": "top center",
        "featured": True,
        "bookingCount": 109,
    },
    {
        "serviceId": "svc-signature-hairstyles",
        "name": "Signature Hairstyles",
        "category": "african-braids",
        "subcategory": "specialty-braids",
        "description": "Custom statement styles for special occasions, photos, and everyday beauty.",
        "startingPrice": 15000,
        "durationMinutes": 180,
        "imagePath": "/services/boho-knotless-braids-copper.webp",
        "imagePosition": "center 22%",
        "featured": False,
        "bookingCount": 24,
    },
    {
        "serviceId": "svc-professional-hair-braiding",
        "name": "Professional Hair Braiding",
        "category": "african-braids",
        "subcategory": "specialty-braids",
        "description": "Neat, professional braiding for protective styles that are beautiful and durable.",
        "startingPrice": 16000,
        "durationMinutes": 210,
        "imagePath": "/services/boho-knotless-braids-golden.webp",
        "imagePosition": "center 22%",
        "featured": False,
        "bookingCount": 21,
    },
    {
        "serviceId": "svc-natural-hairstyle",
        "name": "Natural Hairstyle",
        "category": "natural",
        "description": "Shape, define, and style your natural texture with a healthy-hair-first approach.",
        "startingPrice": 8500,
        "durationMinutes": 120,
        "imagePath": "/services/natural-hairstyle.webp",
        "featured": True,
        "bookingCount": 84,
    },
    {
        "serviceId": "svc-silk-press",
        "name": "Silk Press & Styling",
        "category": "natural",
        "description": "A smooth silk press with heat-conscious technique and a soft luminous finish.",
        "startingPrice": 9000,
        "durationMinutes": 120,
        "imagePath": "/services/boho-knotless-braids-golden.webp",
        "imagePosition": "center 22%",
        "featured": False,
        "bookingCount": 38,
    },
    {
        "serviceId": "svc-protective-styling",
        "name": "Protective Styling",
        "category": "natural",
        "description": "Low-maintenance styles that protect natural hair while keeping your look elevated.",
        "startingPrice": 9500,
        "durationMinutes": 120,
        "imagePath": "/services/cornrows-top-bun.webp",
        "imagePosition": "center 18%",
        "featured": False,
        "bookingCount": 35,
    },
    {
        "serviceId": "svc-deep-treatment",
        "name": "Deep Hair Treatment",
        "category": "natural",
        "description": "Moisture and strengthening care for hair that needs extra softness and support.",
        "startingPrice": 5500,
        "durationMinutes": 60,
        "imagePath": "/services/deep-hair-treatment.webp",
        "featured": False,
        "bookingCount": 18,
    },
    {
        "serviceId": "svc-revitalization",
        "name": "Hair Revitalization Therapy",
        "category": "natural",
        "description": "A restorative service for stressed hair, focused on hydration and manageability.",
        "startingPrice": 7000,
        "durationMinutes": 75,
        "imagePath": "/services/deep-hair-treatment.webp",
        "featured": False,
        "bookingCount": 29,
    },
    {
        "serviceId": "svc-sew-in",
        "name": "Sew-In",
        "category": "sew-in",
        "description": "A polished sew-in service with foundation care, blending, and a refined finish.",
        "startingPrice": 17500,
        "durationMinutes": 180,
        "imagePath": "/services/sew-in-curly-waves.webp",
        "featured": True,
        "bookingCount": 121,
    },
    {
        "serviceId": "svc-men-hairstyles",
        "name": "Men Hairstyles",
        "category": "men",
        "description": "Braids, twists, and tailored styles for men with a clean, comfortable experience.",
        "startingPrice": 6500,
        "durationMinutes": 90,
        "imagePath": "/services/man-hairstyle-2.webp",
        "imagePaths": [
            "/services/man-hairstyle-2.webp",
            "/services/man-hairstyle-3.webp",
            "/services/men-hairstyles.webp",
        ],
        "imagePosition": "center 22%",
        "featured": True,
        "bookingCount": 76,
    },
    {
        "serviceId": "svc-men-dreadlocks",
        "name": "Men Dreadlocks",
        "category": "men",
        "description": "Dreadlock styles for men with expert technique, clean finish, and long-lasting results.",
        "startingPrice": 10000,
        "durationMinutes": 120,
        "imagePath": "/services/men-dreadlocks-hairstyles.webp",
        "featured": True,
        "bookingCount": 58,
    },
    {
        "serviceId": "svc-kids-hairstyles",
        "name": "Kids Hairstyles",
        "category": "kids",
        "description": "Gentle kids braids and styles designed for comfort, neatness, and confidence.",
        "startingPrice": 7500,
        "durationMinutes": 120,
        "imagePath": "/services/kids-cornrows-beads.webp",
        "imagePaths": [
            "/services/kids-cornrows-beads.webp",
            "/services/kids-twists-bow.webp",
            "/services/kids-box-braids-star-beads.webp",
            "/services/kids-cornrows-color-beads.webp",
            "/services/kids-cornrows-flower-beads.webp",
        ],
        "imagePosition": "top center",
        "featured": True,
        "bookingCount": 134,
    },
]

PORTFOLIO_ITEMS: list[tuple[str, str, str, str]] = [
    ("style-knotless-waist", "Waist-Length Knotless Braids", "knotless", "/services/knotless-braids-wavy-ends.webp"),
    ("style-boho-braids", "Boho Braids with Soft Curls", "knotless", "/services/boho-knotless-braids-blonde.webp"),
    ("style-boho-golden", "Boho Knotless Braids - Golden", "knotless", "/services/boho-knotless-braids-golden.webp"),
    ("style-boho-copper", "Boho Knotless Braids - Copper", "knotless", "/services/boho-knotless-braids-copper.webp"),
    ("style-african-braids", "African Braids", "knotless", "/services/african-braids.webp"),
    ("style-fulani-braids", "Fulani Braids", "knotless", "/services/fulani-braids.webp"),
    ("style-miracle-knot", "Miracle Knot Hairstyle", "knotless", "/services/miracle-knot-hairstyle.webp"),
    ("style-crochet", "Crochet Braids", "knotless", "/services/crochet-hairstyle.webp"),
    ("style-jumbo-box-braids", "Jumbo Box Braids", "box-braids", "/services/jumbo-box-braids.webp"),
    ("style-box-braids", "Classic Box Braids", "box-braids", "/services/box-braids.webp"),
    ("style-box-braids-styled", "Styled Box Braids Updo", "box-braids", "/services/box-braids-styled.webp"),
    ("style-senegalese-twist", "Senegalese Twists", "senegalese", "/services/senegalese-twist.webp"),
    (
        "style-senegalese-twist-colors",
        "Senegalese Twists with Color",
        "senegalese",
        "/services/senegalese-twist-colors.webp",
    ),
    ("style-sew-in-layered", "Layered Sew-In", "sew-in", "/services/sew-in-curly-waves.webp"),
    ("style-natural-hairstyle", "Natural Hairstyle", "natural", "/services/natural-hairstyle.webp"),
    ("style-cornrows-bun", "Cornrows into Top Bun", "natural", "/services/cornrows-top-bun.webp"),
    ("style-kids-beads", "Kids Braids with Beads", "kids", "/services/kids-cornrows-beads.webp"),
    ("style-kids-twists-bow", "Kids Twists with Bow", "kids", "/services/kids-twists-bow.webp"),
    ("style-kids-star-beads", "Kids Box Braids with Star Beads", "kids", "/services/kids-box-braids-star-beads.webp"),
    ("style-kids-color-beads", "Kids Cornrows with Color Beads", "kids", "/services/kids-cornrows-color-beads.webp"),
    ("style-kids-flower-beads", "Kids Cornrows with Flower Beads", "kids", "/services/kids-cornrows-flower-beads.webp"),
    ("style-men-hairstyles", "Men Hairstyles", "men", "/services/men-hairstyles.webp"),
    ("style-men-hairstyle-2", "Men Braided Style", "men", "/services/man-hairstyle-2.webp"),
    ("style-men-hairstyle-3", "Men Protective Style", "men", "/services/man-hairstyle-3.webp"),
    ("style-men-dreadlocks", "Men Dreadlocks", "men", "/services/men-dreadlocks-hairstyles.webp"),
]

DEMO_REVIEWS: list[dict[str, Any]] = [
    {
        "reviewId": "review-1",
        "clientName": "Amara T.",
        "rating": 5,
        "body": (
            "Ariane did an incredible job on my knotless braids. Clean parts, zero tension on my scalp, "
            "and they lasted almost 8 weeks."
        ),
        "serviceName": "Knotless Braids",
        "createdAt": "2026-04-22T12:00:00Z",
        "featured": True,
    },
    {
        "reviewId": "review-2",
        "clientName": "Kezia M.",
        "rating": 5,
        "body": (
            "Brought my daughter in for the first time and she absolutely loved it. Ariane was so patient "
            "and gentle with her."
        ),
        "serviceName": "Kids Hairstyles",
        "createdAt": "2026-04-10T12:00:00Z",
        "featured": True,
    },
    {
        "reviewId": "review-3",
        "clientName": "Nadia B.",
        "rating": 5,
        "body": (
            "Best boho braids I have ever had. The texture was perfect, the length was flawless, "
            "and she listened to exactly what I wanted."
        ),
        "serviceName": "Boho Braid Waist Length",
        "createdAt": "2026-03-28T12:00:00Z",
        "featured": True,
    },
    {
        "reviewId": "review-4",
        "clientName": "Imani R.",
        "rating": 5,
        "body": (
            "I had a full sew-in done and I am obsessed with the result. It looks completely natural "
            "and lays so flat."
        ),
        "serviceName": "Sew-In",
        "createdAt": "2026-03-15T12:00:00Z",
        "featured": False,
    },
    {
        "reviewId": "review-5",
        "clientName": "Zora A.",
        "rating": 5,
        "body": "My hair has never felt so healthy. Ariane spent real time understanding my hair before touching it.",
        "serviceName": "Protective Styling",
        "createdAt": "2026-02-20T12:00:00Z",
        "featured": False,
    },
    {
        "reviewId": "review-6",
        "clientName": "Fatou D.",
        "rating": 5,
        "body": (
            "Came in for African braids and left feeling like royalty. The parts are so clean and "
            "the install was painless."
        ),
        "serviceName": "African Braids",
        "createdAt": "2026-02-05T12:00:00Z",
        "featured": False,
    },
]


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y"}


def money(value: int) -> Decimal:
    return Decimal(value)


def asset_url(cdn_base_url: str, path: str) -> str:
    return f"{cdn_base_url}/{path.lstrip('/')}"


def prune_missing(table: Any, key_name: str, expected_keys: set[str]) -> None:
    for item in table.scan(ProjectionExpression=key_name).get("Items", []):
        key = item.get(key_name)
        if key and key not in expected_keys:
            table.delete_item(Key={key_name: key})


def scan_all(table: Any) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    kwargs: dict[str, Any] = {}
    while True:
        response = table.scan(**kwargs)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            return items
        kwargs["ExclusiveStartKey"] = last_key


def main() -> None:
    dynamodb = boto3.resource("dynamodb")
    services_table = dynamodb.Table(os.environ["TABLE_SERVICES"])
    settings_table = dynamodb.Table(os.environ["TABLE_BUSINESS_SETTINGS"])
    reviews_table = dynamodb.Table(os.environ["TABLE_REVIEWS"])
    portfolio_table = dynamodb.Table(os.environ["TABLE_PORTFOLIO"])
    cdn_base_url = os.environ["CDN_BASE_URL"].rstrip("/")

    is_dev = "-dev-" in services_table.name
    prune_services = env_bool("PRUNE_SEED_SERVICES", default=is_dev)
    seed_demo_reviews = env_bool("SEED_DEMO_REVIEWS", default=is_dev)

    settings_table.put_item(Item=BUSINESS_SETTINGS)

    service_ids = {service["serviceId"] for service in SERVICES}
    if prune_services:
        prune_missing(services_table, "serviceId", service_ids)

    for index, service in enumerate(SERVICES):
        image_path = service["imagePath"]
        image_paths = service.get("imagePaths", [image_path])
        item = {
            "serviceId": service["serviceId"],
            "name": service["name"],
            "category": service["category"],
            "description": service["description"],
            "startingPrice": money(service["startingPrice"]),
            "priceUnit": "cents",
            "durationMinutes": money(service["durationMinutes"]),
            "imageUrl": asset_url(cdn_base_url, image_path),
            "images": [asset_url(cdn_base_url, path) for path in image_paths],
            "featured": service["featured"],
            "active": True,
            "activeKey": "true",
            "bookingCount": money(service["bookingCount"]),
            "displayOrder": money(index),
            "createdAt": "2026-05-14T00:00:00Z",
            "updatedAt": "2026-05-14T00:00:00Z",
        }
        if service.get("subcategory"):
            item["subcategory"] = service["subcategory"]
        if service.get("imagePosition"):
            item["imagePosition"] = service["imagePosition"]
        services_table.put_item(Item=item)

    for index, (style_id, title, category, image_path) in enumerate(PORTFOLIO_ITEMS):
        portfolio_table.put_item(
            Item={
                "styleId": style_id,
                "title": title,
                "category": category,
                "imageUrl": asset_url(cdn_base_url, image_path),
                "thumbnailUrl": asset_url(cdn_base_url, image_path),
                "featured": index < 8,
                "active": True,
                "activeKey": "true",
                "createdAt": f"2026-05-{index + 1:02d}T12:00:00Z",
                "updatedAt": "2026-05-14T00:00:00Z",
            }
        )

    if seed_demo_reviews:
        for review in DEMO_REVIEWS:
            item = {
                **review,
                "rating": Decimal(review["rating"]),
                "approved": True,
                "approvedKey": "true",
                "source": "website",
                "updatedAt": review["createdAt"],
            }
            reviews_table.put_item(Item=item)

    approved_reviews = [
        item
        for item in scan_all(reviews_table)
        if item.get("approved") is True and not str(item.get("reviewId", "")).startswith("AGGREGATE#")
    ]
    total = sum(int(review.get("rating", 0)) for review in approved_reviews)
    count = len(approved_reviews)
    average = Decimal(str(round(total / count, 2))) if count else Decimal(0)
    aggregate = {
        "reviewId": "AGGREGATE#RATINGS",
        "totalCount": Decimal(count),
        "sumRatings": Decimal(total),
        "averageRating": average,
        "updatedAt": "2026-05-14T00:00:00Z",
    }
    reviews_table.put_item(Item=aggregate)


if __name__ == "__main__":
    main()
