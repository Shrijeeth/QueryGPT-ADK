import asyncio

from qdrant_client import AsyncQdrantClient

from config import get_settings


async def main():
    client = AsyncQdrantClient(
        url=get_settings().QDRANT_URL,
        api_key=get_settings().QDRANT_API_KEY,
    )
    await client.delete_collection(get_settings().QDRANT_COLLECTION_NAME)
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
