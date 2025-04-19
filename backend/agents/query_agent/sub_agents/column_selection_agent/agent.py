from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from config import get_settings
from .prompts import agent_description, agent_instruction


AGENT_MODEL = LiteLlm(
    model=get_settings().LLM_MODEL,
    api_key=get_settings().LLM_API_KEY,
)


root_agent = LlmAgent(
    name="column_selection_agent",
    model=AGENT_MODEL,
    description=agent_description(version=1),
    instruction=agent_instruction(version=1),
    output_key="selected_columns",
)
