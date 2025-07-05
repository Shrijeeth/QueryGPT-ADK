from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.genai import types

from config import get_settings

from .prompts import agent_description, agent_instruction

AGENT_MODEL = LiteLlm(
    model=get_settings().LLM_MODEL,
    api_key=get_settings().LLM_API_KEY,
)


root_agent = LlmAgent(
    name="query_formation_agent",
    model=AGENT_MODEL,
    description=agent_description(version=1),
    instruction=agent_instruction(version=2),
    output_key="generated_query",
    generate_content_config=types.GenerateContentConfig(
        temperature=get_settings().LLM_TEMPERATURE,
    ),
)
