# QueryGPT-ADK

QueryGPT-ADK is an open-source, multi-agent system for natural language to SQL query generation and explanation. It leverages LLMs and vector search to help users convert natural language questions into SQL queries, explain them, and validate them, making database analytics accessible to everyone.

## Features

- Natural Language to SQL: Converts user questions into SQL queries using LLM-based agents.
- Multi-Agent Architecture: Modular agents for query formation, explanation, table/column selection, and validation.
- Vector Search Integration: Uses Qdrant for semantic search over sample queries and table schemas.
- Validation: Ensures only valid SELECT queries are generated and executed.
- Extensible: Built with FastAPI, Pydantic, and Google ADK which supports easy addition of new agents and tools.
- Sample Data: Includes sample queries and table schemas for demonstration and testing.

## Project Structure

```text
QueryGPT-ADK/
├── backend/
│   ├── agents/           # Multi-agent system implementation
│   ├── scripts/          # Data loading and utility scripts
│   ├── utils/            # Utility modules
│   ├── config.py         # Configuration and environment management
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
├── frontend/             # (Currently empty, for future UI)
├── README.md
├── Makefile
└── .gitignore
```

## Installation

### Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- [MySQL database](https://www.mysql.com/) (for query validation)
- [Qdrant](https://qdrant.tech/) vector database
- (Optional) [Gemini](https://aistudio.google.com/) or [Ollama](https://ollama.com/) or any other LLM API

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Shrijeeth/QueryGPT-ADK.git
cd QueryGPT-ADK
```

2. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

3. Set up environment variables:

```bash
cd backend
cp .env.example .env
```

4. Clear Qdrant database (Optional):

```bash
cd backend
python scripts/clear_vector_db.py
```

5. Load db data into Qdrant:

```bash
cd backend
python scripts/add_table_schemas.py
python scripts/add_sample_queries_qdrant.py
```

## Usage

The application is designed to be integrated into a Google ADK or FastAPI or Streamlit app (frontend coming soon). You can interact with the agents programmatically or extend the project for your use case.

1. Launch the ADK Web UI

    From the parent directory of your agent project (e.g. QueryGPT-ADK/):

    ```bash
    cd backend
    adk web agents
    ```

    - Open the URL provided in the terminal (usually [http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)) in your browser.
    - In the top-left corner, select your agent (e.g., query_agent) from the dropdown.
    - Chat with your agent using the textbox, inspect function calls, and view responses.

2. Run your Agent from the CLI

    You can run your agent directly in the terminal:

    ```bash
    cd backend
    adk run agents/query_agent
    ```

    Use `Ctrl+C` to exit the agent from the terminal.

3. Start a Local API Server

    To expose your agent as a FastAPI server for local development and integration:

    ```bash
    cd backend
    adk api_server agents
    ```

    This will start a FastAPI server (by default on port 8000), allowing you to send HTTP requests to your agent.

4. Programmatic Interaction in Python

    You can also invoke your agent programmatically:

    ```python
    from agents.query_agent.agent import root_agent

    response = root_agent.run(user_input="Show me the top 5 medicines by usage")
    print(response)
    ```

## Agents Overview

- `query_agent`: Delegates tasks to sub-agents for query formation, explanation, table, and column selection.
- `query_explanation_agent`: Finds and explains similar queries related to the user input.
- `table_agent`: Identifies relevant tables based on the user input.
- `column_selection_agent`: Selects appropriate columns for the query.
- `query_formation_agent`: Generates and validates SQL queries based on the user input and available tables and columns.

## Tools

- `get_similar_queries_tool`: Retrieves similar queries from the Qdrant database based on the user input.
- `get_table_tool`: Retrieves table names from the Qdrant database based on the user input.
- `validate_sql_query_tool`: Validates the generated SQL query.

## Contribution

Contributions are welcome! Please open issues or submit pull requests for bug fixes, new features, or improvements.

1. Fork the repository.
2. Create your feature branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -am 'Add new feature').
4. Push to the branch (git push origin feature/your-feature).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Google ADK](https://github.com/google/adk-python)
- [MySQL](https://www.mysql.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Qdrant](https://qdrant.tech/)
- [Pydantic](https://docs.pydantic.dev/)
- [LiteLLM](https://github.com/BerriAI/litellm)
