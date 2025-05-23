from typing import AsyncGenerator

from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions


class ValidateTableCount(BaseAgent):
    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        try:
            table_descriptions = ctx.session.state.get("sql_table_description", "")
            input_query = ctx.session.events[-1].content.parts[0].text
            input_tables_count = len(input_query.strip().split(";"))
            table_descriptions_count = len(table_descriptions["table_descriptions"])
            should_stop = input_tables_count == table_descriptions_count
            yield Event(
                author=self.name,
                actions=EventActions(
                    escalate=should_stop,
                ),
            )
        except Exception as e:
            print("Exception: ", e)
            yield Event(
                author=self.name,
                actions=EventActions(
                    escalate=False,
                ),
            )


root_agent = ValidateTableCount(name="validate_table_count")
