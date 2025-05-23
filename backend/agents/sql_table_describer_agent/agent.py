from google.adk.agents import LoopAgent

from .sub_agents import table_count_check_agent, table_description_agent

root_agent = LoopAgent(
    name="sql_table_describer_agent",
    sub_agents=[
        table_description_agent,
        table_count_check_agent,
    ],
    max_iterations=3,
)
