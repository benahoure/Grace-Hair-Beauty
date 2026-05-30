from __future__ import annotations

from aws_lambda_powertools.utilities.typing import LambdaContext

from common.config import get_config
from common.dynamo import active_filter, bool_filter, scan_items
from common.http import method, query_params
from common.logger import logger
from common.response import bad_request, internal_error, ok, options

VALID_CATEGORIES = {"african-braids", "natural", "sew-in", "men", "kids"}


@logger.inject_lambda_context(log_event=False)
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    if method(event) == "OPTIONS":
        return options()
    try:
        params = query_params(event)
        category = params.get("category")
        featured = params.get("featured")
        if category and category not in VALID_CATEGORIES:
            return bad_request("Invalid service category.")

        filter_expression = active_filter()
        if featured == "true":
            filter_expression = filter_expression & bool_filter("featured", True)
        items, _ = scan_items(get_config().table_services, filter_expression=filter_expression, limit=100)
        if category:
            items = [item for item in items if item.get("category") == category]
        return ok(
            {"services": sorted(items, key=lambda item: item.get("name", ""))},
            cache_control="public, max-age=300",
        )
    except Exception:
        logger.exception("Failed to fetch services")
        return internal_error()
