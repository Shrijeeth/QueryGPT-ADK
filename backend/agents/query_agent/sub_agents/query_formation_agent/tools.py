import mysql.connector
from mysql.connector import Error
from google.adk.tools import FunctionTool
from config import get_settings


def validate_sql_query(query: str) -> dict:
    """
    Validates a SQL query by attempting to execute it safely.
    It is used to validate the generated query by the query formation agent.
    Only SELECT statements are validated.

    Args:
        query (str): The MySQL query to validate

    Returns:
        dict: A dictionary containing the validation result (valid: bool) and error message (error: str)
    """
    conn = None
    try:
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
                return {"valid": True, "error": None}
            except Error as e:
                return {"valid": False, "error": str(e)}
        else:
            return {"valid": False, "error": "Only SELECT statements are allowed"}
    except Error as e:
        return {"valid": False, "error": str(e)}
    finally:
        if conn:
            conn.close()

validate_sql_query_tool = FunctionTool(
    func=validate_sql_query,
)