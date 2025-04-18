from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from config import get_settings
from .prompts import agent_global_instruction, agent_instruction, agent_description
from .sub_agents import query_explanation_agent, table_agent


AGENT_MODEL = LiteLlm(
    model=get_settings().LLM_MODEL,
    api_key=get_settings().LLM_API_KEY,
)


root_agent = Agent(
    name="query_agent",
    model=AGENT_MODEL,
    global_instruction=agent_global_instruction(version=1),
    instruction=agent_instruction(version=1),
    description=agent_description(version=1),
    sub_agents=[
        query_explanation_agent,
        table_agent,
    ],
)
