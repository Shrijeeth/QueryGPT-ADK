import asyncio
import json
import os

from agents.sql_data_generation_agent.agent import root_agent
from google.adk import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from utils.helpers import parse_json_markdown


async def main():
    tables_file = os.path.join(os.path.dirname(__file__), "data", "tables.json")
    with open(tables_file, "r") as f:
        tables = json.load(f)

    sample_queries = []
    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="sql_data_generation_agent",
        user_id="user",
        session_id="user-session",
    )
    runner = Runner(
        agent=root_agent,
        session_service=session_service,
        app_name="sql_data_generation_agent",
    )
    content = types.Content(
        role="user",
        parts=[
            types.Part(
                text="Generate sample queries for the following database:\n"
                + "\n".join([str(table) for table in tables["data"]])
            )
        ],
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
    sample_queries = final_response["sample_queries"]
    data = []
    for query in sample_queries:
        data.append(
            {
                "query": query["query"],
                "description": query["description"],
                "type": "SAMPLE_QUERY",
            }
        )

    output = {"data": data}
    with open(
        os.path.join(os.path.dirname(__file__), "data", "sample_queries.json"), "w"
    ) as f:
        json.dump(output, f, indent=4)
    print(
        f"Wrote {len(data)} sample queries to {os.path.join(os.path.dirname(__file__), 'data', 'sample_queries.json')}"
    )


if __name__ == "__main__":
    asyncio.run(main())
