install-backend:
	cd backend && python -m pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

lint-backend:
	cd backend && python -m ruff check

fix-lint-backend:
	cd backend && python -m ruff check --select I,RUF022 --fix .

format-backend:
	cd backend && python -m ruff format

upsert-data:
	cd backend && python -m scripts.clear_vector_db && python -m scripts.add_sample_queries_qdrant && python -m scripts.add_table_schemas

generate-data:
	cd backend && python -m scripts.generate_tables_json && python -m scripts.generate_sample_queries

run-backend:
	cd backend && uvicorn main:app --port 8000

run-frontend:
	cd frontend && npm run dev

# Alembic migration commands
migrate:
	cd backend && alembic revision --autogenerate -m "$(m)"

upgrade:
	cd backend && alembic upgrade head

downgrade:
	cd backend && alembic downgrade -1

migrations:
	cd backend && alembic history --verbose
