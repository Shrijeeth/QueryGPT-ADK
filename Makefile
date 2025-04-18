install:
	python -m pip install -r requirements.txt

lint:
	python -m ruff check

format:
	python -m ruff format

upsert-data:
	cd backend && python -m scripts.clear_vector_db && python -m scripts.add_sample_queries_qdrant && python -m scripts.add_table_schemas