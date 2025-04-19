from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.agent_tool import AgentTool
from config import get_settings
from .prompts import agent_global_instruction, agent_instruction, agent_description
from .sub_agents import query_explanation_agent, table_agent, column_selection_agent


AGENT_MODEL = LiteLlm(
    model=get_settings().LLM_MODEL,
    api_key=get_settings().LLM_API_KEY,
)


query_explanation_agent_tool = AgentTool(query_explanation_agent)
table_agent_tool = AgentTool(table_agent)
column_selection_agent_tool = AgentTool(column_selection_agent)


root_agent = Agent(
    name="query_agent",
    model=AGENT_MODEL,
    global_instruction=agent_global_instruction(version=1),
    instruction=agent_instruction(version=1),
    description=agent_description(version=1),
    tools=[
        query_explanation_agent_tool,
        table_agent_tool,
        column_selection_agent_tool,
    ],
)
