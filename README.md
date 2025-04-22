# QueryGPT-ADK

QueryGPT-ADK is an open-source, multi-agent system for natural language to SQL query generation and explanation. It leverages LLMs and vector search to help users convert natural language questions into SQL queries, explain them, and validate them, making database analytics accessible to everyone.

## Features

- Natural Language to SQL: Converts user questions into SQL queries using LLM-based agents.
- Multi-Agent Architecture: Modular agents for query formation, explanation, table/column selection, and validation.
- Vector Search Integration: Uses Qdrant for semantic search over sample queries and table schemas.
- Validation: Ensures only valid SELECT queries are generated and executed.
- **Production-Ready Security:**
  - Redis-backed rate limiting (per-IP, distributed)
  - Account lockout after repeated failed logins (also Redis-backed)
  - JWT authentication, password hashing, and best-practice error handling
- **Extensible & Modular:**
  - Models organized in `models/`, infra in `infra/`, and all middlewares in `middleware/`
  - Easy to add new agents, tools, or infrastructure
- LLM Provider Flexibility: Supports Gemini (default), Ollama, OpenAI, or any LLM provider by configuring environment variables in `.env`. See `.env.example` for details.
- Sample Data: Includes sample queries and table schemas for demonstration and testing.

## Project Structure

```text
QueryGPT-ADK/
├── backend/
│   ├── agents/           # Multi-agent system implementation
│   ├── scripts/          # Data loading and utility scripts
│   ├── utils/            # Utility modules
│   ├── models/           # Modular SQLAlchemy models
│   ├── infra/            # Infrastructure: database and Redis clients
│   ├── middleware/       # Middlewares: rate limiting, account lockout
│   ├── config.py         # Configuration and environment management
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
├── frontend/             # (Currently empty, for future UI)
├── README.md
├── Makefile
└── .gitignore
```

## Alembic Migrations, Linting, and Formatting

- Database schema changes are managed using Alembic migrations. See `alembic/` for migration scripts.
- Code is formatted and linted using `ruff`. Run `make lint` and `make format` to check and auto-fix code style.

## Installation

### Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- [MySQL database](https://www.mysql.com/) (for query validation)
- [Qdrant](https://qdrant.tech/) vector database
- [Redis](https://redis.io/) (for rate limiting and account lockout)
- (Optional) [Gemini](https://aistudio.google.com/), [Ollama](https://ollama.com/), [OpenAI](https://platform.openai.com/), or any other LLM API (configurable via `.env`)

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

Edit `.env` and set your database and Redis URLs as needed. Example:

```text
POSTGRES_DB_URL=postgresql+asyncpg://user:password@localhost:5432/querygpt
REDIS_URL=redis://localhost:6379/1
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

6. (Optional) Use Your Own Data:

To use QueryGPT-ADK with your own data, replace the provided `sample_queries.json` and `tables.json` files in the `backend/scripts/data/` directory with your own files. Make sure your files follow the same structure as the samples. Then, rerun the data loading scripts:

```bash
python scripts/add_table_schemas.py
python scripts/add_sample_queries_qdrant.py
```

#### Data File Structure

- **sample_queries.json**
  - Contains a list of example queries for your database.
  - Each entry should have a `description`, `query`, and `type`.
  - Example:

    ```json
    {
      "data": [
        {
          "description": "Check current stock balance",
          "query": "SELECT * FROM stock_balance",
          "type": "SAMPLE_QUERY"
        },
        {
          "description": "Monthly purchase summary",
          "query": "SELECT ...",
          "type": "SAMPLE_QUERY"
        }
      ]
    }
    ```

- **tables.json**
  - Contains a list of tables (or views) and their schemas.
  - Each entry should have a `name`, `description`, `schema`, and `type` (usually `TABLE`).
  - Example:

    ```json
    {
      "data": [
        {
          "name": "medicines",
          "description": "Stores information about each medicine.",
          "schema": "CREATE TABLE medicines (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, ...);",
          "type": "TABLE"
        },
        {
          "name": "stock_credit",
          "description": "When stock is added (purchase or restock).",
          "schema": "CREATE TABLE stock_credit (id SERIAL PRIMARY KEY, ...);",
          "type": "TABLE"
        }
      ]
    }
    ```

Ensure your files follow the above structure for successful data loading and agent operation.

## Usage

The application is designed to be integrated into a Google ADK, FastAPI, or Streamlit app (frontend coming soon). You can interact with the agents programmatically or extend the project for your use case.

### Authentication & API Usage

- The `/query` endpoint requires a Bearer token for authentication. Obtain a token from `/token` using username/password (see `fake_users_db` in `auth.py` for default credentials).

**Example: Obtain Token and Query (using curl)**

```bash
# Get access token
curl -X POST "http://localhost:8000/token" -d "username=testuser&password=secret"
# Use the returned access_token for authenticated query
curl -X POST "http://localhost:8000/query" -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" -d '{"query": "Show me the top 5 medicines by usage"}'
```

### Launching ADK Web UI

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
- `query_formation_agent`: Generates SQL queries based on the user input and available tables and columns.
- `query_validation_agent`: Validates the generated SQL queries for correctness and safety.

## Tools

- `get_similar_queries_tool`: Retrieves similar queries from the Qdrant database based on the user input.
- `get_similar_tables_tool`: Retrieves similar tables from the Qdrant database based on the user input.
- `validate_sql_query_tool`: Validates the generated SQL query.

## Demo

Watch the demo video below to see QueryGPT-ADK in action:

[![Watch the demo](https://img.youtube.com/vi/CqprPES6tks/0.jpg)](https://youtu.be/CqprPES6tks)

## Roadmap

### Streamlit UI

- Build a Streamlit app for natural-language-to-SQL interactions.
- Provide a text input for user queries and display generated SQL queries.
- Execute SQL queries and render results as interactive tables.
- Add a sidebar for query history, filters, and parameter controls.
- Utilize Streamlit caching and session state for performance and UX.

### FastAPI Backend

- Develop REST API endpoints for query submission, execution, and validation.
- Implement CORS, rate limiting, and token-based authentication.
- Establish database connectivity and connection pooling.
- Provide interactive OpenAPI documentation via Swagger UI.
- Write unit and integration tests for API endpoints.

### BYOK & Model Provider Support

- Add support for BYOK (Bring Your Own Key/Model) to allow users to plug in their preferred LLM provider (e.g., OpenAI, Gemini, Ollama, Azure, local models, etc.).
- Provide a configuration interface for selecting and managing model providers.
- Ensure compatibility with multiple model APIs and authentication mechanisms.
- Add documentation and examples for integrating new model providers.

### Importing Custom Databases

- Build a flexible importer to support connecting and importing schemas from various custom databases (e.g., PostgreSQL, SQLite, Oracle, etc.).
- Provide a UI and/or CLI for users to add new database connections.
- Auto-detect and map table schemas and relationships from imported databases.
- Validate and test queries on imported/custom databases.

### Importing Custom Vector Databases

- Add support for connecting to and importing from various vector databases (e.g., Pinecone, Weaviate, Milvus, Chroma, etc.).
- Provide configuration and interface for users to add/manage vector DB connections.
- Enable schema and collection import for semantic search and retrieval.
- Ensure integration of custom vector DBs with agentic workflow and query tools.

### Testing

- Write test cases for agentic workflow (end-to-end and agent interaction tests).

## Contribution & Extending Agents

Contributions are welcome! The agent system is modular. New agents and tools can be added by following the existing pattern in `backend/agents/`. Please open issues or submit pull requests for bug fixes, new features, or improvements.

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
