from typing import AsyncGenerator

from config import get_settings
from google.adk.agents import BaseAgent, LoopAgent, SequentialAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.agent_tool import AgentTool

from .sub_agents import (
    column_selection_agent,
    query_explanation_agent,
    query_formation_agent,
    query_validation_agent,
    table_agent,
)

AGENT_MODEL = LiteLlm(
    model=get_settings().LLM_MODEL,
    api_key=get_settings().LLM_API_KEY,
)


query_explanation_agent_tool = AgentTool(query_explanation_agent)
table_agent_tool = AgentTool(table_agent)
column_selection_agent_tool = AgentTool(column_selection_agent)
query_formation_agent_tool = AgentTool(query_formation_agent)


# root_agent = Agent(
#     name="query_agent",
#     model=AGENT_MODEL,
#     global_instruction=agent_global_instruction(version=1),
#     instruction=agent_instruction(version=1),
#     description=agent_description(version=1),
#     # tools=[
#     #     query_explanation_agent_tool,
#     #     table_agent_tool,
#     #     column_selection_agent_tool,
#     #     query_formation_agent_tool,
#     # ],
#     sub_agents=[
#         query_explanation_agent,
#         table_agent,
#         column_selection_agent,
#         query_formation_agent,
#     ],
# )

sequential_agent = SequentialAgent(
    name="query_generator_agent",
    sub_agents=[
        query_explanation_agent,
        table_agent,
        column_selection_agent,
        query_formation_agent,
    ],
)


class ValidateQueryStatusCheck(BaseAgent):
    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        status = ctx.session.state.get("validation_result", "")
        should_stop = (
            ("valid" in status)
            and ("error" in status)
            and ('"valid": "true"' in status)
        )
        yield Event(
            author=self.name,
            actions=EventActions(
                escalate=should_stop,
            ),
        )


root_agent = LoopAgent(
    name="query_agent",
    sub_agents=[
        sequential_agent,
        query_validation_agent,
        ValidateQueryStatusCheck(name="validate_query_status_check"),
    ],
    max_iterations=3,
)
