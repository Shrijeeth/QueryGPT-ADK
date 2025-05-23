# QueryGPT-ADK

QueryGPT-ADK is an open-source, multi-agent system for natural language to SQL query generation and explanation. It leverages LLMs and vector search to help users convert natural language questions into SQL queries, explain them, and validate them, making database analytics accessible to everyone.

## 🚀 Demo

*QueryGPT-ADK in action:*

- Enter a natural language question (e.g., "Show me the top 5 medicines by usage")
- Authenticate via registration/login
- See the generated SQL, explanation, and results
- Handles rate limiting, account lockout, and error responses

➡️ **Watch the demo video below to see QueryGPT-ADK in action:**

[![Watch the demo](https://img.youtube.com/vi/CqprPES6tks/0.jpg)](https://youtu.be/CqprPES6tks)

➡️ **See [Usage Examples](#usage-examples) below for API calls and more!**

## Features

- Natural Language to SQL: Converts user questions into SQL queries using LLM-based agents.
- Multi-Agent Architecture: Modular agents for query formation, explanation, table/column selection, and validation.
- **Automatic Schema Extraction & Table Description:**
  - New agent (`sql_table_describer_agent`) for extracting and describing SQL table schemas, including sub-agents for table-level tasks.
  - Includes a script to auto-generate JSON documentation of all tables, views, and enums from your database (`generate_tables_json.py`).
- Robust SQL Query Validation: Ensures only valid SELECT statements are executed, supporting both MySQL and PostgreSQL.

- Vector Search Integration: Uses Qdrant for semantic search over sample queries and table schemas.
- Validation: Ensures only valid SELECT queries are generated and executed.
- **Production-Ready Security:**
  - Redis-backed rate limiting (per-IP, distributed)
  - Account lockout after repeated failed logins (also Redis-backed)
  - JWT authentication, password hashing, and best-practice error handling
- **Extensible & Modular:**
  - Models organized in `models/`, infra in `infra/`, and all middlewares in `middleware/`
  - Easy to add new agents, tools, or infrastructure
- **Next.js UI:**
  - Built with Next.js and TypeScript
  - Provides a user-friendly interface for entering queries and viewing generated SQL and results
  - Interactive UI for entering and submitting natural language queries to various databases.
- LLM Provider Flexibility: Supports Gemini (default), Ollama, OpenAI, or any LLM provider by configuring environment variables in `.env`. See `.env.example` for details.
- Sample Data: Includes sample queries and table schemas for demonstration and testing.

## Alembic Migrations, Linting, and Formatting

- Database schema changes are managed using Alembic migrations. See `alembic/` for migration scripts.
- Code is formatted and linted using `ruff`. Run `make lint` and `make format` to check and auto-fix code style.

## Changelog

### 2025-05-23
- Added `sql_table_describer_agent` for automated SQL table schema extraction and description.
- Introduced `backend/scripts/generate_tables_json.py` for generating up-to-date JSON documentation of all database tables, views, and enums.
- Enhanced SQL query validation tools to support both MySQL and PostgreSQL, with improved error handling.
- Updated configuration and helper utilities for multi-database and LLM support.

### 2025-05-20

- **PostgreSQL Support**: Added support for PostgreSQL alongside MySQL for query validation.
- **SQL Validation Improvements**: Cleaned up JSON formatting and simplified SQL syntax validation in query formation prompts.
- **Requirements Update**: Specified `psycopg2` package version as 2.9.10 in `requirements.txt`.
- **Model/Migration Cleanup**: Removed `LLMCredential` model and related migrations.

## Installation

### Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- [Qdrant](https://qdrant.tech/) vector database
- [Redis](https://redis.io/) (for rate limiting and account lockout)
- [Next.js](https://nextjs.org/) (for UI)
- [TypeScript](https://www.typescriptlang.org/) (for UI)
- (Optional) [Gemini](https://aistudio.google.com/), [Ollama](https://ollama.com/), [OpenAI](https://platform.openai.com/), or any other LLM API (configurable via `.env`)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Shrijeeth/QueryGPT-ADK.git
cd QueryGPT-ADK
```

2. Install dependencies (Backend):

```bash
cd backend
python -m pip install -r requirements.txt
```

3. Set up environment variables (Backend):

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your database and Redis URLs as needed. Example:

```text
POSTGRES_DB_URL=postgresql+asyncpg://user:password@localhost:5432/querygpt
REDIS_URL=redis://localhost:6379/1
```

4. Generate up-to-date table and enum documentation (Backend):

```bash
cd backend
python -m scripts.generate_tables_json
```

This command will connect to your configured database and auto-generate the latest tables, views, and enums documentation in `backend/scripts/data/tables.json`. Before running this command, make sure your database is up and running and the connection string in `.env` is correct for validation database. You also need LLM provider and API key for this command to work. Set `SYNTHETIC_DATA_LLM_MODEL` and `SYNTHETIC_DATA_LLM_API_KEY` in `.env` for this to work.

5. Set up environment variables (Frontend):

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and set your API base URL as needed. Example:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

6. Set up the Frontend (Next.js UI):

```bash
cd frontend
npm install
npm run build
npm run dev
```

This will start the frontend at [http://localhost:3000](http://localhost:3000).

7. Clear Qdrant database (Optional):

```bash
cd backend
python scripts/clear_vector_db.py
```

8. Load db data into Qdrant:

```bash
cd backend
python scripts/add_table_schemas.py
python scripts/add_sample_queries_qdrant.py
```

9. (Optional) Use Your Own Data:

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

## Usage Examples

### 1. Register a New User

```bash
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123", "email": "alice@example.com", "full_name": "Alice Smith"}'
```

### 2. Log In and Get a JWT Token

```bash
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=alice&password=secret123"
# Response: {"access_token": "<JWT>", "token_type": "bearer"}
```

### 3. Run a Query (Authenticated)

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me the top 5 medicines by usage"}'
```

### 4. Example Error Responses

- **Rate Limit Exceeded:**

  ```json
  {"detail": "Too Many Requests"}
  ```

- **Account Lockout:**

  ```json
  {"detail": "Account locked due to too many failed login attempts. Try again in 299 seconds."}
  ```

- **Unauthorized:**

  ```json
  {"detail": "Incorrect username or password"}
  ```

### 5. Interactive API Docs

- Visit [http://localhost:8000/docs](http://localhost:8000/docs) for Swagger UI (auto-generated, try endpoints in browser)

### 6. Alembic Migrations & Linting

- Generate a new migration after model changes:

  ```bash
  cd backend
  alembic revision --autogenerate -m "describe_change"
  alembic upgrade head
  ```

- Lint and format code:

  ```bash
  make lint
  make format
  ```

### 7. Running with Redis & Database

- Make sure Redis and your database are running and accessible (see `.env` for connection strings).
- For distributed deployments, Redis ensures rate limiting and lockout work across all app instances.

### 8. API Extensibility

- Add new endpoints, agents, or tools in `backend/` as needed. See `middleware/` and `infra/` for scalable patterns.

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

## Roadmap

### Next.js UI (In Progress)

- Build a modern Next.js web app for natural-language-to-SQL interactions. (Completed)
- Provide a user-friendly interface for entering queries and viewing generated SQL and results. (Completed)
- Display results in interactive, filterable tables. (To Do)
- Add authentication, query history, and user profile management. (In Progress)
- Integrate responsive design and accessibility best practices. (To Do)
- Enable seamless communication with the FastAPI backend via REST API. (Completed)

### FastAPI Backend (In Progress)

- Develop REST API endpoints for query submission, execution, and validation. (Completed)
- Implement CORS, rate limiting, and token-based authentication. (Completed)
- Establish database connectivity and connection pooling. (Completed)
- Provide interactive OpenAPI documentation via Swagger UI. (Completed)
- Write unit and integration tests for API endpoints. (To Do)

### BYOK & Model Provider Support (Completed)

- Add support for BYOK (Bring Your Own Key/Model) to allow users to plug in their preferred LLM provider (e.g., OpenAI, Gemini, Ollama, Azure, local models, etc.).
- Provide a configuration interface for selecting and managing model providers.
- Ensure compatibility with multiple model APIs and authentication mechanisms.
- Add documentation and examples for integrating new model providers.

### Importing Custom Databases (To Do)

- Build a flexible importer to support connecting and importing schemas from various custom databases (e.g., PostgreSQL, SQLite, Oracle, etc.).
- Provide a UI and/or CLI for users to add new database connections.
- Auto-detect and map table schemas and relationships from imported databases.
- Validate and test queries on imported/custom databases.

### Importing Custom Vector Databases (To Do)

- Add support for connecting to and importing from various vector databases (e.g., Pinecone, Weaviate, Milvus, Chroma, etc.).
- Provide configuration and interface for users to add/manage vector DB connections.
- Enable schema and collection import for semantic search and retrieval.
- Ensure integration of custom vector DBs with agentic workflow and query tools.

### Generate Synthetic Data for a Database (In Progress)

- Add support for generating synthetic data for a given database.
- Provide a UI and/or CLI for users to generate synthetic data for their own database.
- Create an agent that can generate synthetic data queries for a given database.
- Add scripts to generate synthetic data and fetch schema for a given database.

### Testing (To Do)

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
- [Redis](https://redis.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [MySQL](https://www.mysql.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Qdrant](https://qdrant.tech/)
- [Pydantic](https://docs.pydantic.dev/)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [Alembic](https://alembic.sqlalchemy.org/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
