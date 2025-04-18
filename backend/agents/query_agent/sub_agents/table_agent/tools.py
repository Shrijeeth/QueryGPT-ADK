import json
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from litellm import embedding
from config import get_settings


def get_similar_tables(
    user_input: str, similar_queries: str, score_threshold: float = 0.7
) -> str:
    """
    Get similar tables for the given user input and score threshold

    Args:
        user_input (str): The user input
        similar_queries (str): The similar queries related to the user input
        score_threshold (float): The score threshold for the search

    Returns:
        str: The similar tables
    """

    user_query = f"# User Input:\n{user_input}\n\n# Similar Queries:\n{similar_queries}"
    embed = embedding(
        model=get_settings().EMBEDDING_MODEL,
        api_key=get_settings().EMBEDDING_API_KEY,
        input=[user_query],
    )

    client = QdrantClient(
        url=get_settings().QDRANT_URL,
        api_key=get_settings().QDRANT_API_KEY,
    )
    similar_queries = client.query_points(
        collection_name=get_settings().QDRANT_COLLECTION_NAME,
        query=embed.data[0].embedding,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="type",
                    match=MatchValue(value="TABLE"),
                )
            ]
        ),
        score_threshold=score_threshold,
        with_payload=True,
    )

    result = []
    for query in similar_queries.points:
        result.append(query.payload)

    client.close()
    return json.dumps(
        {
            "data": result,
        }
    )
