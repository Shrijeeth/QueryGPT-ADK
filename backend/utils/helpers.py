import json
import re

import mysql.connector
import psycopg2

from config import get_settings


def parse_json(json_str: str) -> dict | None:
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


def parse_json_markdown(json_str: str) -> dict | None:
    try:
        cleaned = re.sub(r"```json|^```|```$", "", json_str.strip(), flags=re.MULTILINE)
        return parse_json(cleaned.strip())
    except json.JSONDecodeError:
        return None


def get_validate_db_mysql_connection() -> tuple[object, object]:
    conn = mysql.connector.connect(
        host=get_settings().VALIDATE_DB_HOST,
        port=get_settings().VALIDATE_DB_PORT,
        user=get_settings().VALIDATE_DB_USER,
        password=get_settings().VALIDATE_DB_PASSWORD,
        database=get_settings().VALIDATE_DB_DATABASE,
        autocommit=False,
    )
    cursor = conn.cursor()
    return conn, cursor


def get_validate_db_postgres_connection() -> tuple[object, object]:
    conn = psycopg2.connect(
        host=get_settings().VALIDATE_DB_HOST,
        port=get_settings().VALIDATE_DB_PORT,
        user=get_settings().VALIDATE_DB_USER,
        password=get_settings().VALIDATE_DB_PASSWORD,
        database=get_settings().VALIDATE_DB_DATABASE,
    )
    cursor = conn.cursor()
    return conn, cursor
