from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.genai import types

from config import get_settings

from .prompts import agent_description, agent_instruction
from .types import SampleQuerySchema

AGENT_MODEL = LiteLlm(
    model=get_settings().SYNTHETIC_DATA_LLM_MODEL,
    api_key=get_settings().SYNTHETIC_DATA_LLM_API_KEY,
    response_format=SampleQuerySchema,
)


root_agent = LlmAgent(
    name="sql_query_generation_agent",
    model=AGENT_MODEL,
    description=agent_description(version=1),
    instruction=agent_instruction(version=1),
    output_key="sql_generated_queries",
    generate_content_config=types.GenerateContentConfig(
        temperature=get_settings().SYNTHETIC_DATA_LLM_TEMPERATURE,
    ),
    output_schema=SampleQuerySchema,
)
