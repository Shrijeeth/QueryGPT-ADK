install:
	python -m pip install -r requirements.txt

lint:
	python -m ruff check

format:
	python -m ruff format

upsert-data:
	cd backend && python -m scripts.clear_vector_db && python -m scripts.add_sample_queries_qdrant && python -m scripts.add_table_schemas

run-backend:
	cd backend && uvicorn main:app --port 8000

# Alembic migration commands
migrate:
	cd backend && alembic revision --autogenerate -m "$(m)"

upgrade:
	cd backend && alembic upgrade head

downgrade:
	cd backend && alembic downgrade -1

migrations:
	cd backend && alembic history --verbose
