import asyncio
import json
import uuid

from litellm import aembedding
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from config import get_settings


async def main(tables_file: str, qdrant_client: AsyncQdrantClient):
    with open(tables_file, "r") as f:
        tables = json.load(f)

    embed_input = []
    for table in tables["data"]:
        embed_input.append(json.dumps(table))
    embeddings_response = await aembedding(
        model=get_settings().EMBEDDING_MODEL,
        api_key=get_settings().EMBEDDING_API_KEY,
        input=embed_input,
    )

    if not await qdrant_client.collection_exists(
        collection_name=get_settings().QDRANT_COLLECTION_NAME,
    ):
        await qdrant_client.create_collection(
            collection_name=get_settings().QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=get_settings().EMBEDDING_SIZE,
                distance=Distance.COSINE,
            ),
        )
        await qdrant_client.create_payload_index(
            collection_name=get_settings().QDRANT_COLLECTION_NAME,
            field_name="type",
            field_schema="keyword",
        )

    points = []
    for i, embed in enumerate(embeddings_response.data):
        points.append(
            {
                "id": str(uuid.uuid4()),
                "vector": embed.embedding,
                "payload": tables["data"][i],
            }
        )
    await qdrant_client.upsert(
        collection_name=get_settings().QDRANT_COLLECTION_NAME,
        points=points,
    )
    await qdrant_client.close()


if __name__ == "__main__":
    qdrant_client = AsyncQdrantClient(
        url=get_settings().QDRANT_URL,
        api_key=get_settings().QDRANT_API_KEY,
    )
    asyncio.run(
        main(tables_file="scripts/data/tables.json", qdrant_client=qdrant_client)
    )
