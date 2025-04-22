# QueryGPT Backend

This directory contains the backend for QueryGPT-ADK, an open-source, multi-agent system for natural language to SQL query generation and explanation.

## Features
- Multi-agent architecture for query generation, explanation, and validation
- LLM provider flexibility (Gemini, Ollama, OpenAI, etc.)
- Vector search with Qdrant
- Production-ready security: JWT, password hashing, rate limiting, account lockout (Redis)
- Modular and extensible codebase

## Project Structure
```
backend/
├── agents/           # Multi-agent system implementation
├── scripts/          # Data loading and utility scripts
├── utils/            # Utility modules
├── models/           # Modular SQLAlchemy models
├── infra/            # Infrastructure: database and Redis clients
├── middleware/       # Middlewares: rate limiting, account lockout
├── config.py         # Configuration and environment management
├── requirements.txt  # Python dependencies
└── .env              # Environment variables
```

## Setup & Installation

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and update variables as needed.

## Database & Migrations
- Database schema changes are managed using Alembic migrations (see `alembic/`).
- To run migrations:
  ```bash
  alembic upgrade head
  ```

## Running the Backend
```bash
uvicorn main:app --reload
```

## Data Loading
Replace the sample data in `scripts/data/` with your own and run:
```bash
python scripts/add_table_schemas.py
python scripts/add_sample_queries_qdrant.py
```

## Linting & Formatting
Run the following to check and fix code style:
```bash
make lint
make format
```

## API Usage & Development
- See the main project README for API examples and endpoints.
- Extend agents, tools, or infra by adding to respective modules.

---
For more details, see the top-level README.md.
