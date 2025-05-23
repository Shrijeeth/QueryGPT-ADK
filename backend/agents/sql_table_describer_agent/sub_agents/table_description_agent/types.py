from pydantic import BaseModel


class TableDescription(BaseModel):
    table_name: str
    description: str


class TableDescriptionSchema(BaseModel):
    table_descriptions: list[TableDescription]
