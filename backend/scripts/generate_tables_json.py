import asyncio
import os

from google.adk import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from agents.sql_table_describer_agent.agent import root_agent
from config import get_settings
from utils.helpers import (
    get_validate_db_mysql_connection,
    get_validate_db_postgres_connection,
    parse_json_markdown,
)


async def main():
    db_type = get_settings().VALIDATE_DB_TYPE
    if db_type == "mysql":
        conn, cursor = get_validate_db_mysql_connection()
        cursor.execute(
            "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE' OR Table_type = 'VIEW';"
        )
        tables = cursor.fetchall()
        data = []
        for row in tables:
            name = row[0]
            ttype = row[1].upper()
            cursor.execute(f"SHOW CREATE TABLE `{name}`;")
            create_stmt = cursor.fetchone()[1]
            data.append(
                {
                    "name": name,
                    "description": "",
                    "schema": create_stmt,
                    "type": "TABLE" if ttype == "BASE TABLE" else "VIEW",
                }
            )
        # Extract ENUMs from information_schema.columns
        cursor.execute(
            """
            SELECT DISTINCT column_type
            FROM information_schema.columns
            WHERE table_schema = %s AND data_type = 'enum';
        """,
            (get_settings().VALIDATE_DB_DATABASE,),
        )
        enums = cursor.fetchall()
        seen = set()
        for (enum_def,) in enums:
            # enum_def is like: enum('value1','value2',...)
            if enum_def in seen:
                continue
            seen.add(enum_def)
            enum_name = enum_def  # MySQL enums don't have separate type names
            create_stmt = f"CREATE TYPE {enum_name}"
            data.append(
                {
                    "name": enum_name,
                    "description": "",
                    "schema": create_stmt,
                    "type": "ENUM",
                }
            )
    elif db_type == "postgresql":
        conn, cursor = get_validate_db_postgres_connection()
        # Get tables and views
        cursor.execute("""
            SELECT table_name, 'TABLE' as type FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            UNION
            SELECT table_name, 'VIEW' as type FROM information_schema.views 
            WHERE table_schema = 'public';
        """)
        tables = cursor.fetchall()
        data = []
        for name, ttype in tables:
            if ttype == "TABLE":
                # Gather columns
                cursor.execute(
                    """
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = %s
                    ORDER BY ordinal_position;
                """,
                    (name,),
                )
                columns = cursor.fetchall()
                col_lines = []
                for col_name, data_type, is_nullable, col_default in columns:
                    line = f"    {col_name} {data_type}"
                    if col_default:
                        line += f" DEFAULT {col_default}"
                    if is_nullable == "NO":
                        line += " NOT NULL"
                    col_lines.append(line)
                create_stmt = (
                    f"CREATE TABLE {name} (\n" + ",\n".join(col_lines) + "\n);"
                )
            else:
                cursor.execute("SELECT pg_get_viewdef(%s, true);", (name,))
                view_def = cursor.fetchone()[0]
                create_stmt = f"CREATE VIEW {name} AS {view_def}"
            data.append(
                {
                    "name": name,
                    "description": "",
                    "schema": create_stmt,
                    "type": "TABLE",
                }
            )
        # Extract ENUM types
        cursor.execute("""
            SELECT t.typname, string_agg(e.enumlabel, ',') AS enum_values
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            GROUP BY t.typname;
        """)
        enums = cursor.fetchall()
        for enum_name, values in enums:
            value_list = ", ".join([f"'{v}'" for v in values.split(",")])
            create_stmt = f"CREATE TYPE {enum_name} AS ENUM ({value_list});"
            data.append(
                {
                    "name": enum_name,
                    "description": "",
                    "schema": create_stmt,
                    "type": "TABLE",
                }
            )
    else:
        raise ValueError("Unsupported database type")

    # Setup ADK session
    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="sql_table_describer_agent",
        user_id="user",
        session_id="user-session",
    )
    runner = Runner(
        agent=root_agent,
        app_name="sql_table_describer_agent",
        session_service=session_service,
    )
    content = types.Content(
        role="user",
        parts=[types.Part(text="".join([table["schema"] for table in data]))],
    )
    events = runner.run_async(
        user_id="user",
        session_id="user-session",
        new_message=content,
    )
    async for event in events:
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text
    final_response = parse_json_markdown(final_response)
    if not final_response:
        raise ValueError("Failed to parse JSON response")
    table_descriptions: list[dict] = final_response["table_descriptions"]
    if len(table_descriptions) != len(data):
        print("Number of table descriptions does not match number of tables")
    for table in data:
        desc = list(
            filter(lambda x: x["table_name"] == table["name"], table_descriptions)
        )
        if not desc:
            print(f"Table {table['name']} not found in table descriptions")
            continue
        table["description"] = desc[0]["description"]

    # Write to tables.json
    output = {"data": data}
    out_path = os.path.join(os.path.dirname(__file__), "data", "tables.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        import json

        json.dump(output, f, indent=4)
    print(f"Wrote schema for {len(data)} tables/views to {out_path}")
    conn.close()
    cursor.close()


if __name__ == "__main__":
    asyncio.run(main())
