import json

from google.adk.tools import FunctionTool
from litellm import embedding
from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue

from config import get_settings


def get_similar_queries(user_input: str, score_threshold: float = 0.3) -> str:
    """
    Get similar queries for the given user input and score threshold

    Args:
        user_input (str): The user input
        score_threshold (float): The score threshold for the search

    Returns:
        str: The similar queries
    """

    embed = embedding(
        model=get_settings().EMBEDDING_MODEL,
        api_key=get_settings().EMBEDDING_API_KEY,
        input=[user_input],
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
                    match=MatchValue(value="SAMPLE_QUERY"),
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


get_similar_queries_tool = FunctionTool(
    func=get_similar_queries,
)
