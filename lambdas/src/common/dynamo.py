from __future__ import annotations

import base64
import json
from decimal import Decimal
from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from common.errors import NotFoundError

_resource = boto3.resource("dynamodb")


def _table(table_name: str):
    return _resource.Table(table_name)


def to_json_safe(value: Any) -> Any:
    if isinstance(value, list):
        return [to_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json_safe(item) for key, item in value.items()}
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    return value


def encode_cursor(key: dict[str, Any] | None) -> str | None:
    if not key:
        return None
    return base64.urlsafe_b64encode(json.dumps(to_json_safe(key)).encode("utf-8")).decode("utf-8")


def decode_cursor(cursor: str | None) -> dict[str, Any] | None:
    if not cursor:
        return None
    try:
        decoded = json.loads(base64.urlsafe_b64decode(cursor.encode("utf-8")).decode("utf-8"))
        if not isinstance(decoded, dict):
            raise ValueError("Invalid pagination cursor.")
        return decoded
    except (ValueError, json.JSONDecodeError) as exc:
        raise ValueError("Invalid pagination cursor.") from exc


def put_item(table_name: str, item: dict[str, Any]) -> None:
    _table(table_name).put_item(Item=item)


def get_item(table_name: str, key: dict[str, Any]) -> dict[str, Any] | None:
    response = _table(table_name).get_item(Key=key)
    item = response.get("Item")
    return to_json_safe(item) if item else None


def delete_item(table_name: str, key: dict[str, Any]) -> None:
    _table(table_name).delete_item(Key=key)


def scan_items(
    table_name: str,
    *,
    filter_expression: Any | None = None,
    limit: int = 100,
    cursor: str | None = None,
) -> tuple[list[dict[str, Any]], str | None]:
    kwargs: dict[str, Any] = {"Limit": min(limit, 100)}
    if filter_expression is not None:
        kwargs["FilterExpression"] = filter_expression
    exclusive_start_key = decode_cursor(cursor)
    if exclusive_start_key:
        kwargs["ExclusiveStartKey"] = exclusive_start_key

    response = _table(table_name).scan(**kwargs)
    return to_json_safe(response.get("Items", [])), encode_cursor(response.get("LastEvaluatedKey"))


def scan_all_items(table_name: str, *, filter_expression: Any | None = None) -> list[dict[str, Any]]:
    """Read every page of a scan. Never truncates.

    A single scan page reads at most 100 items (and at most 1 MB) *before* the
    filter is applied, so one page silently drops rows once a table outgrows it.
    Only use this for tables whose size is bounded by the business itself
    (service catalog, portfolio, moderated reviews/messages); time-series data
    such as appointments must be queried by key range instead.
    """
    items: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        page, cursor = scan_items(table_name, filter_expression=filter_expression, limit=100, cursor=cursor)
        items.extend(page)
        if not cursor:
            return items


def query_index(
    table_name: str,
    index_name: str,
    pk_name: str,
    pk_value: Any,
    *,
    range_condition: Any | None = None,
    limit: int = 50,
    cursor: str | None = None,
    scan_index_forward: bool = False,
) -> tuple[list[dict[str, Any]], str | None]:
    key_condition = Key(pk_name).eq(pk_value)
    if range_condition is not None:
        key_condition = key_condition & range_condition
    kwargs: dict[str, Any] = {
        "IndexName": index_name,
        "KeyConditionExpression": key_condition,
        "Limit": min(limit, 100),
        "ScanIndexForward": scan_index_forward,
    }
    exclusive_start_key = decode_cursor(cursor)
    if exclusive_start_key:
        kwargs["ExclusiveStartKey"] = exclusive_start_key
    response = _table(table_name).query(**kwargs)
    return to_json_safe(response.get("Items", [])), encode_cursor(response.get("LastEvaluatedKey"))


def query_all_index(
    table_name: str,
    index_name: str,
    pk_name: str,
    pk_value: Any,
    *,
    range_condition: Any | None = None,
    scan_index_forward: bool = True,
) -> list[dict[str, Any]]:
    """Read every page of an index query. Never truncates.

    Callers must bound the read with ``range_condition`` (e.g. one month of
    dates) unless the partition itself is known to stay small.
    """
    items: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        page, cursor = query_index(
            table_name,
            index_name,
            pk_name,
            pk_value,
            range_condition=range_condition,
            limit=100,
            cursor=cursor,
            scan_index_forward=scan_index_forward,
        )
        items.extend(page)
        if not cursor:
            return items


def update_item(table_name: str, key: dict[str, Any], updates: dict[str, Any]) -> dict[str, Any]:
    expression_names = {f"#{name}": name for name in updates}
    expression_values = {f":{name}": value for name, value in updates.items()}
    update_expression = "SET " + ", ".join(f"#{name} = :{name}" for name in updates)
    try:
        response = _table(table_name).update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_names,
            ExpressionAttributeValues=expression_values,
            ConditionExpression=Attr(list(key.keys())[0]).exists(),
            ReturnValues="ALL_NEW",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise NotFoundError("Resource not found.") from exc
        raise
    return to_json_safe(response["Attributes"])


def update_item_with_removes(
    table_name: str,
    key: dict[str, Any],
    updates: dict[str, Any],
    remove_fields: list[str],
) -> dict[str, Any]:
    """Run SET for non-null fields and REMOVE for explicitly-nulled fields in one call."""
    expression_parts: list[str] = []
    expression_names: dict[str, str] = {}
    expression_values: dict[str, Any] = {}

    if updates:
        expression_names.update({f"#{name}": name for name in updates})
        expression_values.update({f":{name}": value for name, value in updates.items()})
        expression_parts.append("SET " + ", ".join(f"#{name} = :{name}" for name in updates))

    if remove_fields:
        expression_names.update({f"#{name}": name for name in remove_fields})
        expression_parts.append("REMOVE " + ", ".join(f"#{name}" for name in remove_fields))

    update_expression = " ".join(expression_parts)
    try:
        kwargs: dict[str, Any] = {
            "Key": key,
            "UpdateExpression": update_expression,
            "ConditionExpression": Attr(list(key.keys())[0]).exists(),
            "ReturnValues": "ALL_NEW",
        }
        if expression_names:
            kwargs["ExpressionAttributeNames"] = expression_names
        if expression_values:
            kwargs["ExpressionAttributeValues"] = expression_values
        response = _table(table_name).update_item(**kwargs)
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise NotFoundError("Resource not found.") from exc
        raise
    return to_json_safe(response["Attributes"])


def append_list_item(table_name: str, key: dict[str, Any], attribute: str, value: Any) -> dict[str, Any]:
    try:
        response = _table(table_name).update_item(
            Key=key,
            UpdateExpression="SET #attr = list_append(if_not_exists(#attr, :empty), :new)",
            ExpressionAttributeNames={"#attr": attribute},
            ExpressionAttributeValues={":new": [value], ":empty": []},
            ConditionExpression=Attr(list(key.keys())[0]).exists(),
            ReturnValues="ALL_NEW",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise NotFoundError("Resource not found.") from exc
        raise
    return to_json_safe(response["Attributes"])


def active_filter():
    return Attr("active").eq(True) | Attr("active").eq("true")


def bool_filter(attribute: str, value: bool):
    return Attr(attribute).eq(value) | Attr(attribute).eq(str(value).lower())
