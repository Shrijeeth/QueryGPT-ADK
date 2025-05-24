from pydantic import BaseModel


class SampleQuery(BaseModel):
    query: str
    description: str


class SampleQuerySchema(BaseModel):
    sample_queries: list[SampleQuery]
