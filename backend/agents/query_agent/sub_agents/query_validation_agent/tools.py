from google.adk.tools import FunctionTool
from mysql.connector import Error as MySQLError
from psycopg2 import Error as PostgresError

from config import get_settings
from utils.helpers import (
    get_validate_db_mysql_connection,
    get_validate_db_postgres_connection,
)


def validate_sql_query_mysql(query: str) -> tuple[dict, object]:
    conn, cursor = get_validate_db_mysql_connection()
    query_type = query.strip().split()[0].upper()

    if query_type == "SELECT":
        try:
            cursor.execute(f"EXPLAIN {query}")
            return {"valid": "true", "error": ""}, conn
        except MySQLError as e:
            return {"valid": "false", "error": str(e)}, conn
    else:
        return {"valid": "false", "error": "Only SELECT statements are allowed"}, conn


def validate_sql_query_postgres(query: str) -> tuple[dict, object]:
    conn, cursor = get_validate_db_postgres_connection()
    query_type = query.strip().split()[0].upper()

    if query_type == "SELECT":
        try:
            cursor.execute(f"EXPLAIN {query}")
            return {"valid": "true", "error": ""}, conn
        except PostgresError as e:
            return {"valid": "false", "error": str(e)}, conn
    else:
        return {"valid": "false", "error": "Only SELECT statements are allowed"}, conn


def validate_sql_query(query: str) -> dict:
    """
    Validates a SQL query by attempting to execute it safely.
    It is used to validate the generated query by the query formation agent.
    Only SELECT statements are validated.

    Args:
        query (str): The SQL query to validate

    Returns:
        dict: A dictionary containing the validation result (valid: bool) and error message (error: str)
    """
    conn = None
    try:
        if get_settings().VALIDATE_DB_TYPE == "mysql":
            result, conn = validate_sql_query_mysql(query)
        elif get_settings().VALIDATE_DB_TYPE == "postgresql":
            result, conn = validate_sql_query_postgres(query)
        else:
            return {"valid": "false", "error": "Unsupported database type"}
        return result
    except Exception as e:
        return {"valid": "false", "error": str(e)}
    finally:
        if conn:
            conn.close()


validate_sql_query_tool = FunctionTool(
    func=validate_sql_query,
)
