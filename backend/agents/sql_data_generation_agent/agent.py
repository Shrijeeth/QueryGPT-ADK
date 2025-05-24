from google.adk.agents import LoopAgent

from .sub_agents import sql_query_generation_agent

root_agent = LoopAgent(
    name="sql_data_generation_agent",
    sub_agents=[
        sql_query_generation_agent,
    ],
    max_iterations=1,
)
