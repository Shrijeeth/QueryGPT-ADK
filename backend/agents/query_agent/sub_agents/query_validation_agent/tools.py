import mysql.connector
import psycopg2
from config import get_settings
from google.adk.tools import FunctionTool
from mysql.connector import Error as MySQLError
from psycopg2 import Error as PostgresError


def validate_sql_query_mysql(query: str) -> dict:
    conn = mysql.connector.connect(
        host=get_settings().VALIDATE_DB_HOST,
        port=get_settings().VALIDATE_DB_PORT,
        user=get_settings().VALIDATE_DB_USER,
        password=get_settings().VALIDATE_DB_PASSWORD,
        database=get_settings().VALIDATE_DB_DATABASE,
        autocommit=False,
    )
    cursor = conn.cursor()
    query_type = query.strip().split()[0].upper()

    if query_type == "SELECT":
        try:
            cursor.execute(f"EXPLAIN {query}")
            conn.close()
            return {"valid": "true", "error": ""}
        except MySQLError as e:
            conn.close()
            return {"valid": "false", "error": str(e)}
    else:
        conn.close()
        return {"valid": "false", "error": "Only SELECT statements are allowed"}


def validate_sql_query_postgres(query: str) -> dict:
    conn = psycopg2.connect(
        host=get_settings().VALIDATE_DB_HOST,
        port=get_settings().VALIDATE_DB_PORT,
        user=get_settings().VALIDATE_DB_USER,
        password=get_settings().VALIDATE_DB_PASSWORD,
        database=get_settings().VALIDATE_DB_DATABASE,
    )
    cursor = conn.cursor()
    query_type = query.strip().split()[0].upper()

    if query_type == "SELECT":
        try:
            cursor.execute(f"EXPLAIN {query}")
            conn.close()
            return {"valid": "true", "error": ""}
        except PostgresError as e:
            conn.close()
            return {"valid": "false", "error": str(e)}
    else:
        conn.close()
        return {"valid": "false", "error": "Only SELECT statements are allowed"}


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
    try:
        if get_settings().VALIDATE_DB_TYPE == "mysql":
            return validate_sql_query_mysql(query)
        elif get_settings().VALIDATE_DB_TYPE == "postgresql":
            return validate_sql_query_postgres(query)
        else:
            return {"valid": "false", "error": "Unsupported database type"}
    except Exception as e:
        return {"valid": "false", "error": str(e)}


validate_sql_query_tool = FunctionTool(
    func=validate_sql_query,
)
